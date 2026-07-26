import { useState } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { apiFetch } from "../../utils/api";
import { toast } from "../../utils/toast";
import { useListaRemota, executarAcaoCrud } from "../../utils/useCrud";
import "../../assets/styles/dashboard/utilizadores.css";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const PERFIS = ["Administrador", "Secretaria", "Tesouraria", "Pastor", "Membro"];

const DESCRICAO_PERFIL = {
  Administrador: "Acesso total ao sistema, incluindo gestão de utilizadores.",
  Secretaria: "Acesso ao Dashboard, Membros, Agenda e Secretaria com permissão de edição.",
  Tesouraria: "Acesso ao Dashboard e Tesouraria com permissão de edição.",
  Pastor: "Visualização de todas as áreas — sem permissão de edição.",
  Membro: "Acesso apenas ao Dashboard.",
};

const CORES_PERFIL = {
  Administrador: "#ff6b35",
  Secretaria: "#0044ff",
  Tesouraria: "#00c853",
  Pastor: "#9c27b0",
  Membro: "#607d8b",
};

const BadgePerfil = ({ perfil }) => (
  <span style={{
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: `${CORES_PERFIL[perfil] ?? "#666"}22`,
    color: CORES_PERFIL[perfil] ?? "#aaa",
    border: `1px solid ${CORES_PERFIL[perfil] ?? "#666"}44`,
  }}>
    {perfil}
  </span>
);

