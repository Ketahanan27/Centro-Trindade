export const FORM_VAZIO = {
  titulo: "",
  data: "",
  hora: "",
  local: "",
  participantes: "",
  resumo: "",
  decisoes: "",
  observacoes: ""
};

export function filtrarReunioes(reunioes, pesquisa) {
  return reunioes.filter(reuniao => reuniao.titulo.toLowerCase().includes(pesquisa.toLowerCase()));
}
