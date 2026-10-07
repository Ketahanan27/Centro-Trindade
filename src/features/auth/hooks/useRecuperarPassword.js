import { useState } from 'react';
import { recuperarPassword } from '../auth.api.js';

export function useRecuperarPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await recuperarPassword(email);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus({ tipo: "erro", texto: data?.message ?? "Erro ao enviar. Tente novamente." });
      } else {
        setStatus({ tipo: "sucesso", texto: data?.message ?? "Email enviado! Verifique a sua caixa de correio." });
      }
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível ligar ao servidor." });
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, status, handleSubmit };
}
