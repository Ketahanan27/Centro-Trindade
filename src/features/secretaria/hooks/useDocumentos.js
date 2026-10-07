import { FORM_VAZIO, dadosParaEmissao } from "../models/documentos.model";
import { ENDPOINTS, documentosApi } from "../secretaria.api";
import { useState } from "react";
import { usePerfil } from "../../../routes/PerfilContext";
import { criarDocumentoPDF, emitirDocumentoPDF } from "../../../utils/documentoPdf.js";
import { toast } from "../../../utils/toast.js";
import { useListaRemota, executarAcaoCrud } from "../../../utils/useCrud";
export function useDocumentos() {
  const {
    soLeitura
  } = usePerfil();
  const [formData, setFormData] = useState(FORM_VAZIO);
  const [documentos,, carregarDocumentos] = useListaRemota(ENDPOINTS.documentos, "Não foi possível carregar os documentos. Tente novamente.");
  const [tipoDocumento, setTipoDocumento] = useState("Batismo");
  const handleChange = e => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
  const [emitindo, setEmitindo] = useState(false);
  const gerarPDF = async () => {
    if (emitindo || soLeitura) return;
    const registo = dadosParaEmissao(formData, tipoDocumento);
    setEmitindo(true);
    try {
      const emitido = await emitirDocumentoPDF(registo, snapshot => executarAcaoCrud(documentosApi.criar(snapshot), {
        mensagemErroRede: "Não foi possível guardar o documento. O PDF não foi emitido."
      }));
      if (emitido) carregarDocumentos();
    } catch (erro) {
      toast.erro(erro.message || "Não foi possível gerar o documento.");
    } finally {
      setEmitindo(false);
    }
  };
  const eliminarDocumento = async id => {
    if (!window.confirm("Eliminar documento?")) return;
    await executarAcaoCrud(documentosApi.eliminar(id), {
      aoSucesso: carregarDocumentos
    });
  };
  const reimprimir = doc => {
    try {
      const pdf = criarDocumentoPDF(doc);
      pdf.doc.save(pdf.nomeFicheiro);
    } catch (erro) {
      toast.erro(`Não foi possível reimprimir: ${erro.message}`);
    }
  };
  return {
    soLeitura,
    formData,
    documentos,
    tipoDocumento,
    setTipoDocumento,
    handleChange,
    emitindo,
    gerarPDF,
    eliminarDocumento,
    reimprimir
  };
}
