import { Routes, Route } from "react-router-dom";

import Home from "../features/publico/HomePage";
import Escola120 from "../features/publico/Escola120Page";
import Contribua from "../features/publico/ContribuaPage";
import Formulario from "../features/publico/ContactoPage";
import NotFound from "../features/publico/NotFoundPage";
import Login from "../features/auth/LoginPage";
import Calendario from "../features/publico/AgendaPublicaPage";
import RedefinirPassword from "../features/auth/RedefinirPasswordPage";
import Registo from "../features/auth/AcessoConvitePage";
import PoliticaPrivacidade from "../features/publico/PoliticaPrivacidadePage";
import TermosCondicoes from "../features/publico/TermosCondicoesPage";

import Dashboard from "../features/dashboard/DashboardPage";
import Membros from "../features/membros/MembrosPage";
import Agenda from "../features/agenda/AgendaPage";
import Tesouraria from "../features/tesouraria/TesourariaPage";
import Relatorios from "../features/relatorios/RelatoriosPage";
import Secretaria from "../features/secretaria/SecretariaPage";
import Utilizadores from "../features/utilizadores/UtilizadoresPage";
import MinhaArea from "../features/minha-area/MinhaAreaPage";

import ProtectedRoute from "./ProctedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/escola120" element={<Escola120 />} />
      <Route path="/contribua" element={<Contribua />} />
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registo" element={<Registo />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/redefinir-password" element={<RedefinirPassword />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/termos-condicoes" element={<TermosCondicoes />} />

      <Route path="/dashboard" element={
        <ProtectedRoute area="dashboard"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/membros" element={
        <ProtectedRoute area="membros"><Membros /></ProtectedRoute>
      } />
      <Route path="/dashboard/agenda" element={
        <ProtectedRoute area="agenda"><Agenda /></ProtectedRoute>
      } />
      <Route path="/dashboard/tesouraria" element={
        <ProtectedRoute area="tesouraria"><Tesouraria /></ProtectedRoute>
      } />
      <Route path="/dashboard/secretaria" element={
        <ProtectedRoute area="secretaria"><Secretaria /></ProtectedRoute>
      } />
      <Route path="/dashboard/relatorios" element={<ProtectedRoute area="relatorios"><Relatorios /></ProtectedRoute>} />
      <Route path="/dashboard/utilizadores" element={
        <ProtectedRoute area="utilizadores"><Utilizadores /></ProtectedRoute>
      } />
      <Route path="/dashboard/minha-area" element={
        <ProtectedRoute><MinhaArea /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
