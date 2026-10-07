import { useState } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";

import VisitasAtividade from "../../components/secretaria/visitasAtividade";
import Visitantes from "../../components/secretaria/visitantes";
import Documentos from "../../components/secretaria/documentos";
import Apresentacoes from "../../components/secretaria/apresentacoes";
import Atas from "../../components/secretaria/atas";

import "../../assets/styles/dashboard/secretaria.css";

function Secretaria() {
  const [activeTab, setActiveTab] = useState("visitas-atividade");

  return (
    <DashboardLayout>
      <div className="secretaria-page">

        <div className="secretaria-tabs">
          <button className={activeTab === "visitas-atividade" ? "active" : ""} onClick={() => setActiveTab("visitas-atividade")}>Visitantes por atividade</button>

          <button
            className={activeTab === "visitantes" ? "active" : ""}
            onClick={() => setActiveTab("visitantes")}
          >
            Acompanhamento de visitantes
          </button>

          <button
            className={activeTab === "documentos" ? "active" : ""}
            onClick={() => setActiveTab("documentos")}
          >
            Documentos
          </button>

          <button
            className={activeTab === "apresentacoes" ? "active" : ""}
            onClick={() => setActiveTab("apresentacoes")}
          >
            Apresentações
          </button>

          <button
            className={activeTab === "atas" ? "active" : ""}
            onClick={() => setActiveTab("atas")}
          >
            Reuniões e Atas
          </button>

        </div>

        <div className="secretaria-content">

          {activeTab === "visitantes" && <Visitantes />}
          {activeTab === "visitas-atividade" && <VisitasAtividade />}
          {activeTab === "documentos" && <Documentos />}
          {activeTab === "apresentacoes" && <Apresentacoes />}
          {activeTab === "atas" && <Atas />}

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Secretaria;
