export const CODIGO_POSTAL_RE = /^\d{4}-\d{3}$/;

/*
|--------------------------------------------------------------------------
| Avatar de substituição
|--------------------------------------------------------------------------
|
| SVG embutido em base64, usado quando o membro ainda não tem foto ou
| quando a foto configurada falha a carregar. Evita depender de um
| serviço externo (ex.: via.placeholder.com), que exigiria abrir a
| Content-Security-Policy a mais um domínio de terceiros.
|
*/
export const AVATAR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNjAiIGhlaWdodD0iMjYwIj48cmVjdCB3aWR0aD0iMjYwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI2UyZThmMCIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEwMCIgcj0iNDUiIGZpbGw9IiNhMGFlYzAiLz48ZWxsaXBzZSBjeD0iMTMwIiBjeT0iMjEyIiByeD0iNzgiIHJ5PSI1OCIgZmlsbD0iI2EwYWVjMCIvPjwvc3ZnPg==";


export const CAMPOS_PERFIL = [
  { nome: 'email', rotulo: 'Email', icone: 'ri-mail-line' },
  { nome: 'telemovel', rotulo: 'Telemóvel', icone: 'ri-phone-line', editavel: true, maxLength: 9 },
  { nome: 'morada', rotulo: 'Morada', icone: 'ri-map-pin-line', editavel: true },
  { nome: 'codigo_postal', rotulo: 'Código Postal', icone: 'ri-map-2-line', editavel: true, maxLength: 8 },
  { nome: 'nascimento', rotulo: 'Nascimento', icone: 'ri-cake-line', data: true },
  { nome: 'estado_civil', rotulo: 'Estado Civil', icone: 'ri-heart-line', editavel: true, opcoes: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)'] },
  { nome: 'entrada', rotulo: 'Entrada', icone: 'ri-calendar-check-line', data: true },
  { nome: 'batizado', rotulo: 'Batizado(a)', icone: 'ri-drop-line' },
  { nome: 'estado', rotulo: 'Estado', icone: 'ri-checkbox-circle-line' },
];

export function formularioDoPerfil(membro) {
  return {
    telemovel: membro.telemovel || '', sexo: membro.sexo || '', estado_civil: membro.estado_civil || '',
    morada: membro.morada || '', codigo_postal: membro.codigo_postal || '',
    entrada: membro.entrada ? String(membro.entrada).split('T')[0] : '',
    batizado: membro.batizado || '', estado: membro.estado || '',
  };
}

export function normalizarCampo(nome, valor) {
  if (nome === 'telemovel') return valor.replace(/\D/g, '').slice(0, 9);
  if (nome === 'codigo_postal') {
    const numeros = valor.replace(/\D/g, '').slice(0, 7);
    return numeros.length <= 4 ? numeros : `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
  }
  return valor;
}

export function dadosParaGuardar(formulario) {
  return {
    telemovel: String(formulario.telemovel || '').trim() || null,
    sexo: formulario.sexo || null,
    estado_civil: formulario.estado_civil || null,
    morada: formulario.morada || null,
    codigo_postal: String(formulario.codigo_postal || '').trim() || null,
  };
}
