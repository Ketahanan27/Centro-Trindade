// CORRIGIDO: removido useEffect — estava importado mas nunca utilizado
import { useState } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";

import Visitantes from "../../components/secretaria/visitantes";
import Documentos from "../../components/secretaria/documentos";
import Relatorios from "../../components/secretaria/relatorios";
import Apresentacoes from "../../components/secretaria/apresentacoes";
import Atas from "../../components/secretaria/atas";

import "../../assets/styles/dashboard/secretaria.css";


function Secretaria() {

    const [activeTab, setActiveTab] =
        useState("visitantes");

    return (

        <DashboardLayout>

            <div className="secretaria-page">

                <div className="secretaria-tabs">

                    <button
                        className={
                            activeTab === "visitantes"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("visitantes")
                        }
                    >
                        Visitantes
                    </button>

                    <button
                        className={
                            activeTab === "documentos"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("documentos")
                        }
                    >
                        Documentos
                    </button>

                    <button
                        className={
                            activeTab === "relatorios"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("relatorios")
                        }
                    >
                        Relatórios
                    </button>

                    <button
                        className={
                            activeTab === "apresentacoes"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("apresentacoes")
                        }
                    >
                        Apresentações
                    </button>

                    <button
                        className={
                            activeTab === "atas"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("atas")
                        }
                    >
                        Reuniões e Atas
                    </button>

                </div>

                <div className="secretaria-content">

                    {activeTab === "visitantes" &&
                        <Visitantes />
                    }

                    {activeTab === "documentos" &&
                        <Documentos />
                    }

                    {activeTab === "relatorios" &&
                        <Relatorios />
                    }

                    {activeTab === "apresentacoes" &&
                        <Apresentacoes />
                    }

                    {activeTab === "atas" &&
                        <Atas />
                    }

                </div>

            </div>

        </DashboardLayout>

    );
}

export default Secretaria;