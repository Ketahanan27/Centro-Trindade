import { useState, useEffect } from 'react';
import { listarEventosPublicos } from '../publico.api.js';

export function useAgendaPublica() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function carregar() {
      try {
        const data = await listarEventosPublicos();
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
  }, []);

  return { events, loading, error };
}
