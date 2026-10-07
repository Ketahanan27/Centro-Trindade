import { useState } from 'react';
import { usePerfil } from '../../../routes/PerfilContext';
import { useListaRemota, executarAcaoCrud } from '../../../utils/useCrud';
import { AGENDA_INTERNA_ENDPOINT, criar, alterar, eliminar } from '../agenda.api';
import { FORM_VAZIO, dataLocal, eventosNoMes, formularioDoEvento } from '../agenda.model';
export function useAgenda() {
  const {
    soLeitura
  } = usePerfil();
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [eventoEmEdicaoId, setEventoEmEdicaoId] = useState(null);
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const [eventos,, carregarEventos] = useListaRemota(AGENDA_INTERNA_ENDPOINT, 'Não foi possível carregar a agenda. Tente novamente.');
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();
  const hoje = dataLocal();
  const eventosDoMes = eventosNoMes(eventos, ano, mes);
  const eventosVisiveis = dataSelecionada ? eventos.filter(evento => evento.data_evento?.slice(0, 10) === dataSelecionada) : eventosDoMes;
  const limparFormulario = () => {
    setFormulario(FORM_VAZIO);
    setEventoEmEdicaoId(null);
  };
  const selecionarData = data => {
    setDataSelecionada(data);
    setEventoEmEdicaoId(null);
    setFormulario({
      ...FORM_VAZIO,
      data_evento: data
    });
  };
  const selecionarEvento = evento => {
    setDataSelecionada(String(evento.data_evento).slice(0, 10));
    setEventoEmEdicaoId(evento.id);
    setFormulario(formularioDoEvento(evento));
  };
  const mudarMes = deslocamento => {
    setMesAtual(new Date(ano, mes + deslocamento, 1));
    setDataSelecionada(null);
    limparFormulario();
  };
  const irParaHoje = () => {
    setMesAtual(new Date());
    selecionarData(hoje);
  };
  const aposGuardar = () => {
    carregarEventos();
    limparFormulario();
  };
  const criarEvento = () => executarAcaoCrud(criar(formulario), {
    aoSucesso: aposGuardar
  });
  const guardarAlteracao = () => eventoEmEdicaoId && executarAcaoCrud(alterar(eventoEmEdicaoId, formulario), {
    aoSucesso: aposGuardar
  });
  const eliminarEvento = () => {
    if (!eventoEmEdicaoId || !window.confirm('Deseja eliminar este evento?')) return;
    return executarAcaoCrud(eliminar(eventoEmEdicaoId), {
      aoSucesso: aposGuardar
    });
  };
  return {
    soLeitura,
    ano,
    mes,
    hoje,
    eventos,
    eventosDoMes,
    eventosVisiveis,
    dataSelecionada,
    eventoEmEdicaoId,
    formulario,
    setFormulario,
    selecionarData,
    selecionarEvento,
    mudarMes,
    irParaHoje,
    criarEvento,
    guardarAlteracao,
    eliminarEvento,
    limparFormulario
  };
}
