import { useState, useEffect } from "react";
import { consultarIndicadores } from "../dashboard.api";
export function useDashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let active = true;
    async function carregar() {
      try {
        const res = await consultarIndicadores();
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setDados(data);
      } catch {
        if (active) setErro('Não foi possível carregar os indicadores. Tente novamente.');
      } finally {
        if (active) setLoading(false);
      }
    }
    carregar();
    return () => {
      active = false;
    };
  }, [tentativa]);
  function repetir() {
    setLoading(true);
    setErro(null);
    setTentativa(value => value + 1);
  }
  return {
    dados,
    loading,
    erro,
    repetir
  };
}
