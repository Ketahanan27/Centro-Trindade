import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import "../../assets/styles/dashboard/utilizadores.css";

function Utilizadores() {

  // CORRIGIDO: JSON.parse sem try/catch causava crash imediato se o valor
  // guardado no localStorage estivesse corrompido ou não fosse JSON válido.
  // Adicionado try/catch com fallback para array vazio.
  const [users, setUsers] = useState(() => {
    try {
      const dados = localStorage.getItem("utilizadores");
      return dados ? JSON.parse(dados) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("utilizadores", JSON.stringify(users));
  }, [users]);

  const [search, setSearch]             = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [showDetails, setShowDetails]   = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    nome:   "",
    email:  "",
    perfil: "Administrador",
    estado: "Ativo",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const limparFormulario = () => {
    setFormData({ nome: "", email: "", perfil: "Administrador", estado: "Ativo" });
    setEditingIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert("Introduza o nome.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Introduza o email.");
      return;
    }

    const emailExiste = users.some(
      (user, index) =>
        user.email.toLowerCase() === formData.email.toLowerCase() &&
        index !== editingIndex
    );

    if (emailExiste) {
      alert("Já existe um utilizador com este email.");
      return;
    }

    const user = {
      ...formData,
      ultimoAcesso:
        editingIndex !== null ? users[editingIndex].ultimoAcesso : "Nunca",
      criado:
        editingIndex !== null
          ? users[editingIndex].criado
          : new Date().toLocaleDateString("pt-PT"),
    };

    if (editingIndex === null) {
      setUsers([...users, user]);
    } else {
      const updated = [...users];
      updated[editingIndex] = user;
      setUsers(updated);
    }

    limparFormulario();
    setShowModal(false);
  };

  const editUser = (index) => {
    const user = users[index];
    setFormData({
      nome:   user.nome,
      email:  user.email,
      perfil: user.perfil,
      estado: user.estado,
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const deleteUser = (index) => {
    if (window.confirm("Eliminar utilizador?")) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  const resetPassword = (user) => {
    alert(`Nova palavra-passe temporária enviada para ${user.email}`);
  };

  const viewUser = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container">

        <div className="page-header">
          <h1>Utilizadores</h1>
          <div className="header-buttons">
            <button
              className="btn-primary"
              onClick={() => {
                limparFormulario();
                setEditingIndex(null);
                setShowModal(true);
              }}
            >
              <i className="ri-user-add-line"></i>
              Novo Utilizador
            </button>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Pesquisar utilizador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-counter">
          Total: {filteredUsers.length} utilizador(es)
        </div>

        <div className="table-wrapper">
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    Nenhum utilizador registado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const originalIndex = users.findIndex(
                    (u) => u.email === user.email
                  );
                  return (
                    <tr key={user.email}>
                      <td>{user.nome}</td>
                      <td>{user.email}</td>
                      <td>{user.perfil}</td>
                      <td>
                        <span className={user.estado === "Ativo" ? "active" : "inactive"}>
                          {user.estado}
                        </span>
                      </td>
                      <td>{user.ultimoAcesso}</td>
                      <td className="actions">
                        <button className="view" onClick={() => viewUser(user)}>
                          <i className="ri-eye-line"></i>
                        </button>
                        <button className="edit" onClick={() => editUser(originalIndex)}>
                          <i className="ri-pencil-line"></i>
                        </button>
                        <button className="reset" onClick={() => resetPassword(user)}>
                          <i className="ri-refresh-line"></i>
                        </button>
                        <button className="delete" onClick={() => deleteUser(originalIndex)}>
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL FORMULÁRIO */}
        {showModal && (
          <div className="modal active">
            <div className="modal-content">

              <div className="modal-header">
                <h2>
                  {editingIndex === null ? "Novo Utilizador" : "Editar Utilizador"}
                </h2>
                <button onClick={() => { setShowModal(false); limparFormulario(); }}>
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid">
                  <div className="field">
                    <label>Nome</label>
                    <input type="text" name="nome"
                      value={formData.nome} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" name="email"
                      value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Perfil</label>
                    <select name="perfil" value={formData.perfil} onChange={handleChange}>
                      <option>Administrador</option>
                      <option>Secretaria</option>
                      <option>Tesouraria</option>
                      <option>Pastor</option>
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
                  <button type="submit" className="save">
                    {editingIndex === null ? "Guardar" : "Atualizar"}
                  </button>
                  <button type="button" className="cancel" onClick={limparFormulario}>
                    Limpar
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* MODAL DETALHES */}
        {showDetails && selectedUser && (
          <div className="modal active">
            <div className="modal-content">

              <div className="modal-header">
                <h2>Detalhes do Utilizador</h2>
                <button onClick={() => setShowDetails(false)}>
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="details-item">
                <strong>Nome:</strong> {selectedUser.nome}
              </div>
              <div className="details-item">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div className="details-item">
                <strong>Perfil:</strong> {selectedUser.perfil}
              </div>
              <div className="details-item">
                <strong>Estado:</strong> {selectedUser.estado}
              </div>
              <div className="details-item">
                <strong>Último Acesso:</strong> {selectedUser.ultimoAcesso}
              </div>
              <div className="details-item">
                <strong>Data de Criação:</strong> {selectedUser.criado}
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Utilizadores;