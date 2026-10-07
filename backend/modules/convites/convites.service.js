import bcrypt from 'bcrypt';
import { validarUtilizador, emailNormalizado, InputError } from '../../utils/inputValidation.js';
import { convitesRepository } from './convites.repository.js';
import { hashToken, gerarToken, erroConta, RECUPERACAO_GENERICA } from './convites.model.js';
import { enviarLink } from './convites.email.js';

export function criarConvitesService(repositorio = convitesRepository, enviar = enviarLink, agora = () => Date.now()) {
  async function guardarToken(transacao, id, token, convite) {
    await transacao.invalidarLinks(id);
    await transacao.guardarToken(id, hashToken(token), new Date(agora() + (convite ? 48 * 60 : 30) * 60 * 1000));
  }
  async function entregar(utilizador, token, convite) {
    try { await enviar(utilizador, token, convite); return true; }
    catch (error) {
      console.error('[entregarLink]', error.code ?? 'erro');
      // Um reenvio concorrente deve continuar válido: revogar só este token.
      await repositorio.revogarLink(hashToken(token)).catch(() => console.error('[revogarLink] falha'));
      return false;
    }
  }
  return {
    async criar(payload) {
      const dados = validarUtilizador(payload, true);
      const token = gerarToken();
      const password = await bcrypt.hash(gerarToken(), 10);
      const utilizador = await repositorio.comTransacao(async transacao => {
        await transacao.bloquearEmail(dados.email);
        const existente = await transacao.procurarEmail(dados.email);
        if (existente.rows.length) throw erroConta(409, 'Email já registado. Use Reenviar convite na conta existente.');
        const resultado = await transacao.criarConta(dados, password);
        const conta = resultado.rows[0];
        if (dados.estado === 'Ativo') await guardarToken(transacao, conta.id, token, true);
        return conta;
      });
      const enviado = dados.estado === 'Ativo' ? await entregar(utilizador, token, true) : false;
      return {
        email_enviado: enviado,
        message: enviado ? 'Conta criada e convite enviado.'
          : dados.estado === 'Inativo' ? 'Conta inativa criada. Ative-a antes de enviar o convite.'
            : 'Conta criada, mas o email falhou. Use Reenviar convite; não crie outra conta.',
      };
    },
    async emitir(modo, payload, identificador) {
      const publico = modo === 'recuperar';
      const email = publico ? emailNormalizado(payload?.email, true) : null;
      if (!publico && (!/^\d+$/.test(String(identificador)) || !Number.isSafeInteger(Number(identificador)) || Number(identificador) < 1 || Number(identificador) > 2147483647)) {
        throw new InputError('Utilizador inválido.');
      }
      const token = gerarToken();
      let utilizador;
      try {
        utilizador = await repositorio.comTransacao(async transacao => {
          const resultado = await transacao.procurarConta(publico, publico ? email : identificador);
          const conta = resultado.rows[0];
          if (resultado.rows.length !== 1 || conta.estado !== 'Ativo' || (modo === 'convite' && !conta.convite_pendente)) {
            throw erroConta(!conta ? 404 : 409, !conta ? 'Utilizador não encontrado.'
              : conta.estado !== 'Ativo' ? 'Ative a conta antes de enviar o link.'
                : 'A conta já foi configurada. Use Enviar Reset.');
          }
          await guardarToken(transacao, conta.id, token, conta.convite_pendente);
          return conta;
        });
      } catch (error) {
        if (publico) {
          if (![404, 409].includes(error.status)) console.error('[emitirLinkConta]', error.code ?? 'erro');
          return { status: 200, body: RECUPERACAO_GENERICA };
        }
        throw error;
      }
      const enviado = await entregar(utilizador, token, utilizador.convite_pendente);
      if (publico) return { status: 200, body: RECUPERACAO_GENERICA };
      return {
        status: enviado ? 200 : 502,
        body: {
          email_enviado: enviado,
          message: enviado ? utilizador.convite_pendente ? 'Convite reenviado. Os links anteriores foram invalidados.' : 'Link de recuperação enviado.'
            : 'O email falhou. A conta foi preservada; pode voltar a tentar.',
        },
      };
    },
  };
}

export const convitesService = criarConvitesService();
