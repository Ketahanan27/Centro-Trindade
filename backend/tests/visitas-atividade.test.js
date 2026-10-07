import assert from 'node:assert/strict';
import {after,afterEach,test} from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
process.env.DATABASE_URL='postgresql://test:test@127.0.0.1:1/test';
process.env.JWT_SECRET='isolated-visits-test-secret';
const {pool}=await import('../config/db.js');
const {validarContagem}=await import('../modules/secretaria/visitas-atividade.model.js');
const {criarContagem,atualizarContagem,listarContagens,eliminarContagem}=await import('../modules/secretaria/visitas-atividade.controller.js');
const {default:router}=await import('../routes/visitasAtividadeRoutes.js');
const { criarVisitasAtividadeService } = await import('../modules/secretaria/visitas-atividade.service.js');
const original=pool.query;
const originalConnect=pool.connect;
const deny=async()=>{throw new Error('Unexpected database access');};
pool.query=deny;pool.connect=deny;
afterEach(()=>{pool.query=deny;});
after(async()=>{pool.query=original;pool.connect=originalConnect;await pool.end();});
const body=()=>({atividade:' Culto de domingo ',data_atividade:'2026-01-01',quantidade:'12',observacoes:'Contagem\nagregada'});
const response=()=>({code:200,status(code){this.code=code;return this;},set(){return this;},json(data){this.data=data;return this;}});

test('count service accepts the day of activity and rejects tomorrow using an injected clock', async () => {
 let saved = 0;
 const service = criarVisitasAtividadeService({ criar: async () => { saved++; return {rowCount:1,rows:[{id:4}]}; } }, () => '2026-01-01');
 assert.equal(await service.criar(body(), 2), 4);
 await assert.rejects(service.criar({...body(),data_atividade:'2026-01-02'},2), {status:400});
 assert.equal(saved, 1);
});

test('missing Agenda event prevents writing a visitor count', async () => {
 const service = criarVisitasAtividadeService({ obterEvento: async () => [] }, () => '2026-01-01');
 await assert.rejects(service.criar({...body(),evento_id:3},2), {status:400});
});

test('count service validates malformed payload and reversed filters before persistence', async () => {
 const service = criarVisitasAtividadeService({});
 await assert.rejects(service.criar(null,2), {status:400});
 await assert.rejects(service.atualizar('abc',body(),2), {status:400});
 await assert.rejects(service.listar({inicio:'2026-02-01',fim:'2026-01-01'}), {status:400});
});

test('export at the limit returns all activities without pagination', async () => {
 const records = Array.from({length:5000}, () => ({quantidade:0}));
 const service = criarVisitasAtividadeService({
  resumir: async () => [{total:'5000',visitantes:'0'}],
  listar: async filtros => { assert.equal(filtros.limite,5001); assert.equal(filtros.offset,0); return records; },
 });
 const result = await service.listar({exportar:'true',pagina:'9'});
 assert.equal(result.registos.length,5000);
 assert.equal(result.totalVisitantes,0);
});
test('counts accept zero and reject types, fractions, invalid dates and unsafe identifiers',()=>{
 assert.equal(validarContagem({...body(),quantidade:0}).quantidade,0);
 for(const patch of [{quantidade:-1},{quantidade:1.5},{quantidade:true},{quantidade:1000001},{quantidade:null},{atividade:{}},{data_atividade:'2026-02-30'},{evento_id:'abc'}])assert.throws(()=>validarContagem({...body(),...patch}));
});
test('manual creation uses session authorship and stores only aggregate fields',async()=>{
 let values;pool.query=async(sql,params)=>{assert.match(sql,/INSERT INTO visitas_atividade/);values=params;return {command:'INSERT',rowCount:1,rows:[{id:4}]};};
 const res=response();await criarContagem({body:{...body(),criado_por:999},user:{id:2}},res);
 assert.equal(res.code,201);assert.equal(values[1],'Culto de domingo');assert.equal(values[3],12);assert.equal(values[5],2);assert.equal(values.length,6);
});
test('linked event takes its title and date from Agenda, ignoring forged fields',async()=>{
 let values;pool.query=async(sql,params)=>sql.startsWith('SELECT')?{command:'SELECT',rows:[{titulo:'Evento real',data:'2026-01-02'}]}:(values=params,{command:'INSERT',rowCount:1,rows:[{id:1}]});
 const res=response();await criarContagem({body:{...body(),evento_id:3,atividade:'Falso'},user:{id:2}},res);assert.equal(res.code,201);assert.equal(values[1],'Evento real');assert.equal(values[2],'2026-01-02');
});
test('duplicates give 409; absent rows give 404; future activities are not counted',async()=>{
 pool.query=async()=>{const error=new Error();error.code='23505';throw error;};let res=response();await criarContagem({body:body(),user:{id:1}},res);assert.equal(res.code,409);
 pool.query=async()=>({command:'UPDATE',rowCount:0,rows:[]});res=response();await atualizarContagem({params:{id:3},body:body(),user:{id:1}},res);assert.equal(res.code,404);
 res=response();await eliminarContagem({params:{id:3}},res);assert.equal(res.code,404);
 pool.query=async()=>{throw new Error('Unexpected database access');};res=response();await criarContagem({body:{...body(),data_atividade:'2099-01-01'},user:{id:1}},res);assert.equal(res.code,400);
});
test('filters are bound SQL parameters and report totals cover all filtered records',async()=>{
 const calls=[];pool.query=async(sql,params)=>{calls.push({sql,params});return {command:'SELECT',rows:sql.includes('COUNT(*)')?[{total:'26',visitantes:'100'}]:[{id:1,quantidade:5}]};};
 const res=response();await listarContagens({query:{inicio:'2026-01-01',fim:'2026-01-31',pesquisa:'culto',pagina:'2'}},res);
 assert.equal(res.code,200);assert.equal(res.data.totalVisitantes,100);assert.equal(calls[1].params[4],25);assert.equal(calls[0].params[2],'%culto%');
 res.code=200;await listarContagens({query:{inicio:'2026-02-01',fim:'2026-01-01'}},res);assert.equal(res.code,400);
});
test('PDF export fetches whole filtered period and refuses truncation beyond 5000',async()=>{
 pool.query=async(sql,params)=>{if(!sql.includes('COUNT(*)'))assert.equal(params[4],0);return {command:'SELECT',rows:sql.includes('COUNT(*)')?[{total:5001,visitantes:5001}]:Array.from({length:5001},()=>({quantidade:1}))};};
 const res=response();await listarContagens({query:{exportar:'true',pagina:'2'}},res);assert.equal(res.code,400);
});
test('routes reject public/member/Treasury access and Pastor writes',async()=>{
 let perfil='Membro';pool.query=async()=>({command:'SELECT',rows:[{id:1,perfil,estado:'Ativo',session_version:0}]});
 const app=express();app.use(express.json());app.use(router);const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{const url=`http://127.0.0.1:${server.address().port}/`;assert.equal((await fetch(url)).status,401);
 const token=jwt.sign({id:1,session_version:0},process.env.JWT_SECRET,{algorithm:'HS256',expiresIn:'1m'});
 for(const role of ['Membro','Tesouraria']){perfil=role;assert.equal((await fetch(url,{headers:{Authorization:`Bearer ${token}`}})).status,403);}
 perfil='Pastor';assert.equal((await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:'{}'})).status,403);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
