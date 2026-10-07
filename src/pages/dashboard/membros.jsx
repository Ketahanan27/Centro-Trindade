import { useState } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import AuthenticatedPhoto from "../../components/AuthenticatedPhoto";
import { apiFetch, apiFetchArray } from "../../utils/api";
import { toast } from "../../utils/toast";
import { sanitizarTelefone } from "../../utils/validation";
import { formatarData } from "../../utils/data";
import { useListaRemota, executarAcaoCrud } from "../../utils/useCrud";
import { usePerfil } from "../../routes/PerfilContext";
import "../../assets/styles/dashboard/membros.css";
import "../../assets/styles/dashboard/membros-visual.css";


const FORM_VAZIO = {
  nome: "", morada: "", codigo_postal: "",
  email: "", telemovel: "", nascimento: "",
  sexo: "Masculino", estado_civil: "Solteiro(a)",
  entrada: "", batizado: "Não", estado: "Ativo",
  utilizador_id: "",
};

function Membros() {
  const { soLeitura, perfil } = usePerfil();
  const [contas, setContas] = useState([]);
  const [contasErro, setContasErro] = useState(false);

  const carregarContas = async () => {
    if (perfil !== "Administrador") return;
    setContasErro(false);
    try { setContas(await apiFetchArray("/api/auth/users")); }
    catch { setContasErro(true); toast.erro("Não foi possível carregar as contas. Feche e abra o formulário para tentar novamente."); }
  };

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editId, setEditId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [membros, , carregarMembros] = useListaRemota(
    "/api/membros",
    "Não foi possível carregar os membros. Tente novamente."
  );

  const [formData, setFormData] = useState(FORM_VAZIO);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "telemovel" ? sanitizarTelefone(value) : value });
  };

  const limparFormulario = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (perfil !== "Administrador" || contasErro) delete payload.utilizador_id;
    else payload.utilizador_id = formData.utilizador_id ? Number(formData.utilizador_id) : null;
    await executarAcaoCrud(
      apiFetch(
        editId ? `/api/membros/${editId}` : "/api/membros",
        { method: editId ? "PUT" : "POST", body: JSON.stringify(payload) }
      ),
      { aoSucesso: () => { carregarMembros(); limparFormulario(); setShowModal(false); } }
    );
  };

  const editarMembro = (membro) => {
    const limparData = (d) => (!d ? "" : String(d).split("T")[0]);
    setFormData({
      nome: membro.nome || "",
      email: membro.email || "",
      telemovel: membro.telemovel || "",
      nascimento: limparData(membro.nascimento),
      sexo: membro.sexo || "Masculino",
      estado_civil: membro.estado_civil || "Solteiro(a)",
      morada: membro.morada || "",
      codigo_postal: membro.codigo_postal || "",
      entrada: limparData(membro.entrada),
      batizado: membro.batizado || "Não",
      estado: membro.estado || "Ativo",
      utilizador_id: membro.utilizador_id ?? "",
    });
    setEditId(membro.id);
    carregarContas();
    setShowModal(true);
  };

  const eliminarMembro = async (id) => {
    if (!window.confirm("Eliminar membro?")) return;
    await executarAcaoCrud(
      apiFetch(`/api/membros/${id}`, { method: "DELETE" }),
      { aoSucesso: carregarMembros }
    );
  };

  const getAvatarSrc = (foto) => {
    if (!foto) return "";
    const value = String(foto).trim();
    if (!value) return "";
    return value;
  };

  const membrosFiltrados = membros.filter(
    (m) => m.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container members-view">

        {soLeitura && (
          <div className="banner-leitura">
            <i className="ri-eye-line"></i>
            Modo visualização — não tem permissão para editar dados nesta área.
          </div>
        )}

        <div className="page-header">
          <h1>Membros</h1>
          {!soLeitura && (
            <button className="btn-primary" onClick={() => { limparFormulario(); carregarContas(); setShowModal(true); }}>
              <i className="ri-user-add-line"></i> Novo Membro
            </button>
          )}
        </div>

        <div className="members-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Pesquisar membro..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>

        <span className="members-count">{membrosFiltrados.length} {membrosFiltrados.length === 1 ? "membro" : "membros"}</span>
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
                    <td><div className="member-identity"><span className="member-initial" aria-hidden="true">{membro.nome?.trim().charAt(0).toUpperCase()}</span><strong>{membro.nome}</strong></div></td>
                    <td>{membro.telemovel}</td>
                    <td>{membro.email}</td>
                    <td>
                      <span className={membro.estado === "Ativo" ? "badge-ativo" : "badge-inativo"}>
                        {membro.estado}
                      </span>
                    </td>
                    <td><div className="member-actions">
                      <button className="view" aria-label="Ver membro" title="Ver detalhes" onClick={() => { setSelectedMember(membro); setShowDetails(true); }}>
                        <i className="ri-eye-line"></i>
                      </button>
                      {!soLeitura && (
                        <>
                          <button className="edit" aria-label="Editar membro" title="Editar" onClick={() => editarMembro(membro)}>
                            <i className="ri-pencil-line"></i>
                          </button>
                          <button className="delete" aria-label="Eliminar membro" title="Eliminar" onClick={() => eliminarMembro(membro.id)}>
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </>
                      )}
                    </div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && createPortal(
        <div className="modal active members-modal">
          <div className="modal-content" role="dialog" aria-modal="true" aria-label="Ficha de membro">
            <div className="modal-header">
              <h2>{editId ? "Editar Membro" : "Novo Membro"}</h2>
              <button aria-label="Fechar" onClick={() => setShowModal(false)}><i className="ri-close-line"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid">
                {perfil === "Administrador" && (
                  <div className="field">
                    <label htmlFor="membro-conta">Conta associada</label>
                    <select id="membro-conta" name="utilizador_id" value={formData.utilizador_id} onChange={handleChange} disabled={contasErro}>
                      <option value="">Sem conta associada</option>
                      {contas.filter((c) => c.estado === "Ativo" || c.id === Number(formData.utilizador_id)).map((c) => (
                        <option key={c.id} value={c.id}>{c.nome} — {c.email}</option>
                      ))}
                    </select>
                    <small>Associe apenas a conta da pessoa cuja identidade confirmou.</small>
                  </div>
                )}
                <div className="field">
                  <label>Nome</label>
                  <input type="text" name="nome" required value={formData.nome} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Telemóvel</label>
                  <input type="text" name="telemovel" maxLength="9" value={formData.telemovel} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Data Nascimento</label>
                  <input type="date" name="nascimento" value={formData.nascimento} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange}>
                    <option>Masculino</option>
                    <option>Feminino</option>
                  </select>
                </div>
                <div className="field">
                  <label>Estado Civil</label>
                  <select name="estado_civil" value={formData.estado_civil} onChange={handleChange}>
                    <option>Solteiro(a)</option>
                    <option>Casado(a)</option>
                    <option>Divorciado(a)</option>
                    <option>Viúvo(a)</option>
                  </select>
                </div>
                <div className="field">
                  <label>Morada</label>
                  <input type="text" name="morada" value={formData.morada} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Código Postal</label>
                  <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Data Entrada</label>
                  <input type="date" name="entrada" value={formData.entrada} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Batizado</label>
                  <select name="batizado" value={formData.batizado} onChange={handleChange}>
                    <option>Sim</option>
                    <option>Não</option>
                  </select>
                </div>
                <div className="field">
                  <label>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option>Ativo</option>
                    <option>Inativo</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save">Guardar</button>
                <button type="button" className="cancel" onClick={limparFormulario}>Limpar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showDetails && selectedMember && createPortal(
        <div className="modal active members-modal">
          <div className="modal-content" role="dialog" aria-modal="true" aria-label="Ficha de membro">
            <div className="modal-header">
              <h2>Detalhes do Membro</h2>
              <button aria-label="Fechar detalhes" onClick={() => setShowDetails(false)}><i className="ri-close-line"></i></button>
            </div>

            <div className="details-wrapper">
              <div className="details-profile-card">
                {getAvatarSrc(selectedMember.foto) ? (
                  <AuthenticatedPhoto
                    className="details-avatar"
                    src={getAvatarSrc(selectedMember.foto)}
                    alt={`Foto de perfil de ${selectedMember.nome || "membro"}`}
                  />
                ) : (
                  <div className="details-avatar details-avatar-placeholder">
                    <i className="ri-user-line"></i>
                  </div>
                )}
              </div>

              <div className="details-list">
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
                    <strong>{label}:</strong> {value || "—"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </DashboardLayout>
  );
}

export default Membros;
