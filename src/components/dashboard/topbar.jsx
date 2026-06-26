function Topbar() {

  // CORRIGIDO: JSON.parse sem try/catch crasha se o valor guardado em
  // localStorage estiver corrompido ou mal formado. Adicionado try/catch
  // com fallback para objeto vazio.
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

        <h3>
          Bem-vindo, {user?.nome ?? "Utilizador"}
        </h3>

        <small>
          {user?.perfil ?? ""}
        </small>

      </div>

      <div className="profile">

        <i className="ri-user-3-line"></i>

      </div>

    </header>
  );
}

export default Topbar;