import { useEffect, useState, useCallback } from "react";
import { usePerfil } from "../../routes/ProctedRoute";
import { toast } from "../../utils/toast";
import { apiFetch, apiFetchArray } from "../../utils/api";
import "../../assets/styles/dashboard/visitantes.css";

function Visitantes() {
  const { soLeitura } = usePerfil();

    const [visitantes, setVisitantes]     = useState([]);
    const [search, setSearch]             = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    const [showModal, setShowModal]       = useState(false);
    const [editId, setEditId]             = useState(null);

    const [formData, setFormData] = useState({
        nome: "", telefone: "", email: "",
        data_visita: "", convidado_por: "",
        observacoes: "", estado: "Visitante"
    });

    const carregarVisitantes = useCallback(async () => {
        try {
            const data = await apiFetchArray("/api/visitantes");
            setVisitantes(data);
        } catch (error) {
            console.error("[carregarVisitantes]", error);
        }
    }, []);

    useEffect(() => { carregarVisitantes(); }, [carregarVisitantes]);

    const handleChange      = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePhoneChange = (e) => setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, "") });

    const clearForm = () => {
        setFormData({ nome: "", telefone: "", email: "", data_visita: "", convidado_por: "", observacoes: "", estado: "Visitante" });
        setEditId(null);
    };

    const validarFormulario = () => {
        if (!formData.nome.trim())                      { toast.aviso("O nome é obrigatório.");                           return false; }
        if (!formData.telefone.trim())                  { toast.aviso("O telefone é obrigatório.");                       return false; }
        if (!/^\d{9}$/.test(formData.telefone))         { toast.aviso("O telefone deve conter exatamente 9 dígitos.");    return false; }
        if (!formData.data_visita)                      { toast.aviso("Selecione a data da visita.");                     return false; }
        if (!formData.convidado_por.trim())             { toast.aviso("Informe quem convidou o visitante.");              return false; }
        return true;
    };

    const handleCreate = async () => {
        if (!validarFormulario()) return;
        try {
            const response = await apiFetch("/api/visitantes", { method: "POST", body: JSON.stringify(formData) });
            const data = await response.json();
            if (!response.ok) { toast.erro(data.message); return; }
            toast.sucesso(data.message);
            carregarVisitantes(); clearForm(); setShowModal(false);
        } catch (error) { console.error(error); }
    };

    const handleEdit = async () => {
        if (!validarFormulario() || !editId) return;
        try {
            const response = await apiFetch(`/api/visitantes/${editId}`, { method: "PUT", body: JSON.stringify(formData) });
            const data = await response.json();
            if (!response.ok) { toast.erro(data.message); return; }
            toast.sucesso(data.message);
            carregarVisitantes(); clearForm(); setShowModal(false);
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseja eliminar este visitante?")) return;
        try {
            const response = await apiFetch(`/api/visitantes/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok) { toast.erro(data.message); return; }
            toast.sucesso(data.message);
            carregarVisitantes();
        } catch (error) { console.error(error); }
    };

    const handleSelectVisitor = (v) => {
        setEditId(v.id);
        setFormData({
            nome: v.nome || "", telefone: v.telefone || "", email: v.email || "",
            data_visita: v.data_visita?.split("T")[0] || "",
            convidado_por: v.convidado_por || "", observacoes: v.observacoes || "",
            estado: v.estado || "Visitante"
        });
        setShowModal(true);
    };

    const visitantesFiltrados = visitantes.filter((v) => {
        const matchNome   = (v.nome || "").toLowerCase().includes(search.toLowerCase());
        const matchEstado = filtroEstado === "Todos" ? true : v.estado === filtroEstado;
        return matchNome && matchEstado;
    });

    const totalVisitantes = visitantes.length;
    const acompanhamento  = visitantes.filter(v => v.estado === "Em acompanhamento").length;
    const membros         = visitantes.filter(v => v.estado === "Tornou-se membro").length;
    const visitante         = visitantes.filter(v => v.estado === "Visitante").length;
    const mostrarAcoes = !soLeitura;

    return (
        <div className="visitors-container">

      {soLeitura && (
        <div className="banner-leitura">
          <i className="ri-eye-line"></i>
          Modo visualização — não tem permissão para editar visitantes.
        </div>
      )}

            <div className="page-header">
                <h1>Visitantes</h1>
                {!soLeitura && <button onClick={() => { clearForm(); setShowModal(true); }}>Novo Visitante</button>}
            </div>

            <div className="search-box">
                <input type="text" placeholder="Pesquisar visitante..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="filter-box">
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option>Todos</option>
                    <option>Visitante</option>
                    <option>Em acompanhamento</option>
                    <option>Tornou-se membro</option>
                </select>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><h3>{totalVisitantes}</h3><span>Total</span></div>
                <div className="stat-card"><h3>{acompanhamento}</h3><span>Em acompanhamento</span></div>
                <div className="stat-card"><h3>{membros}</h3><span>Tornaram-se membros</span></div>
                <div className="stat-card"><h3>{visitante}</h3><span>Visitante</span></div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Data Visita</th>
                            <th>Estado</th>
                            {mostrarAcoes && <th>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {visitantesFiltrados.length === 0 ? (
                            <tr><td colSpan="6" className="empty-row">
                                {visitantes.length === 0 ? "Nenhum visitante registado." : "Nenhum resultado para o filtro aplicado."}
                            </td></tr>
                        ) : (
                            visitantesFiltrados.map((v) => (
                                <tr key={v.id}>
                                    <td>{v.nome}</td>
                                    <td>{v.telefone}</td>
                                    <td>{v.email}</td>
                                    <td>{new Date(v.data_visita).toLocaleDateString("pt-PT")}</td>
                                    <td><span className="status">{v.estado}</span></td>
                                    {mostrarAcoes && (
                                        <td className="actions">
                                            <button className="edit" onClick={() => handleSelectVisitor(v)}>
                                                <i className="ri-pencil-line"></i></button>
                                            <button className="delete" onClick={() => handleDelete(v.id)}>
                                                <i className="ri-delete-bin-line"></i></button>
                                        </td>
                                    )}
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
                            <h2>{editId ? "Editar Visitante" : "Novo Visitante"}</h2>
                            <button onClick={() => setShowModal(false)}><i className="ri-close-line"></i></button>
                        </div>
                        <div className="grid">
                            <div className="field"><label>Nome</label>
                                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required/></div>
                            <div className="field"><label>Telefone</label>
                                <input type="text" name="telefone" value={formData.telefone} onChange={handlePhoneChange} maxLength="9" required/></div>
                            <div className="field"><label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}/></div>
                            <div className="field"><label>Data da Visita</label>
                                <input type="date" name="data_visita" value={formData.data_visita} onChange={handleChange} required/></div>
                            <div className="field"><label>Convidado Por</label>
                                <input type="text" name="convidado_por" value={formData.convidado_por} onChange={handleChange} required/></div>
                            <div className="field"><label>Estado</label>
                                <select name="estado" value={formData.estado} onChange={handleChange}>
                                    <option>Visitante</option>
                                    <option>Em acompanhamento</option>
                                    <option>Tornou-se membro</option>
                                </select></div>
                            <div className="field full"><label>Observações</label>
                                <textarea rows="4" name="observacoes" value={formData.observacoes} onChange={handleChange}/></div>
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

export default Visitantes;
