import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { usePerfil } from "../../routes/ProctedRoute";
import { toast } from "../../utils/toast";
import { apiFetch, apiFetchArray } from "../../utils/api";
import "../../assets/styles/dashboard/tesouraria.css";

const TIPOS = {
  Receita: ["Dízimo", "Oferta", "Voto", "Contribuição", "Doação", "Ação Social", "T-Shirts", "Outros"],
  Despesa: ["Água", "Luz", "Internet", "Manutenção", "Compras", "Caixa", "Outros"],
};

const dataHoje = () => new Date().toISOString().split("T")[0];

const FORM_VAZIO = {
  natureza: "Receita",
  tipo: "Dízimo",
  valor: "",
  data: dataHoje(),
  observacao: "",
};

function Tesouraria() {
  const { soLeitura } = usePerfil();
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroNatureza, setFiltroNatureza] = useState("Todos");
  const [form, setForm] = useState(FORM_VAZIO);

  const carregarMovimentos = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await apiFetchArray("/api/tesouraria");
      setMovimentos(dados);
    } catch (err) {
      console.error("[carregarMovimentos]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMovimentos();
  }, [carregarMovimentos]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "natureza") {
      setForm((prev) => ({
        ...prev,
        natureza: value,
        tipo: TIPOS[value][0],
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const limparCampos = () => {
    setForm({ ...FORM_VAZIO, data: dataHoje() });
    setEditId(null);
  };

  const validar = () => {
    if (!form.valor || Number(form.valor) <= 0) {
      toast.aviso("Introduza um valor válido.");
      return false;
    }
    if (!form.data) {
      toast.aviso("Selecione uma data.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validar()) return;

    const payload = {
      natureza: form.natureza,
      tipo: form.tipo,
      valor: Number(form.valor),
      data: form.data,
      observacao: form.observacao.trim() || null,
    };

    try {
      const res = await apiFetch(
        editId ? `/api/tesouraria/${editId}` : "/api/tesouraria",
        {
          method: editId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.erro(data.message);
        return;
      }

      toast.sucesso(data.message);
      limparCampos();
      carregarMovimentos();
    } catch (err) {
      console.error("[handleSubmit]", err);
      toast.erro("Erro ao comunicar com o servidor.");
    }
  };

  const handleEdit = (mov) => {
    setEditId(mov.id);
    setForm({
      natureza: mov.natureza,
      tipo: mov.tipo,
      valor: String(mov.valor),
      data: mov.data,
      observacao: mov.observacao || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar este movimento permanentemente?")) return;
    try {
      const res = await apiFetch(`/api/tesouraria/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.erro(data.message);
        return;
      }
      setMovimentos((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("[handleDelete]", err);
      toast.erro("Erro ao comunicar com o servidor.");
    }
  };

  const entradas = useMemo(
    () => movimentos.filter((m) => m.natureza === "Receita")
      .reduce((acc, m) => acc + Number(m.valor), 0),
    [movimentos]
  );
  const saidas = useMemo(
    () => movimentos.filter((m) => m.natureza === "Despesa")
      .reduce((acc, m) => acc + Number(m.valor), 0),
    [movimentos]
  );
  const saldo = entradas - saidas;

  const movimentosFiltrados = useMemo(() => {
    return movimentos
      .filter((mov) => {
        const matchTexto =
          mov.tipo.toLowerCase().includes(pesquisa.toLowerCase()) ||
          (mov.observacao || "").toLowerCase().includes(pesquisa.toLowerCase());
        const matchNatureza =
          filtroNatureza === "Todos" || mov.natureza === filtroNatureza;
        return matchTexto && matchNatureza;
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [movimentos, pesquisa, filtroNatureza]);

  const totaisPorTipo = useMemo(() => {
    const mapa = {};
    movimentos.forEach((mov) => {
      mapa[mov.tipo] = (mapa[mov.tipo] || 0) + Number(mov.valor);
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  }, [movimentos]);

  const exportarCSV = () => {
    const linhas = [["Natureza", "Tipo", "Valor (€)", "Data", "Observações"]];
    movimentos.forEach((mov) => {
      linhas.push([
        mov.natureza,
        mov.tipo,
        Number(mov.valor).toFixed(2),
        mov.data,
        mov.observacao || "",
      ]);
    });
    const csv = linhas.map((l) => l.join(";")).join("\r\n");
    const blob = new Blob(["\FEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tesouraria_${dataHoje()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatarData = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("pt-PT");

  return (
    <DashboardLayout>
      <div className="tesouraria-container">

        {soLeitura && (
          <div className="banner-leitura">
            <i className="ri-eye-line"></i>
            Modo visualização — não tem permissão para registar movimentos.
          </div>
        )}

        <h1>Tesouraria</h1>

        <div className="resumo-cards">
          <div className="card entrada">
            <h3>Receitas</h3>
            <p>{entradas.toFixed(2)} €</p>
          </div>

          <div className="card saida">
            <h3>Despesas</h3>
            <p>{saidas.toFixed(2)} €</p>
          </div>

          <div className={`card saldo ${saldo >= 0 ? "positivo" : "negativo"}`}>
            <h3>Saldo</h3>
            <p>{saldo.toFixed(2)} €</p>
          </div>
        </div>

        {!soLeitura && (
          <>
            <div className="form-box">
              <h2>{editId !== null ? "Editar Movimento" : "Novo Movimento"}</h2>

              <div className="form-grid">

                <div>
                  <label>Natureza</label>
                  <select name="natureza" value={form.natureza} onChange={handleChange}>
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>

                <div>
                  <label>Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange}>
                    {TIPOS[form.natureza].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Valor (€)</label>
                  <input
                    type="number"
                    name="valor"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.valor}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Data</label>
                  <input
                    type="date"
                    name="data"
                    max={dataHoje()}
                    value={form.data}
                    onChange={handleChange}
                  />
                </div>

                <div className="campo-full">
                  <label>Observações</label>
                  <input
                    type="text"
                    name="observacao"
                    placeholder="Opcional"
                    value={form.observacao}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSubmit}>
                  {editId !== null ? "Atualizar" : "Guardar"}
                </button>
                <button className="btn-clear" onClick={limparCampos}>
                  Limpar
                </button>
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Pesquisar por tipo ou observação..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
              <select
                className="filtro-natureza-select"
                value={filtroNatureza}
                onChange={(e) => setFiltroNatureza(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Receita">Receitas</option>
                <option value="Despesa">Despesas</option>
              </select>
              <button className="btn-export" onClick={exportarCSV}>
                Exportar CSV
              </button>
            </div>

            <div className="table-box">
              {loading ? (
                <p className="empty-row">A carregar movimentos...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Natureza</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Observações</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-row">
                          {movimentos.length === 0
                            ? "Nenhum movimento registado."
                            : "Sem resultados para o filtro aplicado."}
                        </td>
                      </tr>
                    ) : (
                      movimentosFiltrados.map((mov) => (
                        <tr key={mov.id}>
                          <td>{mov.tipo}</td>
                          <td>
                            <span className={
                              `natureza-badge ${mov.natureza === "Receita"
                                ? "natureza-receita"
                                : "natureza-despesa"}`
                            }>
                              {mov.natureza}
                            </span>
                          </td>
                          <td className="valor-cel">
                            {Number(mov.valor).toFixed(2)} €
                          </td>
                          <td>{formatarData(mov.data)}</td>
                          <td className="obs-cel">{mov.observacao || "—"}</td>
                          <td className="actions">
                            {!soLeitura && (
                              <>
                                <button
                                  className="edit-btn"
                                  title="Editar"
                                  onClick={() => handleEdit(mov)}
                                >
                                  <i className="ri-pencil-line"></i>
                                </button>
                                <button
                                  className="delete-btn"
                                  title="Eliminar"
                                  onClick={() => handleDelete(mov.id)}
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {totaisPorTipo.length > 0 && (
              <div className="resumo-tipos">
                <h2>Resumo por Categoria</h2>

                {totaisPorTipo.map(([tipo, total]) => (
                  <div key={tipo} className="tipo-item">
                    <span>{tipo}</span>
                    <strong>{total.toFixed(2)} €</strong>
                  </div>
                ))}
              </div>
            )}

          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Tesouraria;
