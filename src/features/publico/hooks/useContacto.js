import { useState } from 'react';
import { enviarContacto } from '../publico.api.js';

const FORM_VAZIO = { nome: '', telefone: '', email: '', assunto: '', mensagem: '' };

export function useContacto() {
  const [form, setForm] = useState(FORM_VAZIO);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setStatus(null);

    try {
      const res = await enviarContacto(form);

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus({ tipo: "erro", texto: data?.message ?? "Erro ao enviar. Tente novamente." });
        return;
      }

      setStatus({ tipo: "sucesso", texto: data?.message ?? "Mensagem enviada com sucesso!" });
      setForm(FORM_VAZIO);
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível ligar ao servidor. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return { form, loading, status, handleChange, handleSubmit };
}
