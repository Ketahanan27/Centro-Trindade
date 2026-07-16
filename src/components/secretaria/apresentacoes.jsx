import { useEffect, useState, useCallback } from "react";
import { usePerfil } from "../../routes/ProctedRoute";
import { toast } from "../../utils/toast";
import { apiFetch, apiFetchArray } from "../../utils/api";
import "../../assets/styles/dashboard/apresentacoes.css";

function Apresentacoes() {
  const { soLeitura } = usePerfil();

  const [apresentacoes, setApresentacoes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filtroAno, setFiltroAno] = useState("Todos");

  const [formData, setFormData] = useState({
    data_apresentacao: "", quantidade: "", observacoes: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const carregarApresentacoes = useCallback(async () => {
    try {
      const data = await apiFetchArray("/api/apresentacoes");
      setApresentacoes(data);
    } catch (error) {
      console.error("[carregarApresentacoes]", error);
    }
  }, []);

  useEffect(() => { carregarApresentacoes(); }, [carregarApresentacoes]);

  const totalApresentacoes = apresentacoes.length;
  const totalCriancas = apresentacoes.reduce((t, i) => t + Number(i.quantidade), 0);

  const anosDisponiveis = [...new Set(
    apresentacoes.map(i => new Date(i.data_apresentacao).getFullYear())
  )].sort((a, b) => b - a);

  const apresentacoesFiltradas = apresentacoes.filter((item) => {
    const matchPesquisa = (item.observacoes || "").toLowerCase().includes(search.toLowerCase());
    const matchAno = filtroAno === "Todos" ? true
      : new Date(item.data_apresentacao).getFullYear().toString() === filtroAno;
    return matchPesquisa && matchAno;
  });

  const clearForm = () => {
    setFormData({ data_apresentacao: "", quantidade: "", observacoes: "" });
    setEditId(null);
  };

  const handleCreate = async () => {
    if (!formData.data_apresentacao) { toast.aviso("Selecione uma data."); return; }
    if (!formData.quantidade || Number(formData.quantidade) <= 0) { toast.aviso("Quantidade inválida."); return; }
    try {
      const response = await apiFetch("/api/apresentacoes", { method: "POST", body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) { toast.erro(data.message); return; }
      toast.sucesso(data.message);
      carregarApresentacoes(); clearForm(); setShowModal(false);
    } catch (error) { console.error(error); }
  };

  const handleSelect = (item) => {
    setEditId(item.id);
    setFormData({
      data_apresentacao: item.data_apresentacao?.split("T")[0] || "",
      quantidade: item.quantidade || "", observacoes: item.observacoes || ""
    });
    setShowModal(true);
  };

  const handleEdit = async () => {
    if (!editId) return;
    try {
      const response = await apiFetch(`/api/apresentacoes/${editId}`, { method: "PUT", body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) { toast.erro(data.message); return; }
      toast.sucesso(data.message);
      carregarApresentacoes(); clearForm(); setShowModal(false);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja eliminar este registo?")) return;
    try {
      const response = await apiFetch(`/api/apresentacoes/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) { toast.erro(data.message); return; }
      toast.sucesso(data.message);
      carregarApresentacoes();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="apresentacoes-container">

      {soLeitura && (
        <div className="banner-leitura">
          <i className="ri-eye-line"></i>
          Modo visualização — não tem permissão para registar apresentações.
        </div>
      )}

      <div className="page-header">
        <h1>Apresentação de Crianças</h1>
        {!soLeitura && (
          <button onClick={() => { clearForm(); setShowModal(true); }}>
            Nova Apresentação
          </button>
        )}
      </div>

      <div className="search-box">
        <input type="text" placeholder="Pesquisar observações..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="filter-box">
        <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)}>
          <option>Todos</option>
          {anosDisponiveis.map(ano => <option key={ano}>{ano}</option>)}
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>{totalApresentacoes}</h3><span>Apresentações</span></div>
        <div className="stat-card"><h3>{totalCriancas}</h3><span>Crianças apresentadas</span></div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Data</th><th>Quantidade</th><th>Observações</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {apresentacoesFiltradas.length === 0 ? (
              <tr><td colSpan="4" className="empty-row">
                {apresentacoes.length === 0 ? "Nenhum registo encontrado." : "Nenhum resultado para o filtro aplicado."}
              </td></tr>
            ) : (
              apresentacoesFiltradas.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.data_apresentacao).toLocaleDateString("pt-PT")}</td>
                  <td><span className="quantity-badge">{item.quantidade}</span></td>
                  <td className="obs-cell">{item.observacoes}</td>
                  <td className="actions">
                    {!soLeitura && (<><button className="edit" onClick={() => handleSelect(item)}>
                      <i className="ri-pencil-line"></i></button>
                      <button className="delete" onClick={() => handleDelete(item.id)}>
                        <i className="ri-delete-bin-line"></i></button></>)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? "Editar Apresentação" : "Nova Apresentação"}</h2>
              <button onClick={() => setShowModal(false)}><i className="ri-close-line"></i></button>
            </div>
            <div className="grid">
              <div className="field"><label>Data da Apresentação</label>
                <input type="date" name="data_apresentacao" value={formData.data_apresentacao} onChange={handleChange} /></div>
              <div className="field"><label>Quantidade de Crianças</label>
                <input type="number" min="1" name="quantidade" value={formData.quantidade} onChange={handleChange} /></div>
              <div className="field full"><label>Observações</label>
                <textarea rows="4" name="observacoes" value={formData.observacoes} onChange={handleChange} /></div>
            </div>
            <div className="form-actions">
              <button className="save" onClick={editId ? handleEdit : handleCreate}>Guardar</button>
              <button className="cancel" onClick={clearForm}>Limpar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Apresentacoes;
