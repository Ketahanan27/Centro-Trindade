# Organização do projeto

O frontend está a ser organizado por funcionalidades. Membros é o primeiro
módulo migrado, seguido da Agenda, Tesouraria, Secretaria, Utilizadores e Minha
Área, Dashboard e Relatórios. As páginas internas estão organizadas por módulo;
as páginas públicas e de autenticação continuam na estrutura anterior.

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

## Dashboard: responsabilidades

O módulo está em `src/features/dashboard`. `DashboardPage.jsx` compõe a visão
geral e conserva as condições de acesso devolvidas pelo servidor.
`useDashboard` gere consulta, carregamento, erro e nova tentativa;
`dashboard.api.js` consulta os indicadores agregados.

Os componentes apresentam indicadores, contagens por atividade, distribuição
dos visitantes, resumo financeiro, gráfico mensal, próximos eventos e pendências.
`dashboard.model.js` prepara as séries financeiras, a distribuição por estado,
formatação monetária e rótulos. O gráfico financeiro mantém uma tabela acessível
com os mesmos valores. Meses sem movimentos aparecem com zero e meses futuros
não são incluídos. Os estilos ficam em `dashboard.module.css`.

As permissões e os cálculos financeiros oficiais continuam no backend. O módulo
apenas prepara os valores recebidos para apresentação e não consulta dados de
membros ou movimentos individuais para calcular indicadores no navegador.

## Relatórios: responsabilidades

O módulo está em `src/features/relatorios`. `RelatoriosPage.jsx` compõe filtros,
erros e resumo. `RelatorioFiltros` apresenta períodos, observações e botões;
`RelatorioResumo` apresenta as secções autorizadas recebidas do servidor.
`useRelatorios` gere os filtros e a consulta ou exportação, enquanto
`relatorios.api.js` constrói o pedido global autenticado.

`relatorios.model.js` calcula os períodos de mês, trimestre e ano pela data de
Lisboa e constrói o nome do documento a partir do período devolvido. A alteração
dos filtros limpa o resumo anterior. Cada exportação faz uma nova consulta e usa
o gerador oficial partilhado `relatorioGlobalPdf`, incluindo as observações.
`relatorios.module.css` isola os estilos. A abrangência, autorização e snapshot
consistente das operações continuam definidos no backend.

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

## Backend: Agenda

O primeiro módulo reorganizado do backend está em `backend/modules/agenda`:

| Ficheiro | Responsabilidade |
| --- | --- |
| `agenda.controller.js` | Receber o pedido HTTP e devolver respostas, códigos e cabeçalhos |
| `agenda.service.js` | Validar os dados e aplicar as regras dos eventos |
| `agenda.repository.js` | Executar SQL parametrizado e devolver resultados da persistência |

O fluxo é rota → middleware de autenticação e autorização → controlador → serviço
→ repositório → PostgreSQL. `backend/routes/agendaRoutes.js` mantém os endpoints,
os limites de pedidos e os perfis autorizados. A validação partilhada existente
continua em `backend/utils/secretariaValidation.js` e `inputValidation.js`.

As consultas públicas filtram visibilidade e estado no SQL e não devolvem os
campos internos. A criação impede datas passadas, mas a edição continua a permitir
corrigir eventos já realizados. A eliminação usa uma condição de data no próprio
DELETE, evitando uma verificação prévia que pudesse ficar desatualizada. Uma
consulta posterior distingue um evento ausente de um evento protegido.

O serviço permite substituir repositório e relógio em testes. Os testes de
controladores continuam a verificar o SQL através de um pool simulado. Nenhum
destes testes altera a base de produção. O script de verificação PostgreSQL foi
atualizado para o novo import, mas só deve ser executado numa base de teste.

## Backend: Tesouraria

O módulo está em `backend/modules/tesouraria`:

| Ficheiro | Responsabilidade |
| --- | --- |
| `tesouraria.controller.js` | Receber pedidos e devolver respostas HTTP |
| `tesouraria.service.js` | Coordenar movimentos, autor confirmado e histórico |
| `tesouraria.repository.js` | Executar consultas, bloqueios e transações PostgreSQL |
| `tesouraria.model.js` | Validar valores, datas, motivos e preparar o resumo |

