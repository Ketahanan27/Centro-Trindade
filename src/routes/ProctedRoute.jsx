import { createContext, useContext } from "react";
import { Navigate } from "react-router-dom";
import { temAcesso, ehSoLeitura, getPerfil, getUser } from "../utils/rbac";

export const PerfilContext = createContext({ perfil: "Membro", soLeitura: false });
export const usePerfil = () => useContext(PerfilContext);

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
