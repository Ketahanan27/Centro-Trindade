import styles from "../membros.module.css";
export default function MembrosTabela({
  membros,
  soLeitura,
  onVer,
  onEditar,
  onEliminar
}) {
  return <div className={styles["table-wrapper"]}>
      <table>
        <thead>
          <tr><th>Nome</th><th>Telemóvel</th><th>Email</th><th>Estado</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {membros.length === 0 ? <tr><td colSpan="5" style={{
            textAlign: "center"
          }}>Nenhum membro encontrado</td></tr> : membros.map(membro => <tr key={membro.id}>
                <td><div className={styles["member-identity"]}><span className={styles["member-initial"]} aria-hidden="true">{membro.nome?.trim().charAt(0).toUpperCase()}</span><strong>{membro.nome}</strong></div></td>
                <td>{membro.telemovel}</td>
                <td>{membro.email}</td>
                <td>
                  <span className={membro.estado === "Ativo" ? styles["badge-ativo"] : styles["badge-inativo"]}>
                    {membro.estado}
                  </span>
                </td>
                <td><div className={styles["member-actions"]}>
                  <button className={styles["view"]} aria-label="Ver membro" title="Ver detalhes" onClick={() => onVer(membro)}>
                    <i className="ri-eye-line"></i>
                  </button>
                  {!soLeitura && <>
                      <button aria-label="Editar membro" title="Editar" onClick={() => onEditar(membro)}>
                        <i className="ri-pencil-line"></i>
                      </button>
                      <button className={styles["delete"]} aria-label="Eliminar membro" title="Eliminar" onClick={() => onEliminar(membro.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </>}
                </div></td>
              </tr>)}
        </tbody>
      </table>
    </div>;
}
