import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { redefinirPassword } from '../auth.api.js';

export function useRedefinirPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ nova_password: "", confirmar: "" });
  const [loading, setLoading] = useState(false);
  const [resultado, setStatus] = useState(null);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConf, setMostrarConf] = useState(false);

  const status = token ? resultado : { tipo: "erro", texto: "Link inválido. Verifica se copiaste o endereço completo do email." };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !token) return;

    if (form.nova_password !== form.confirmar) {
      setStatus({ tipo: "erro", texto: "As palavras-passe não coincidem." });
      return;
    }

    if (form.nova_password.length < 8) {
      setStatus({ tipo: "erro", texto: "A palavra-passe deve ter pelo menos 8 caracteres." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await redefinirPassword(token, form.nova_password);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus({ tipo: "erro", texto: data?.message ?? "Erro ao redefinir. Tente novamente." });
        return;
      }

      setStatus({ tipo: "sucesso", texto: data?.message ?? "Palavra-passe atualizada com sucesso!" });
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível ligar ao servidor." });
    } finally {
      setLoading(false);
    }
  };

  return { token, form, loading, status, mostrarNova, setMostrarNova, mostrarConf, setMostrarConf, handleChange, handleSubmit };
}
