import db from '../config/db.js';
import { objeto, texto, data, validarId, InputError } from '../utils/inputValidation.js';
import { notas } from '../utils/secretariaValidation.js';
import { periodoDashboard } from './dashboardController.js';
export function validarContagem(payload) {
 const body=objeto(payload);
 if (!['number','string'].includes(typeof body.quantidade) || !/^\d+$/.test(String(body.quantidade)) || !Number.isSafeInteger(Number(body.quantidade)) || Number(body.quantidade)>1000000) throw new InputError('Quantidade deve ser um inteiro entre 0 e 1000000.');
 const evento_id=body.evento_id==null||body.evento_id===''?null:validarId(body.evento_id);
 return { evento_id, atividade:evento_id?null:texto(body.atividade,'Atividade',150,true),data_atividade:evento_id?null:data(body.data_atividade,'Data da atividade'),quantidade:Number(body.quantidade),observacoes:notas(body.observacoes,'Observações',2000) };
}
function erro(res,error) {
 if(error.status===400)return res.status(400).json({message:error.message});
 if(error.code==='23505')return res.status(409).json({message:'Esta atividade já tem uma contagem nesta data. Edite o registo existente.'});
 if(error.code==='23503')return res.status(409).json({message:'O evento já não está disponível. Atualize a Agenda.'});
 console.error('[visitasAtividade]',error.code??'erro');return res.status(500).json({message:'Não foi possível concluir a operação.'});
}
export async function listarContagens(req,res) {
 try {
 const inicio=data(req.query.inicio,'Data inicial'),fim=data(req.query.fim,'Data final');
 if(inicio&&fim&&inicio>fim)throw new InputError('O início deve ser anterior ao fim.');
 const pesquisa=texto(req.query.pesquisa,'Pesquisa',150);
 const page=validarId(req.query.pagina??1);const exportar=req.query.exportar==='true';
 const params=[inicio,fim,pesquisa?`%${pesquisa}%`:null];
 const where='WHERE ($1::date IS NULL OR data_atividade >= $1::date) AND ($2::date IS NULL OR data_atividade <= $2::date) AND ($3::text IS NULL OR atividade ILIKE $3)';
 const [summary,rows]=await Promise.all([db.query(`SELECT COUNT(*) AS total,COALESCE(SUM(quantidade),0) AS visitantes FROM visitas_atividade ${where}`,params),db.query(`SELECT id,evento_id,atividade,TO_CHAR(data_atividade,'YYYY-MM-DD') AS data_atividade,quantidade,observacoes FROM visitas_atividade ${where} ORDER BY data_atividade DESC,id DESC LIMIT $4 OFFSET $5`,[...params,exportar?5001:25,exportar?0:(page-1)*25])]);
 if(exportar&&rows.length>5000)throw new InputError('Reduza o período do relatório para até 5000 atividades.');
 res.set('Cache-Control','private, no-store');res.json({registos:rows,total:Number(summary[0].total),totalVisitantes:Number(summary[0].visitantes)});
 }catch(error){return erro(res,error);}
}
async function guardar(req,res,editar) {
 try {
 const id=editar?validarId(req.params.id):null;const dados=validarContagem(req.body);
 if(dados.evento_id){const eventos=await db.query("SELECT titulo,TO_CHAR(data_evento,'YYYY-MM-DD') AS data FROM eventos WHERE id=$1",[dados.evento_id]);if(!eventos.length)throw new InputError('Selecione um evento existente.');dados.atividade=eventos[0].titulo;dados.data_atividade=eventos[0].data;}
 if(!dados.data_atividade)throw new InputError('Data da atividade é obrigatória.');
 if(dados.data_atividade>periodoDashboard().hoje)throw new InputError('Registe a contagem após a atividade; a data não pode ser futura.');
 const values=[dados.evento_id,dados.atividade,dados.data_atividade,dados.quantidade,dados.observacoes,req.user.id];
 const result=editar?await db.query('UPDATE visitas_atividade SET evento_id=$1,atividade=$2,data_atividade=$3,quantidade=$4,observacoes=$5,atualizado_por=$6,atualizado_em=now() WHERE id=$7 RETURNING id',[...values,id]):await db.query('INSERT INTO visitas_atividade(evento_id,atividade,data_atividade,quantidade,observacoes,criado_por,atualizado_por) VALUES($1,$2,$3,$4,$5,$6,$6) RETURNING id',values);
 if(!result.rowCount)return res.status(404).json({message:'Contagem não encontrada.'});
 res.status(editar?200:201).json({message:editar?'Contagem atualizada.':'Contagem registada.',id:result.rows[0].id});
 }catch(error){return erro(res,error);}
}
export const criarContagem=(req,res)=>guardar(req,res,false);
export const atualizarContagem=(req,res)=>guardar(req,res,true);
export async function eliminarContagem(req,res){try{const id=validarId(req.params.id);const result=await db.query('DELETE FROM visitas_atividade WHERE id=$1',[id]);if(!result.rowCount)return res.status(404).json({message:'Contagem não encontrada.'});res.json({message:'Contagem eliminada.'});}catch(error){return erro(res,error);}}
