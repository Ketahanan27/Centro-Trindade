import crypto from 'node:crypto';

export const hashToken = token => `sha256:${crypto.createHash('sha256').update(token).digest('hex')}`;
export const gerarToken = () => crypto.randomBytes(32).toString('hex');
export const RECUPERACAO_GENERICA = { message: 'Se existir uma conta ativa com este email, foi enviado um link de recuperação.' };

export function erroConta(status, message) {
  return Object.assign(new Error(message), { status });
}