A escrita passa por validação antes de abrir uma ligação. O repositório inicia
a transação e entrega ao serviço as operações disponíveis nessa ligação. O
serviço confirma o autor, bloqueia o movimento existente com `FOR UPDATE`, escreve
o movimento e o snapshot de auditoria. O repositório só confirma a transação
depois de todas essas operações terem sucesso; em erro, faz rollback e liberta
a ligação. Um movimento ausente devolve 404 sem criar histórico.

O autor vem da sessão e o seu nome é confirmado no PostgreSQL. O payload não
determina o autor. Alterações e eliminações exigem motivo; a eliminação preserva
o snapshot anterior. As consultas mantêm os autores na tabela de movimentos,
o resumo mensal e o limite de 200 operações na consulta de histórico.

As rotas e autorizações permanecem em `backend/routes/tesourariaRoutes.js`.
Os testes usam ligações e consultas simuladas, cobrindo confirmação conjunta,
rollback, libertação da ligação, validação e consultas.

## Backend: Membros e fotografias

O módulo está em `backend/modules/membros`. `membros.controller.js` trata as
respostas HTTP; `membros.service.js` valida os dados e gere as associações às
contas. `membros.repository.js` reúne as consultas parametrizadas e
`membros.model.js` prepara os parâmetros e os dados com URLs protegidos.
As fotografias têm controlador e serviço próprios, com armazenamento partilhado
em `backend/config/photoStorage.js`.

A associação exige administrador e conta ativa disponível. Uma associação
existente pode ser preservada mesmo que a conta esteja inativa. Omitir o campo
na edição mantém a ligação; enviá-lo vazio permite ao administrador desligá-la.
A Minha Área consulta e altera exclusivamente o membro associado à sessão.

O endpoint de fotografias verifica a associação ou o perfil autorizado no SQL e
responde sem cache. O carregamento confirma a associação antes de guardar o
ficheiro. Se o UPDATE confirmar que o membro já não existe, remove a fotografia
nova; se a resposta da base falhar, preserva-a para reconciliação. A limpeza da
fotografia antiga não invalida uma atualização confirmada. Os serviços aceitam
repositórios e armazenamento simulados para testar estes casos sem dados reais.

## Backend: Secretaria — Visitantes, Apresentações e Reuniões/Atas

Os três módulos estão em `backend/modules/secretaria`. Cada área tem um
controlador de entrada com os nomes utilizados nas rotas. O fluxo comum está
separado em `secretaria.controller.js` (respostas HTTP),
`secretaria.service.js` (validação e registos ausentes) e
`secretaria.repository.js` (consultas parametrizadas).

`secretaria.model.js` define internamente os campos, as consultas de leitura,
os validadores e os nomes apresentados nas respostas. Só estas três áreas são
aceites: nomes de tabelas e colunas nunca vêm do pedido. A validação partilhada
continua em `backend/utils/secretariaValidation.js`. A separação substitui o
antigo `secretariaCrud.js`, que misturava HTTP, validação e SQL.

As listagens preservam a ordenação existente e o formato de datas e horas das
atas. As rotas mantêm os perfis autorizados e os limites de escrita. Os testes
cobrem validação antes da persistência, conflitos, registos ausentes, ordenação,
formatação e erros genéricos sem revelar detalhes internos.

## Backend: Secretaria — Documentos e contagens por atividade

Os dois módulos estão também em `backend/modules/secretaria`, com controlador,
serviço e repositório próprios. Documentos utiliza o validador partilhado em
`shared/documentos.js` e preserva os dados guardados para reimpressão, incluindo
identidade e data de emissão. A leitura aceita JSON antigo em texto e devolve um
objeto vazio quando o conteúdo não pode ser interpretado. A criação e a
eliminação validam os dados e os identificadores antes de consultar a base.

