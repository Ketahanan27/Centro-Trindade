import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import "../../assets/styles/dashboard/tesouraria.css";

function Tesouraria() {
  const hoje = new Date();

  const dataAtual =
    hoje.toISOString().split("T")[0];

  const dataMinima = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate() - 7
  )
    .toISOString()
    .split("T")[0];

  const [movimentos, setMovimentos] = useState(() => {
    const dados = localStorage.getItem("movimentos");
    return dados ? JSON.parse(dados) : [];
  });

  const [editIndex, setEditIndex] = useState(null);

  const [pesquisa, setPesquisa] = useState("");

  const [form, setForm] = useState({
    tipo: "Dízimo",
    valor: "",
    data: dataAtual,
    obs: "",
  });

  useEffect(() => {
    localStorage.setItem("movimentos", JSON.stringify(movimentos));
  }, [movimentos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const limparCampos = () => {
    setForm({
      tipo: "Dízimo",
      valor: "",
      data: dataAtual,
      obs: "",
    });
    setEditIndex(null);
  };

  const salvarMovimento = () => {
    if (!form.valor || Number(form.valor) <= 0) {
      alert("Introduza um valor válido.");
      return;
    }

    if (!form.data) {
      alert("Selecione uma data.");
      return;
    }

    if (form.data < dataMinima || form.data > dataAtual) {
      alert("A data deve estar entre os últimos 7 dias e hoje.");
      return;
    }

    const movimento = {
      ...form,
      valor: Number(form.valor),
    };

    if (editIndex !== null) {
      const copia = [...movimentos];
      copia[editIndex] = movimento;
      setMovimentos(copia);
    } else {
      setMovimentos([...movimentos, movimento]);
    }

    alert("Movimento guardado com sucesso.");
    limparCampos();
  };

  const editar = (index) => {
    const movimento = movimentosFiltrados[index];
    const indiceOriginal = movimentos.findIndex((m) => m === movimento);
    setForm(movimento);
    setEditIndex(indiceOriginal);
  };

  const remover = (index) => {
    const movimento = movimentosFiltrados[index];
    const indiceOriginal = movimentos.findIndex((m) => m === movimento);
    if (window.confirm("Deseja eliminar este movimento?")) {
      const copia = [...movimentos];
      copia.splice(indiceOriginal, 1);
      setMovimentos(copia);
    }
  };

  const movimentosFiltrados = useMemo(() => {
    return movimentos
      .filter(
        (mov) =>
          // CORRIGIDO: (mov.obs || "") para evitar crash se obs for null/undefined
          mov.tipo.toLowerCase().includes(pesquisa.toLowerCase()) ||
          (mov.obs || "").toLowerCase().includes(pesquisa.toLowerCase())
      )
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [movimentos, pesquisa]);

  const entradas = useMemo(() => {
    return movimentos
      .filter((m) => m.tipo !== "Saída")
      .reduce((acc, item) => acc + Number(item.valor), 0);
  }, [movimentos]);

  const saidas = useMemo(() => {
    return movimentos
      .filter((m) => m.tipo === "Saída")
      .reduce((acc, item) => acc + Number(item.valor), 0);
  }, [movimentos]);

  const saldo = entradas - saidas;

  const totaisPorTipo = useMemo(() => {
    const resumo = {};
    movimentos.forEach((mov) => {
      if (!resumo[mov.tipo]) resumo[mov.tipo] = 0;
      resumo[mov.tipo] += Number(mov.valor);
    });
    return resumo;
  }, [movimentos]);

  const exportarCSV = () => {
    const linhas = [["Tipo", "Valor", "Data", "Observações"]];
    movimentos.forEach((mov) => {
      linhas.push([mov.tipo, mov.valor, mov.data, mov.obs]);
    });
    const csv = linhas.map((l) => l.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tesouraria.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="tesouraria-container">

        <h1>Tesouraria</h1>

        <div className="resumo-cards">

          <div className="card entrada">
            <h3>Entradas</h3>
            <p>{entradas.toFixed(2)} €</p>
          </div>

          <div className="card saida">
            <h3>Saídas</h3>
            <p>{saidas.toFixed(2)} €</p>
          </div>

          {/* CORRIGIDO: classes .positivo/.negativo usadas corretamente
              (o CSS estava a definir .saldo-positivo/.saldo-negativo) */}
          <div className={`card saldo ${saldo >= 0 ? "positivo" : "negativo"}`}>
            <h3>Saldo</h3>
            <p>{saldo.toFixed(2)} €</p>
          </div>

        </div>

        <div className="form-box">

          <h2>
            {editIndex !== null ? "Editar Movimento" : "Novo Movimento"}
          </h2>

          <div className="form-grid">

            <div>
              <label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option>Dízimo</option>
                <option>Oferta</option>
                <option>Voto</option>
                <option>Ação Social</option>
                <option>T-Shirts</option>
                <option>Saída</option>
              </select>
            </div>

            <div>
              <label>Valor (€)</label>
              <input
                type="number"
                step="0.01"
                name="valor"
                value={form.valor}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Data</label>
              <input
                type="date"
                name="data"
                min={dataMinima}
                max={dataAtual}
                value={form.data}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Observações</label>
              <input
                type="text"
                name="obs"
                value={form.obs}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-actions">

            <button className="btn-save" onClick={salvarMovimento}>
              {editIndex !== null ? "Atualizar" : "Guardar"}
            </button>

            <button className="btn-clear" onClick={limparCampos}>
              Limpar
            </button>

          </div>

        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Pesquisar movimento..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
          <button className="btn-export" onClick={exportarCSV}>
            Exportar CSV
          </button>
        </div>

        <div className="table-box">

          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {movimentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    Nenhum movimento registado.
                  </td>
                </tr>
              ) : (
                movimentosFiltrados.map((mov, index) => (
                  <tr key={index}>
                    <td>{mov.tipo}</td>
                    <td>{Number(mov.valor).toFixed(2)} €</td>
                    <td>{mov.data}</td>
                    <td>{mov.obs}</td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => editar(index)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => remover(index)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>

        <div className="resumo-tipos">

          <h2>Resumo por Categoria</h2>

          {Object.entries(totaisPorTipo).map(([tipo, total]) => (
            <div key={tipo} className="tipo-item">
              <span>{tipo}</span>
              <strong>{total.toFixed(2)} €</strong>
            </div>
          ))}

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Tesouraria;