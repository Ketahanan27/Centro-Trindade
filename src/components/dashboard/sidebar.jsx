import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="logo">

        <i className="ri-community-line"></i>

        <h2>TRINDADE</h2>

      </div>

      <ul>

        <li>
          <NavLink to="/dashboard">
            <i className="ri-dashboard-line"></i>
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/membros">
            <i className="ri-team-line"></i>
            Membros
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/agenda">
            <i className="ri-calendar-event-line"></i>
            Agenda
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/tesouraria">
            <i className="ri-money-euro-circle-line"></i>
            Tesouraria
          </NavLink>
        </li>

        <li>
          {/* CORRIGIDO: ícone era duplicado de Tesouraria, substituído por ícone adequado */}
          <NavLink to="/dashboard/secretaria">
            <i className="ri-file-list-3-line"></i>
            Secretaria
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/utilizadores">
            <i className="ri-user-settings-line"></i>
            Utilizadores
          </NavLink>
        </li>

      </ul>

      <button
        className="logout"
        onClick={logout}
      >

        <i className="ri-logout-box-r-line"></i>

        Terminar Sessão

      </button>

    </aside>
  );
}

export default Sidebar;