export const PERFIL_AUSENTE = 'Perfil de membro não encontrado. Contacte a secretaria.';

export function erroMembros(status, message) {
  return Object.assign(new Error(message), { name: 'MembrosError', status });
}

export function comFotoProtegida(membro) {
  return { ...membro, foto: membro.foto ? `/api/membros/${membro.id}/foto` : null };
}

export function parametrosMembro(dados) {
  return [
    dados.nome.trim(), dados.email?.trim() || null, dados.telemovel || null,
    dados.nascimento || null, dados.sexo || null, dados.estado_civil || null,
    dados.morada || null, dados.codigo_postal || null, dados.entrada || null,
    dados.batizado || 'Não', dados.estado || 'Ativo', dados.utilizador_id || null,
  ];
}
