export const PERFIS = ["Administrador", "Secretaria", "Tesouraria", "Pastor", "Membro"];

export const DESCRICAO_PERFIL = {
  Administrador: "Acesso total ao sistema, incluindo gestão de utilizadores.",
  Secretaria: "Acesso ao Dashboard, Membros, Agenda e Secretaria com permissão de edição.",
  Tesouraria: "Acesso ao Dashboard e Tesouraria com permissão de edição.",
  Pastor: "Visualização de todas as áreas — sem permissão de edição.",
  Membro: "Acesso ao Dashboard e à Minha Área.",
};

export const CORES_PERFIL = {
  Administrador: "#ff6b35",
  Secretaria: "#0044ff",
  Tesouraria: "#00c853",
  Pastor: "#9c27b0",
  Membro: "#607d8b",
};

export const FORM_VAZIO = { nome: "", email: "", perfil: "Membro", estado: "Ativo" };


export function filtrarUtilizadores(utilizadores, pesquisa) {
  const termo = pesquisa.toLowerCase();
  return utilizadores.filter(utilizador => [utilizador.nome, utilizador.email, utilizador.perfil].some(valor => (valor || '').toLowerCase().includes(termo)));
}
