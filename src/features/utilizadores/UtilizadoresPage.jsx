import styles from "./utilizadores.module.css";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { PERFIS } from "./utilizadores.model";
import { useUtilizadores } from "./hooks/useUtilizadores";
import BadgePerfil from "./components/BadgePerfil";
import UtilizadoresTabela from "./components/UtilizadoresTabela";
import UtilizadorFormulario from "./components/UtilizadorFormulario";
import UtilizadorDetalhes from "./components/UtilizadorDetalhes";
export default function UtilizadoresPage() {
  const utilizadores = useUtilizadores();
  const {
    formLoading,
    search,
    setSearch,
    showModal,
    setShowModal,
    showDetails,
    setShowDetails,
    selectedUser,
    setSelectedUser,
    editId,
    formData,
    eu,
    handleChange,
    abrirNovo,
    abrirEditar,
    handleSubmit,
    filtrados
  } = utilizadores;
  return <DashboardLayout>
      <div className={styles["container"] + " " + styles["users-view"]}>

        <div className={styles["page-header"]}>
          <h1>Utilizadores</h1>
          <button className={styles["btn-primary"]} onClick={abrirNovo}>
            <i className="ri-user-add-line"></i> Novo Utilizador
          </button>
        </div>

        <div className={styles["perfis-legend"]}>
          {PERFIS.map(p => <span key={p} className={styles["legend-item"]}>
              <BadgePerfil perfil={p} />
            </span>)}
        </div>

        <div className={styles["users-toolbar"]}>
        <div className={styles["search-box"]}>
          <input type="text" placeholder="Pesquisar por nome, email ou perfil..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className={styles["user-counter"]}>
          {filtrados.length} utilizador(es)
        </div>

        </div>

        <UtilizadoresTabela {...utilizadores} />
      </div>

      {showModal && <UtilizadorFormulario editId={editId} formData={formData} onChange={handleChange} onSubmit={handleSubmit} onClose={() => setShowModal(false)} loading={formLoading} />}

      {showDetails && selectedUser && <UtilizadorDetalhes user={selectedUser} onClose={() => {
      setShowDetails(false);
      setSelectedUser(null);
    }} onEdit={abrirEditar} currentUserId={eu.id} />}

    </DashboardLayout>;
}
