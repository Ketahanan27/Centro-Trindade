import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import nodemailer from 'nodemailer';
import { enviarContacto } from '../controllers/contactoController.js';
const original = nodemailer.createTransport;
const env = { ...process.env };
afterEach(() => { nodemailer.createTransport = original; });
after(() => { for (const key of ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_DESTINO']) { if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key]; } });
const body = () => ({ nome: ' Pessoa <teste> ', email: ' TESTE@example.invalid ', telefone: '912345678', assunto: ' Pedido ', mensagem: 'Olá\n<script>alert(1)</script>' });
function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
function setup(failure = 0, rejected = false) {
  process.env.EMAIL_USER = 'sender@example.invalid'; process.env.EMAIL_PASS = 'mock'; process.env.EMAIL_DESTINO = 'church@example.invalid';
  const state = { messages: [], closed: false };
  nodemailer.createTransport = (options) => { state.options = options; return {
    close() { state.closed = true; }, async sendMail(message) {
      state.messages.push(message);
      if (state.messages.length === failure) throw new Error('private SMTP details');
      return { accepted: rejected ? [] : [message.to] };
    }
  }; };
  return state;
}
test('invalid payloads return 400 without opening SMTP', async () => {
  nodemailer.createTransport = () => { throw new Error('SMTP must not be used'); };
  for (const payload of [undefined, null, [], { ...body(), nome: {} }, { ...body(), email: [] }, { ...body(), telefone: 'abc' }, { ...body(), assunto: 'x\r\nBcc: other@example.invalid' }, { ...body(), mensagem: ' ' }, { ...body(), mensagem: 'x'.repeat(10001) }, { ...body(), mensagem: 'x\u0000' }, { ...body(), nome: 'x'.repeat(151) }]) {
    const res = response(); await enviarContacto({ body: payload }, res); assert.equal(res.code, 400);
  }
});
test('valid contact normalizes addresses, escapes HTML and closes bounded SMTP transport', async () => {
  const state = setup(); const res = response(); await enviarContacto({ body: body() }, res);
  assert.equal(res.code, 200); assert.equal(res.body.confirmacao_enviada, true);
  assert.equal(state.messages[0].replyTo, 'teste@example.invalid');
  assert.equal(state.messages[1].to, 'teste@example.invalid');
  assert.match(state.messages[0].html, /Pessoa &lt;teste&gt;/);
  assert.match(state.messages[0].html, /&lt;script&gt;/);
  assert.equal(state.options.socketTimeout, 15000); assert.ok(state.closed);
});
test('primary SMTP failure returns 502 and never attempts confirmation', async () => {
  const state = setup(1); const res = response(); await enviarContacto({ body: body() }, res);
  assert.equal(res.code, 502); assert.equal(state.messages.length, 1); assert.ok(state.closed);
  assert.doesNotMatch(JSON.stringify(res.body), /private SMTP/);
});
test('recipient rejection is not reported as success', async () => {
  const state = setup(0, true); const res = response(); await enviarContacto({ body: body() }, res);
  assert.equal(res.code, 502); assert.equal(state.messages.length, 1); assert.ok(state.closed);
});
test('confirmation failure preserves primary success and tells visitor not to resend', async () => {
  const state = setup(2); const res = response(); await enviarContacto({ body: body() }, res);
  assert.equal(res.code, 200); assert.equal(res.body.confirmacao_enviada, false);
  assert.match(res.body.message, /Não precisa de enviar novamente/); assert.ok(state.closed);
});
test('missing SMTP configuration returns 503 before opening transport', async () => {
  const state = setup(); delete process.env.EMAIL_PASS; const res = response();
  await enviarContacto({ body: body() }, res); assert.equal(res.code, 503); assert.equal(state.messages.length, 0);
});
