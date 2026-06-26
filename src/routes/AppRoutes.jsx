import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Escola120 from "../pages/Escola120";
import Contribua from "../pages/Contribua";
import Formulario from "../pages/Formulario";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Registo from "../pages/registro";
import Calendario from "../pages/calendario";
import Dashboard from "../pages/dashboard/dashboard";
import Membros from "../pages/dashboard/membros";
import Agenda from "../pages/dashboard/agenda";
import Tesouraria from "../pages/dashboard/tesouraria";
import Secretaria from "../pages/dashboard/secretaria";
import Utilizadores from "../pages/dashboard/utilizadores";

import ProtectedRoute from "../routes/ProctedRoute";

// CORRIGIDO: removido import desnecessário de Visitantes — este componente é
// um sub-componente da Secretaria e não deve ter rota própria sem DashboardLayout

function AppRoutes() {
  return (
    <Routes>

      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/escola120" element={<Escola120 />} />
      <Route path="/contribua" element={<Contribua />} />
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registo" element={<Registo />} />
      <Route path="/calendario" element={<Calendario />} />

      {/* Rotas Protegidas do Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/membros"
        element={
          <ProtectedRoute>
            <Membros />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/tesouraria"
        element={
          <ProtectedRoute>
            <Tesouraria />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/secretaria"
        element={
          <ProtectedRoute>
            <Secretaria />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/utilizadores"
        element={
          <ProtectedRoute>
            <Utilizadores />
          </ProtectedRoute>
        }
      />

      {/* CORRIGIDO: rota /dashboard/visitantes removida — Visitantes é acedido
          através do tab "Visitantes" dentro de /dashboard/secretaria.
          Não deve ter rota própria sem DashboardLayout (sidebar/topbar). */}

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;