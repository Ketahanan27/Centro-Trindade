import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
process.env.DATABASE_URL='postgresql://test:test@127.0.0.1:1/test';
const { pool }=await import('../config/db.js');
const {periodoDashboard}=await import('../modules/dashboard/dashboard.model.js');
const {getDashboardStats}=await import('../modules/dashboard/dashboard.controller.js');
const { criarDashboardService } = await import('../modules/dashboard/dashboard.service.js');
const original=pool.query;
afterEach(()=>{pool.query=original;});after(async()=>{await pool.end();});
function response(){return {code:200,headers:{},set(key,value){this.headers[key]=value;return this;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};}
function mock(){const calls=[];pool.query=async(sql,params)=>{calls.push({sql,params});let rows=[{total:'3'}];if(sql.includes('FROM eventos'))rows=[{id:1,titulo:'Evento',data:'2026-10-10',total:'7',publico:false,estado:'Cancelado'}];if(sql.includes('SUM(valor)'))rows=sql.includes('GROUP BY')?[{mes:1,receitas:'100',despesas:'30'}]:[{receitas:'100',despesas:'30'}];if(sql.includes('GROUP BY estado'))rows=[{estado:'Visitante',total:'3'}];if(sql.includes('ORDER BY data_atividade DESC'))rows=[{id:1,atividade:'Culto',data:'2026-10-01',quantidade:3}];return {command:'SELECT',rows};};return calls;}
test('Lisbon date and month/year boundaries are explicit',()=>{
 const p=periodoDashboard(new Date('2026-12-31T23:30:00Z'));assert.equal(p.fimMes,'2027-01-01');assert.equal(p.inicioAno,'2026-01-01');
 assert.equal(periodoDashboard(new Date('2026-06-30T23:30:00Z')).inicioMes,'2026-07-01');
});

test('dashboard service uses an injected period and avoids restricted repositories for members', async () => {
 const periodo=periodoDashboard(new Date('2026-06-30T23:30:00Z'));
 const service=criarDashboardService({
  membrosAtivos:async()=>[{total:'0'}],
  proximosEventos:async params=>{assert.deepEqual(params,[periodo.hoje,false]);return [];},
 },()=>periodo);
 const result=await service.obter({perfil:'Membro'});
 assert.deepEqual(result.periodo,periodo);
 assert.equal(result.stats.membros,0);
 assert.equal(result.stats.saldo,null);
 assert.deepEqual(result.graficoAnual,[]);
});
test('administrator receives real aggregates and explicit monthly balance',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Administrador'}},res);
 assert.equal(res.code,200);assert.equal(res.data.stats.saldo,'70.00');assert.equal(res.data.stats.eventos,7);assert.equal(res.data.stats.novosMembros,3);
 assert.equal(res.data.pendencias.contasPorAtivar,3);assert.equal(res.data.proximosEventos[0].total,undefined);assert.equal(res.headers['Cache-Control'],'private, no-store');
 const totalVisitantes = calls.find(({sql})=>sql.includes('SUM(quantidade)'));
 assert.doesNotMatch(totalVisitantes.sql, /WHERE|data_atividade/);
 assert.deepEqual(totalVisitantes.params, []);
 assert.equal(res.data.stats.visitantes, 3);
});
test('Secretaria never queries or receives financial values or account invitation totals',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Secretaria'}},res);
 assert.ok(!calls.some(({sql})=>sql.includes('tesouraria')||sql.includes('utilizadores')));assert.equal(res.data.stats.saldo,null);assert.deepEqual(res.data.graficoAnual,[]);assert.equal(res.data.pendencias.contasPorAtivar,null);
});
test('ordinary member receives only public events and no visitor/member detail aggregates',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Membro'}},res);
 assert.equal(calls.length,2);assert.equal(calls.find(({sql})=>sql.includes('eventos')).params[1],false);assert.equal(res.data.stats.visitantes,null);assert.deepEqual(res.data.visitantesAtividade,[]);assert.deepEqual(res.data.visitantesPorEstado,[]);assert.equal(res.data.pendencias.membrosSemConta,null);
});
test('Treasury sees finance but no visitor records or private event bypass',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Tesouraria'}},res);
 assert.equal(res.data.podeVerFinancas,true);assert.ok(!calls.some(({sql})=>sql.includes('visitantes')));assert.equal(calls.find(({sql})=>sql.includes('eventos')).params[1],false);
});
test('database failures return a safe error instead of invented zeros',async()=>{
 pool.query=async()=>{throw new Error('secret database information');};const res=response();await getDashboardStats({user:{perfil:'Administrador'}},res);assert.equal(res.code,500);assert.doesNotMatch(JSON.stringify(res.data),/secret database/);
});

test('events include visibility and status while public-only access keeps Agendado filter',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Administrador'}},res);
 assert.equal(res.data.proximosEventos[0].publico,false);assert.equal(res.data.proximosEventos[0].estado,'Cancelado');
 const sql=calls.find(({sql})=>sql.includes('FROM eventos')).sql;
 assert.match(sql,/publico=true AND estado='Agendado'/);assert.match(sql,/COUNT\(\*\) FILTER \(WHERE estado='Agendado'\)/);
 assert.equal(res.data.visitantesAtividade[0].quantidade,3);
 assert.ok(!calls.some(({sql})=>sql.includes('EXTRACT(MONTH FROM entrada)')));
});
