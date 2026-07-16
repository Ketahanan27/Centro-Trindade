import { useState } from "react";
import Layout from "../components/Layout";
import "../assets/styles/home/contribua.css";

import mbway from "../assets/img/mbway.png";
import paypal from "../assets/img/PAYPAL.jpg";
import { apiFetch } from "../utils/api";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("Introduza o seu nome.");
      return;
    }

    if (!form.telemovel.trim() || form.telemovel.length < 9) {
      alert("Introduza um número de telemóvel válido.");
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

        const start = Date.now();
        const poll = setInterval(async () => {
          try {
            const res = await apiFetch(`/api/donate/status/${data.donationId}`);
            const json = await res.json();
            setStatus(json.status);
            if (json.status === "PAID") {
              clearInterval(poll);
              setLoading(false);
            }
            if (Date.now() - start > 2 * 60 * 1000) {
              clearInterval(poll);
              setLoading(false);
            }
          } catch (err) {
            clearInterval(poll);
            setLoading(false);
          }
        }, 2000);

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
              {status !== "PAID" && (
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      const res = await apiFetch(`/api/donate/simulate/${donationId}`, { method: "POST" });
                      if (!res.ok) throw new Error("Simulação falhou");
                      const j = await res.json();
                      setStatus(j.donation.status);
                      alert("Simulado: marcado como PAID");
                    } catch (err) {
                      alert(err.message || "Erro");
                    }
                  }}
                >
                  Simular confirmação (desenvolvimento)
                </button>
              )}
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
