import assert from 'node:assert/strict';
import { test, after, afterEach } from 'node:test';
import { criarRelatorioGlobalPDF } from '../../src/utils/relatorioGlobalPdf.js';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const { getRelatorioGlobal } = await import('../modules/relatorios/relatorio-global.controller.js');
const original = pool.connect;
afterEach(() => { pool.connect = async () => assert.fail('Unexpected database access'); });
after(async () => { pool.connect = original; await pool.end(); });

async function invoke(perfil, query = {inicio:'2025-12-01',fim:'2026-01-31'}) {
  let code=200,body;
  await getRelatorioGlobal({user:{perfil},query},{status(value){code=value;return this;},setHeader(){},json(value){body=value;return this;}});
  return {code,body};
}
function fixture() {
  const queries=[];
  let released=false;
  pool.connect = async () => ({ query: async (sql,params) => {
    queries.push(sql);
    if (/BETWEEN/.test(sql)) assert.deepEqual(params,['2025-12-01','2026-01-31']);
    if (/GROUP BY estado/.test(sql)) return {rows:[{estado:'Ativo',total:4}]};
    if (/batizado =/.test(sql)) return {rows:[{total:2}]};
    if (/COUNT\(\*\)/.test(sql)) return {rows:[{total:0}]};
    return {rows:[]};
  }, release(){released=true;} });
  return {queries,released:()=>released};
}
for (const [role,administrative,financial] of [['Administrador',true,true],['Pastor',true,true],['Secretaria',true,false],['Tesouraria',false,true]]) {
  test(`global report enforces ${role} scope in database queries and payload`,async()=>{
    const f=fixture(); const {code,body}=await invoke(role);
    assert.equal(code,200);
    assert.equal(Boolean(body.sections.membros),administrative);
    assert.equal(Boolean(body.sections.tesouraria),financial);
    assert.equal(f.queries.some(sql=>/FROM tesouraria/.test(sql)),financial);
    assert.equal(f.queries.some(sql=>/FROM membros/.test(sql)),administrative);
    assert.equal(f.queries[0],'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    assert.equal(f.queries.at(-1),'COMMIT'); assert.ok(f.released());
    assert.ok(!f.queries.some(sql=>/LIMIT/.test(sql)));
  });
}
test('global report refuses invalid periods, mode and unauthorized users before connecting',async()=>{
  pool.connect=async()=>assert.fail('Invalid request connected');
  for (const query of [{inicio:'2026-02-30',fim:'2026-03-01'},{inicio:'2026-02-01',fim:'2025-01-01'},{inicio:'2026-01-01'}, {inicio:'2026-01-01',fim:'2026-02-01',modo:'all'}]) assert.equal((await invoke('Administrador',query)).code,400);
  assert.equal((await invoke('Membro')).code,403);
});
test('detailed report refuses oversized exports, rolls back and releases connection',async()=>{
  const calls=[];let released=false;
  pool.connect=async()=>({query:async sql=>{calls.push(sql);return {rows:/LIMIT/.test(sql)?Array.from({length:5001},()=>({nome:'Pessoa'})):[{total:0}]};},release(){released=true;}});
  assert.equal((await invoke('Administrador',{inicio:'2025-12-01',fim:'2026-01-31',modo:'detalhado'})).code,400);
  assert.equal(calls.at(-1),'ROLLBACK');assert.ok(released);
});
test('detailed report returns all authorized sections and uses bounded date-filtered lists',async()=>{
  const f=fixture();const {code,body}=await invoke('Administrador',{inicio:'2025-12-01',fim:'2026-01-31',modo:'detalhado'});
  assert.equal(code,200);assert.equal(Object.keys(body.sections).length,8);
  assert.equal(f.queries.filter(sql=>/LIMIT 5001/.test(sql)).length,8);
  assert.ok(f.released());
});
test('database failure rolls back and releases the snapshot without partial data',async()=>{
  let released=false;const calls=[];
  pool.connect=async()=>({query:async sql=>{calls.push(sql);if(/FROM/.test(sql))throw new Error('Connection lost');return {rows:[]};},release(){released=true;}});
  const result=await invoke('Administrador');assert.equal(result.code,500);
  assert.equal(result.body.sections,undefined);assert.equal(calls.at(-1),'ROLLBACK');assert.ok(released);
});

test('combined section sizes enforce the global limit even when each list is below it', async () => {
  const calls=[];
  let released=false;
  pool.connect=async()=>({
    query:async sql=>{
      calls.push(sql);
      return {rows:/LIMIT/.test(sql)?Array.from({length:3000},()=>({nome:'Pessoa'})):[{total:0}]};
    },
    release(){released=true;},
  });
  const result=await invoke('Administrador',{inicio:'2025-12-01',fim:'2026-01-31',modo:'detalhado'});
  assert.equal(result.code,400);
  assert.equal(result.body.sections,undefined);
  assert.equal(calls.filter(sql=>/LIMIT/.test(sql)).length,2);
  assert.equal(calls.at(-1),'ROLLBACK');
  assert.ok(released);
});

test('failed COMMIT returns no report and still releases the connection', async () => {
  const calls=[];
  let released=false;
  pool.connect=async()=>({
    query:async sql=>{
      calls.push(sql);
      if(sql==='COMMIT')throw new Error('Commit failed');
      return {rows:[{total:0}]};
    },
    release(){released=true;},
  });
  const result=await invoke('Tesouraria');
  assert.equal(result.code,500);
  assert.equal(result.body.sections,undefined);
  assert.equal(calls.at(-1),'ROLLBACK');
  assert.ok(released);
});

test('failed BEGIN and failed rollback still release the connection', async () => {
  let released=false;
  pool.connect=async()=>({query:async()=>{throw new Error('Connection lost');},release(){released=true;}});
  assert.equal((await invoke('Tesouraria')).code,500);
  assert.ok(released);
});
test('detailed global PDF preserves long minutes, money, identity and signatures',()=>{
  const doc=criarRelatorioGlobalPDF({inicio:'2026-01-01',fim:'2026-10-07',modo:'detalhado',abrangencia:'Global',emitidoEm:'2026-10-07T12:00:00Z',sections:{
    atas:{titulo:'Reuniões e atas',resumo:{reunioes:1},colunas:[],registos:[{titulo:'Reuniao de teste',data:'2026-10-06',resumo:'Texto de continuidade. '.repeat(250),decisoes:'DECISAO_FINAL'}]},
    tesouraria:{titulo:'Tesouraria',resumo:{receitas:'125.50',despesas:'25.00',saldo:'100.50'},colunas:[['data','Data'],['valor','Valor']],registos:[{data:'2026-10-01',valor:'125.50'}]}
  }},'NOTA_FINAL');
  const output=doc.output();
  for(const pattern of [/CENTRO TRINDADE/,/\/Subtype \/Image/,/Secretaria/,/Pastor/,/125,50/,/DECISAO_FINAL/,/NOTA_FINAL/]) assert.match(output,pattern);
  assert.ok(doc.getNumberOfPages()>2);
});
