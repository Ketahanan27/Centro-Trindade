import { useState } from "react";
import { jsPDF } from "jspdf";
import logo from "../../assets/img/principal.png";
import { usePerfil } from "../../routes/ProctedRoute";
import { toast } from "../../utils/toast";
import { apiFetch } from "../../utils/api";
import { useListaRemota, executarAcaoCrud } from "../../utils/useCrud";

function Atas() {
    const { soLeitura } = usePerfil();

    const [reunioes, setReunioes, carregarReunioes] = useListaRemota(
        "/api/atas",
        "Não foi possível carregar as reuniões. Tente novamente."
    );

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [editId, setEditId] = useState(null);

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

        setEditId(null);
        setSelectedMeeting(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titulo.trim()) {
            toast.aviso("Introduza o título.");
            return;
        }

        if (!formData.data) {
            toast.aviso("Selecione a data.");
            return;
        }

        if (!formData.hora) {
            toast.aviso("Selecione a hora.");
            return;
        }

        await executarAcaoCrud(
            apiFetch(
                editId !== null ? `/api/atas/${editId}` : "/api/atas",
                { method: editId !== null ? "PUT" : "POST", body: JSON.stringify(formData) }
            ),
            { aoSucesso: () => { resetForm(); setShowModal(false); carregarReunioes(); } }
        );
    };

    const handleEdit = (reuniao) => {
        setFormData({
            titulo: reuniao.titulo,
            data: reuniao.data,
            hora: reuniao.hora,
            local: reuniao.local || "",
            participantes: reuniao.participantes || "",
            resumo: reuniao.resumo || "",
            decisoes: reuniao.decisoes || "",
            observacoes: reuniao.observacoes || "",
        });
        setEditId(reuniao.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Eliminar reunião?")) return;

        await executarAcaoCrud(
            apiFetch(`/api/atas/${id}`, { method: "DELETE" }),
            {
                aoSucesso: () => {
                    setReunioes((prev) => prev.filter((r) => r.id !== id));
                    if (selectedMeeting?.id === id) setSelectedMeeting(null);
                },
            }
        );
    };

    const handleSelect = (reuniao) => {
        setSelectedMeeting(reuniao);
    };

    const handleView = (reuniao) => {
        setSelectedMeeting(reuniao);
        setShowDetails(true);
    };

    const handlePrint = () => {
        if (reunioes.length === 0) return;

        const meetingToPrint = selectedMeeting ?? reunioes[0];
        if (!meetingToPrint) return;

        setSelectedMeeting(meetingToPrint);
        setShowDetails(true);

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const margin = 40;
        const headerHeight = 80;
        let cursorY = margin + headerHeight;

        const drawHeader = () => {
            if (logo) {
                try {
                    doc.addImage(logo, "PNG", margin, 20, 90, 40);
                } catch (error) {
                    console.warn("Logo não pôde ser adicionada ao PDF:", error);
                }
            }
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Centro Trindade", margin + 110, 35);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Atas de reuniões oficial", margin + 110, 52);
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(margin, margin + headerHeight - 10, 555, margin + headerHeight - 10);
        };

        const drawFooter = (pageNumber, totalPages) => {
            const footerY = 820;
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(margin, footerY - 10, 555, footerY - 10);
            doc.setFontSize(10);
            doc.text(
                `Gerado em ${new Date().toLocaleDateString("pt-PT")}`,
                margin,
                footerY
            );
            doc.text(
                `Página ${pageNumber} de ${totalPages}`,
                555,
                footerY,
                { align: "right" }
            );
        };

        const printLine = (text, options = {}) => {
            const fontSize = options.fontSize || 12;
            const lineHeight = fontSize * 1.6;
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", "normal");
            const textLines = doc.splitTextToSize(text, 520);
            textLines.forEach((line) => {
                if (cursorY > 760) {
                    doc.addPage();
                    cursorY = margin + headerHeight;
                    drawHeader();
                }
                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            });
            cursorY += 8;
        };

        drawHeader();

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Ata de Reunião", margin, cursorY);
        cursorY += 30;

        printLine(`Título: ${meetingToPrint.titulo}`, { fontSize: 12 });
        printLine(
            `Data: ${new Date(meetingToPrint.data).toLocaleDateString("pt-PT")}`,
            { fontSize: 12 }
        );
        printLine(`Hora: ${meetingToPrint.hora}`, { fontSize: 12 });
        printLine(`Local: ${meetingToPrint.local}`, { fontSize: 12 });

        printLine(`Participantes: ${meetingToPrint.participantes || "-"}`, {
            fontSize: 12,
        });
        printLine(`Resumo: ${meetingToPrint.resumo || "-"}`, {
            fontSize: 12,
        });
        printLine(`Decisões: ${meetingToPrint.decisoes || "-"}`, {
            fontSize: 12,
        });
        printLine(`Observações: ${meetingToPrint.observacoes || "-"}`, {
            fontSize: 12,
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i += 1) {
            doc.setPage(i);
            drawFooter(i, totalPages);
        }

        const fileName = `Ata_${meetingToPrint.titulo
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 50)}.pdf`;
        doc.save(fileName);
    };

    const filteredMeetings = reunioes.filter((r) =>
        r.titulo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="secretaria-container">

            {soLeitura && (
                <div className="banner-leitura">
                    <i className="ri-eye-line"></i>
                    Modo visualização — não tem permissão para criar ou editar reuniões.
                </div>
            )}

            <div className="page-header">
                <h1>Reuniões e Atas</h1>

                {!soLeitura && (
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
                )}
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

                            filteredMeetings.map((r) => (

                                <tr
                                    key={r.id}
                                    className={
                                        selectedMeeting?.id === r.id
                                            ? "selected-row"
                                            : ""
                                    }
                                    onClick={() => handleSelect(r)}
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

                                        {!soLeitura && (<><button
                                            className="edit"
                                            onClick={() =>
                                                handleEdit(r)
                                            }
                                        >
                                            <i className="ri-pencil-line"></i>
                                        </button>
                                            <button
                                                className="delete"
                                                onClick={() =>
                                                    handleDelete(r.id)
                                                }
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button></>)}

                                    </td>

                                </tr>

                            ))
                        )}

                    </tbody>

                </table>
            </div>

            {}

            {
                showModal && (
                    <div className="modal active">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h2>
                                    {editId !== null
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
                )
            }

            {}

            {
                showDetails && selectedMeeting && (
                    <div className="modal active">

                        <div className="modal-content print-region">

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

                            <div className="form-actions print-actions">
                                <button
                                    type="button"
                                    className="save"
                                    onClick={handlePrint}
                                >
                                    Imprimir Ata
                                </button>
                            </div>

                        </div>

                    </div>
                )
            }

        </div >
    );
}

export default Atas;