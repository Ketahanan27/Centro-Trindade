import { useState } from "react";
import Layout from "../components/Layout";

const FORM_VAZIO = { nome: "", telefone: "", email: "", assunto: "", mensagem: "" };

function Formulario() {
  const [form, setForm] = useState(FORM_VAZIO);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

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

  return (
    <Layout>
      <section className="contacto">
        <form onSubmit={handleSubmit}>
          <fieldset>
            <h1>CONTACTO</h1>

            {status && (
              <div className={`contacto-status contacto-status--${status.tipo}`}>
                {status.tipo === "sucesso" ? "✓ " : "✗ "}{status.texto}
              </div>
            )}

            <label>Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <label>Telemóvel</label>
            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              disabled={loading}
            />

            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <label>Assunto</label>
            <input
              type="text"
              name="assunto"
              value={form.assunto}
              onChange={handleChange}
              disabled={loading}
            />

            <label>Mensagem *</label>
            <textarea
              name="mensagem"
              value={form.mensagem}
              onChange={handleChange}
              required
              disabled={loading}
            ></textarea>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "A enviar..." : "Enviar"}
            </button>

          </fieldset>
        </form>
      </section>
    </Layout>
  );
}

export default Formulario;
