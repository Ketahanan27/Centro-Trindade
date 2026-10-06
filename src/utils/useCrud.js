import { useState, useCallback, useEffect } from "react";
import { apiFetchArray } from "./api";
import { toast } from "./toast";

/*
|--------------------------------------------------------------------------
| useListaRemota
|--------------------------------------------------------------------------
|
| Carrega uma lista da API num useEffect e expõe uma função para a
| recarregar. Substitui o par "useState([]) + useCallback fetch +
| useEffect" que se repetia, praticamente igual, em membros.jsx,
| visitantes.jsx, agenda.jsx, apresentacoes.jsx, atas.jsx, utilizadores.jsx
| e documentos.jsx.
|
| Devolve [itens, setItens, recarregar, carregando] — o 4º valor só é usado
| pelas páginas que mostram um estado de "a carregar" (ex.: utilizadores.jsx).
|
*/
export function useListaRemota(endpoint, mensagemErro) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [tentativa, setTentativa] = useState(0);
  const carregar = useCallback(() => {
    setCarregando(true);
    setTentativa((value) => value + 1);
  }, []);
  useEffect(() => {
    let active = true;
    async function consultar() {
      try {
        const data = await apiFetchArray(endpoint);
        if (active) setItens(data);
      } catch {
        if (active && mensagemErro) toast.erro(mensagemErro);
      } finally {
        if (active) setCarregando(false);
      }
    }
    consultar();
    return () => { active = false; };
  }, [endpoint, mensagemErro, tentativa]);

  return [itens, setItens, carregar, carregando];
}

/*
|--------------------------------------------------------------------------
| executarAcaoCrud
|--------------------------------------------------------------------------
|
| Executa um pedido POST/PUT/DELETE seguindo o padrão repetido em todas as
| páginas com CRUD: toast.erro se a API responder com erro, toast.sucesso e
| aoSucesso() se tudo correr bem, e uma mensagem consistente para falhas de
| rede em vez de as deixar por tratar (o que acontecia em vários sítios).
|
| Uso: await executarAcaoCrud(apiFetch(url, { method, body }), { aoSucesso })
| mensagemErroRede é opcional — só é preciso quando a mensagem padrão não
| chega (ex.: documentos.jsx, onde o PDF já foi gerado mesmo que o registo
| na base de dados falhe, e vale a pena dizer isso ao utilizador).
|
*/
export async function executarAcaoCrud(pedido, { aoSucesso, mensagemErroRede } = {}) {
  try {
    const response = await pedido;
    const data = await response.json();
    if (!response.ok) {
      toast.erro(data.message);
      return false;
    }
    toast.sucesso(data.message);
    aoSucesso?.();
    return true;
  } catch (error) {
    console.error(error);
    toast.erro(mensagemErroRede || "Não foi possível ligar ao servidor. Tente novamente.");
    return false;
  }
}
