import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { useTesouraria } from "./hooks/useTesouraria";
import TesourariaResumo from "./components/TesourariaResumo";
import MovimentoFormulario from "./components/MovimentoFormulario";
import MovimentosFiltros from "./components/MovimentosFiltros";
import MovimentosTabela from "./components/MovimentosTabela";
import ResumoCategorias from "./components/ResumoCategorias";
import styles from "./tesouraria.module.css";
export default function TesourariaPage() {
  const tesouraria = useTesouraria();
  return <DashboardLayout><div className={styles["tesouraria-container"]}>
 {tesouraria.soLeitura && <div className={styles["banner-leitura"]}><i className="ri-eye-line" /> Modo visualização — não tem permissão para registar movimentos.</div>}
 <header className={styles["treasury-heading"]}><h1>Tesouraria</h1><span>{tesouraria.movimentos.length} movimentos</span></header>
 <TesourariaResumo {...tesouraria} />
 {!tesouraria.soLeitura && <><MovimentoFormulario {...tesouraria} /><MovimentosFiltros {...tesouraria} /><MovimentosTabela {...tesouraria} />{tesouraria.totaisPorTipo.length > 0 && <ResumoCategorias {...tesouraria} />}</>}
 </div></DashboardLayout>;
}
