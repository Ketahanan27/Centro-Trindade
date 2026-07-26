import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "../utils/toast";
import "../assets/styles/toast.css";

const ICONES = {
  sucesso: "ri-checkbox-circle-line",
  erro: "ri-close-circle-line",
  aviso: "ri-alert-line",
  info: "ri-information-line",
};

function ToastContainer() {
  const [lista, setLista] = useState([]);

  const adicionar = useCallback((novoToast) => {
    const id = `${Date.now()}-${Math.random()}`;

    setLista((prev) => [...prev, { ...novoToast, id, saindo: false }]);

    setTimeout(() => {
      setLista((prev) =>
        prev.map((t) => (t.id === id ? { ...t, saindo: true } : t))
      );
    }, (novoToast.duracao ?? 4000) - 400);

    setTimeout(() => {
      setLista((prev) => prev.filter((t) => t.id !== id));
    }, novoToast.duracao ?? 4000);
  }, []);

  useEffect(() => {
    toast._setDispatch(adicionar);
    return () => toast._setDispatch(null);
  }, [adicionar]);

  const fechar = (id) => {
    setLista((prev) => prev.map((t) => (t.id === id ? { ...t, saindo: true } : t)));
    setTimeout(() => setLista((prev) => prev.filter((t) => t.id !== id)), 350);
  };

  if (!lista.length) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {lista.map((t) => (
        <div
          key={t.id}
          className={`toast-item toast-${t.tipo} ${t.saindo ? "toast-saindo" : ""}`}
          role="alert"
        >
          <i className={ICONES[t.tipo]}></i>
          <span className="toast-mensagem">{t.mensagem}</span>
          <button
            className="toast-fechar"
            onClick={() => fechar(t.id)}
            aria-label="Fechar"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export default ToastContainer;
