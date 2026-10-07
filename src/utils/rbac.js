export const PERMISSOES = {
  Administrador: {
    areas: ["dashboard", "relatorios", "membros", "agenda", "tesouraria", "secretaria", "utilizadores"],
    soLeitura: false,
  },
  Secretaria: {
    areas: ["dashboard", "relatorios", "membros", "agenda", "secretaria"],
    soLeitura: false,
  },
  Tesouraria: {
    areas: ["dashboard", "relatorios", "tesouraria"],
    soLeitura: false,
  },
  Pastor: {
    areas: ["dashboard", "relatorios", "membros", "agenda", "tesouraria", "secretaria"],
    soLeitura: true,
  },
  Membro: {
    areas: ["dashboard"],
    soLeitura: true,
  },
};

/*
|--------------------------------------------------------------------------
| Leitura do perfil a partir do localStorage
|--------------------------------------------------------------------------
|
| IMPORTANTE: isto é apenas um "hint" de UI (mostrar/esconder menus e
| campos) — nunca é, nem pode ser, a fonte real de autorização.
| localStorage é controlado pelo utilizador no próprio browser e pode ser
| alterado livremente via DevTools. A autorização verdadeira (o que cada
| perfil pode realmente fazer) é sempre imposta no backend, pelo
| middleware permit()/adminOnly em middleware/auth.js — é isso que protege
| os dados, não este ficheiro.
|
*/
export const getPerfil = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}").perfil || "Membro"; }
  catch { return "Membro"; }
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
};

export const temAcesso = (perfil, area) =>
  (PERMISSOES[perfil] ?? PERMISSOES.Membro).areas.includes(area);

export const ehSoLeitura = (perfil) =>
  (PERMISSOES[perfil] ?? PERMISSOES.Membro).soLeitura;
