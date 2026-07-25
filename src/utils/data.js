// Formatação de datas partilhada. Antes desta função existir, quatro páginas
// (agenda.jsx, membros.jsx, MinhaArea.jsx, calendario.jsx) reimplementavam
// exatamente a mesma lógica de forma ligeiramente diferente.
//
// Propositadamente NÃO usa `new Date(str).toLocaleDateString()`: strings
// "YYYY-MM-DD" sem hora são interpretadas pelo browser como UTC meia-noite,
// o que ao converter para o fuso local pode mostrar o dia anterior. Dividir
// a string manualmente evita esse deslocamento.
export const formatarData = (data, valorVazio = "—") => {
  if (!data) return valorVazio;
  const parte = String(data).split("T")[0];
  const [ano, mes, dia] = parte.split("-");
  if (!ano || !mes || !dia) return String(data);
  return `${dia}/${mes}/${ano}`;
};