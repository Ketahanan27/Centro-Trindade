import { useState, useEffect, useCallback, useMemo } from "react";
import { criarTesourariaPDF } from "../../utils/exportacoesPdf.js";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { usePerfil } from "../../routes/ProctedRoute";
import { toast } from "../../utils/toast";
import { apiFetch, apiFetchArray } from "../../utils/api";
import "../../assets/styles/dashboard/tesouraria.css";

const TIPOS = {
  Receita: ["Dízimo", "Oferta", "Voto", "Contribuição", "Doação", "Ação Social", "T-Shirts", "Outros"],
  Despesa: ["Água", "Luz", "Internet", "Manutenção", "Compras", "Caixa", "Outros"],
};

const MOVIMENTOS_POR_PAGINA = 10;
const dataHoje = () => new Date().toISOString().split("T")[0];

const FORM_VAZIO = {
  natureza: "Receita",
  tipo: "Dízimo",
  valor: "",
  data: dataHoje(),
  observacao: "",
  motivo: "",
};

function Tesouraria() {
  const { soLeitura } = usePerfil();
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroNatureza, setFiltroNatureza] = useState("Todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [historico, setHistorico] = useState(null);

  const carregarHistorico = async () => {
    try { setHistorico(await apiFetchArray("/api/tesouraria/historico")); }
    catch { toast.erro("Não foi possível consultar o histórico."); }
  };

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
    let ativo = true;
    apiFetchArray("/api/tesouraria").then((dados) => {
      if (ativo) setMovimentos(dados);
    }).catch(() => {
      if (ativo) toast.erro("Não foi possível carregar os movimentos.");
    }).finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, []);

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
    if (saving) return;
    if (!validar()) return;
    if (editId && form.motivo.trim().length < 5) {
      toast.aviso("Indique o motivo da alteração (mínimo 5 caracteres).");
      return;
    }

    const payload = {
      natureza: form.natureza,
      tipo: form.tipo,
      valor: form.valor,
      data: form.data,
      observacao: form.observacao.trim() || null,
      motivo: form.motivo,
    };

    setSaving(true);
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
      if (historico !== null) carregarHistorico();
    } catch (err) {
      console.error("[handleSubmit]", err);
      toast.erro("Erro ao comunicar com o servidor.");
    } finally { setSaving(false); }
  };

  const handleEdit = (mov) => {
    setEditId(mov.id);
    setForm({
      natureza: mov.natureza,
      tipo: mov.tipo,
      valor: String(mov.valor),
      data: mov.data,
      observacao: mov.observacao || "",
      motivo: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (saving) return;
    if (!window.confirm("Eliminar este movimento permanentemente?")) return;
    const motivo = window.prompt("Motivo da eliminação (5 a 500 caracteres):");
    if (motivo === null) return;
    if (motivo.trim().length < 5 || motivo.length > 500) { toast.aviso("Indique um motivo válido."); return; }
    setSaving(true);
    try {
      const res = await apiFetch(`/api/tesouraria/${id}`, { method: "DELETE", body: JSON.stringify({ motivo }) });
      const data = await res.json();
      if (!res.ok) {
        toast.erro(data.message);
        return;
      }
      setMovimentos((prev) => prev.filter((m) => m.id !== id));
      if (historico !== null) carregarHistorico();
    } catch (err) {
      console.error("[handleDelete]", err);
      toast.erro("Erro ao comunicar com o servidor.");
    } finally { setSaving(false); }
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
  const totalPaginas = Math.ceil(movimentosFiltrados.length / MOVIMENTOS_POR_PAGINA);
  const paginaVisivel = Math.min(paginaAtual, Math.max(totalPaginas, 1));
  const movimentosDaPagina = movimentosFiltrados.slice(
    (paginaVisivel - 1) * MOVIMENTOS_POR_PAGINA,
    paginaVisivel * MOVIMENTOS_POR_PAGINA
  );

  const totaisPorTipo = useMemo(() => {
    const mapa = {};
    movimentos.forEach((mov) => {
      mapa[mov.tipo] = (mapa[mov.tipo] || 0) + Number(mov.valor);
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  }, [movimentos]);

  const exportarPDF = (listaMovimentos = movimentos, titulo = "Tesouraria — Relatório") => {
    if (!listaMovimentos.length) {
      toast.aviso(
        titulo.includes("Dia")
          ? "Não há movimentos para o dia selecionado."
          : "Não há movimentos para exportar."
      );
      return;
    }

    const doc = criarTesourariaPDF(listaMovimentos, {
      titulo: titulo.replace("—", "-"),
      periodo: titulo.includes("Dia") ? `Movimentos de ${formatarData(form.data || dataHoje())}` : "Todos os movimentos registados",
    });

    const nomeArquivo = titulo.includes("Dia")
      ? `tesouraria_dia_${(form.data || dataHoje())}.pdf`
      : `tesouraria_${dataHoje()}.pdf`;

    doc.save(nomeArquivo);
  };

  const exportarPDFDia = () => {
    const dataSelecionada = form.data || dataHoje();
    const movimentosDoDia = movimentos.filter((mov) => mov.data === dataSelecionada);
    exportarPDF(
      movimentosDoDia,
      `Tesouraria — Dia ${formatarData(dataSelecionada)}`
    );
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
        <button className="btn-export" onClick={carregarHistorico}>Consultar histórico</button>
        {historico !== null && (
          <section className="table-box" aria-label="Histórico da tesouraria">
            <h2>Últimas 200 operações</h2>
            <button className="btn-close-history" onClick={() => setHistorico(null)}>Fechar histórico</button>
            {historico.length === 0 ? <p>Ainda não existem operações registadas no histórico.</p> : (
              <table><thead><tr><th>Data e autor</th><th>Operação</th><th>Motivo</th><th>Valores registados</th></tr></thead>
                <tbody>{historico.map((item) => <tr key={item.id}>
                  <td>{new Date(item.registado_em).toLocaleString("pt-PT")}<br />{item.autor_nome}</td>
                  <td>#{item.movimento_id} — {item.acao}</td>
                  <td>{item.motivo || "Registo inicial"}</td>
                  <td>{[ ["Antes", item.antes], ["Depois", item.depois] ].filter(([, value]) => value).map(([label, value]) => (
                    <p key={label}>{label}: {value.natureza}, {value.tipo}, {Number(value.valor).toFixed(2)} €, {formatarData(String(value.data).slice(0, 10))}{value.observacao ? ` — ${value.observacao}` : ""}</p>
                  ))}</td>
                </tr>)}</tbody></table>
            )}
          </section>
        )}

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
                {editId !== null && <div className="campo-full">
                  <label htmlFor="motivo-tesouraria">Motivo da alteração</label>
                  <input id="motivo-tesouraria" name="motivo" value={form.motivo} onChange={handleChange} maxLength={500} />
                </div>}

              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                  {saving ? "A guardar..." : editId !== null ? "Atualizar" : "Guardar"}
                </button>
                <button className="btn-clear" onClick={limparCampos} disabled={saving}>
                  Limpar
                </button>
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Pesquisar por tipo ou observação..."
                value={pesquisa}
                onChange={(e) => {
                  setPesquisa(e.target.value);
                  setPaginaAtual(1);
                }}
              />
              <select
                className="filtro-natureza-select"
                value={filtroNatureza}
                onChange={(e) => {
                  setFiltroNatureza(e.target.value);
                  setPaginaAtual(1);
                }}
              >
                <option value="Todos">Todos</option>
                <option value="Receita">Receitas</option>
                <option value="Despesa">Despesas</option>
              </select>
              <button className="btn-export" onClick={() => exportarPDF()}>
                GERAL
              </button>
              <button className="btn-export" onClick={exportarPDFDia}>
                DIÁRIO
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
                      movimentosDaPagina.map((mov) => (
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
                                  disabled={saving}
                                  onClick={() => handleEdit(mov)}
                                >
                                  <i className="ri-pencil-line"></i>
                                </button>
                                <button
                                  className="delete-btn"
                                  title="Eliminar"
                                  disabled={saving}
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
              {!loading && totalPaginas > 1 && (
                <nav className="pagination" aria-label="Paginação dos movimentos">
                  <button
                    type="button"
                    className="pagination-arrow"
                    onClick={() => setPaginaAtual(Math.max(paginaVisivel - 1, 1))}
                    disabled={paginaVisivel === 1}
                    aria-label="Página anterior"
                  >
                    &larr; Anterior
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((pagina) => (
                      <button
                        type="button"
                        key={pagina}
                        className={`pagination-page${pagina === paginaVisivel ? " active" : ""}`}
                        onClick={() => setPaginaAtual(pagina)}
                        aria-label={`Página ${pagina}`}
                        aria-current={pagina === paginaVisivel ? "page" : undefined}
                      >
                        {pagina}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="pagination-arrow"
                    onClick={() => setPaginaAtual(Math.min(paginaVisivel + 1, totalPaginas))}
                    disabled={paginaVisivel === totalPaginas}
                    aria-label="Página seguinte"
                  >
                    Seguinte &rarr;
                  </button>
                </nav>
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
