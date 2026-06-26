// CORRIGIDO: placeholder estava completamente vazio — apenas <h2>Relatórios</h2>
// sem qualquer estrutura ou CSS, causando renderização sem layout

function Relatorios() {
  return (
    <div className="secretaria-container">

      <div className="page-header">
        <h1>Relatórios</h1>
      </div>

      <div className="relatorios-grid">

        <div className="relatorio-card">
          <i className="ri-team-line"></i>
          <h3>Membros por Estado</h3>
          <p>Ativos / Inativos</p>
          <span className="em-desenvolvimento">Em desenvolvimento</span>
        </div>

        <div className="relatorio-card">
          <i className="ri-money-euro-circle-line"></i>
          <h3>Relatório Financeiro</h3>
          <p>Entradas, saídas e saldo</p>
          <span className="em-desenvolvimento">Em desenvolvimento</span>
        </div>

        <div className="relatorio-card">
          <i className="ri-calendar-event-line"></i>
          <h3>Eventos por Mês</h3>
          <p>Frequência e participação</p>
          <span className="em-desenvolvimento">Em desenvolvimento</span>
        </div>

        <div className="relatorio-card">
          <i className="ri-user-received-line"></i>
          <h3>Visitantes</h3>
          <p>Conversões e acompanhamento</p>
          <span className="em-desenvolvimento">Em desenvolvimento</span>
        </div>

        <div className="relatorio-card">
          <i className="ri-presentation-line"></i>
          <h3>Apresentações</h3>
          <p>Crianças apresentadas por período</p>
          <span className="em-desenvolvimento">Em desenvolvimento</span>
        </div>

        <div className="relatorio-card">
          <i className="ri-file-chart-line"></i>
          <h3>Relatório Geral</h3>
          <p>Visão consolidada da igreja</p>
          <span className="em-desenvolvimento">Em desenvolvimento</span>
        </div>

      </div>

    </div>
  );
}

export default Relatorios;