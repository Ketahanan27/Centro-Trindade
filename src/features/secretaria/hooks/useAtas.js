import { ENDPOINTS, atasApi } from "../secretaria.api";
import { useState } from "react";
import { criarAtaPDF } from "../../../utils/exportacoesPdf.js";
import { usePerfil } from "../../../routes/PerfilContext";
import { toast } from "../../../utils/toast";
import { useListaRemota, executarAcaoCrud } from "../../../utils/useCrud";
import { FORM_VAZIO, filtrarReunioes } from "../models/atas.model";
export function useAtas() {
  const {
    soLeitura
  } = usePerfil();
  const [reunioes, setReunioes, carregarReunioes] = useListaRemota(ENDPOINTS.atas, "Não foi possível carregar as reuniões. Tente novamente.");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(FORM_VAZIO);
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const resetForm = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
    setSelectedMeeting(null);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      toast.aviso("Introduza o título.");
      return;
    }
    if (!formData.data) {
      toast.aviso("Selecione a data.");
      return;
    }
    if (!formData.hora) {
      toast.aviso("Selecione a hora.");
      return;
    }
    await executarAcaoCrud(atasApi.guardar(editId, formData), {
      aoSucesso: () => {
        resetForm();
        setShowModal(false);
        carregarReunioes();
      }
    });
  };
  const handleEdit = reuniao => {
    setFormData({
      titulo: reuniao.titulo,
      data: reuniao.data,
      hora: reuniao.hora,
      local: reuniao.local || "",
      participantes: reuniao.participantes || "",
      resumo: reuniao.resumo || "",
      decisoes: reuniao.decisoes || "",
      observacoes: reuniao.observacoes || ""
    });
    setEditId(reuniao.id);
    setShowModal(true);
  };
  const handleDelete = async id => {
    if (!window.confirm("Eliminar reunião?")) return;
    await executarAcaoCrud(atasApi.eliminar(id), {
      aoSucesso: () => {
        setReunioes(prev => prev.filter(r => r.id !== id));
        if (selectedMeeting?.id === id) setSelectedMeeting(null);
      }
    });
  };
  const handleSelect = reuniao => {
    setSelectedMeeting(reuniao);
  };
  const handleView = reuniao => {
    setSelectedMeeting(reuniao);
    setShowDetails(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Impressão da ata em PDF
  |--------------------------------------------------------------------------
  |
  | Desenha o cabeçalho (logótipo + título) em cada página e quebra o
  | texto automaticamente quando o cursor vertical ultrapassa o limite
  | da folha A4, repetindo o cabeçalho na página seguinte. O rodapé com
  | a numeração de páginas só pode ser escrito no fim, depois de sabermos
  | quantas páginas o documento ocupou no total.
  |
  */
  const handlePrint = () => {
    if (reunioes.length === 0) return;
    const meetingToPrint = selectedMeeting ?? reunioes[0];
    if (!meetingToPrint) return;
    setSelectedMeeting(meetingToPrint);
    setShowDetails(true);
    const doc = criarAtaPDF(meetingToPrint);
    const fileName = `Ata_${meetingToPrint.titulo.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50)}.pdf`;
    doc.save(fileName);
  };
  const filteredMeetings = filtrarReunioes(reunioes, search);
  return {
    soLeitura,
    search,
    setSearch,
    showModal,
    setShowModal,
    showDetails,
    setShowDetails,
    selectedMeeting,
    editId,
    formData,
    handleChange,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSelect,
    handleView,
    handlePrint,
    filteredMeetings
  };
}
