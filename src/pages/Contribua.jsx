import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../assets/styles/home/contribua.css";

import mbway from "../assets/img/mbway.png";
import paypal from "../assets/img/PAYPAL.jpg";
import { apiFetch } from "../utils/api";
import { sanitizarTelefone, validarTelefone } from "../utils/validation";

function Contribua() {

  const [form, setForm] = useState({
    nome: "",
    telemovel: "",
    valor: "",
    descricao: "Selecione uma opção",
  });

  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [status, setStatus] = useState(null);

  // Faz polling do estado da doação enquanto houver um donationId ativo.
  // O intervalo é limpo (clearInterval) quando o componente desmonta ou
  // quando é criada uma nova doação — antes, este setInterval era criado
  // fora de qualquer useEffect e nunca era cancelado ao mudar de página,
  // continuando a chamar a API sobre um componente já desmontado.
  useEffect(() => {
    if (!donationId) return;

    const start = Date.now();
    const poll = setInterval(async () => {
      try {
        const res = await apiFetch(`/api/donate/status/${donationId}`);
        const json = await res.json();
        setStatus(json.status);
        if (json.status === "PAID" || Date.now() - start > 2 * 60 * 1000) {
          clearInterval(poll);
        }
      } catch (err) {
        clearInterval(poll);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [donationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "telemovel" ? sanitizarTelefone(value) : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("Introduza o seu nome.");
      return;
    }

    if (!validarTelefone(form.telemovel)) {
      alert("Introduza um número de telemóvel válido (9 dígitos).");
      return;
    }

    if (!form.valor || Number(form.valor) <= 0) {
      alert("Introduza um valor válido.");
      return;
    }

    if (form.descricao === "Selecione uma opção") {
      alert("Selecione uma descrição.");
      return;
    }

    setLoading(true);
    apiFetch("/api/donate/create", {
      method: "POST",
      body: JSON.stringify(form),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao criar pedido");
        return r.json();
      })
      .then((data) => {
        setDonationId(data.donationId);
        setStatus(data.status);
        setEnviado(true);
        setForm({ nome: "", telemovel: "", valor: "", descricao: "Selecione uma opção" });
      })
      .catch((err) => {
        alert(err.message || "Erro ao enviar pedido");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Layout>

      <h1 className="contribua-title">
        Escolha uma das opções abaixo para cumprir os princípios financeiros:
      </h1>

      <section className="contribua">

        <div className="contribua-left">

          <img
            src={mbway}
            alt="MBWay"
            className="mbway-logo"
          />

          <p>
            Se deseja dizimar ou ofertar,
            preencha os campos abaixo e clique em confirmar.
          </p>

          {enviado && (
            <div className="contribua-sucesso">
              ✓ Pedido MBWay enviado com sucesso! Confirme no seu telemóvel.
            </div>
          )}

          {donationId && (
            <div className="contribua-status">
              <p>ID: {donationId} — Estado: {status}</p>
            </div>
          )}

          <form
            className="contribua-form"
            onSubmit={handleSubmit}
          >

            <label>Nome *</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="O seu nome"
            />

            <label>Telemóvel *</label>
            <input
              type="tel"
              name="telemovel"
              value={form.telemovel}
              onChange={handleChange}
              placeholder="9XXXXXXXX"
              maxLength={9}
            />

            <label>Valor *</label>
            <input
              type="number"
              name="valor"
              value={form.valor}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />

            <label>Descrição *</label>
            <select
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
            >
              <option disabled>Selecione uma opção</option>
              <option>Dízimos</option>
              <option>Oferta</option>
              <option>Voto</option>
              <option>T-Shirts</option>
              <option>Ação Social</option>
            </select>

            <button type="submit" className="btn">
              Confirmar
            </button>

          </form>

        </div>

        <div className="contribua-right">

          <h2>Transferência Bancária</h2>

          <p>Comunidade Centro Trindade</p>

          <p>
            <strong>Banco:</strong> Caixa Geral de Depósitos
          </p>

          <p>
            <strong>IBAN:</strong> PT50 XXXX XXXX XXXX
          </p>

          <p>
            <strong>SWIFT:</strong> CCOMPTPL
          </p>

          <img
            src={paypal}
            alt="PayPal"
            className="paypal-logo"
          />

        </div>

      </section>

    </Layout>
  );
}

export default Contribua;