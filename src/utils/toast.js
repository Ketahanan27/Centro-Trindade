let _dispatch = null;

export const toast = {
  sucesso: (mensagem, duracao = 4000) =>
    _dispatch?.({ tipo: "sucesso", mensagem, duracao }),

  erro: (mensagem, duracao = 5500) =>
    _dispatch?.({ tipo: "erro", mensagem, duracao }),

  aviso: (mensagem, duracao = 4500) =>
    _dispatch?.({ tipo: "aviso", mensagem, duracao }),

  info: (mensagem, duracao = 3500) =>
    _dispatch?.({ tipo: "info", mensagem, duracao }),

  _setDispatch: (fn) => { _dispatch = fn; },
};
