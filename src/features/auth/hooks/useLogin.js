import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { autenticar } from '../auth.api.js';

export function useLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessaoExpirada = searchParams.get("sessao") === "expirada";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [erroLogin, setErroLogin] = useState(null);

  const [avisarExpiracao, setAvisarExpiracao] = useState(true);
  const mensagemLogin = erroLogin || (sessaoExpirada && avisarExpiracao ? "A sua sessão expirou. Por favor inicie sessão novamente." : null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErroLogin(null);
    setAvisarExpiracao(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErroLogin(null);
    setAvisarExpiracao(false);

    try {
      const response = await autenticar(formData);

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        setErroLogin(err?.message ?? `Erro ${response.status}: servidor indisponível.`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("ERRO login:", error);
      setErroLogin("Não foi possível ligar ao servidor. Confirma que o backend está a correr.");
      setLoading(false);
    }
  };

  return { formData, loading, showPassword, setShowPassword, mostrarRecuperar, setMostrarRecuperar, mensagemLogin, handleChange, handleSubmit };
}
