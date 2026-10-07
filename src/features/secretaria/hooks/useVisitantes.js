import { ENDPOINTS, visitantesApi } from "../secretaria.api";
import { useState } from "react";
import { usePerfil } from "../../../routes/PerfilContext";
import { toast } from "../../../utils/toast";
import { useListaRemota, executarAcaoCrud } from "../../../utils/useCrud";
import { FORM_VAZIO, formularioDoVisitante, filtrarVisitantes } from "../models/visitantes.model";
export function useVisitantes() {
  const {
    soLeitura
  } = usePerfil();
  const [visitantes,, carregarVisitantes] = useListaRemota(ENDPOINTS.visitantes, "Não foi possível carregar os visitantes. Tente novamente.");
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(FORM_VAZIO);
  const handleChange = e => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
  const handlePhoneChange = e => setFormData({
    ...formData,
    telefone: e.target.value.replace(/\D/g, "")
  });
  const clearForm = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
  };
  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      toast.aviso("O nome é obrigatório.");
      return false;
    }
    if (!formData.telefone.trim()) {
      toast.aviso("O telefone é obrigatório.");
      return false;
    }
    if (!/^\d{9}$/.test(formData.telefone)) {
      toast.aviso("O telefone deve conter exatamente 9 dígitos.");
      return false;
    }
    if (!formData.data_visita) {
      toast.aviso("Selecione a data da visita.");
      return false;
    }
    if (!formData.convidado_por.trim()) {
      toast.aviso("Informe quem convidou o visitante.");
      return false;
    }
    return true;
  };
  const handleCreate = async () => {
    if (!validarFormulario()) return;
    await executarAcaoCrud(visitantesApi.criar(formData), {
      aoSucesso: () => {
        carregarVisitantes();
        clearForm();
        setShowModal(false);
      }
    });
  };
  const handleEdit = async () => {
    if (!validarFormulario() || !editId) return;
    await executarAcaoCrud(visitantesApi.alterar(editId, formData), {
      aoSucesso: () => {
        carregarVisitantes();
        clearForm();
        setShowModal(false);
      }
    });
  };
  const handleDelete = async id => {
    if (!window.confirm("Deseja eliminar este visitante?")) return;
    await executarAcaoCrud(visitantesApi.eliminar(id), {
      aoSucesso: carregarVisitantes
    });
  };
  const handleSelectVisitor = v => {
    setEditId(v.id);
    setFormData(formularioDoVisitante(v));
    setShowModal(true);
  };
  const visitantesFiltrados = filtrarVisitantes(visitantes, search, filtroEstado);
  const totalVisitantes = visitantes.length;
  const acompanhamento = visitantes.filter(v => v.estado === "Em acompanhamento").length;
  const membros = visitantes.filter(v => v.estado === "Tornou-se membro").length;
  const visitante = visitantes.filter(v => v.estado === "Visitante").length;
  const mostrarAcoes = !soLeitura;
  return {
    soLeitura,
    visitantes,
    search,
    setSearch,
    filtroEstado,
    setFiltroEstado,
    showModal,
    setShowModal,
    editId,
    formData,
    handleChange,
    handlePhoneChange,
    clearForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSelectVisitor,
    visitantesFiltrados,
    totalVisitantes,
    acompanhamento,
    membros,
    visitante,
    mostrarAcoes
  };
}
