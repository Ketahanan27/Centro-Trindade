import { useState, useEffect } from "react"; // CORRIGIDO: imports obrigatórios adicionados

function Atas() {

    const [reunioes, setReunioes] = useState(() => {
        const dados = localStorage.getItem("reunioes");
        return dados ? JSON.parse(dados) : [];
    });

    useEffect(() => {
        localStorage.setItem(
            "reunioes",
            JSON.stringify(reunioes)
        );
    }, [reunioes]);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [editIndex, setEditIndex] = useState(null);

    const [formData, setFormData] = useState({
        titulo: "",
        data: "",
        hora: "",
        local: "",
        participantes: "",
        resumo: "",
        decisoes: "",
        observacoes: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({
            titulo: "",
            data: "",
            hora: "",
            local: "",
            participantes: "",
            resumo: "",
            decisoes: "",
            observacoes: "",
        });

        setEditIndex(null);
        setSelectedMeeting(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.titulo.trim()) {
            alert("Introduza o título.");
            return;
        }

        if (!formData.data) {
            alert("Selecione a data.");
            return;
        }

        if (!formData.hora) {
            alert("Selecione a hora.");
            return;
        }

        if (editIndex !== null) {

            const updated = [...reunioes];

            updated[editIndex] = formData;

            updated.sort((a, b) => {

                const dateA =
                    new Date(`${a.data} ${a.hora}`);

                const dateB =
                    new Date(`${b.data} ${b.hora}`);

                return dateA - dateB;

            });

            setReunioes(updated);

        } else {

            const updated = [
                ...reunioes,
                formData
            ];

            updated.sort(
                (a, b) =>
                    new Date(a.data) -
                    new Date(b.data)
            );

            setReunioes(updated);
        }

        resetForm();
        setShowModal(false);
    };

    const handleEdit = (index) => {
        setFormData(reunioes[index]);
        setEditIndex(index);
        setShowModal(true);
    };

    const handleDelete = (index) => {
        if (window.confirm("Eliminar reunião?")) {
            const updated = reunioes.filter((_, i) => i !== index);
            setReunioes(updated);
        }
    };

    const handleView = (meeting) => {
        setSelectedMeeting(meeting);
        setShowDetails(true);
    };

    const filteredMeetings = reunioes.filter((r) =>
        r.titulo.toLowerCase().includes(search.toLowerCase())
    );

    // CORRIGIDO: removido <DashboardLayout> — este componente já é filho de
    // secretaria.jsx que tem o seu próprio DashboardLayout
    return (
        <div className="secretaria-container">

            <div className="page-header">
                <h1>Reuniões e Atas</h1>

                <div className="header-actions">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        <i className="ri-add-line"></i>
                        Nova Reunião
                    </button>
                </div>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Pesquisar reunião..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="meeting-counter">
                Total: {filteredMeetings.length} reunião(ões)
            </div>

            <div className="table-wrapper">
                <table>

                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Local</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredMeetings.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="5"
                                    className="empty-row"
                                >
                                    Nenhuma reunião registada.
                                </td>
                            </tr>

                        ) : (

                            filteredMeetings.map((r) => {

                                const originalIndex = reunioes.findIndex(
                                    item =>
                                        item.titulo === r.titulo &&
                                        item.data === r.data &&
                                        item.hora === r.hora
                                );

                                return (

                                    <tr
                                        key={`${r.titulo}-${r.data}-${r.hora}`}
                                    >

                                        <td>{r.titulo}</td>

                                        <td>
                                            {new Date(r.data)
                                                .toLocaleDateString("pt-PT")}
                                        </td>

                                        <td>{r.hora}</td>

                                        <td>{r.local}</td>

                                        <td className="actions">

                                            <button
                                                className="view"
                                                onClick={() => handleView(r)}
                                            >
                                                <i className="ri-eye-line"></i>
                                            </button>

                                            <button
                                                className="edit"
                                                onClick={() =>
                                                    handleEdit(originalIndex)
                                                }
                                            >
                                                <i className="ri-pencil-line"></i>
                                            </button>

                                            <button
                                                className="delete"
                                                onClick={() =>
                                                    handleDelete(originalIndex)
                                                }
                                            >
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
                                {editIndex !== null
                                    ? "Editar Reunião"
                                    : "Registar Reunião"}
                            </h2>

                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(false);
                                }}
                            >
                                <i className="ri-close-line"></i>
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="grid">

                                <div className="field">
                                    <label>Título</label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label>Data</label>
                                    <input
                                        type="date"
                                        name="data"
                                        value={formData.data}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label>Hora</label>
                                    <input
                                        type="time"
                                        name="hora"
                                        value={formData.hora}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label>Local</label>
                                    <input
                                        type="text"
                                        name="local"
                                        value={formData.local}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="field full">
                                    <label>Participantes</label>
                                    <textarea
                                        name="participantes"
                                        value={formData.participantes}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="field full">
                                    <label>Resumo</label>
                                    <textarea
                                        name="resumo"
                                        value={formData.resumo}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="field full">
                                    <label>Decisões</label>
                                    <textarea
                                        name="decisoes"
                                        value={formData.decisoes}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="field full">
                                    <label>Observações</label>
                                    <textarea
                                        name="observacoes"
                                        value={formData.observacoes}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                            <div className="form-actions">

                                <button type="submit" className="save">
                                    Guardar
                                </button>

                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={resetForm}
                                >
                                    Limpar
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* MODAL DETALHES */}

            {showDetails && selectedMeeting && (
                <div className="modal active">

                    <div className="modal-content">

                        <div className="modal-header">

                            <h2>Detalhes</h2>

                            <button onClick={() => setShowDetails(false)}>
                                <i className="ri-close-line"></i>
                            </button>

                        </div>

                        <div className="details-item">
                            <strong>Título:</strong> {selectedMeeting.titulo}
                        </div>

                        <div className="details-item">
                            <strong>Data:</strong>{" "}
                            {new Date(
                                selectedMeeting.data
                            ).toLocaleDateString("pt-PT")}
                        </div>

                        <div className="details-item">
                            <strong>Hora:</strong> {selectedMeeting.hora}
                        </div>

                        <div className="details-item">
                            <strong>Local:</strong> {selectedMeeting.local}
                        </div>

                        <div className="details-item">
                            <strong>Participantes:</strong>{" "}
                            {selectedMeeting.participantes}
                        </div>

                        <div className="details-item">
                            <strong>Resumo:</strong> {selectedMeeting.resumo}
                        </div>

                        <div className="details-item">
                            <strong>Decisões:</strong> {selectedMeeting.decisoes}
                        </div>

                        <div className="details-item">
                            <strong>Observações:</strong>{" "}
                            {selectedMeeting.observacoes}
                        </div>

                    </div>

                </div>
            )}

            <div className="form-actions" style={{ marginTop: "20px" }}>
                <button
                    className="save"
                    onClick={() => window.print()}
                >
                    Imprimir Ata
                </button>
            </div>

        </div>
    );
}

export default Atas;