import { TITULOS_DOCUMENTO } from "../../../../shared/documentos.js";
import { formatarData } from "../../../utils/data.js";
import { useDocumentos } from "../hooks/useDocumentos";
import styles from "../secretaria.module.css";
export default function Documentos() {
  const {
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
  } = useDocumentos();
  return <div className={styles["documentos-container"]}>

      {soLeitura && <div className={styles["banner-leitura"]}>
          <i className="ri-eye-line"></i>
          Modo visualização — pode consultar documentos mas não pode criar nem eliminar.
        </div>}

      <header className={styles["documents-heading"]}><h1>Documentos</h1><span>{documentos.length} {documentos.length === 1 ? "documento emitido" : "documentos emitidos"}</span></header>
      <div className={styles["documents-selector"]}>
      <div className={styles["field"]}>
        <label htmlFor="documento-tipo">Tipo de documento</label>
        <select id="documento-tipo" value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)}>
          <option value="Batismo">Declaração de Batismo</option>
          <option value="Membro">Declaração de Membro</option>
          <option value="Recomendacao">Carta de Recomendação</option>
        </select>
      </div>
      <div className={styles["documents-selected-title"]}><i className="ri-file-text-line" aria-hidden="true" /><h2>{TITULOS_DOCUMENTO[tipoDocumento]}</h2></div>
      </div>

      {!soLeitura && <div className={styles["form-card"]}>
          <h3>Dados para emissão</h3>
          <div className={styles["grid"]}>
            <div className={styles["field"]}>
              <label>Nome Completo</label>
              <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} />
            </div>
            <div className={styles["field"]}>
              <label>Nº BI / Cartão de Cidadão</label>
              <input type="text" name="bi" value={formData.bi} onChange={handleChange} />
            </div>

            {tipoDocumento === "Batismo" && <>
                <div className={styles["field"]}>
                  <label>Data de Nascimento</label>
                  <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                </div>
                <div className={styles["field"]}>
                  <label>Data do Batismo</label>
                  <input type="date" name="data_batismo" value={formData.data_batismo} onChange={handleChange} />
                </div>
              </>}

            {tipoDocumento === "Membro" && <>
                <div className={styles["field"]}>
                  <label>Data de Entrada</label>
                  <input type="date" name="data_entrada" value={formData.data_entrada} onChange={handleChange} />
                </div>
                <div className={styles["field"]}>
                  <label>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option>Ativo</option>
                    <option>Inativo</option>
                  </select>
                </div>
              </>}

            {tipoDocumento === "Recomendacao" && <>
                <div className={styles["field"]}>
                  <label>Data de Entrada</label>
                  <input type="date" name="data_entrada" value={formData.data_entrada} onChange={handleChange} />
                </div>
                <div className={styles["field"] + " " + styles["full"]}>
                  <label>Igreja de Destino</label>
                  <input type="text" name="igreja_destino" value={formData.igreja_destino} onChange={handleChange} />
                </div>
                <div className={styles["field"] + " " + styles["full"]}>
                  <label>Motivo</label>
                  <textarea rows="4" name="motivo" value={formData.motivo} onChange={handleChange} />
                </div>
              </>}
          </div>
          <div className={styles["form-actions"]}>
            <button className={styles["save"]} onClick={gerarPDF} disabled={emitindo}>{emitindo ? "A emitir..." : "Gerar PDF"}</button>
          </div>


        </div>}

          <section className={styles["documents-register"]} aria-labelledby="documents-register-title">
            <div className={styles["documents-register-heading"]}><h2 id="documents-register-title">Documentos emitidos</h2><span>{documentos.length} registos</span></div>
          <div className={styles["table-wrapper"]}>
            <table>
              <thead>
                <tr><th>Tipo</th><th>Nome</th><th>BI</th><th>Emissão</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {documentos.length === 0 ? <tr><td colSpan="5" className={styles["empty-row"]}>Nenhum documento emitido.</td></tr> : documentos.map(doc => <tr key={doc.id}>
                      <td><span className={styles["document-type"]}>{doc.tipo === "Recomendacao" ? "Recomendação" : doc.tipo}</span></td>
                      <td>{doc.nome_completo}</td>
                      <td>{doc.bi}</td>
                      <td>{formatarData(doc.data_emissao)}</td>
                      <td><div className={styles["document-row-actions"]}>
                        <button className={styles["edit"]} onClick={() => reimprimir(doc)}>Reimprimir</button>
                        {!soLeitura && <button className={styles["delete"]} onClick={() => eliminarDocumento(doc.id)}>Eliminar</button>}
                      </div></td>
                    </tr>)}
              </tbody>
            </table>
          </div>
          </section>

    </div>;
}
