import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../../utils/api";
import { validarTelefone, TELEFONE_MENSAGEM_ERRO } from "../../utils/validation";
import { formatarData as fmtData } from "../../utils/data";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import AuthenticatedPhoto from "../../components/AuthenticatedPhoto";
import "../../assets/styles/dashboard/minha-area.css";

const CODIGO_POSTAL_RE = /^\d{4}-\d{3}$/;

/*
|--------------------------------------------------------------------------
| Avatar de substituição
|--------------------------------------------------------------------------
|
| SVG embutido em base64, usado quando o membro ainda não tem foto ou
| quando a foto configurada falha a carregar. Evita depender de um
| serviço externo (ex.: via.placeholder.com), que exigiria abrir a
| Content-Security-Policy a mais um domínio de terceiros.
|
*/
const AVATAR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNjAiIGhlaWdodD0iMjYwIj48cmVjdCB3aWR0aD0iMjYwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI2UyZThmMCIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEwMCIgcj0iNDUiIGZpbGw9IiNhMGFlYzAiLz48ZWxsaXBzZSBjeD0iMTMwIiBjeT0iMjEyIiByeD0iNzgiIHJ5PSI1OCIgZmlsbD0iI2EwYWVjMCIvPjwvc3ZnPg==";

function MinhaArea() {
  const [membro, setMembro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState({
    telemovel: "",
    sexo: "",
    estado_civil: "",
    morada: "",
    codigo_postal: "",
    entrada: "",
    batizado: "",
    estado: "",
  });

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const userLocal = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    apiFetch("/api/membros/me")
      .then(async (res) => {
        if (!res.ok) {
          const message = res.status === 404
            ? "O seu registo de membro ainda não está associado à sua conta. Peça ao administrador para fazer a associação em Membros → Editar → Conta associada."
            : "Não foi possível carregar o seu perfil. Tente novamente dentro de instantes.";
          throw new Error(message);
        }
        return res.json();
      })
      .then((data) => {
        setMembro(data);
        setFormData({
          telemovel: data.telemovel || "",
          sexo: data.sexo || "",
          estado_civil: data.estado_civil || "",
          morada: data.morada || "",
          codigo_postal: data.codigo_postal || "",
          entrada: data.entrada ? String(data.entrada).split("T")[0] : "",
          batizado: data.batizado || "",
          estado: data.estado || "",
        });
        setLoading(false);
      })
      .catch((error) => {
        setErro(error.message === "Failed to fetch" ? "Não foi possível ligar ao servidor. Verifique a ligação e volte a tentar." : error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFotoChange = (event) => {
    setFeedback(null);
    const file = event.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "telemovel") {
      nextValue = value.replace(/\D/g, "").slice(0, 9);
    }

    if (name === "codigo_postal") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 7);
      if (digitsOnly.length <= 4) {
        nextValue = digitsOnly;
      } else {
        nextValue = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 7)}`;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const telemovel = String(formData.telemovel || "").trim();
    const codigoPostal = String(formData.codigo_postal || "").trim();

    if (telemovel && !validarTelefone(telemovel)) {
      setFeedback({ type: "error", message: TELEFONE_MENSAGEM_ERRO });
      setSaving(false);
      return;
    }

    if (codigoPostal && !CODIGO_POSTAL_RE.test(codigoPostal)) {
      setFeedback({ type: "error", message: "O código postal deve ter o formato XXXX-XXX." });
      setSaving(false);
      return;
    }

    const payload = {
      telemovel: telemovel || null,
      sexo: formData.sexo || null,
      estado_civil: formData.estado_civil || null,
      morada: formData.morada || null,
      codigo_postal: codigoPostal || null,
    };

    try {
      const response = await apiFetch("/api/membros/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar o perfil.");
      }

      setMembro((prev) => ({ ...prev, ...payload, estado: prev?.estado || formData.estado }));
      setFeedback({ type: "success", message: data.message });
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: error.message || "Erro ao atualizar o perfil." });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!fotoFile) {
      setFeedback({ type: "error", message: "Selecione uma imagem antes de carregar." });
      return;
    }

    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("foto", fotoFile);
      const response = await apiFetch("/api/membros/me/foto", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao carregar a foto.");
      }
      const fotoVal = data.foto ? `${data.foto}?t=${Date.now()}` : null;
      setMembro((prev) => ({ ...(prev ?? {}), foto: fotoVal }));
      setFotoFile(null);
      setPreview(null);
      setErro(null);
      setFeedback({ type: "success", message: data.message });
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: error.message || "Erro ao carregar a foto." });
    } finally {
      setUploading(false);
    }
  };

  const campos = membro
    ? [
        { icone: "ri-mail-line", label: "Email", valor: membro.email },
        { icone: "ri-phone-line", label: "Telemóvel", valor: membro.telemovel || "—" },
        { icone: "ri-map-pin-line", label: "Morada", valor: membro.morada || "—" },
        { icone: "ri-map-2-line", label: "Código Postal", valor: membro.codigo_postal || "—" },
        { icone: "ri-cake-line", label: "Nascimento", valor: fmtData(membro.nascimento) },
        { icone: "ri-heart-line", label: "Estado Civil", valor: membro.estado_civil || "—" },
        { icone: "ri-calendar-check-line", label: "Entrada", valor: fmtData(membro.entrada) },
        { icone: "ri-drop-line", label: "Batizado(a)", valor: membro.batizado || "—" },
        { icone: "ri-checkbox-circle-line", label: "Estado", valor: membro.estado || "—" },
      ]
    : [];

  const resolvedAvatar = (() => {
    if (preview) return preview;
    if (!membro?.foto) return AVATAR_PLACEHOLDER;
    return membro.foto;
  })();

  const avatarSrc = resolvedAvatar;

  return (
    <DashboardLayout>
      <div className="minha-area-page">
        <div className="minha-area-card-big">
          <div className="minha-area-card-photo">
            <AuthenticatedPhoto
              src={avatarSrc}
              fallback={AVATAR_PLACEHOLDER}
              alt="Foto de perfil"
              onError={(e) => {
                e.currentTarget.src = AVATAR_PLACEHOLDER;
              }}
            />
            <label className="file-button">
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFotoChange} />
              <i className="ri-camera-line"></i>
              <span>{fotoFile ? "Foto selecionada" : "Escolher foto"}</span>
            </label>
            <button
              className="btn-upload"
              type="button"
              onClick={handleUpload}
              disabled={!fotoFile || uploading}
            >
              <i className="ri-upload-cloud-line"></i>
              <span>{uploading ? "A carregar…" : "Carregar foto"}</span>
            </button>
            <p>JPEG, PNG, GIF ou WebP estático, até 2 MB e 16 milhões de píxeis.</p>
            {feedback && (
              <p className={`minha-area-feedback ${feedback.type === "success" ? "sucesso" : "erro"}`}>
                {feedback.message}
              </p>
            )}
          </div>

          <div className="minha-area-card-details">
            <div className="minha-area-card-header">
              <h1>{membro?.nome || userLocal.nome || "Bem-vindo"}</h1>
            </div>
          </div>
        </div>

        {loading && (
          <div className="minha-area-loading">
            <i className="ri-loader-4-line"></i>
            <p>A carregar as suas informações…</p>
          </div>
        )}

        {!loading && erro && (
          <div className="minha-area-aviso">
            <i className="ri-information-line"></i>
            <p>{erro}</p>
            <p>
              Email registado: <strong>{userLocal.email}</strong>
            </p>
          </div>
        )}

        {!loading && membro && (
          <form className="minha-area-form" onSubmit={handleSave}>
            <div className="minha-area-grid">
              {campos.map(({ icone, label, valor }) => {
                const isReadOnly = ["Email", "Nome", "Nascimento", "Estado", "Entrada", "Batizado(a)"].includes(label);
                const fieldName =
                  label === "Telemóvel" ? "telemovel" :
                  label === "Morada" ? "morada" :
                  label === "Código Postal" ? "codigo_postal" :
                  label === "Estado Civil" ? "estado_civil" :
                  label === "Entrada" ? "entrada" :
                  label === "Batizado(a)" ? "batizado" :
                  label === "Sexo" ? "sexo" :
                  "";

                const fieldValue =
                  label === "Telemóvel" ? formData.telemovel :
                  label === "Morada" ? formData.morada :
                  label === "Código Postal" ? formData.codigo_postal :
                  label === "Estado Civil" ? formData.estado_civil :
                  label === "Entrada" ? formData.entrada :
                  label === "Batizado(a)" ? formData.batizado :
                  label === "Sexo" ? formData.sexo :
                  "";

                return (
                  <div key={label} className="minha-area-card">
                    <div className="minha-area-card-icon">
                      <i className={icone}></i>
                    </div>
                    <div className="minha-area-card-body">
                      <span className="minha-area-card-label">{label}</span>
                      {isReadOnly ? (
                        <span className="minha-area-card-valor">{valor}</span>
                      ) : label === "Sexo" ? (
                        <select className="minha-area-input" name={fieldName} value={fieldValue} onChange={handleChange} disabled={saving}>
                          <option value="">Selecionar</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                        </select>
                      ) : label === "Estado Civil" ? (
                        <select className="minha-area-input" name={fieldName} value={fieldValue} onChange={handleChange} disabled={saving}>
                          <option value="">Selecionar</option>
                          <option value="Solteiro(a)">Solteiro(a)</option>
                          <option value="Casado(a)">Casado(a)</option>
                          <option value="Divorciado(a)">Divorciado(a)</option>
                          <option value="Viúvo(a)">Viúvo(a)</option>
                        </select>
                      ) : label === "Batizado(a)" ? (
                        <select className="minha-area-input" name={fieldName} value={fieldValue} onChange={handleChange} disabled={saving}>
                          <option value="">Selecionar</option>
                          <option value="Sim">Sim</option>
                          <option value="Não">Não</option>
                        </select>
                      ) : (
                        <input
                          className="minha-area-input"
                          name={fieldName}
                          value={fieldValue}
                          onChange={handleChange}
                          type={label === "Entrada" ? "date" : "text"}
                          inputMode={label === "Telemóvel" ? "numeric" : "text"}
                          maxLength={label === "Telemóvel" ? 9 : label === "Código Postal" ? 8 : undefined}
                          placeholder={label === "Código Postal" ? "1234-567" : label}
                          disabled={saving}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="minha-area-form-actions">
              <button className="btn-save" type="submit" disabled={saving}>
                {saving ? "A guardar…" : "Guardar alterações"}
              </button>
            </div>
          </form>
        )}

        <p className="minha-area-rodape">
          Nome, email e data de nascimento ficam protegidos para manutenção da identidade do perfil.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default MinhaArea;