function ModalUtilizador({ editId, formData, onChange, onSubmit, onClose, loading }) {
  return createPortal(
    <div className="modal active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editId ? "Editar Utilizador" : "Novo Utilizador"}</h2>
          <button onClick={onClose}><i className="ri-close-line"></i></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid">

            <div className="field">
              <label>Nome *</label>
              <input type="text" name="nome" required value={formData.nome} onChange={onChange} />
            </div>

            <div className="field">
              <label>Email *{!editId && " (receberá convite)"}</label>
              <input type="email" name="email" required disabled={!!editId} value={formData.email} onChange={onChange} />
            </div>

            <div className="field">
              <label>Perfil</label>
              <select name="perfil" value={formData.perfil} onChange={onChange}>
                {PERFIS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Estado</label>
              <select name="estado" value={formData.estado} onChange={onChange}>
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </div>

          </div>

          <div className="perfil-descricao">
            <i className="ri-information-line"></i>
            {DESCRICAO_PERFIL[formData.perfil]}
          </div>

          {!editId && (
            <p className="form-nota">
              📧 Será enviado um email para o utilizador configurar a sua palavra-passe.
            </p>
          )}

          <div className="form-actions">
            <button type="submit" className="save" disabled={loading}>
              {loading ? "A guardar..." : editId ? "Atualizar" : "Criar e Enviar Convite"}
            </button>
            <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function ModalDetalhes({ user, onClose, onEdit, currentUserId }) {
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async () => {
    if (!window.confirm(`Enviar link de reset de palavra-passe para ${user.email}?`)) return;
    setResetLoading(true);
    await executarAcaoCrud(apiFetch(`/api/auth/users/${user.id}/reset`, { method: "POST" }));
    setResetLoading(false);
  };

  return createPortal(
    <div className="modal active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalhes do Utilizador</h2>
          <button onClick={onClose}><i className="ri-close-line"></i></button>
        </div>

        <div className="details-grid-util">
          <div className="details-item"><strong>Nome</strong><span>{user.nome}</span></div>
          <div className="details-item"><strong>Email</strong><span>{user.email}</span></div>
          <div className="details-item"><strong>Perfil</strong><BadgePerfil perfil={user.perfil} /></div>
          <div className="details-item">
            <strong>Estado</strong>
            <span className={user.estado === "Ativo" ? "badge-ativo" : "badge-inativo"}>{user.estado}</span>
          </div>
          <div className="details-item"><strong>Último Acesso</strong><span>{user.ultimo_acesso || "Nunca"}</span></div>
          <div className="details-item"><strong>Criado em</strong><span>{user.criado}</span></div>
        </div>

        <div className="perfil-descricao" style={{ marginTop: "16px" }}>
          <i className="ri-shield-check-line"></i>
          {DESCRICAO_PERFIL[user.perfil]}
        </div>

        {user.id !== currentUserId && (
          <div className="form-actions" style={{ marginTop: "24px" }}>
            <button className="save" onClick={() => { onClose(); onEdit(user); }}>
              <i className="ri-pencil-line"></i> Editar
            </button>
            <button className="cancel" onClick={handleReset} disabled={resetLoading}>
              <i className="ri-refresh-line"></i>
              {resetLoading ? "A enviar..." : "Enviar Reset"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

const FORM_VAZIO = { nome: "", email: "", perfil: "Membro", estado: "Ativo" };

function Utilizadores() {
  const [users, setUsers, carregarUtilizadores, loading] = useListaRemota(
    "/api/auth/users",
    "Não foi possível carregar os utilizadores. Tente novamente."
  );
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(FORM_VAZIO);

  const eu = getUser();

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const abrirNovo = () => {
    setFormData(FORM_VAZIO);
    setEditId(null);
    setShowModal(true);
  };

  const abrirEditar = (user) => {
    setFormData({ nome: user.nome, email: user.email, perfil: user.perfil, estado: user.estado });
    setEditId(user.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    await executarAcaoCrud(
      apiFetch(
        editId ? `/api/auth/users/${editId}` : "/api/auth/users",
        { method: editId ? "PUT" : "POST", body: JSON.stringify(formData) }
      ),
      { aoSucesso: () => { setShowModal(false); carregarUtilizadores(); } }
    );
    setFormLoading(false);
  };

  const eliminar = async (user) => {
    if (user.id === eu.id) {
      toast.erro("Não pode eliminar a sua própria conta.");
      return;
    }
    if (!window.confirm(`Eliminar o utilizador "${user.nome}"?`)) return;
    await executarAcaoCrud(
      apiFetch(`/api/auth/users/${user.id}`, { method: "DELETE" }),
      { aoSucesso: () => setUsers((prev) => prev.filter((u) => u.id !== user.id)) }
    );
  };

  const filtrados = users.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.perfil.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container">

        <div className="page-header">
          <h1>Utilizadores</h1>
          <button className="btn-primary" onClick={abrirNovo}>
            <i className="ri-user-add-line"></i> Novo Utilizador
          </button>
        </div>

        <div className="perfis-legend">
          {PERFIS.map((p) => (
            <span key={p} className="legend-item">
              <BadgePerfil perfil={p} />
            </span>
          ))}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou perfil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-counter">
          {filtrados.length} utilizador(es)
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ color: "#999", padding: "20px" }}>A carregar utilizadores...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Estado</th>
                  <th>Último Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan="6" className="empty-row">Nenhum utilizador encontrado.</td></tr>
                ) : (
                  filtrados.map((user) => (
                    <tr key={user.id} className={user.id === eu.id ? "row-eu" : ""}>
                      <td>
                        {user.nome}
                        {user.id === eu.id && <span className="tag-eu">eu</span>}
                      </td>
                      <td>{user.email}</td>
                      <td><BadgePerfil perfil={user.perfil} /></td>
                      <td>
                        <span className={user.estado === "Ativo" ? "badge-ativo" : "badge-inativo"}>
                          {user.estado}
                        </span>
                      </td>
                      <td>{user.ultimo_acesso || "Nunca"}</td>
                      <td className="actions">
                        <button
                          className="view"
                          title="Detalhes"
                          onClick={() => { setSelectedUser(user); setShowDetails(true); }}
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        {user.id !== eu.id && (
                          <>
                            <button className="edit" title="Editar" onClick={() => abrirEditar(user)}>
                              <i className="ri-pencil-line"></i>
                            </button>
                            <button className="delete" title="Eliminar" onClick={() => eliminar(user)}>
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

      </div>

      {showModal && (
        <ModalUtilizador
          editId={editId}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          loading={formLoading}
        />
      )}

      {showDetails && selectedUser && (
        <ModalDetalhes
          user={selectedUser}
          onClose={() => { setShowDetails(false); setSelectedUser(null); }}
          onEdit={abrirEditar}
          currentUserId={eu.id}
        />
      )}

    </DashboardLayout>
  );
}

export default Utilizadores;
