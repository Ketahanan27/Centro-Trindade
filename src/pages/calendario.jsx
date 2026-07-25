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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const data = await apiFetchArray("/api/eventos");
      const publicEvents = data
        .filter((item) => item.estado === "Agendado")
        .map((item) => ({
          ...item,
          data_evento: item.data_evento?.slice(0, 10),
        }));
      setEvents(publicEvents);
      setError(null);
    } catch (err) {
      console.error("[carregarEventos]", err);
      setError("Erro ao carregar a agenda pública.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

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

  const handlePrevMonth = () => {
  };

  const handleNextMonth = () => {
  };

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
      <div
        key={dateString}
        className={`day ${isToday ? "today" : ""} ${hasEvent ? "has-event" : ""} ${isSelected ? "selected" : ""}`}
        onClick={() => setSelectedDate(dateString)}
      >
        {day}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <section className="calendar-page">
        <h1>Agenda</h1>

        <div className="calendar-container">
          <div className="calendar-header">
            <h2>{months[month]} {year}</h2>
          </div>

          <div className="weekdays">
            <div>Dom</div><div>Seg</div><div>Ter</div>
            <div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="calendar-days">{days}</div>
        </div>

        <div className="event-box">
          <h3>Eventos públicos</h3>

          {loading ? (
            <p>Carregando eventos...</p>
          ) : error ? (
            <p>{error}</p>
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