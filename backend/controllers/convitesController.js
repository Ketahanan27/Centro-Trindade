import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { pool } from '../config/db.js';
import { validarUtilizador, emailNormalizado } from '../utils/inputValidation.js';

export const hashToken = (token) => `sha256:${crypto.createHash('sha256').update(token).digest('hex')}`;
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function enviarLink(user, token, convite) {
  const link = new URL('/redefinir-password', process.env.FRONTEND_URL);
  link.searchParams.set('token', token);
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000 });
  try {
    await transport.sendMail({ from: `"Centro Trindade" <${process.env.EMAIL_USER}>`, to: user.email,
      subject: convite ? 'Centro Trindade — Configure a sua conta' : 'Centro Trindade — Recuperação de palavra-passe',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h1>Centro Trindade</h1><h2>Olá, ${escape(user.nome)}!</h2><p>${convite ? 'Foi convidado para configurar a sua conta.' : 'Foi solicitada a recuperação da sua palavra-passe.'}</p><p><a href="${escape(link.toString())}">${convite ? 'Configurar conta' : 'Redefinir palavra-passe'}</a></p><p>Link de uso único, válido ${convite ? '48 horas' : '30 minutos'}. Se não esperava este pedido, ignore este email.</p></div>` });
  } finally { transport.close(); }
}

async function guardarToken(client, id, token, convite) {
  await client.query('UPDATE password_resets SET usado = 1 WHERE utilizador_id = $1 AND usado = 0', [id]);
  await client.query('INSERT INTO password_resets (utilizador_id, token, expiry) VALUES ($1,$2,$3)', [id, hashToken(token), new Date(Date.now() + (convite ? 48 * 60 : 30) * 60 * 1000)]);
}

async function entregar(user, token, convite) {
  try { await enviarLink(user, token, convite); return true; }
  catch (error) {
    console.error('[entregarLink]', error.code ?? 'erro');
    // SMTP failure can occur after acceptance. Revoke only this link; a later
    // concurrent resend must remain valid. Account stays available for retry.
    await pool.query('UPDATE password_resets SET usado=1 WHERE token=$1', [hashToken(token)]).catch(() => console.error('[revogarLink] falha'));
    return false;
  }
}

export async function criarContaConvite(req, res) {
  let dados;
  try { dados = validarUtilizador(req.body, true); }
  catch (error) { return res.status(400).json({ message: error.message }); }
  const { nome, email, perfil, estado } = dados;
  let client;
  let user;
  const token = crypto.randomBytes(32).toString('hex');
  try {
    const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    client = await pool.connect();
    await client.query('BEGIN');
    const normalized = email.trim().toLowerCase();
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [normalized]);
    const existing = await client.query('SELECT id FROM utilizadores WHERE lower(trim(email))=$1', [normalized]);
    if (existing.rows.length) { await client.query('ROLLBACK'); return res.status(409).json({ message: 'Email já registado. Use Reenviar convite na conta existente.' }); }
    const result = await client.query('INSERT INTO utilizadores (nome,email,password,perfil,estado,convite_pendente) VALUES ($1,$2,$3,$4,$5,true) RETURNING id,nome,email,estado', [nome.trim(), normalized, password, perfil, estado]);
    user = result.rows[0];
    if (estado === 'Ativo') await guardarToken(client, user.id, token, true);
    await client.query('COMMIT');
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('[criarContaConvite]', error.code ?? 'erro');
    return res.status(error.code === '23505' ? 409 : 500).json({ message: error.code === '23505' ? 'Email já registado.' : 'Não foi possível criar a conta e o convite.' });
  } finally { client?.release(); }
  const sent = estado === 'Ativo' ? await entregar(user, token, true) : false;
  return res.status(201).json({ email_enviado: sent, message: sent ? 'Conta criada e convite enviado.' : estado === 'Inativo' ? 'Conta inativa criada. Ative-a antes de enviar o convite.' : 'Conta criada, mas o email falhou. Use Reenviar convite; não crie outra conta.' });
}

export const emitirLinkConta = (modo) => async (req, res) => {
  const publico = modo === 'recuperar';
  const generic = { message: 'Se existir uma conta ativa com este email, foi enviado um link de recuperação.' };
  let email;
  if (publico) {
    try { email = emailNormalizado(req.body?.email, true); }
    catch (error) { return res.status(400).json({ message: error.message }); }
  }
  if (!publico && (!/^\d+$/.test(String(req.params.id)) || !Number.isSafeInteger(Number(req.params.id)) || Number(req.params.id) < 1 || Number(req.params.id) > 2147483647)) return res.status(400).json({ message: 'Utilizador inválido.' });
  let client;
  let user;
  let convite;
  const token = crypto.randomBytes(32).toString('hex');
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await client.query(publico ? 'SELECT id,nome,email,estado,convite_pendente FROM utilizadores WHERE lower(trim(email))=$1 FOR UPDATE' : 'SELECT id,nome,email,estado,convite_pendente FROM utilizadores WHERE id=$1 FOR UPDATE', [publico ? email.trim().toLowerCase() : req.params.id]);
    user = result.rows[0];
    if (result.rows.length !== 1 || user.estado !== 'Ativo' || (modo === 'convite' && !user.convite_pendente)) {
      await client.query('ROLLBACK');
      return publico ? res.json(generic) : res.status(!user ? 404 : 409).json({ message: !user ? 'Utilizador não encontrado.' : user.estado !== 'Ativo' ? 'Ative a conta antes de enviar o link.' : 'A conta já foi configurada. Use Enviar Reset.' });
    }
    convite = user.convite_pendente;
    await guardarToken(client, user.id, token, convite);
    await client.query('COMMIT');
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('[emitirLinkConta]', error.code ?? 'erro');
    return publico ? res.json(generic) : res.status(500).json({ message: 'Não foi possível preparar o link.' });
  } finally { client?.release(); }
  const sent = await entregar(user, token, convite);
  return publico ? res.json(generic) : res.status(sent ? 200 : 502).json({ email_enviado: sent, message: sent ? convite ? 'Convite reenviado. Os links anteriores foram invalidados.' : 'Link de recuperação enviado.' : 'O email falhou. A conta foi preservada; pode voltar a tentar.' });
};
