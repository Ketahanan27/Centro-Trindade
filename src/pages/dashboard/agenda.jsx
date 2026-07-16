import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { usePerfil } from "../../routes/ProctedRoute";
import { toast } from "../../utils/toast";
import { apiFetch, apiFetchArray } from "../../utils/api";
import "../../assets/styles/dashboard/agenda.css";

function Agenda() {
  const { soLeitura } = usePerfil();

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "", descricao: "", data_evento: "",
    hora_evento: "", local_evento: "", estado: "Agendado"
  });

  const formatarData = (data) => {
    if (!data) return "";
    const p = data.split("T")[0].split("-");
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const carregarEventos = useCallback(async () => {
    try {
      const data = await apiFetchArray("/api/eventos");
      setEvents(data);
    } catch (error) {
      console.error("[carregarEventos]", error);
    }
  }, []);

  useEffect(() => { carregarEventos(); }, [carregarEventos]);

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
    const temEvento = events.some(e => e.data_evento?.substring(0, 10) === dateString);
    days.push(
      <div key={dateString}
        className={`day ${isToday ? "today" : ""} ${temEvento ? "has-event" : ""} ${selectedDate === dateString ? "selected" : ""}`}
        onClick={() => {
          setSelectedDate(dateString); setSelectedEvent(null);
          setFormData(p => ({ ...p, data_evento: dateString }));
        }}>
        {day}
      </div>
    );
  }

  const clearForm = () => {
    setFormData({ titulo: "", descricao: "", data_evento: "", hora_evento: "", local_evento: "", estado: "Agendado" });
    setEditId(null); setSelectedEvent(null);
  };

  const handleCreate = async () => {
    try {
      const response = await apiFetch("/api/eventos", { method: "POST", body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) { toast.erro(data.message); return; }
      toast.sucesso(data.message); carregarEventos(); clearForm();
    } catch (error) { console.error(error); }
  };

  const handleEdit = async () => {
    if (!editId) { toast.aviso("Selecione um evento."); return; }
    try {
      const response = await apiFetch(`/api/eventos/${editId}`, { method: "PUT", body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) { toast.erro(data.message); return; }
      toast.sucesso(data.message); carregarEventos(); clearForm();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!window.confirm("Deseja eliminar este evento?")) return;
    try {
      const response = await apiFetch(`/api/eventos/${editId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) { toast.erro(data.message); return; }
      toast.sucesso(data.message); carregarEventos(); clearForm();
    } catch (error) { console.error(error); }
  };

  const eventosDoDia = selectedDate
    ? events.filter(e => e.data_evento?.substring(0, 10) === selectedDate) : [];

  const hoje = new Date().toISOString().split("T")[0];

  const eventosDoMes = events.filter(e => {
    const d = new Date(e.data_evento);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const historicoMes = [...eventosDoMes].sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));

  return (
    <DashboardLayout>
      <section className="agenda-container">

        {soLeitura && (
          <div className="banner-leitura">
            <i className="ri-eye-line"></i>
            Modo visualização — não tem permissão para editar eventos.
          </div>
        )}

        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <i className="ri-arrow-left-s-line"></i></button>
            <h2>{months[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <i className="ri-arrow-right-s-line"></i></button>
            <button className="today-btn" onClick={() => {
              const h = new Date(); setCurrentDate(h);
              setSelectedDate(h.toISOString().split("T")[0]); setSelectedEvent(null);
            }}>Hoje</button>
          </div>
          <div className="weekdays">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => <div key={d}>{d}</div>)}
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
            {selectedDate && eventosDoDia.length ? (
              eventosDoDia.map((e, i) => (
                <div key={i}
                  className={`event-item ${selectedEvent === i ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedEvent(i); setEditId(e.id);
                    setFormData({
                      titulo: e.titulo, descricao: e.descricao,
                      data_evento: String(e.data_evento).slice(0, 10),
                      hora_evento: e.hora_evento, local_evento: e.local_evento, estado: e.estado
                    });
                  }}>
                  <strong>{e.titulo}</strong><br />{e.hora_evento}h<br />{e.descricao}
                </div>
              ))
            ) : (
              <div>
                <h4>Eventos deste mês</h4>
                {historicoMes.length === 0 ? (
                  <p className="empty-message">Nenhum evento neste mês.</p>
                ) : (
                  historicoMes.map(e => (
                    <div key={e.id} className="event-item">
                      <strong>{e.titulo}</strong><br />
                      {formatarData(String(e.data_evento))}<br />{e.hora_evento}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {!soLeitura && (
          <>
            <div className="event-form">
              <h3>Dados da atividade</h3>
              <input type="text" placeholder="Título"
                value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} />
              <input type="date" value={formData.data_evento} min={hoje}
                onChange={e => setFormData({ ...formData, data_evento: e.target.value })} />
              <input type="time" value={formData.hora_evento}
                onChange={e => setFormData({ ...formData, hora_evento: e.target.value })} />
              <input type="text" placeholder="Local"
                value={formData.local_evento} onChange={e => setFormData({ ...formData, local_evento: e.target.value })} />
              <textarea rows="4" placeholder="Descrição"
                value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} />
            </div>

            <div className="crud-buttons">
              <button className="btn-create" onClick={handleCreate}>Criar</button>
              <button className="btn-edit" onClick={handleEdit}>Editar</button>
              <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
              <button className="btn-clear" onClick={clearForm}>Limpar</button>
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  );
}

export default Agenda;
