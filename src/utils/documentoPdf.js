import { criarPDFOficial } from "./pdfOficial.js";
import { validarDocumento, TITULOS_DOCUMENTO } from "../../shared/documentos.js";
import { formatarData } from "./data.js";

export function criarDocumentoPDF(registo) {
  const erro = validarDocumento(registo);
  if (erro) throw new Error(erro);
  const { tipo, nome_completo: nome, bi, data_emissao: emissao, dados_json: dados } = registo;
  const pdf = criarPDFOficial({ titulo: TITULOS_DOCUMENTO[tipo], departamento: "Secretaria Geral", data: emissao, referencia: registo.id ? `Documento n.º ${registo.id}` : "" });
  pdf.secao("Identificação");
  pdf.paragrafo(`Nome: ${nome}`);
  pdf.paragrafo(`BI / Cartão de Cidadão: ${bi}`);
  pdf.secao("Declaração");
  if (tipo === "Batismo") pdf.paragrafo(`Declaramos que ${nome}, nascido(a) em ${formatarData(dados.data_nascimento)}, foi batizado(a) em ${formatarData(dados.data_batismo)} neste ministério.`);
  if (tipo === "Membro") pdf.paragrafo(`Declaramos que ${nome} é membro desta igreja desde ${formatarData(dados.data_entrada)}, encontrando-se com o estado ${dados.estado}.`);
  if (tipo === "Recomendacao") {
    pdf.paragrafo(`Recomendamos ${nome}, membro desta igreja desde ${formatarData(dados.data_entrada)}, para a igreja ${dados.igreja_destino}.`);
    if (dados.motivo) { pdf.secao("Motivo da recomendação"); pdf.paragrafo(dados.motivo); }
  }
  const doc = pdf.finalizar();

  const prefixo = { Batismo: "Declaracao_Batismo", Membro: "Declaracao_Membro", Recomendacao: "Carta_Recomendacao" }[tipo];
  const nomeFicheiro = `${prefixo}_${nome.replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
  return { doc, nomeFicheiro };
}

export async function emitirDocumentoPDF(registo, guardar, descarregar = (doc, nome) => doc.save(nome)) {
  // Render from the snapshot first, then allow download only after persistence succeeds.
  const { doc, nomeFicheiro } = criarDocumentoPDF(registo);
  if (!await guardar(registo)) return false;
  descarregar(doc, nomeFicheiro);
  return true;
}
