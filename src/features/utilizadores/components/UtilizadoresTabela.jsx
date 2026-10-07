import styles from "../utilizadores.module.css";
import BadgePerfil from "./BadgePerfil";
export default function UtilizadoresTabela({
  loading,
  filtrados,
  eu,
  setSelectedUser,
  setShowDetails,
  abrirEditar,
  eliminar
}) {
  return <div className={styles["table-wrapper"]}>
          {loading ? <p style={{
      color: "#999",
      padding: "20px"
    }}>A carregar utilizadores...</p> : <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? <tr><td colSpan="5" className={styles["empty-row"]}>Nenhum utilizador encontrado.</td></tr> : filtrados.map(user => <tr key={user.id} className={user.id === eu.id ? styles["row-eu"] : ""}>
                      <td>
                        {user.nome}
                        {user.id === eu.id && <span className={styles["tag-eu"]}>eu</span>}
                      </td>
                      <td>{user.email}</td>
                      <td><BadgePerfil perfil={user.perfil} /></td>
                      <td>
                        <span className={user.estado === "Ativo" ? styles["badge-ativo"] : styles["badge-inativo"]}>
                          {user.estado}
                        </span>
                      </td>
                      <td><div className={styles["users-row-actions"]}>
                        <button className={styles["view"]} title="Detalhes" aria-label="Ver utilizador" onClick={() => {
                setSelectedUser(user);
                setShowDetails(true);
              }}>
                          <i className="ri-eye-line"></i>
                        </button>
                        {user.id !== eu.id && <>
                            <button className={styles["edit"]} title="Editar" aria-label="Editar utilizador" onClick={() => abrirEditar(user)}>
                              <i className="ri-pencil-line"></i>
                            </button>
                            <button className={styles["delete"]} title="Eliminar" aria-label="Eliminar utilizador" onClick={() => eliminar(user)}>
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </>}
                      </div></td>
                    </tr>)}
              </tbody>
            </table>}
        </div>;
}
