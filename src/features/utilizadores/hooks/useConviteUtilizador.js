import { useState } from "react";
import { executarAcaoCrud } from "../../../utils/useCrud";
import { enviarAcesso } from "../utilizadores.api";
export function useConviteUtilizador(user) {
  const [resetLoading, setResetLoading] = useState(false);
  const handleReset = async () => {
    if (resetLoading) return;
    if (!window.confirm(`Enviar ${user.convite_pendente ? "convite" : "link de recuperação"} para ${user.email}?`)) return;
    setResetLoading(true);
    await executarAcaoCrud(enviarAcesso(user));
    setResetLoading(false);
  };
  return {
    resetLoading,
    handleReset
  };
}
