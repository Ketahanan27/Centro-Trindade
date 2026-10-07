import { useState } from "react";
import { consultarRelatorio } from "../relatorios.api";
import { datasPreset, nomeDoRelatorio } from "../relatorios.model";
import { criarRelatorioGlobalPDF } from "../../../utils/relatorioGlobalPdf";
export function useRelatorios() {
  const [periodo, setPeriodo] = useState(() => datasPreset('ano'));
  const [preset, setPreset] = useState('ano');
  const [dados, setDados] = useState(null);
  const [notas, setNotas] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  async function gerar(modo, exportar = false) {
    if (busy) return;
    setBusy(true);
    setErro('');
    try {
      const response = await consultarRelatorio(periodo, modo);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Não foi possível gerar o relatório.');
      setDados(result);
      if (exportar) criarRelatorioGlobalPDF(result, notas).save(nomeDoRelatorio(modo, result));
    } catch (error) {
      setErro(error.message);
    } finally {
      setBusy(false);
    }
  }
  const alterar = (key, value) => {
    setPeriodo(current => ({
      ...current,
      [key]: value
    }));
    setPreset('personalizado');
    setDados(null);
  };
  const selecionarPreset = value => {
    setPreset(value);
    if (value !== "personalizado") setPeriodo(datasPreset(value));
    setDados(null);
  };
  return {
    periodo,
    preset,
    dados,
    notas,
    setNotas,
    busy,
    erro,
    gerar,
    alterar,
    selecionarPreset
  };
}
