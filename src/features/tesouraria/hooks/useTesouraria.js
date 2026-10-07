import { useState, useEffect, useCallback, useMemo } from "react";
import { usePerfil } from "../../../routes/PerfilContext";
import { toast } from "../../../utils/toast";
import { formatarData } from "../../../utils/data";
import { criarTesourariaPDF } from "../../../utils/exportacoesPdf";
import { listarMovimentos, guardarMovimento, eliminarMovimento } from "../tesouraria.api";
import { TIPOS, dataHoje, formularioVazio, formularioDoMovimento, calcularResumo, filtrarMovimentos, paginarMovimentos, calcularTotaisPorTipo } from "../tesouraria.model";
export function useTesouraria() {
  const {
    soLeitura
  } = usePerfil();
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroNatureza, setFiltroNatureza] = useState("Todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [form, setForm] = useState(() => formularioVazio());
  const [saving, setSaving] = useState(false);
  const carregarMovimentos = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await listarMovimentos();
      setMovimentos(dados);
    } catch (err) {
      console.error("[carregarMovimentos]", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let ativo = true;
    listarMovimentos().then(dados => {
      if (ativo) setMovimentos(dados);
    }).catch(() => {
      if (ativo) toast.erro("Não foi possível carregar os movimentos.");
    }).finally(() => {
      if (ativo) setLoading(false);
    });
    return () => {
      ativo = false;
    };
  }, []);
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    if (name === "natureza") {
      setForm(prev => ({
        ...prev,
        natureza: value,
        tipo: TIPOS[value][0]
      }));
      return;
    }
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const limparCampos = () => {
    setForm(formularioVazio());
    setEditId(null);
  };
  const validar = () => {
    if (!form.valor || Number(form.valor) <= 0) {
      toast.aviso("Introduza um valor válido.");
      return false;
    }
    if (!form.data) {
      toast.aviso("Selecione uma data.");
      return false;
    }
    return true;
  };
  const handleSubmit = async () => {
    if (saving) return;
    if (!validar()) return;
    if (editId && form.motivo.trim().length < 5) {
      toast.aviso("Indique o motivo da alteração (mínimo 5 caracteres).");
      return;
    }
    const payload = {
      natureza: form.natureza,
      tipo: form.tipo,
      valor: form.valor,
      data: form.data,
      observacao: form.observacao.trim() || null,
      motivo: form.motivo
    };
    setSaving(true);
    try {
      const res = await guardarMovimento(editId, payload);
      const data = await res.json();
      if (!res.ok) {
        toast.erro(data.message);
        return;
      }
      toast.sucesso(data.message);
      limparCampos();
      carregarMovimentos();
    } catch (err) {
      console.error("[handleSubmit]", err);
      toast.erro("Erro ao comunicar com o servidor.");
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = mov => {
    setEditId(mov.id);
    setForm(formularioDoMovimento(mov));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const handleDelete = async id => {
    if (saving) return;
    if (!window.confirm("Eliminar este movimento permanentemente?")) return;
    const motivo = window.prompt("Motivo da eliminação (5 a 500 caracteres):");
    if (motivo === null) return;
    if (motivo.trim().length < 5 || motivo.length > 500) {
      toast.aviso("Indique um motivo válido.");
      return;
    }
    setSaving(true);
    try {
      const res = await eliminarMovimento(id, motivo);
      const data = await res.json();
      if (!res.ok) {
        toast.erro(data.message);
        return;
      }
      setMovimentos(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("[handleDelete]", err);
      toast.erro("Erro ao comunicar com o servidor.");
    } finally {
      setSaving(false);
    }
  };
  const {
    entradas,
    saidas,
    saldo
  } = useMemo(() => calcularResumo(movimentos), [movimentos]);
  const movimentosFiltrados = useMemo(() => filtrarMovimentos(movimentos, pesquisa, filtroNatureza), [movimentos, pesquisa, filtroNatureza]);
  const {
    totalPaginas,
    paginaVisivel,
    movimentosDaPagina
  } = paginarMovimentos(movimentosFiltrados, paginaAtual);
  const totaisPorTipo = useMemo(() => calcularTotaisPorTipo(movimentos), [movimentos]);
  const exportarPDF = (listaMovimentos = movimentos, titulo = "Tesouraria — Relatório") => {
    if (!listaMovimentos.length) {
      toast.aviso(titulo.includes("Dia") ? "Não há movimentos para o dia selecionado." : "Não há movimentos para exportar.");
      return;
    }
    const doc = criarTesourariaPDF(listaMovimentos, {
      titulo: titulo.replace("—", "-"),
      periodo: titulo.includes("Dia") ? `Movimentos de ${formatarData(form.data || dataHoje())}` : "Todos os movimentos registados"
    });
    const nomeArquivo = titulo.includes("Dia") ? `tesouraria_dia_${form.data || dataHoje()}.pdf` : `tesouraria_${dataHoje()}.pdf`;
    doc.save(nomeArquivo);
  };
  const exportarPDFDia = () => {
    const dataSelecionada = form.data || dataHoje();
    const movimentosDoDia = movimentos.filter(mov => mov.data === dataSelecionada);
    exportarPDF(movimentosDoDia, `Tesouraria — Dia ${formatarData(dataSelecionada)}`);
  };
  return {
    soLeitura,
    movimentos,
    loading,
    editId,
    form,
    handleChange,
    handleSubmit,
    saving,
    limparCampos,
    entradas,
    saidas,
    saldo,
    pesquisa,
    setPesquisa,
    setPaginaAtual,
    filtroNatureza,
    setFiltroNatureza,
    exportarPDF,
    exportarPDFDia,
    movimentosFiltrados,
    movimentosDaPagina,
    handleEdit,
    handleDelete,
    totalPaginas,
    paginaVisivel,
    totaisPorTipo
  };
}
