import { useState } from "react";

import Layout from "../components/Layout";

function QuemSomos() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    console.log(form);

    alert("Mensagem enviada!");
  }

  return (
    <Layout>
      <section className="contacto">
        <form onSubmit={handleSubmit}>
          <fieldset>
            <h1>CONTACTO</h1>

            <label>Primeiro Nome</label>

            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
            />

            <label>Telemóvel</label>

            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
            />

            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <label>Mensagem</label>

            <textarea
              name="mensagem"
              value={form.mensagem}
              onChange={handleChange}
            ></textarea>

            <button type="submit" className="btn">
              Enviar
            </button>
          </fieldset>
        </form>
      </section>
    </Layout>
  );
}

export default QuemSomos;