import { useState, useEffect } from "react";
import { validarTelefone, TELEFONE_MENSAGEM_ERRO } from "../../../utils/validation";
import { CODIGO_POSTAL_RE, AVATAR_PLACEHOLDER, formularioDoPerfil, normalizarCampo, dadosParaGuardar } from "../minha-area.model";
import { consultarPerfil, guardarPerfil, carregarFotografia } from "../minha-area.api";
export function useMinhaArea() {
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
    estado: ""
  });
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);
  const [userLocal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}") ?? {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    consultarPerfil().then(async res => {
      if (!res.ok) {
        const message = res.status === 404 ? "O seu registo de membro ainda não está associado à sua conta. Peça ao administrador para fazer a associação em Membros → Editar → Conta associada." : "Não foi possível carregar o seu perfil. Tente novamente dentro de instantes.";
        throw new Error(message);
      }
      return res.json();
    }).then(data => {
      setMembro(data);
      setFormData(formularioDoPerfil(data));
      setLoading(false);
    }).catch(error => {
      setErro(error.message === "Failed to fetch" ? "Não foi possível ligar ao servidor. Verifique a ligação e volte a tentar." : error.message);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  const handleFotoChange = event => {
    setFeedback(null);
    const file = event.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    const nextValue = normalizarCampo(name, value);
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
  };
  const handleSave = async e => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setFeedback(null);
    const telemovel = String(formData.telemovel || "").trim();
    const codigoPostal = String(formData.codigo_postal || "").trim();
    if (telemovel && !validarTelefone(telemovel)) {
      setFeedback({
        type: "error",
        message: TELEFONE_MENSAGEM_ERRO
      });
      setSaving(false);
      return;
    }
    if (codigoPostal && !CODIGO_POSTAL_RE.test(codigoPostal)) {
      setFeedback({
        type: "error",
        message: "O código postal deve ter o formato XXXX-XXX."
      });
      setSaving(false);
      return;
    }
    const payload = dadosParaGuardar(formData);
    try {
      const response = await guardarPerfil(payload);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar o perfil.");
      }
      setMembro(prev => ({
        ...prev,
        ...payload,
        estado: prev?.estado || formData.estado
      }));
      setFeedback({
        type: "success",
        message: data.message
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error.message || "Erro ao atualizar o perfil."
      });
    } finally {
      setSaving(false);
    }
  };
  const handleUpload = async () => {
    if (uploading) return;
    if (!fotoFile) {
      setFeedback({
        type: "error",
        message: "Selecione uma imagem antes de carregar."
      });
      return;
    }
    setUploading(true);
    setFeedback(null);
    try {
      const response = await carregarFotografia(fotoFile);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao carregar a foto.");
      }
      const fotoVal = data.foto ? `${data.foto}?t=${Date.now()}` : null;
      setMembro(prev => ({
        ...(prev ?? {}),
        foto: fotoVal
      }));
      setFotoFile(null);
      setPreview(null);
      setErro(null);
      setFeedback({
        type: "success",
        message: data.message
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error.message || "Erro ao carregar a foto."
      });
    } finally {
      setUploading(false);
    }
  };
  const avatarSrc = preview || membro?.foto || AVATAR_PLACEHOLDER;
  return {
    membro,
    loading,
    erro,
    fotoFile,
    uploading,
    saving,
    feedback,
    formData,
    userLocal,
    handleFotoChange,
    handleChange,
    handleSave,
    handleUpload,
    avatarSrc
  };
}
