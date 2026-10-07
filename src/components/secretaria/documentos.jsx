import { useState } from "react";
import { usePerfil } from "../../routes/PerfilContext";
import { TITULOS_DOCUMENTO } from "../../../shared/documentos.js";
import { criarDocumentoPDF, emitirDocumentoPDF } from "../../utils/documentoPdf.js";
import { formatarData } from "../../utils/data.js";
import { toast } from "../../utils/toast.js";
import { apiFetch } from "../../utils/api";
import { useListaRemota, executarAcaoCrud } from "../../utils/useCrud";
import "../../assets/styles/dashboard/documentos.css";
import "../../assets/styles/dashboard/documentos-visual.css";

function Documentos() {
  const { soLeitura } = usePerfil();

  const [formData, setFormData] = useState({
    nome_completo: "", bi: "", data_nascimento: "", data_batismo: "",
    data_entrada: "", estado: "Ativo", igreja_destino: "", motivo: "",
  });

  const [documentos, , carregarDocumentos] = useListaRemota(
    "/api/documentos",
    "Não foi possível carregar os documentos. Tente novamente."
  );
  const [tipoDocumento, setTipoDocumento] = useState("Batismo");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [emitindo, setEmitindo] = useState(false);

  const gerarPDF = async () => {
    if (emitindo || soLeitura) return;
    const hoje = new Date();
    const dataEmissao = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const registo = {
      tipo: tipoDocumento, nome_completo: formData.nome_completo.trim(),
      bi: formData.bi.trim(), data_emissao: dataEmissao,
      dados_json: { ...formData },
    };
    setEmitindo(true);
    try {
      const emitido = await emitirDocumentoPDF(registo, (snapshot) => executarAcaoCrud(
        apiFetch("/api/documentos", { method: "POST", body: JSON.stringify(snapshot) }),
        { mensagemErroRede: "Não foi possível guardar o documento. O PDF não foi emitido." }
      ));
      if (emitido) carregarDocumentos();
    } catch (erro) {
      toast.erro(erro.message || "Não foi possível gerar o documento.");
    } finally {
      setEmitindo(false);
    }
  };

  const eliminarDocumento = async (id) => {
    if (!window.confirm("Eliminar documento?")) return;
    await executarAcaoCrud(
      apiFetch(`/api/documentos/${id}`, { method: "DELETE" }),
      { aoSucesso: carregarDocumentos }
    );
  };

  const reimprimir = (doc) => {
    try {
      const pdf = criarDocumentoPDF(doc);
      pdf.doc.save(pdf.nomeFicheiro);
    } catch (erro) {
      toast.erro(`Não foi possível reimprimir: ${erro.message}`);
    }
  };

  return (
    <div className="documentos-container">

      {soLeitura && (
        <div className="banner-leitura">
          <i className="ri-eye-line"></i>
          Modo visualização — pode consultar documentos mas não pode criar nem eliminar.
        </div>
      )}

      <header className="documents-heading"><h1>Documentos</h1><span>{documentos.length} {documentos.length === 1 ? "documento emitido" : "documentos emitidos"}</span></header>
      <div className="documents-selector">
      <div className="field">
        <label htmlFor="documento-tipo">Tipo de documento</label>
        <select id="documento-tipo" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
          <option value="Batismo">Declaração de Batismo</option>
          <option value="Membro">Declaração de Membro</option>
          <option value="Recomendacao">Carta de Recomendação</option>
        </select>
      </div>
      <div className="documents-selected-title"><i className="ri-file-text-line" aria-hidden="true" /><h2>{TITULOS_DOCUMENTO[tipoDocumento]}</h2></div>
      </div>

      {!soLeitura && (
        <div className="form-card">
          <h3>Dados para emissão</h3>
          <div className="grid">
            <div className="field">
              <label>Nome Completo</label>
              <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Nº BI / Cartão de Cidadão</label>
              <input type="text" name="bi" value={formData.bi} onChange={handleChange} />
            </div>

            {tipoDocumento === "Batismo" && (
              <>
                <div className="field">
                  <label>Data de Nascimento</label>
                  <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Data do Batismo</label>
                  <input type="date" name="data_batismo" value={formData.data_batismo} onChange={handleChange} />
                </div>
              </>
            )}

            {tipoDocumento === "Membro" && (
              <>
                <div className="field">
                  <label>Data de Entrada</label>
                  <input type="date" name="data_entrada" value={formData.data_entrada} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option>Ativo</option>
                    <option>Inativo</option>
                  </select>
                </div>
              </>
            )}

            {tipoDocumento === "Recomendacao" && (
              <>
                <div className="field">
                  <label>Data de Entrada</label>
                  <input type="date" name="data_entrada" value={formData.data_entrada} onChange={handleChange} />
                </div>
                <div className="field full">
                  <label>Igreja de Destino</label>
                  <input type="text" name="igreja_destino" value={formData.igreja_destino} onChange={handleChange} />
                </div>
                <div className="field full">
                  <label>Motivo</label>
                  <textarea rows="4" name="motivo" value={formData.motivo} onChange={handleChange} />
                </div>
              </>
            )}
          </div>
          <div className="form-actions">
            <button className="save" onClick={gerarPDF} disabled={emitindo}>{emitindo ? "A emitir..." : "Gerar PDF"}</button>
          </div>


        </div>
      )}

          <section className="documents-register" aria-labelledby="documents-register-title">
            <div className="documents-register-heading"><h2 id="documents-register-title">Documentos emitidos</h2><span>{documentos.length} registos</span></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Tipo</th><th>Nome</th><th>BI</th><th>Emissão</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {documentos.length === 0 ? (
                  <tr><td colSpan="5" className="empty-row">Nenhum documento emitido.</td></tr>
                ) : (
                  documentos.map((doc) => (
                    <tr key={doc.id}>
                      <td><span className="document-type">{doc.tipo === "Recomendacao" ? "Recomendação" : doc.tipo}</span></td>
                      <td>{doc.nome_completo}</td>
                      <td>{doc.bi}</td>
                      <td>{formatarData(doc.data_emissao)}</td>
                      <td><div className="document-row-actions">
                        <button className="edit" onClick={() => reimprimir(doc)}>Reimprimir</button>
                        {!soLeitura && <button className="delete" onClick={() => eliminarDocumento(doc.id)}>Eliminar</button>}
                      </div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </section>

    </div>
  );
}

export default Documentos;
