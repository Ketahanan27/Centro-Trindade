export const FORM_VAZIO = {
  nome: "",
  morada: "",
  codigo_postal: "",
  email: "",
  telemovel: "",
  nascimento: "",
  sexo: "Masculino",
  estado_civil: "Solteiro(a)",
  entrada: "",
  batizado: "Não",
  estado: "Ativo",
  utilizador_id: ""
};
export function formularioDoMembro(membro) {
  const limparData = valor => valor ? String(valor).split("T")[0] : "";
  return {
    nome: membro.nome || "",
    email: membro.email || "",
    telemovel: membro.telemovel || "",
    nascimento: limparData(membro.nascimento),
    sexo: membro.sexo || "Masculino",
    estado_civil: membro.estado_civil || "Solteiro(a)",
    morada: membro.morada || "",
    codigo_postal: membro.codigo_postal || "",
    entrada: limparData(membro.entrada),
    batizado: membro.batizado || "Não",
    estado: membro.estado || "Ativo",
    utilizador_id: membro.utilizador_id ?? ""
  };
}
export function dadosParaGuardar(formulario, perfil, contasErro) {
  const dados = {
    ...formulario
  };
  if (perfil !== "Administrador" || contasErro) delete dados.utilizador_id;else dados.utilizador_id = formulario.utilizador_id ? Number(formulario.utilizador_id) : null;
  return dados;
}
