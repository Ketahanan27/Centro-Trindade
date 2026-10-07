import styles from "./minha-area.module.css";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { useMinhaArea } from "./hooks/useMinhaArea";
import PerfilFotografia from "./components/PerfilFotografia";
import PerfilFormulario from "./components/PerfilFormulario";
export default function MinhaAreaPage() {
  const area = useMinhaArea();
  const {
    loading,
    erro,
    membro,
    userLocal
  } = area;
  return <DashboardLayout>
      <div className={styles["minha-area-page"] + " " + styles["personal-view"]}>
        <header className={styles["personal-page-heading"]}><h1>Minha Área</h1></header>
        <PerfilFotografia {...area} />
        {loading && <div className={styles["minha-area-loading"]}>
            <i className="ri-loader-4-line"></i>
            <p>A carregar as suas informações…</p>
          </div>}

        {!loading && erro && <div className={styles["minha-area-aviso"]}>
            <i className="ri-information-line"></i>
            <p>{erro}</p>
            <p>
              Email registado: <strong>{userLocal.email}</strong>
            </p>
          </div>}

        {!loading && membro && <PerfilFormulario {...area} />}

        <p className={styles["minha-area-rodape"]}>
          Nome, email e data de nascimento ficam protegidos para manutenção da identidade do perfil.
        </p>
      </div>
    </DashboardLayout>;
}
