import Sidebar from "./sidebar";
import Topbar from "./topbar";

// CORRIGIDO: dashboard.css importado aqui no layout pai para garantir que os
// estilos do sidebar/topbar estão disponíveis em TODAS as rotas do dashboard,
// independentemente de qual página é carregada primeiro
import "../../assets/styles/dashboard/dashboard.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard">

      <Sidebar />

      <main className="content">

        <Topbar />

        {children}

      </main>

    </div>
  );
}

export default DashboardLayout;