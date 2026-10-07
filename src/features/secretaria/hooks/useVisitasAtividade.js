import { visitasApi, listarEventosInternos } from "../secretaria.api";
import { useEffect, useState } from 'react';
import { usePerfil } from "../../../routes/PerfilContext";
import { formatarData } from "../../../utils/data";
import { criarVisitasAtividadePDF } from "../../../utils/exportacoesPdf";
import { vazio, consultaContagens, formularioDaAgenda } from "../models/visitasAtividade.model";
export function useVisitasAtividade() {
  const {
    soLeitura
  } = usePerfil();
  const [filtros, setFiltros] = useState({
    inicio: '',
    fim: '',
    pesquisa: ''
  });
  const [pagina, setPagina] = useState(1),
    [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState(null),
    [erro, setErro] = useState(null),
    [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]),
    [agendaErro, setAgendaErro] = useState(false);
  const [form, setForm] = useState(vazio),
    [editId, setEditId] = useState(null),
    [busy, setBusy] = useState(false),
    [feedback, setFeedback] = useState(null);
  const [exportando, setExportando] = useState(false);
  const query = consultaContagens(filtros, pagina);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await visitasApi.consultar(query);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        if (active) {
          setResultado(data);
          setErro(null);
        }
      } catch (error) {
        if (active) setErro(error.message || 'Erro ao carregar as contagens.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [query, tentativa]);
  useEffect(() => {
    let active = true;
    listarEventosInternos().then(data => {
      if (active) setEventos(data);
    }).catch(() => {
      if (active) setAgendaErro(true);
    });
    return () => {
      active = false;
    };
  }, []);
  function recarregar() {
    setLoading(true);
    setTentativa(value => value + 1);
  }
  function filtrar(event) {
    setFiltros({
      ...filtros,
      [event.target.name]: event.target.value
    });
    setPagina(1);
    setLoading(true);
  }
  function alterar(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
    setFeedback(null);
  }
  function escolherEvento(event) { setForm(formularioDaAgenda(form, eventos, event.target.value)); }
  async function guardar(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await visitasApi.guardar(editId, form);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFeedback(data.message);
      setForm(vazio);
      setEditId(null);
      setPagina(1);
      recarregar();
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function eliminar(row) {
    if (busy || !window.confirm(`Eliminar a contagem de ${row.atividade} em ${formatarData(row.data_atividade)}?`)) return;
    setBusy(true);
    try {
      const res = await visitasApi.eliminar(row.id);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (editId === row.id) {
        setEditId(null);
        setForm(vazio);
      }
      setPagina(1);
      recarregar();
      setFeedback(data.message);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function exportar() {
    if (exportando) return;
    setExportando(true);
    try {
      const res = await visitasApi.consultar(consultaContagens(filtros, pagina, true));
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const periodo = `Período: ${filtros.inicio ? formatarData(filtros.inicio) : 'sem início definido'} a ${filtros.fim ? formatarData(filtros.fim) : 'sem fim definido'}.${filtros.pesquisa ? ` Pesquisa: ${filtros.pesquisa}.` : ''}`;
      criarVisitasAtividadePDF(data.registos, periodo).save('visitantes-por-atividade.pdf');
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setExportando(false);
    }
  }
  return {
    soLeitura,
    filtros,
    pagina,
    setPagina,
    resultado,
    erro,
    loading,
    setLoading,
    eventos,
    agendaErro,
    form,
    setForm,
    editId,
    setEditId,
    busy,
    feedback,
    setFeedback,
    exportando,
    recarregar,
    filtrar,
    alterar,
    escolherEvento,
    guardar,
    eliminar,
    exportar
  };
}
