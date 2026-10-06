import { useState, useEffect, useMemo } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetchArray } from "../utils/api";
import { formatarData } from "../utils/data";

import "../assets/styles/home/calendario.css";

function Calendario() {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tentativa, setTentativa] = useState(0);
  function carregarEventos() {
    setLoading(true);
    setError(null);
    setTentativa((value) => value + 1);
  }
  useEffect(() => {
    let active = true;
    async function carregar() {
      try {
        const data = await apiFetchArray("/api/eventos");
        if (!active) return;
        setEvents(data.filter((item) => item.estado === "Agendado")
          .map((item) => ({ ...item, data_evento: item.data_evento?.slice(0, 10) })));
        setError(null);
      } catch {
        if (!active) return;
        setError("Erro ao carregar a agenda pública.");
        setEvents([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    carregar();
    return () => { active = false; };
  }, [tentativa]);

  function mudarMes(offset) {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));
    setSelectedDate(null);
  }
  function mostrarHoje() {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => event.data_evento === selectedDate);
  }, [events, selectedDate]);

  const monthEvents = useMemo(
    () => events.filter((event) => {
      if (!event.data_evento) return false;
      const [y, m] = event.data_evento.split("-").map(Number);
      return y === year && m === month + 1;
    }),
    [events, year, month]
  );

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="empty-day" />);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = dateString === todayString;
    const hasEvent = events.some((event) => event.data_evento === dateString);
    const isSelected = selectedDate === dateString;

    days.push(
      <button
        type="button"
        aria-label={`${day} de ${months[month]} de ${year}${hasEvent ? ", com eventos" : ""}`}
        aria-pressed={isSelected}
        aria-current={isToday ? "date" : undefined}
        key={dateString}
        className={`day ${isToday ? "today" : ""} ${hasEvent ? "has-event" : ""} ${isSelected ? "selected" : ""}`}
        onClick={() => setSelectedDate(dateString)}
      >
        {day}
      </button>
    );
  }

  return (
    <>
      <Navbar />

      <section className="calendar-page">
        <h1>Agenda</h1>

        <div className="calendar-container">
          <div className="calendar-header">
            <button type="button" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>‹</button>
            <h2 aria-live="polite">{months[month]} {year}</h2>
            <button type="button" aria-label="Mês seguinte" onClick={() => mudarMes(1)}>›</button>
            <button type="button" onClick={mostrarHoje}>Hoje</button>
          </div>

          <div className="weekdays">
            <div>Dom</div><div>Seg</div><div>Ter</div>
            <div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="calendar-days">{days}</div>
        </div>

        <div className="event-box" aria-live="polite" aria-busy={loading}>
          <h3>{selectedDate ? `Eventos públicos — ${formatarData(selectedDate)}` : "Eventos públicos"}</h3>
          {selectedDate && <button type="button" onClick={() => setSelectedDate(null)}>Ver todos os eventos do mês</button>}

          {loading ? (
            <p>Carregando eventos...</p>
          ) : error ? (
            <div role="alert"><p>{error}</p><button type="button" onClick={carregarEventos}>Tentar novamente</button></div>
          ) : selectedDate ? (
            selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <strong>{event.titulo}</strong>
                  <div className="event-time">{event.hora_evento || "Horário não informado"}</div>
                  {event.descricao && <p>{event.descricao}</p>}
                </div>
              ))
            ) : (
              <p>Não existem eventos públicos para esta data.</p>
            )
          ) : (
            <>
              <p>Selecione um dia para ver os eventos agendados.</p>
              <div className="month-summary">
                <strong>{monthEvents.length}</strong> evento(s) agendado(s) neste mês.
              </div>
              {monthEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <strong>{event.titulo}</strong>
                  <div>{formatarData(event.data_evento)} {event.hora_evento ? `- ${event.hora_evento}` : ""}</div>
                  {event.descricao && <p>{event.descricao}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Calendario;
