import { useState } from "react";

import Layout from "../components/Layout";

function Formulario() {
  // CORRIGIDO: 'assunto' adicionado ao estado inicial (estava a causar
  // warning "uncontrolled to controlled component")
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    assunto: "",
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

    setForm({
      nome: "",
      telefone: "",
      email: "",
      assunto: "",
      mensagem: "",
    });
  }

  return (
    <Layout>
      <section className="contacto">
        <form onSubmit={handleSubmit}>
          <fieldset>
            <h1>CONTACTO</h1>

            <label>Nome Completo</label>

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

            <label>Assunto</label>

            <input
              type="text"
              name="assunto"
              value={form.assunto}
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

export default Formulario;