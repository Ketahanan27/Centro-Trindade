function enviar(path, dados) {
  return fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
}

export const autenticar = dados => enviar('login', dados);
export const recuperarPassword = email => enviar('recuperar', { email });
export const redefinirPassword = (token, nova_password) => enviar('redefinir', { token, nova_password });
