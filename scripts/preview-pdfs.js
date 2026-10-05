import fs from 'node:fs';
import { criarDocumentoPDF } from '../src/utils/documentoPdf.js';
import { criarAtaPDF, criarTesourariaPDF, criarRelatorioPDF } from '../src/utils/exportacoesPdf.js';

fs.mkdirSync('output/pdf', { recursive: true });
fs.mkdirSync('tmp/pdfs', { recursive: true });
const registo = {
  id: 123, nome_completo: 'Membro Exemplo', bi: 'DOCUMENTO-EXEMPLO', data_emissao: '2026-10-05',
  dados_json: { data_nascimento: '1990-06-15', data_batismo: '2015-04-12', data_entrada: '2014-02-01', estado: 'Ativo', igreja_destino: 'Comunidade de Destino', motivo: 'Transferência de residência e continuidade do acompanhamento pastoral.' },
};
const save = (doc, path) => fs.writeFileSync(path, Buffer.from(doc.output('arraybuffer')));
for (const tipo of ['Batismo', 'Membro', 'Recomendacao']) save(criarDocumentoPDF({ ...registo, tipo }).doc, `output/pdf/modelo-${tipo.toLowerCase()}.pdf`);

const reuniao = { id: 42, titulo: 'Reunião de planeamento ministerial', data: '2026-10-05', hora: '19:30', local: 'Centro Trindade', participantes: 'Pastor, Secretaria e responsáveis dos departamentos.', resumo: 'Foram apresentados os planos de atividades do trimestre e analisadas as necessidades das equipas.', decisoes: 'Aprovar o calendário de atividades. Organizar o acolhimento de novos membros. Agendar uma reunião de acompanhamento para o mês seguinte.', observacoes: 'Os responsáveis comunicarão os progressos à Secretaria.' };
save(criarAtaPDF(reuniao), 'output/pdf/modelo-ata.pdf');
const movimentos = Array.from({ length: 22 }, (_, i) => ({ data: `2026-10-${String(i % 5 + 1).padStart(2, '0')}`, natureza: i % 3 ? 'Receita' : 'Despesa', tipo: i % 3 ? 'Oferta' : 'Manutenção', valor: 25.5 + i * 3, observacao: i % 2 ? 'Registo de exemplo para apresentação do modelo.' : 'Contribuição registada pela equipa de tesouraria.' }));
save(criarTesourariaPDF(movimentos), 'output/pdf/modelo-tesouraria-geral.pdf');
save(criarTesourariaPDF(movimentos.slice(0, 4), { titulo: 'Relatório diário de tesouraria', periodo: 'Movimentos de 05/10/2026' }), 'output/pdf/modelo-tesouraria-diario.pdf');
const dados = { ano: 2026, podeVerFinancas: true, geral: { membros_ativos: 120, membros_total: 135, visitantes_total: 28, convertidos: 8, proximos_eventos: 5, receitas_ano: 18400, despesas_ano: 12650 }, membrosEstado: [{ estado: 'Ativo', total: 120 }, { estado: 'Inativo', total: 15 }], visitantesEstado: [{ estado: 'Visitante', total: 12 }, { estado: 'Em acompanhamento', total: 8 }, { estado: 'Tornou-se membro', total: 8 }], eventosMes: [{ mes: 3, total: 5 }, { mes: 10, total: 4 }], apresentacoesMes: [{ mes: 3, sessoes: 2, criancas: 3 }], financeiroMensal: [{ mes: 3, receitas: 9600, despesas: 6300 }, { mes: 10, receitas: 8800, despesas: 6350 }] };
save(criarRelatorioPDF(dados), 'output/pdf/modelo-relatorio-anual.pdf');
save(criarAtaPDF({ ...reuniao, resumo: 'Texto longo para verificar a continuação da ata sem sobreposição. '.repeat(100) }), 'tmp/pdfs/ata-longa.pdf');
save(criarTesourariaPDF([{ ...movimentos[0], observacao: 'Descrição longa para testar quebras de linha dentro de uma célula. '.repeat(150) }, ...movimentos]), 'tmp/pdfs/tesouraria-longa.pdf');
console.log('Sete modelos de exemplo e duas verificações de paginação criados.');