Contagens tem ainda `visitas-atividade.model.js`, com validação dos registos,
filtros e limites de paginação/exportação. O serviço obtém da Agenda o título e
a data dos eventos associados, usa o autor fornecido pela sessão e recusa datas
futuras. O relógio pode ser substituído nos testes; a data local vem de
`backend/utils/dataLisboa.js`, partilhado com Agenda. O módulo já não depende
do controlador do Dashboard para calcular o dia atual.

O repositório aplica os mesmos filtros ao resumo e à listagem. A consulta normal
continua paginada com 25 registos; a exportação consulta até 5001 para detetar e
recusar períodos acima do limite de 5000 sem entregar um relatório truncado.
As respostas mantêm os campos existentes e a listagem de contagens não permite
cache. Rotas, permissões e geração dos PDFs permanecem preservadas.

## Backend: Dashboard e Relatórios

Dashboard está em `backend/modules/dashboard`, com controlador HTTP, serviço
dos indicadores, modelo do período de Lisboa e repositório das consultas.
O serviço só solicita os agregados autorizados para o perfil. Mantém os valores
financeiros formatados, os totais de visitantes e a seleção de eventos públicos
para perfis sem acesso administrativo. O período pode ser substituído em testes.

Relatórios está em `backend/modules/relatorios`. O relatório anual tem serviço
e repositório próprios, preservando a distinção entre estado atual e dados do
ano selecionado. A autorização e a validação do ano precedem as consultas;
Secretaria não consulta nem recebe valores financeiros.

O relatório global tem controlador, serviço, modelo e repositório próprios.
O modelo valida período, formato e abrangência. O serviço seleciona as secções,
aplica o limite combinado de 5000 detalhes e prepara os dados usados pelo PDF.
O repositório concentra o SQL e gere a transação `REPEATABLE READ READ ONLY`:
confirma só depois de todas as secções, faz rollback em erro e liberta sempre a
ligação. O relógio e a leitura podem ser substituídos em testes isolados.
Os controladores mantêm as respostas e os cabeçalhos de cache existentes.

## Backend: Autenticação, utilizadores e convites

Autenticação, utilizadores e convites estão em `backend/modules/auth`,
`backend/modules/utilizadores` e `backend/modules/convites`. Cada módulo separa
controlador HTTP, regras do serviço e persistência no repositório. As rotas
passam a importar os controladores correspondentes, preservando os endpoints,
middlewares, limites e autorização exclusiva do administrador para contas.

Autenticação mantém credenciais inválidas genéricas, assinatura JWT HS256 e
versão de sessão. A redefinição consome o hash do token, altera a palavra-passe,
incrementa a versão e invalida outros links na mesma transação. Os limites de
8 caracteres e 72 bytes do bcrypt são validados antes da persistência.

Utilizadores mantém a proteção da própria conta, a invalidação das sessões nas
alterações e o fallback de leitura para esquemas antigos. Contas com registos
associados continuam a exigir desativação em vez de eliminação.

Convites separa o envio em `convites.email.js` e os tokens em
`convites.model.js`. A conta e o hash do token são confirmados antes do envio.
Falhas SMTP revogam só o link enviado e preservam a conta para nova tentativa.
Os convites duram 48 horas e a recuperação 30 minutos; o relógio e o envio
podem ser substituídos em testes. A recuperação pública continua a dar a mesma
resposta para contas inexistentes e falhas de envio. O registo público continua
desativado.

`backend/utils/transacao.js` gere BEGIN, COMMIT, rollback em erro e libertação
da ligação, partilhado pelos repositórios de autenticação e convites. Os testes
simulam consultas e email, sem aceder à base de produção nem enviar mensagens.

## Continuação

Continuar a organização do backend por módulo com controlador, regras e consultas
separados onde a complexidade o justificar. Agenda, Tesouraria, Membros e os
módulos da Secretaria, Dashboard, Relatórios, Autenticação, Utilizadores e Convites
foram migrados no backend;
os restantes módulos mantêm os controladores anteriores. As páginas públicas e de
autenticação e a limpeza final do projeto continuam pendentes.
