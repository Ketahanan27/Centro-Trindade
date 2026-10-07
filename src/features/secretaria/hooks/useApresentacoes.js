import { ENDPOINTS, apresentacoesApi } from "../secretaria.api";
import { useState } from "react";
import { usePerfil } from "../../../routes/PerfilContext";
import { toast } from "../../../utils/toast";
import { useListaRemota, executarAcaoCrud } from "../../../utils/useCrud";
import { FORM_VAZIO, anosDasApresentacoes, filtrarApresentacoes } from "../models/apresentacoes.model";
export function useApresentacoes() {
  const {
    soLeitura
  } = usePerfil();
  const [apresentacoes,, carregarApresentacoes] = useListaRemota(ENDPOINTS.apresentacoes, "Não foi possível carregar as apresentações. Tente novamente.");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filtroAno, setFiltroAno] = useState("Todos");
  const [formData, setFormData] = useState(FORM_VAZIO);
  const handleChange = e => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
  const totalApresentacoes = apresentacoes.length;
  const totalCriancas = apresentacoes.reduce((t, i) => t + Number(i.quantidade), 0);
  const anosDisponiveis = anosDasApresentacoes(apresentacoes);
  const apresentacoesFiltradas = filtrarApresentacoes(apresentacoes, search, filtroAno);
  const clearForm = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
  };
  const handleCreate = async () => {
    if (!formData.data_apresentacao) {
      toast.aviso("Selecione uma data.");
      return;
    }
    if (!formData.quantidade || Number(formData.quantidade) <= 0) {
      toast.aviso("Quantidade inválida.");
      return;
    }
    await executarAcaoCrud(apresentacoesApi.criar(formData), {
      aoSucesso: () => {
        carregarApresentacoes();
        clearForm();
        setShowModal(false);
      }
    });
  };
  const handleSelect = item => {
    setEditId(item.id);
    setFormData({
      data_apresentacao: item.data_apresentacao?.split("T")[0] || "",
      quantidade: item.quantidade || "",
      observacoes: item.observacoes || ""
    });
    setShowModal(true);
  };
  const handleEdit = async () => {
    if (!editId) return;
    await executarAcaoCrud(apresentacoesApi.alterar(editId, formData), {
      aoSucesso: () => {
        carregarApresentacoes();
        clearForm();
        setShowModal(false);
      }
    });
  };
  const handleDelete = async id => {
    if (!window.confirm("Deseja eliminar este registo?")) return;
    await executarAcaoCrud(apresentacoesApi.eliminar(id), {
      aoSucesso: carregarApresentacoes
    });
  };
  return {
    soLeitura,
    apresentacoes,
    search,
    setSearch,
    showModal,
    setShowModal,
    editId,
    filtroAno,
    setFiltroAno,
    formData,
    handleChange,
    totalApresentacoes,
    totalCriancas,
    anosDisponiveis,
    apresentacoesFiltradas,
    clearForm,
    handleCreate,
    handleSelect,
    handleEdit,
    handleDelete
  };
}
