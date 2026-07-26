function Topbar() {
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }

  return (
    <header className="topbar">
      <div className="welcome">
        <h1>Dashboard</h1>
        <h3>Bem-vindo, {user?.nome ?? "Utilizador"}</h3>
        <small>{user?.perfil ?? ""}</small>
      </div>
    </header>
  );
}

export default Topbar;
