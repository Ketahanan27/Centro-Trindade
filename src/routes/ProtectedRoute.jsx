import { PerfilContext } from "./PerfilContext";
import { Navigate } from "react-router-dom";
import { temAcesso, ehSoLeitura, getPerfil, getUser } from "../utils/rbac";

function ProtectedRoute({ children, area }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const perfil = getPerfil();
  const soLeitura = ehSoLeitura(perfil);

  if (area && !temAcesso(perfil, area)) {
    return <Navigate to="/dashboard" replace state={{ semAcesso: true }} />;
  }

  return (
    <PerfilContext.Provider value={{ perfil, soLeitura, user: getUser() }}>
      {children}
    </PerfilContext.Provider>
  );
}

export default ProtectedRoute;
