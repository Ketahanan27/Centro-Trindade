import { useState, useCallback } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../assets/styles/home/calendario.css";

function Calendario() {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  // CORRIGIDO: getEventsForDate envolvida em useCallback para não ser
  // recriada em cada render — era chamada dentro do loop de dias
  // (até 31x por render) e voltava a ser criada do zero sem necessidade.
  // CORRIGIDO: specialEvents atualizado com datas futuras (as de Jun 2026
  // já passaram) — mantidas como exemplo de evento especial
  const getEventsForDate = useCallback((dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    const events = [];

    // Domingo: Sunday Service
    if (weekday === 0) {
      events.push("Sunday Service - 10h00");
    }

    // Primeiro domingo do mês: Santa Ceia
    if (weekday === 0 && day <= 7) {
      events.push("À Mesa + Santa Ceia");
    }

    // Eventos especiais hardcoded
    const specialEvents = {
      "2026-07-10": ["Conferência Trindade"],
      "2026-07-16": ["Discipulado - 19h30"],
      "2026-07-23": ["Fornalha - 20h00"],
      "2026-08-06": ["Conferência de Jovens"],
      "2026-08-13": ["Discipulado - 19h30"],
    };

    if (specialEvents[dateString]) {
      events.push(...specialEvents[dateString]);
    }

    return events;
  }, []); // sem deps externas — array de eventos e lógica são constantes

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(
      <div key={`empty-${i}`} className="empty-day" />
    );
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const today = new Date();

    const isToday =
      day   === today.getDate()  &&
      month === today.getMonth() &&
      year  === today.getFullYear();

    const hasEvent  = getEventsForDate(dateString).length > 0;
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
            <button onClick={handlePrevMonth}>◀</button>
            <h2>{months[month]} {year}</h2>
            <button onClick={handleNextMonth}>▶</button>
          </div>

          <div className="weekdays">
            <div>Dom</div><div>Seg</div><div>Ter</div>
            <div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="calendar-days">
            {days}
          </div>

        </div>

        <div className="event-box">
          <h3>Eventos</h3>

          {selectedDate ? (
            getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event, index) => (
                <div key={index} className="event-item">
                  {event}
                </div>
              ))
            ) : (
              <p>Não existem eventos para esta data.</p>
            )
          ) : (
            <p>Selecione um dia para visualizar os eventos.</p>
          )}
        </div>

      </section>

      <Footer />
    </>
  );
}

export default Calendario;