import { useState } from "react";
import { usePerfil } from "../../routes/ProctedRoute";
import { jsPDF } from "jspdf";
import { apiFetch } from "../../utils/api";
import { useListaRemota, executarAcaoCrud } from "../../utils/useCrud";
import "../../assets/styles/dashboard/documentos.css";

const TITULOS_DOCUMENTO = {
  Batismo: "Declaração de Batismo",
  Membro: "Declaração de Membro",
  Recomendacao: "Carta de Recomendação",
};

function Documentos() {
  const { soLeitura } = usePerfil();

  const [formData, setFormData] = useState({
    nome_completo: "", bi: "", data_nascimento: "", data_batismo: "",
    data_entrada: "", estado: "Ativo", igreja_destino: "", motivo: ""
  });

  const [documentos, , carregarDocumentos] = useListaRemota(
    "/api/documentos",
    "Não foi possível carregar os documentos. Tente novamente."
  );
  const [tipoDocumento, setTipoDocumento] = useState("Batismo");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const criarCabecalho = (doc, titulo) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("MINISTÉRIO CENTRO TRINDADE", 105, 20, { align: "center" });
    doc.setFontSize(11); doc.text("Secretaria Geral", 105, 28, { align: "center" });
    doc.line(20, 35, 190, 35); doc.setFontSize(16);
    doc.text(titulo, 105, 50, { align: "center" });
  };
  const criarRodape = (doc) => {
    doc.text(`Emitido em ${new Date().toLocaleDateString("pt-PT")}`, 20, 220);
    doc.line(20, 250, 80, 250); doc.text("Pastor", 25, 258);
    doc.line(120, 250, 180, 250); doc.text("Secretária", 138, 258);
  };

  const gerarBatismo = () => {
    const doc = new jsPDF(); criarCabecalho(doc, "DECLARAÇÃO DE BATISMO"); doc.setFontSize(12);
    doc.text(`Declaramos que ${formData.nome_completo}, BI nº ${formData.bi}, nascido(a) em ${new Date(formData.data_nascimento).toLocaleDateString("pt-PT")}, foi batizado(a) em ${new Date(formData.data_batismo).toLocaleDateString("pt-PT")}.`, 20, 80, { maxWidth: 170, align: "justify" });
    criarRodape(doc); doc.save(`Declaracao_Batismo_${formData.nome_completo}.pdf`);
  };
  const gerarMembro = () => {
    const doc = new jsPDF(); criarCabecalho(doc, "DECLARAÇÃO DE MEMBRO"); doc.setFontSize(12);
    doc.text(`Declaramos que ${formData.nome_completo}, BI nº ${formData.bi}, é membro desta igreja desde ${new Date(formData.data_entrada).toLocaleDateString("pt-PT")}, estado ${formData.estado}.`, 20, 80, { maxWidth: 170, align: "justify" });
    criarRodape(doc); doc.save(`Declaracao_Membro_${formData.nome_completo}.pdf`);
  };
  const gerarRecomendacao = () => {
    const doc = new jsPDF(); criarCabecalho(doc, "CARTA DE RECOMENDAÇÃO"); doc.setFontSize(12);
    doc.text(`Recomendamos ${formData.nome_completo}, BI nº ${formData.bi}, membro desde ${new Date(formData.data_entrada).toLocaleDateString("pt-PT")}, para a igreja ${formData.igreja_destino}.`, 20, 80, { maxWidth: 170, align: "justify" });
    if (formData.motivo) doc.text(`Motivo: ${formData.motivo}`, 20, 120, { maxWidth: 170 });
    criarRodape(doc); doc.save(`Carta_Recomendacao_${formData.nome_completo}.pdf`);
  };

  const salvarDocumento = async () => {
    // O gerarPDF() que chama esta função gera o PDF de qualquer forma, mesmo
    // que este pedido falhe — por isso o aviso de erro de rede é explícito
    // sobre isso, em vez de usar a mensagem genérica do executarAcaoCrud.
    await executarAcaoCrud(
      apiFetch("/api/documentos", {
        method: "POST",
        body: JSON.stringify({
          tipo: tipoDocumento, nome_completo: formData.nome_completo,
          bi: formData.bi, data_emissao: new Date().toISOString().split("T")[0],
          dados_json: formData
        })
      }),
      {
        aoSucesso: carregarDocumentos,
        mensagemErroRede: "Não foi possível ligar ao servidor. O PDF foi gerado, mas o registo não foi guardado.",
      }
    );
  };

  const gerarPDF = async () => {
    await salvarDocumento();
    if (tipoDocumento === "Batismo") gerarBatismo();
    if (tipoDocumento === "Membro") gerarMembro();
    if (tipoDocumento === "Recomendacao") gerarRecomendacao();
  };

  const eliminarDocumento = async (id) => {
    if (!window.confirm("Eliminar documento?")) return;
    await executarAcaoCrud(
      apiFetch(`/api/documentos/${id}`, { method: "DELETE" }),
      { aoSucesso: carregarDocumentos }
    );
  };

  const reimprimir = (doc) => {
    setFormData(doc.dados_json || {});
    if (doc.tipo === "Batismo") gerarBatismo();
    if (doc.tipo === "Membro") gerarMembro();
    if (doc.tipo === "Recomendacao") gerarRecomendacao();
  };

  return (
    <div className="documentos-container">

      {soLeitura && (
        <div className="banner-leitura">
          <i className="ri-eye-line"></i>
          Modo visualização — pode consultar documentos mas não pode criar nem eliminar.
        </div>
      )}

      <div className="field">
        <label>Tipo de Documento</label>
        <select value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)}>
          <option value="Batismo">Declaração de Batismo</option>
          <option value="Membro">Declaração de Membro</option>
          <option value="Recomendacao">Carta de Recomendação</option>
        </select>
      </div>
      <br />
      <div className="page-header"><h1>{TITULOS_DOCUMENTO[tipoDocumento]}</h1></div>

      {!soLeitura && (
        <div className="form-card">
          <div className="grid">
            <div className="field"><label>Nome Completo</label>
              <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} /></div>
            <div className="field"><label>Nº BI / Cartão de Cidadão</label>
              <input type="text" name="bi" value={formData.bi} onChange={handleChange} /></div>

            {tipoDocumento === "Batismo" && (<>
              <div className="field"><label>Data de Nascimento</label>
                <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} /></div>
              <div className="field"><label>Data do Batismo</label>
                <input type="date" name="data_batismo" value={formData.data_batismo} onChange={handleChange} /></div>
            </>)}

            {tipoDocumento === "Membro" && (<>
              <div className="field"><label>Data de Entrada</label>
                <input type="date" name="data_entrada" value={formData.data_entrada} onChange={handleChange} /></div>
              <div className="field"><label>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange}>
                  <option>Ativo</option><option>Inativo</option></select></div>
            </>)}

            {tipoDocumento === "Recomendacao" && (<>
              <div className="field"><label>Data de Entrada</label>
                <input type="date" name="data_entrada" value={formData.data_entrada} onChange={handleChange} /></div>
              <div className="field full"><label>Igreja de Destino</label>
                <input type="text" name="igreja_destino" value={formData.igreja_destino} onChange={handleChange} /></div>
              <div className="field full"><label>Motivo</label>
                <textarea rows="4" name="motivo" value={formData.motivo} onChange={handleChange} /></div>
            </>)}
          </div>
          <div className="form-actions">
            <button className="save" onClick={gerarPDF}>Gerar PDF</button>
          </div>

          <br /><br />

          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Tipo</th><th>Nome</th><th>BI</th><th>Data</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {documentos.length === 0 ? (
                  <tr><td colSpan="5" className="empty-row">Nenhum documento emitido.</td></tr>
                ) : (
                  documentos.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.tipo}</td>
                      <td>{doc.nome_completo}</td>
                      <td>{doc.bi}</td>
                      <td>{new Date(doc.data_emissao).toLocaleDateString("pt-PT")}</td>
                      <td>
                        <button className="edit" onClick={() => reimprimir(doc)}>Reimprimir</button>
                        {!soLeitura && <button className="delete" onClick={() => eliminarDocumento(doc.id)}>Eliminar</button>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
export default Documentos;