import styles from "../dashboard.module.css";
import { Link } from 'react-router-dom';
export default function Pendencias({
  pendencias
}) {
  return <article className={styles["overview-panel"]}><h2>Pendências</h2><ul className={styles["overview-pending"]}>{pendencias.contasPorAtivar !== null && <li><Link to="/dashboard/utilizadores">Contas por ativar</Link><strong>{pendencias.contasPorAtivar}</strong></li>}<li><Link to="/dashboard/membros">Membros sem conta associada</Link><strong>{pendencias.membrosSemConta}</strong></li></ul><p className={styles["overview-note"]}>Sem conta associada não significa que seja obrigatório criar uma conta.</p></article>;
}
