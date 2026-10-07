import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
process.env.DATABASE_URL='postgresql://test:test@127.0.0.1:1/test';
const { pool }=await import('../config/db.js');
const {getDashboardStats,periodoDashboard}=await import('../controllers/dashboardController.js');
const original=pool.query;
afterEach(()=>{pool.query=original;});after(async()=>{await pool.end();});
function response(){return {code:200,headers:{},set(key,value){this.headers[key]=value;return this;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};}
function mock(){const calls=[];pool.query=async(sql,params)=>{calls.push({sql,params});let rows=[{total:'3'}];if(sql.includes('FROM eventos'))rows=[{id:1,titulo:'Evento',data:'2026-10-10',total:'7'}];if(sql.includes('SUM(valor)'))rows=sql.includes('GROUP BY')?[{mes:1,receitas:'100',despesas:'30'}]:[{receitas:'100',despesas:'30'}];if(sql.includes('GROUP BY estado'))rows=[{estado:'Visitante',total:'3'}];if(sql.includes('EXTRACT(MONTH FROM entrada)'))rows=[{mes:1,total:'3'}];return {command:'SELECT',rows};};return calls;}
test('Lisbon date and month/year boundaries are explicit',()=>{
 const p=periodoDashboard(new Date('2026-12-31T23:30:00Z'));assert.equal(p.fimMes,'2027-01-01');assert.equal(p.inicioAno,'2026-01-01');
 assert.equal(periodoDashboard(new Date('2026-06-30T23:30:00Z')).inicioMes,'2026-07-01');
});
test('administrator receives real aggregates and explicit monthly balance',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Administrador'}},res);
 assert.equal(res.code,200);assert.equal(res.data.stats.saldo,'70.00');assert.equal(res.data.stats.eventos,7);assert.equal(res.data.stats.novosMembros,3);
 assert.equal(res.data.pendencias.contasPorAtivar,3);assert.equal(res.data.proximosEventos[0].total,undefined);assert.equal(res.headers['Cache-Control'],'private, no-store');
 assert.ok(calls.find(({sql})=>sql.includes('data_visita')).params[0].endsWith('-01'));
});
test('Secretaria never queries or receives financial values or account invitation totals',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Secretaria'}},res);
 assert.ok(!calls.some(({sql})=>sql.includes('tesouraria')||sql.includes('utilizadores')));assert.equal(res.data.stats.saldo,null);assert.deepEqual(res.data.graficoAnual,[]);assert.equal(res.data.pendencias.contasPorAtivar,null);
});
test('ordinary member receives only public events and no visitor/member detail aggregates',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Membro'}},res);
 assert.equal(calls.length,2);assert.equal(calls.find(({sql})=>sql.includes('eventos')).params[1],false);assert.equal(res.data.stats.visitantes,null);assert.deepEqual(res.data.crescimento,[]);assert.deepEqual(res.data.visitantesPorEstado,[]);assert.equal(res.data.pendencias.membrosSemConta,null);
});
test('Treasury sees finance but no visitor records or private event bypass',async()=>{
 const calls=mock();const res=response();await getDashboardStats({user:{perfil:'Tesouraria'}},res);
 assert.equal(res.data.podeVerFinancas,true);assert.ok(!calls.some(({sql})=>sql.includes('visitantes')));assert.equal(calls.find(({sql})=>sql.includes('eventos')).params[1],false);
});
test('database failures return a safe error instead of invented zeros',async()=>{
 pool.query=async()=>{throw new Error('secret database information');};const res=response();await getDashboardStats({user:{perfil:'Administrador'}},res);assert.equal(res.code,500);assert.doesNotMatch(JSON.stringify(res.data),/secret database/);
});
