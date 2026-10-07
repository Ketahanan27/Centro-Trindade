import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { useMembros } from "./hooks/useMembros";
import MembrosTabela from "./components/MembrosTabela";
import MembroFormulario from "./components/MembroFormulario";
import MembroDetalhes from "./components/MembroDetalhes";
import styles from "./membros.module.css";
export default function MembrosPage() {
  const gestao = useMembros();
  const {
    soLeitura,
    pesquisa,
    setPesquisa,
    membrosFiltrados,
    formularioAberto,
    setFormularioAberto,
    detalhesAbertos,
    setDetalhesAbertos,
    membroSelecionado,
    setMembroSelecionado,
    limparFormulario,
    carregarContas
  } = gestao;
  return <DashboardLayout>
      <div className={styles["members-view"]}>

        {soLeitura && <div className={styles["banner-leitura"]}>
            <i className="ri-eye-line"></i>
            Modo visualização — não tem permissão para editar dados nesta área.
          </div>}

        <div className={styles["page-header"]}>
          <h1>Membros</h1>
          {!soLeitura && <button className={styles["btn-primary"]} onClick={() => {
          limparFormulario();
          carregarContas();
          setFormularioAberto(true);
        }}>
              <i className="ri-user-add-line"></i> Novo Membro
            </button>}
        </div>

        <div className={styles["members-toolbar"]}>
          <div className={styles["search-box"]}>
          <input type="text" placeholder="Pesquisar membro..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
        </div>

        <span className={styles["members-count"]}>{membrosFiltrados.length} {membrosFiltrados.length === 1 ? "membro" : "membros"}</span>
        </div>

        <MembrosTabela membros={membrosFiltrados} soLeitura={soLeitura} onVer={membro => {
        setMembroSelecionado(membro);
        setDetalhesAbertos(true);
      }} onEditar={gestao.editarMembro} onEliminar={gestao.eliminarMembro} />
      </div>
      {formularioAberto && <MembroFormulario
        membroEmEdicaoId={gestao.membroEmEdicaoId}
        perfil={gestao.perfil}
        contas={gestao.contas}
        contasErro={gestao.contasErro}
        formulario={gestao.formulario}
        alterarCampo={gestao.alterarCampo}
        guardarFormulario={gestao.guardarFormulario}
        limparFormulario={limparFormulario}
        onFechar={() => setFormularioAberto(false)}
      />}
      {detalhesAbertos && membroSelecionado && <MembroDetalhes membro={membroSelecionado} onFechar={() => setDetalhesAbertos(false)} />}
    </DashboardLayout>;
}
