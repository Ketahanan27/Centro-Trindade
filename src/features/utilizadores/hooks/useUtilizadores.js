import { useState } from "react";
import { getUser } from "../../../utils/rbac";
import { toast } from "../../../utils/toast";
import { useListaRemota, executarAcaoCrud } from "../../../utils/useCrud";
import { UTILIZADORES_ENDPOINT, guardarUtilizador, eliminarUtilizador } from "../utilizadores.api";
import { FORM_VAZIO, filtrarUtilizadores } from "../utilizadores.model";
export function useUtilizadores() {
  const [users, setUsers, carregarUtilizadores, loading] = useListaRemota(UTILIZADORES_ENDPOINT, "Não foi possível carregar os utilizadores. Tente novamente.");
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(FORM_VAZIO);
  const eu = getUser() ?? {};
  const handleChange = e => setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
  const abrirNovo = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
    setShowModal(true);
  };
  const abrirEditar = user => {
    setFormData({
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      estado: user.estado
    });
    setEditId(user.id);
    setShowModal(true);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (formLoading) return;
    setFormLoading(true);
    await executarAcaoCrud(guardarUtilizador(editId, formData), {
      aoSucesso: () => {
        setShowModal(false);
        carregarUtilizadores();
      }
    });
    setFormLoading(false);
  };
  const eliminar = async user => {
    if (user.id === eu.id) {
      toast.erro("Não pode eliminar a sua própria conta.");
      return;
    }
    if (!window.confirm(`Eliminar o utilizador "${user.nome}"?`)) return;
    await executarAcaoCrud(eliminarUtilizador(user.id), {
      aoSucesso: () => setUsers(prev => prev.filter(u => u.id !== user.id))
    });
  };
  const filtrados = filtrarUtilizadores(users, search);
  return {
    users,
    loading,
    formLoading,
    search,
    setSearch,
    showModal,
    setShowModal,
    showDetails,
    setShowDetails,
    selectedUser,
    setSelectedUser,
    editId,
    formData,
    eu,
    handleChange,
    abrirNovo,
    abrirEditar,
    handleSubmit,
    eliminar,
    filtrados
  };
}
