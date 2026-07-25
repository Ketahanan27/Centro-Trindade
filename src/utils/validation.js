// Validações partilhadas de formulário, usadas em todas as páginas que
// pedem um número de telemóvel (MinhaArea, Membros, Visitantes, Contribua).
// Mantém a regra num único sítio para evitar que cada página aceite um
// formato diferente.

export const TELEFONE_REGEX = /^\d{9}$/;

export const TELEFONE_MENSAGEM_ERRO = "O telemóvel deve conter exatamente 9 dígitos.";

// Remove tudo o que não seja dígito e limita a 9 caracteres.
// Usar no onChange dos campos de telemóvel para impedir a introdução
// de letras/símbolos enquanto o utilizador escreve.
export const sanitizarTelefone = (valor) =>
  String(valor ?? "").replace(/\D/g, "").slice(0, 9);

// Valida um número de telemóvel já sanitizado (ou não).
export const validarTelefone = (valor) =>
  TELEFONE_REGEX.test(String(valor ?? "").trim());