import { useState } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { usePerfil } from "../../routes/PerfilContext";
import { toast } from "../../utils/toast";
import { apiFetch } from "../../utils/api";
import { formatarData } from "../../utils/data";
import { useListaRemota, executarAcaoCrud } from "../../utils/useCrud";
import "../../assets/styles/dashboard/agenda.css";
import "../../assets/styles/dashboard/agenda-visual.css";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const FORM_VAZIO = {
  titulo: "", descricao: "", data_evento: "",
  hora_evento: "", local_evento: "", estado: "Agendado", publico: false,
};

function Agenda() {
  const { soLeitura } = usePerfil();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, , carregarEventos] = useListaRemota(
    "/api/eventos/internos",
    "Não foi possível carregar a agenda. Tente novamente."
  );
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(FORM_VAZIO);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="empty-day" />);
  }
  for (let day = 1; day <= lastDay; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const today = new Date();
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const temEvento = events.some((e) => e.data_evento?.substring(0, 10) === dateString);
    days.push(
      <button
        type="button"
        aria-label={`Selecionar ${formatarData(dateString)}`}
        aria-pressed={selectedDate === dateString}
        key={dateString}
        className={`day ${isToday ? "today" : ""} ${temEvento ? "has-event" : ""} ${selectedDate === dateString ? "selected" : ""}`}
        onClick={() => {
          setSelectedDate(dateString);
          setSelectedEvent(null);
          setFormData((p) => ({ ...p, data_evento: dateString }));
        }}
      >
        {day}
      </button>
    );
  }

  const clearForm = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
    setSelectedEvent(null);
  };

  const handleCreate = async () => {
    await executarAcaoCrud(
      apiFetch("/api/eventos", { method: "POST", body: JSON.stringify(formData) }),
      { aoSucesso: () => { carregarEventos(); clearForm(); } }
    );
  };

  const handleEdit = async () => {
    if (!editId) {
      toast.aviso("Selecione um evento.");
      return;
    }
    await executarAcaoCrud(
      apiFetch(`/api/eventos/${editId}`, { method: "PUT", body: JSON.stringify(formData) }),
      { aoSucesso: () => { carregarEventos(); clearForm(); } }
    );
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!window.confirm("Deseja eliminar este evento?")) return;
    await executarAcaoCrud(
      apiFetch(`/api/eventos/${editId}`, { method: "DELETE" }),
      { aoSucesso: () => { carregarEventos(); clearForm(); } }
    );
  };

  const eventosDoDia = selectedDate
    ? events.filter((e) => e.data_evento?.substring(0, 10) === selectedDate)
    : [];

  const hoje = new Date().toISOString().split("T")[0];

  const eventosDoMes = events.filter((e) => e.data_evento?.slice(0, 7) === `${year}-${String(month + 1).padStart(2, "0")}`);

  const historicoMes = [...eventosDoMes].sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));

  return (
    <DashboardLayout>
      <section className="agenda-container">

        <header className="agenda-page-header"><h1>Agenda</h1><span>{eventosDoMes.length} {eventosDoMes.length === 1 ? "atividade" : "atividades"} este mês</span></header>

        {soLeitura && (
          <div className="banner-leitura">
            <i className="ri-eye-line"></i>
            Modo visualização — não tem permissão para editar eventos.
          </div>
        )}

        <div className="calendar-box">
          <div className="calendar-header">
            <button aria-label="Mês anterior" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <h2>{MESES[month]} {year}</h2>
            <button aria-label="Mês seguinte" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <i className="ri-arrow-right-s-line"></i>
            </button>
            <button
              className="today-btn"
              onClick={() => {
                const h = new Date();
                setCurrentDate(h);
                setSelectedDate(h.toISOString().split("T")[0]);
                setSelectedEvent(null);
              }}
            >
              Hoje
            </button>
          </div>
          <div className="weekdays">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-days">{days}</div>
        </div>

        <div className="events-box">
          <h2><i className="ri-calendar-event-line"></i> Gestão de Eventos</h2>
          <div className="selected-date">
            Data Selecionada: <span>{selectedDate ? formatarData(selectedDate) : "Nenhuma"}</span>
          </div>
          <div className="event-counter">Total do mês: {eventosDoMes.length}</div>
          <div className="event-list">
            {!selectedDate && <h4>Eventos deste mês</h4>}
            {(selectedDate ? eventosDoDia : historicoMes).length === 0 ? <p className="empty-message">{selectedDate ? "Nenhum evento neste dia." : "Nenhum evento neste mês."}</p> : (selectedDate ? eventosDoDia : historicoMes).map((e) => (
              <button type="button" key={e.id} className={`event-item ${selectedEvent === e.id ? "selected" : ""}`} aria-pressed={selectedEvent === e.id} onClick={() => {
                setSelectedDate(String(e.data_evento).slice(0,10)); setSelectedEvent(e.id); setEditId(e.id);
                setFormData({ titulo:e.titulo, descricao:e.descricao || "", data_evento:String(e.data_evento).slice(0,10), hora_evento:e.hora_evento || "", local_evento:e.local_evento || "", estado:e.estado, publico:e.publico });
              }}>
                <strong>{e.titulo}</strong>
                {e.descricao && <span className="agenda-event-description">{e.descricao}</span>}
                <span className="agenda-event-meta"><i className="ri-calendar-line" aria-hidden="true" />{formatarData(e.data_evento)}{e.hora_evento && <><i className="ri-time-line" aria-hidden="true" />{e.hora_evento}</>}</span>
                {e.local_evento && <span className="agenda-event-location"><i className="ri-map-pin-line" aria-hidden="true" />{e.local_evento}</span>}
                <span className="agenda-event-badges"><span className={`agenda-status ${e.estado === "Cancelado" ? "cancelado" : e.estado === "Concluído" ? "concluido" : "agendado"}`}>{e.estado}</span><span className="agenda-visibility">{e.publico ? "Público" : "Interno"}</span></span>
              </button>
            ))}
          </div>
        </div>

        {!soLeitura && (
          <div className="agenda-editor">
            <div className="event-form">
              <h3><i className="ri-edit-box-line" aria-hidden="true" /> {editId ? "Editar atividade" : "Nova atividade"}</h3>
              <div className="agenda-form-grid">
                <label className="agenda-field-wide">Título<input type="text" maxLength={150} placeholder="Nome do culto ou atividade" value={formData.titulo} onChange={e => setFormData({...formData,titulo:e.target.value})} /></label>
                <label>Data<input type="date" value={formData.data_evento} min={editId ? undefined : hoje} onChange={e => setFormData({...formData,data_evento:e.target.value})} /></label>
                <label>Hora<input type="time" value={formData.hora_evento} onChange={e => setFormData({...formData,hora_evento:e.target.value})} /></label>
                <label className="agenda-field-wide">Local<input type="text" placeholder="Local da atividade" value={formData.local_evento} onChange={e => setFormData({...formData,local_evento:e.target.value})} /></label>
                <label className="agenda-field-wide">Descrição<textarea rows={3} value={formData.descricao} onChange={e => setFormData({...formData,descricao:e.target.value})} /></label>
                <label>Estado<select value={formData.estado} onChange={e => setFormData({...formData,estado:e.target.value})}><option>Agendado</option><option>Concluído</option><option>Cancelado</option></select></label>
                <label>Visibilidade<select value={formData.publico ? "publico" : "interno"} onChange={e => setFormData({...formData,publico:e.target.value === "publico"})}><option value="interno">Interno</option><option value="publico">Público</option></select></label>
              </div>
              <p className="agenda-visibility-note">Eventos públicos agendados divulgam o título, descrição, data, hora e local.</p>
            </div>
            <div className="crud-buttons">
              <button className="btn-create" onClick={handleCreate}><i className="ri-add-line" aria-hidden="true" /> Criar</button>
              <button className="btn-edit" disabled={!editId} onClick={handleEdit}><i className="ri-pencil-line" aria-hidden="true" /> Guardar alteração</button>
              <button className="btn-delete" disabled={!editId} onClick={handleDelete}><i className="ri-delete-bin-line" aria-hidden="true" /> Eliminar</button>
              <button className="btn-clear" onClick={clearForm}>Limpar</button>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default Agenda;
