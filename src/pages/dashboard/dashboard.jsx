// CORRIGIDO: caminho com case correto (ficheiro é dashboardlayout.jsx, minúsculas)
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import Card from "../../components/dashboard/card";
import "../../assets/styles/dashboard/dashboard.css";

function Dashboard() {
  return (
    <DashboardLayout>

      <section className="cards">

        <Card
          icon="ri-team-line"
          title="Membros"
          value="145"
        />

        <Card
          icon="ri-calendar-event-line"
          title="Eventos"
          value="8"
        />

        <Card
          icon="ri-money-euro-circle-line"
          title="Receitas"
          value="3450€"
        />

        <Card
          icon="ri-user-settings-line"
          title="Utilizadores"
          value="3"
        />

      </section>

      <section className="dashboard-grid">

        <div className="panel">

          <h2>Próximos Eventos</h2>

          <div className="event-item">
            <span>Sunday Service</span>
            <strong>06 Julho</strong>
          </div>

          <div className="event-item">
            <span>Discipulado</span>
            <strong>16 Julho</strong>
          </div>

          <div className="event-item">
            <span>Fornalha</span>
            <strong>23 Julho</strong>
          </div>

        </div>

        <div className="panel">

          <h2>Últimos Membros</h2>

          <div className="event-item">
            <span>João Silva</span>
          </div>

          <div className="event-item">
            <span>Maria Fernandes</span>
          </div>

          <div className="event-item">
            <span>Paulo Costa</span>
          </div>

        </div>

      </section>

      <section className="panel">

        <h2>Relatórios Financeiros</h2>

        <div className="chart-placeholder">
          Área reservada para gráficos
        </div>

      </section>

      <section className="panel">

        <h2>Últimos Movimentos</h2>

        <div className="event-item">
          <span>Dízimo</span>
          <strong>50€</strong>
        </div>

        <div className="event-item">
          <span>Oferta</span>
          <strong>20€</strong>
        </div>

      </section>

    </DashboardLayout>
  );
}

export default Dashboard;