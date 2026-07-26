import { NavLink, useNavigate } from "react-router-dom";
import { getPerfil, getUser, temAcesso } from "../../utils/rbac";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "ri-dashboard-line", label: "Dashboard", area: "dashboard" },
  { to: "/dashboard/membros", icon: "ri-team-line", label: "Membros", area: "membros" },
  { to: "/dashboard/agenda", icon: "ri-calendar-event-line", label: "Agenda", area: "agenda" },
  { to: "/dashboard/tesouraria", icon: "ri-money-euro-circle-line", label: "Tesouraria", area: "tesouraria" },
  { to: "/dashboard/secretaria", icon: "ri-file-list-3-line", label: "Secretaria", area: "secretaria" },
  { to: "/dashboard/utilizadores", icon: "ri-user-settings-line", label: "Utilizadores", area: "utilizadores" },
  { to: "/dashboard/minha-area", icon: "ri-account-circle-line", label: "Minha Área", area: null },
];

function Sidebar() {
  const navigate = useNavigate();
  const perfil = getPerfil();
  const user = getUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const itensVisiveis = NAV_ITEMS.filter(
    (item) => item.area === null || temAcesso(perfil, item.area)
  );

  return (
    <aside className="sidebar">

      <div className="logo">
        <i className="ri-community-line"></i>
        <h2>TRINDADE</h2>
      </div>

      <ul>
        {itensVisiveis.map((item) => (
          <li key={item.area}>
            <NavLink to={item.to}>
              <i className={item.icon}></i>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          <i className="ri-user-line"></i>
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-nome">{user.nome || "Utilizador"}</span>
          <span className="sidebar-user-perfil">{perfil}</span>
        </div>
      </div>

      <button className="logout" onClick={logout}>
        <i className="ri-logout-box-r-line"></i>
        Terminar Sessão
      </button>

    </aside>
  );
}

export default Sidebar;
