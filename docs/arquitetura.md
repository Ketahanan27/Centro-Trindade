# Organização do projeto

O frontend está a ser organizado por funcionalidades. Membros é o primeiro
módulo migrado, seguido da Agenda, Tesouraria, Secretaria, Utilizadores e Minha
Área. Os restantes continuam nas pastas anteriores até à sua migração.

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

## Secretaria: responsabilidades

O módulo está em `src/features/secretaria`. `SecretariaPage.jsx` define as cinco
abas e monta apenas a área selecionada. Cada área tem a sua vista em `components`,
o seu hook em `hooks` e as regras independentes da interface em `models`:

| Área | Vista | Gestão dos dados |
| --- | --- | --- |
| Contagens por atividade | `VisitasAtividade.jsx` | `useVisitasAtividade.js` |
| Acompanhamento individual | `Visitantes.jsx` | `useVisitantes.js` |
| Emissão e consulta de documentos | `Documentos.jsx` | `useDocumentos.js` |
| Apresentações | `Apresentacoes.jsx` | `useApresentacoes.js` |
| Reuniões e atas | `Atas.jsx` | `useAtas.js` |

`secretaria.api.js` centraliza os endpoints e pedidos autenticados. As consultas
simples continuam a usar o hook partilhado `useListaRemota`; as contagens mantêm
a paginação do servidor, filtros e opção de exportação de todo o período.
Os modelos preparam formulários, filtros, ligações à Agenda e o snapshot para
emissão documental. Não dependem de React nem da base de dados.

`secretaria.module.css` reúne os estilos locais das cinco áreas e da navegação,
preservando a ordem das regras anteriores. As classes partilhadas de tabelas,
formulários e modais já não interferem com outras páginas. Foram retiradas regras
da antiga aba de relatórios e da impressão pelo browser, substituída pelos PDFs.

Os documentos continuam a usar `emitirDocumentoPDF`: validar, preparar o PDF,
guardar o snapshot no servidor e só então disponibilizar o ficheiro. A reimpressão
usa o registo guardado, mantendo a identidade e data originais. As atas e contagens
usam os geradores oficiais existentes. Os hooks preservam as permissões de leitura
e escrita na interface; a autorização efetiva continua no backend.

## Utilizadores: responsabilidades

O módulo está em `src/features/utilizadores`. `UtilizadoresPage.jsx` compõe a
página, enquanto `useUtilizadores` gere consulta, pesquisa, criação, edição e
eliminação. `utilizadores.api.js` centraliza esses pedidos e o envio de convites
ou recuperação de acesso. `utilizadores.model.js` define os perfis, descrições,
cores, formulário inicial e pesquisa.

A tabela, o formulário no portal, os detalhes e o distintivo de perfil ficam
em componentes separados. `useConviteUtilizador` gere a confirmação e o estado
de envio nos detalhes. Mantêm-se a criação por convite, o email bloqueado na
edição, a proteção da própria conta e a autorização administrativa no backend.
`utilizadores.module.css` inclui os estilos da página e dos modais no portal.

## Minha Área: responsabilidades

O módulo está em `src/features/minha-area`. `MinhaAreaPage.jsx` compõe a página
e os estados de carregamento e erro. `PerfilFotografia` apresenta a fotografia
protegida e o carregamento; `PerfilFormulario` apresenta os campos pessoais.
`useMinhaArea` gere consulta, gravação, fotografia, pré-visualização e feedback.
`minha-area.api.js` usa os endpoints do próprio utilizador, sem receber um ID
de membro escolhido pela interface.

`minha-area.model.js` prepara formulários e pedidos, normaliza telefone e código
postal e define os campos visíveis. A edição usa nomes de campos explícitos, sem
depender dos rótulos apresentados. Nome, email, nascimento, entrada, batismo e
estado continuam protegidos. O pedido de atualização mantém a lista anterior de
cinco campos permitidos; a associação da conta continua a cargo do administrador.

As imagens continuam a usar `AuthenticatedPhoto`, o avatar local de substituição
e o envio multipart. As pré-visualizações libertam os seus URLs ao mudar ou sair.
`minha-area.module.css` isola os estilos e a animação de carregamento. Foram
retirados os controlos de edição que nunca eram apresentados e estilos de
elementos substituídos nas duas páginas.

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
