# Organização do projeto

O frontend está a ser organizado por funcionalidades. Membros é o primeiro
módulo migrado, seguido da Agenda e da Tesouraria; os restantes continuam nas pastas anteriores
até à sua migração.

## Membros: responsabilidades

| Ficheiro | Responsabilidade |
| --- | --- |
| `src/features/membros/MembrosPage.jsx` | Compor a página e ligar os componentes |
| `hooks/useMembros.js` | Gerir carregamento, pesquisa, formulários e ações |
| `membros.api.js` | Construir os pedidos HTTP do módulo |
| `membros.model.js` | Preparar formulários e dados para guardar |
| `components/MembrosTabela.jsx` | Apresentar a lista e as ações autorizadas |
| `components/MembroFormulario.jsx` | Apresentar os campos de criação e edição |
| `components/MembroDetalhes.jsx` | Apresentar a ficha e fotografia protegida |
| `components/MembroModal.jsx` | Montar as janelas no portal do documento |
| `membros.module.css` | Estilos locais, sem interferência entre páginas |

## Como explicar uma alteração de membro

1. A página apresenta a tabela; Editar abre o formulário.
2. O hook prepara os dados com as funções do modelo.
3. Ao guardar, o módulo de API envia o pedido autenticado.
4. O backend verifica a sessão, as permissões e os dados antes de consultar
   ou alterar o PostgreSQL.
5. Após sucesso, o hook recarrega a lista e fecha o formulário.

As permissões no frontend apenas orientam a interface. A autorização continua
no backend. A associação de contas só é enviada por administradores e é omitida
quando a consulta de contas falha; assim, uma falha de carregamento não desfaz
uma associação existente.

## Agenda: responsabilidades

O módulo está em `src/features/agenda`:

| Ficheiro | Responsabilidade |
| --- | --- |
| `AgendaPage.jsx` | Compor a página e aplicar o modo de leitura |
| `hooks/useAgenda.js` | Gerir mês, seleção, formulário e ações |
| `agenda.api.js` | Consultar a agenda interna e enviar alterações |
| `agenda.model.js` | Construir dias, filtrar eventos e preparar formulários |
| `components/AgendaCalendario.jsx` | Apresentar o calendário e a seleção |
| `components/EventosLista.jsx` | Apresentar atividades, estados e visibilidade |
| `components/EventoFormulario.jsx` | Apresentar os campos e botões de edição |
| `agenda.module.css` | Isolar os estilos da agenda interna |

Mudar de mês ou selecionar outra data limpa a edição anterior, evitando guardar
um evento com dados de outra seleção. Os dias usam a data local e respeitam anos
bissextos. O calendário público continua separado em `src/pages/calendario.jsx`,
sem controlos de navegação. As permissões continuam verificadas no backend.

## Tesouraria: responsabilidades

O módulo está em `src/features/tesouraria`:

| Ficheiro | Responsabilidade |
| --- | --- |
| `TesourariaPage.jsx` | Compor a página e aplicar o modo de leitura |
| `hooks/useTesouraria.js` | Gerir carregamento, filtros, formulário, ações e exportações |
| `tesouraria.api.js` | Consultar, guardar e eliminar movimentos |
| `tesouraria.model.js` | Preparar formulários, totais, filtros e paginação |
| `components/TesourariaResumo.jsx` | Apresentar receitas, despesas e saldo globais |
| `components/MovimentoFormulario.jsx` | Apresentar campos e motivo da alteração |
| `components/MovimentosFiltros.jsx` | Apresentar pesquisa, natureza e exportações |
| `components/MovimentosTabela.jsx` | Apresentar movimentos, autores, ações e paginação |
| `components/ResumoCategorias.jsx` | Apresentar os totais por tipo |
| `tesouraria.module.css` | Isolar os estilos da Tesouraria |

A tabela mantém dez movimentos por página. Os filtros só afetam a tabela; o
resumo financeiro e o PDF geral continuam a incluir todos os movimentos. O PDF
diário usa a data do formulário. Os documentos continuam a usar o gerador oficial
partilhado em `src/utils/exportacoesPdf.js`. Alterações e eliminações mantêm os
motivos de auditoria e a autorização do backend; a página preserva o modo de
leitura anterior, que apresenta apenas o resumo financeiro.

## Convenções para os próximos módulos

- Organizar código específico em `src/features/<modulo>`.
- Manter componentes partilhados em `src/components` e utilitários gerais em
  `src/utils`. Não generalizar componentes que só têm um uso sem necessidade.
- Usar CSS Modules nas páginas migradas; manter apenas estilos gerais e do
  layout no CSS global.
- Separar apresentação, gestão do estado e pedidos HTTP.
- Extrair funções puras quando representam regras que precisam de verificação.
- Migrar um módulo de cada vez e confirmar rotas, permissões e comportamento.
- Remover ficheiros substituídos só depois de verificar as suas referências.
  Scripts de manutenção não são lixo por não serem importados pela aplicação.

## Verificação

`npm run check:ci` executa lint, testes isolados, compilação de produção e
verificação da entrada serverless. Os testes não precisam da base de produção.

## Continuação

Migrar os restantes módulos do frontend, consolidar os seus estilos e, depois,
organizar o backend por módulo com controlador, regras e consultas separados
onde a complexidade o justificar. A migração do backend ainda não foi feita
nesta primeira etapa.
