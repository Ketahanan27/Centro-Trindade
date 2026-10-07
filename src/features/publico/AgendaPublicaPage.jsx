import { useMemo } from "react";
import { useAgendaPublica } from "./hooks/useAgendaPublica.js";
import { months } from "./publico.model.js";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import { formatarData } from "../../utils/data";

import "./styles/calendario.css";

function Calendario() {
  const { events, loading, error } = useAgendaPublica();
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

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

    days.push(
      <div
        role="img"
        aria-label={`${day} de ${months[month]} de ${year}${hasEvent ? ", com eventos" : ""}`}
        aria-current={isToday ? "date" : undefined}
        key={dateString}
        className={`day ${isToday ? "today" : ""} ${hasEvent ? "has-event" : ""}`}
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
            <h2 aria-live="polite">{months[month]} {year}</h2>
          </div>

          <div className="weekdays">
            <div>Dom</div><div>Seg</div><div>Ter</div>
            <div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="calendar-days">{days}</div>
        </div>

        <div className="event-box" aria-live="polite" aria-busy={loading}>
          <h3>Eventos públicos</h3>

          {loading ? (
            <p>Carregando eventos...</p>
          ) : error ? (
            <p role="alert">{error} Atualize a página para tentar novamente.</p>
          ) : (
            <>
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
