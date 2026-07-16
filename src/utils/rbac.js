const PERFIL_ALIASES = {
  Secretaria: "Secretaria",
  Tesouraria: "Tesouraria",
  Membro: "Membro",
  Pastor: "Pastor",
  Administrador: "Administrador",
};

export const PERMISSOES = {
  Administrador: {
    areas:     ["dashboard", "membros", "agenda", "tesouraria", "secretaria", "utilizadores"],
    soLeitura: false,
  },
  Secretaria: {
    areas:     ["dashboard", "membros", "agenda", "secretaria"],
    soLeitura: false,
  },
  Tesouraria: {
    areas:     ["dashboard", "tesouraria"],
    soLeitura: false,
  },
  Pastor: {
    areas:     ["dashboard", "membros", "agenda", "tesouraria", "secretaria"],
    soLeitura: true,
  },
  Membro: {
    areas:     ["dashboard"],
    soLeitura: true,
  },
};

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
