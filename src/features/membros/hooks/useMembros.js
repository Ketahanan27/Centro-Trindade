import { useState } from "react";
import { usePerfil } from "../../../routes/PerfilContext";
import { toast } from "../../../utils/toast";
import { sanitizarTelefone } from "../../../utils/validation";
import { useListaRemota, executarAcaoCrud } from "../../../utils/useCrud";
import { listarContas, guardarMembro, apagarMembro, MEMBROS_ENDPOINT } from "../membros.api";
import { FORM_VAZIO, formularioDoMembro, dadosParaGuardar } from "../membros.model";
export function useMembros() {
  const {
    soLeitura,
    perfil
  } = usePerfil();
  const [contas, setContas] = useState([]);
  const [contasErro, setContasErro] = useState(false);
  const carregarContas = async () => {
    if (perfil !== "Administrador") return;
    setContasErro(false);
    try {
      setContas(await listarContas());
    } catch {
      setContasErro(true);
      toast.erro("Não foi possível carregar as contas. Feche e abra o formulário para tentar novamente.");
    }
  };
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [membroEmEdicaoId, setEditId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [membros,, carregarMembros] = useListaRemota(MEMBROS_ENDPOINT, "Não foi possível carregar os membros. Tente novamente.");
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const alterarCampo = e => {
    const {
      name,
      value
    } = e.target;
    setFormulario({
      ...formulario,
      [name]: name === "telemovel" ? sanitizarTelefone(value) : value
    });
  };
  const limparFormulario = () => {
    setFormulario(FORM_VAZIO);
    setEditId(null);
  };
  const guardarFormulario = async e => {
    e.preventDefault();
    const payload = dadosParaGuardar(formulario, perfil, contasErro);
    await executarAcaoCrud(guardarMembro(membroEmEdicaoId, payload), {
      aoSucesso: () => {
        carregarMembros();
        limparFormulario();
        setFormularioAberto(false);
      }
    });
  };
  const editarMembro = membro => {
    setFormulario(formularioDoMembro(membro));
    setEditId(membro.id);
    carregarContas();
    setFormularioAberto(true);
  };
  const eliminarMembro = async id => {
    if (!window.confirm("Eliminar membro?")) return;
    await executarAcaoCrud(apagarMembro(id), {
      aoSucesso: carregarMembros
    });
  };
  const membrosFiltrados = membros.filter(m => m.nome.toLowerCase().includes(pesquisa.toLowerCase()));
  return {
    soLeitura,
    perfil,
    contas,
    contasErro,
    formularioAberto,
    setFormularioAberto,
    detalhesAbertos,
    setDetalhesAbertos,
    membroSelecionado,
    setMembroSelecionado,
    membroEmEdicaoId,
    pesquisa,
    setPesquisa,
    formulario,
    alterarCampo,
    limparFormulario,
    guardarFormulario,
    editarMembro,
    eliminarMembro,
    membrosFiltrados,
    carregarContas
  };
}
