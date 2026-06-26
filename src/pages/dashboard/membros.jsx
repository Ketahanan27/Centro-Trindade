import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { apiFetch, apiFetchArray } from "../../utils/api";
import "../../assets/styles/dashboard/membros.css";

function Membros() {

  const [showModal, setShowModal]       = useState(false);
  const [showDetails, setShowDetails]   = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editId, setEditId]             = useState(null);
  const [pesquisa, setPesquisa]         = useState("");
  const [membros, setMembros]           = useState([]);

  const [formData, setFormData] = useState({
    nome: "", morada: "", codigo_postal: "",
    email: "", telemovel: "", nascimento: "",
    sexo: "Masculino", estado_civil: "Solteiro(a)",
    entrada: "", batizado: "Não", estado: "Ativo"
  });

  // CORRIGIDO: apiFetchArray injeta Authorization header e garante array
  const carregarMembros = useCallback(async () => {
    try {
      const data = await apiFetchArray("/api/membros");
      setMembros(data);
    } catch (error) {
      console.error("[carregarMembros]", error);
    }
  }, []);

  useEffect(() => { carregarMembros(); }, [carregarMembros]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const limparFormulario = () => {
    setFormData({
      nome: "", morada: "", codigo_postal: "",
      email: "", telemovel: "", nascimento: "",
      sexo: "Masculino", estado_civil: "Solteiro(a)",
      entrada: "", batizado: "Não", estado: "Ativo"
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiFetch(
        editId ? `/api/membros/${editId}` : "/api/membros",
        {
          method: editId ? "PUT" : "POST",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      alert(data.message);
      carregarMembros();
      limparFormulario();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  const editarMembro = (membro) => {
    setFormData({
      ...membro,
      nascimento: membro.nascimento ? membro.nascimento.split("T")[0] : "",
      entrada:    membro.entrada    ? membro.entrada.split("T")[0]    : ""
    });
    setEditId(membro.id);
    setShowModal(true);
  };

  const eliminarMembro = async (id) => {
    if (!window.confirm("Eliminar membro?")) return;
    try {
      const response = await apiFetch(`/api/membros/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      alert(data.message);
      carregarMembros();
    } catch (error) {
      console.error(error);
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";
    const d = new Date(data);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const membrosFiltrados = membros.filter(
    (m) => m.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container">

        <div className="page-header">
          <h1>Membros</h1>
          <button className="btn-primary" onClick={() => { limparFormulario(); setShowModal(true); }}>
            <i className="ri-user-add-line"></i> Novo Membro
          </button>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Pesquisar membro..."
            value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Nome</th><th>Telemóvel</th><th>Email</th><th>Estado</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {membrosFiltrados.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center" }}>Nenhum membro encontrado</td></tr>
              ) : (
                membrosFiltrados.map((membro) => (
                  <tr key={membro.id}>
                    <td>{membro.nome}</td>
                    <td>{membro.telemovel}</td>
                    <td>{membro.email}</td>
                    <td>
                      <span className={membro.estado === "Ativo" ? "badge-ativo" : "badge-inativo"}>
                        {membro.estado}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="view" onClick={() => { setSelectedMember(membro); setShowDetails(true); }}>
                        <i className="ri-eye-line"></i>
                      </button>
                      <button className="edit" onClick={() => editarMembro(membro)}>
                        <i className="ri-pencil-line"></i>
                      </button>
                      <button className="delete" onClick={() => eliminarMembro(membro.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? "Editar Membro" : "Novo Membro"}</h2>
              <button onClick={() => setShowModal(false)}><i className="ri-close-line"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid">
                <div className="field"><label>Nome</label>
                  <input type="text" name="nome" required value={formData.nome} onChange={handleChange}/></div>
                <div className="field"><label>Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange}/></div>
                <div className="field"><label>Telemóvel</label>
                  <input type="text" name="telemovel" maxLength="9" value={formData.telemovel} onChange={handleChange}/></div>
                <div className="field"><label>Data Nascimento</label>
                  <input type="date" name="nascimento" value={formData.nascimento} onChange={handleChange}/></div>
                <div className="field"><label>Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange}>
                    <option>Masculino</option><option>Feminino</option></select></div>
                <div className="field"><label>Estado Civil</label>
                  <select name="estado_civil" value={formData.estado_civil} onChange={handleChange}>
                    <option>Solteiro(a)</option><option>Casado(a)</option>
                    <option>Divorciado(a)</option><option>Viúvo(a)</option></select></div>
                <div className="field"><label>Morada</label>
                  <input type="text" name="morada" value={formData.morada} onChange={handleChange}/></div>
                <div className="field"><label>Código Postal</label>
                  <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange}/></div>
                <div className="field"><label>Data Entrada</label>
                  <input type="date" name="entrada" value={formData.entrada} onChange={handleChange}/></div>
                <div className="field"><label>Batizado</label>
                  <select name="batizado" value={formData.batizado} onChange={handleChange}>
                    <option>Sim</option><option>Não</option></select></div>
                <div className="field"><label>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option>Ativo</option><option>Inativo</option></select></div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save">Guardar</button>
                <button type="button" className="cancel" onClick={limparFormulario}>Limpar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedMember && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detalhes do Membro</h2>
              <button onClick={() => setShowDetails(false)}><i className="ri-close-line"></i></button>
            </div>
            {[
              ["Nome", selectedMember.nome],
              ["Email", selectedMember.email],
              ["Telemóvel", selectedMember.telemovel],
              ["Nascimento", formatarData(selectedMember.nascimento)],
              ["Sexo", selectedMember.sexo],
              ["Estado Civil", selectedMember.estado_civil],
              ["Morada", selectedMember.morada],
              ["Código Postal", selectedMember.codigo_postal],
              ["Entrada", formatarData(selectedMember.entrada)],
              ["Batizado", selectedMember.batizado],
              ["Estado", selectedMember.estado],
            ].map(([label, value]) => (
              <div key={label} className="details-item">
                <strong>{label}:</strong> {value}
              </div>
            ))}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default Membros;