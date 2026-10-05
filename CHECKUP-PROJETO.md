# Check-up do Centro Trindade

Data: 5 de outubro de 2026. Revisão do código local, configuração, dependências, compilação, testes seguros da entrada serverless e metadados da base PostgreSQL. Não foram alterados registos, enviadas mensagens, processados pagamentos nem publicadas alterações.

**Atualização após o início das correções:** este documento mantém o retrato da auditoria inicial. O estado atual e a ordem de execução estão em [CORRECOES-PRIORIDADES.md](C:/Users/Djame/erp-centro_trindade/CORRECOES-PRIORIDADES.md). Na implementação foi identificado um risco adicional: credenciais preenchidas em `.env.example`, já versionado. A exclusão de `.env` não protege segredos inseridos noutro ficheiro. O exemplo foi limpo localmente, mas as credenciais precisam de ser trocadas e a alteração publicada.

**OK** identifica aspetos concretos que estão bem implementados. **CRÍTICO** identifica tudo o que precisa de melhoria, conforme solicitado; a prioridade distingue riscos urgentes de melhorias normais. Um componente pode ter aspetos nas duas categorias. A revisão não é uma certificação de segurança nem substitui testes completos com utilizadores e dispositivos.

Evidência executada nesta revisão:

- `npm run build:vercel`: passou. Bundle principal de 767,03 kB, 238,16 kB comprimidos; CSS de 188,38 kB. Aviso de bundle superior a 500 kB.
- `npm run test:vercel`: passou; entrada Express/serverless, autenticação sem token, rota inexistente, uploads inválidos e superiores a 2 MB, ausência de URL de API localhost nos ficheiros JavaScript compilados.
- `npm run lint`: falhou com **14 erros e 0 avisos**.
- `npm audit`: **0 vulnerabilidades conhecidas** nas dependências verificadas. Isto não deteta problemas na lógica da aplicação.
- PostgreSQL: ligação e leitura de constraints/índices passaram; consulta de constraints em transação `READ ONLY`. Não se fez um novo teste de escrita sobre a base usada pelo projeto.
- Endereço longo fornecido anteriormente: redirecionou pedidos anónimos para **Login – Vercel**. O HTTP 200 final corresponde à página de login, não ao site. Não foi confirmado o domínio curto atual.
- A API local respondeu 401 sem token em `/api/membros`. Os testes locais não comprovam que o deployment publicado tem a mesma configuração.

## OK

| Componente | O que está bom |
|---|---|
| React/Vite — App, main, Home e AppRoutes | Separação entre páginas públicas e área interna; rotas definidas; compilação de produção funcional. |
| Layout, DashboardLayout, Sidebar, Topbar e Card | Componentes reutilizáveis; menus filtrados pelo perfil; identificação do utilizador e terminar sessão. |
| Navbar, Footer, Hero, Gallery e VideoSection | Estrutura de apresentação, navegação, galeria e vídeo implementadas. Existem estilos para vários tamanhos de ecrã; isso ainda precisa de validação visual em dispositivos. |
| Academia 120 / Escola120 | Página informativa simples, sem dependência da base de dados nem recolha adicional de dados. |
| Login e backend de autenticação | Passwords com bcrypt; JWT assinado com HS256 e expiração; login recusa contas inativas e usa mensagem genérica para credenciais inválidas. |
| Registo | A API impõe o perfil Membro; o visitante não escolhe Administrador através do formulário. Validação básica de email e mínimo de password. |
| Recuperação / RedefinirPassword | Tokens gerados aleatoriamente, com expiração e marcação de uso; não se enviam passwords atuais por email. |
| ProtectedRoute e RBAC | As permissões não dependem apenas dos menus: existem verificações de token e perfil na API. |
| Utilizadores | Gestão reservada ao Administrador no backend; proteção contra alteração do próprio perfil/estado e eliminação da própria conta por esta interface. |
| Membros | CRUD protegido por perfil, consultas parametrizadas e validação básica de email/telemóvel. |
| Minha Área | Endpoint próprio, feedback de carregamento/gravação, preview de fotografia e libertação do URL de preview. |
| Upload e armazenamento de fotografias | Autenticação antes do upload, limite de 2 MB, verificação de assinatura binária, nomes aleatórios e Blob persistente para serverless. |
| Agenda interna | Escrita limitada a Administrador/Secretaria; estados e datas; calendário público separado da interface de gestão. |
| Calendário público | Filtragem visual de eventos agendados, seleção de dia e estados de carregamento/erro. |
| Secretaria e Visitantes | Separação em separadores; acompanhamento de visitantes e pesquisa; controlo de leitura/escrita por perfil. |
| Apresentações | Registo por data e quantidade; listagem e gestão com permissões na API. |
| Documentos | Modelos PDF para batismo, membro e recomendação; histórico armazenado com os dados utilizados. |
| Reuniões e Atas | CRUD e PDF com quebra de páginas, cabeçalho e rodapé repetidos; impressão usa a reunião selecionada. |
| Tesouraria | Separação receitas/despesas, valores decimais no PostgreSQL, filtros/resumos e acesso limitado por perfil. |
| Dashboard e Relatórios | Agregações no backend; detalhes financeiros e lista nominal de membros condicionados ao perfil no dashboard; relatórios ocultam totais financeiros de Secretaria. |
| Contacto / Formulario | Envio no backend; dados escapados no HTML dos emails; botão bloqueado durante o envio e mensagens de sucesso/erro. |
| Doações — consulta de estado | Identificadores aleatórios; a consulta pública de estado não devolve nome, telemóvel ou valor. O processamento real de pagamento está em CRÍTICO. |
| ToastContainer, toast, api, useCrud, data e validation | Reutilização de pedidos/feedback; tratamento central de sessão expirada; datas simples formatadas sem conversão de fuso; regra comum de telemóvel. Toasts têm anúncio acessível. |
| NotFound | Página de recuperação para rotas desconhecidas no frontend, com regresso à página inicial. |
| PostgreSQL / Neon | Pool de ligações, timeout, verificação TLS, consultas parametrizadas e constraints de estados/perfis; índice único de email e relações por chave estrangeira. |
| Migração de dados e fotografias | Scripts separados; importação recusa schema já preenchido; migração de fotografias tem preflight e evita duplicar URLs já migradas. |
| Backend Express e api/index | Aplicação separada do servidor local; Helmet, CORS e tratamento central de erros; entrada compatível com funções. |
| Vercel, build e configuração | API na mesma origem; fallback SPA; região configurada; build evita API localhost; ficheiros SQL/uploads excluídos da função. |
| Git e documentação | `.env`, dumps SQL e uploads ignorados no estado atual; `.env.example`, README, DEPLOYMENT e instruções de migração. O estado inicial do Git estava limpo. |
| Dependências | A análise atual não encontrou vulnerabilidades conhecidas. |
| Política de privacidade e Termos | Páginas existem; termos identificam o caráter demonstrativo das doações. O conteúdo precisa de revisão antes da utilização real. |

## CRÍTICO

### C00 — Urgente: credenciais no exemplo versionado

O `.env.example` continha credenciais de ligação à base e de email, em vez de placeholders. Não reproduzir esses valores em relatórios ou mensagens. A versão local foi corrigida. Como os valores estiveram no Git, é necessário substituir as credenciais nos fornecedores e atualizar os ambientes da aplicação. A limpeza atual não elimina o histórico e não equivale à revogação das credenciais antigas.

Prioridades: **Urgente** = corrigir antes de abrir a utilização com dados reais; **Alta** = resolver antes da operação habitual; **Média** = fiabilidade, acessibilidade, desempenho ou manutenção.

### C01 — Urgente: registo sem verificação permite associação indevida a membros

Evidência: [register](C:/Users/Djame/erp-centro_trindade/backend/controllers/authController.js:34), [getMembroMe](C:/Users/Djame/erp-centro_trindade/backend/controllers/membroController.js:213) e [uploadMembroFoto](C:/Users/Djame/erp-centro_trindade/backend/controllers/membroController.js:245).

O registo público aceita um email sem confirmar a sua posse. A leitura do perfil e a atualização da fotografia associam a conta ao membro por `utilizador_id OU email`. Se alguém registar o email de um membro que ainda não tenha conta, pode obter o perfil desse membro e alterar a fotografia. Não se realizou esta operação sobre dados reais; o cenário decorre diretamente do fluxo e dos predicados SQL.

Melhoria: ligar exclusivamente pelo identificador da conta após confirmação de identidade/email e autorização da secretaria. Enquanto esse fluxo não existir, limitar o registo a convites ou aprovação. Definir também se uma conta pode estar ligada a mais de um membro; o schema atual não impõe unicidade em `membros.utilizador_id`.

### C02 — Urgente: desativar contas ou retirar permissões não invalida a sessão existente

Evidência: [middleware de autenticação](C:/Users/Djame/erp-centro_trindade/backend/middleware/auth.js:24) e [expiração do login](C:/Users/Djame/erp-centro_trindade/backend/controllers/authController.js:108).

A API verifica a assinatura e usa o perfil guardado no JWT, sem consultar o estado/perfil atual da conta. Um token emitido antes da desativação, eliminação, alteração de perfil ou password pode continuar utilizável até expirar, durante um dia.

Melhoria: validar estado/permissões atuais ou uma versão de sessão revogável. Revogar sessões após alterações sensíveis. Avaliar armazenamento de sessão em cookie HttpOnly e proteção adicional para administradores; o token atual fica em localStorage, acessível a código JavaScript da origem.

### C03 — Urgente: doações são uma simulação apresentada como pedido MBWay real

Evidência: [controlador de doações](C:/Users/Djame/erp-centro_trindade/backend/controllers/donateController.js:3) e [Contribua](C:/Users/Djame/erp-centro_trindade/src/pages/Contribua.jsx:38).

O backend usa `mock-`, guarda pedidos num `Map` em memória e nunca confirma um pagamento real. A página diz para confirmar no telemóvel; o IBAN é `PT50 XXXX XXXX XXXX` e a imagem PayPal não constitui uma integração. Na Vercel, instâncias diferentes ou reinícios perdem esse estado.

Melhoria: retirar a afirmação de pagamento enviado e identificar/desativar a demonstração, ou implementar um prestador real, persistência e confirmação por webhook verificado, com prevenção de duplicações. O botão deve usar `loading` para bloquear pedidos repetidos. O polling de 2 em 2 segundos também excede o limite de 20 pedidos/15 minutos numa mesma instância; separar os limites e tratar 404/429 e falhas de consulta.

### C04 — Alta: editar um membro remove a ligação à conta

Evidência: [listagem de membros](C:/Users/Djame/erp-centro_trindade/backend/controllers/membroController.js:61), [UPDATE](C:/Users/Djame/erp-centro_trindade/backend/controllers/membroController.js:113) e [formulário](C:/Users/Djame/erp-centro_trindade/src/pages/dashboard/membros.jsx).

A listagem e o formulário não transportam `utilizador_id`. O UPDATE converte a ausência desse campo em NULL. Uma edição normal pode remover a associação; a edição da Minha Área exige precisamente essa associação, produzindo um fluxo inconsistente.

Melhoria: preservar a associação existente quando não é explicitamente alterada e criar um fluxo próprio para a secretaria associar/desassociar contas verificadas.

### C05 — Alta: reimpressão pode emitir documentos com dados anteriores

Evidência: [reimprimir](C:/Users/Djame/erp-centro_trindade/src/components/secretaria/documentos.jsx:129).

`setFormData()` é seguido imediatamente pela geração do PDF, que lê o estado do render anterior. Reimprimir um documento pode usar dados vazios ou de outra pessoa previamente introduzida. A nova emissão também gera o PDF mesmo se a gravação do histórico falhar, e a reimpressão usa a data atual no rodapé.

Melhoria: passar os dados do documento diretamente ao gerador; preservar a data de emissão ou identificar a reimpressão; condicionar a emissão ao registo bem-sucedido quando se exige rastreabilidade. Validar datas/campos e testar textos longos e caracteres portugueses.

### C06 — Alta: indicadores de conversão estão incorretos

Evidência: [consulta de relatórios](C:/Users/Djame/erp-centro_trindade/backend/controllers/relatoriosController.js:65) e [Visitantes](C:/Users/Djame/erp-centro_trindade/src/components/secretaria/visitantes.jsx:102). A constraint PostgreSQL foi confirmada nesta revisão.

A consulta conta `Convertido`; o estado permitido e usado na interface é `Tornou-se membro`. O indicador fica a zero independentemente dos registos válidos. A interface de relatórios fica dentro de Secretaria, inacessível ao perfil Tesouraria, embora a API permita esse perfil.

Melhoria: unificar os estados e testar os resultados; disponibilizar os relatórios financeiros no percurso de Tesouraria. Identificar claramente que os totais de membros/visitantes são globais, enquanto outras métricas dependem do ano selecionado.

### C07 — Alta: dados oficiais do membro podem ser alterados pelo próprio membro

Evidência: [updateMembroMe](C:/Users/Djame/erp-centro_trindade/backend/controllers/membroController.js:158) e [Minha Área](C:/Users/Djame/erp-centro_trindade/src/pages/dashboard/MinhaArea.jsx:147).

A API permite atualizar `entrada` e `batizado` através do endpoint pessoal. Se estes campos são registos oficiais da igreja, não devem ser autocertificados pelo membro.

Melhoria: definir os campos de autosserviço — por exemplo contacto/morada — e reservar entrada e batismo à secretaria ou a um pedido sujeito a aprovação. Impor esta distinção no backend.

### C08 — Alta: proteção e ciclo de vida das fotografias

Evidência: [photoStorage](C:/Users/Djame/erp-centro_trindade/backend/config/photoStorage.js) e [controlador de membros](C:/Users/Djame/erp-centro_trindade/backend/controllers/membroController.js).

O Blob está configurado como público: quem tiver o URL abre a fotografia sem iniciar sessão. Nomes aleatórios dificultam adivinhação, mas não são controlo de acesso. Substituições e eliminações de membros não eliminam automaticamente as fotografias antigas. Fotografias que já estiveram versionadas podem permanecer no histórico Git.

Melhoria: decidir quais fotografias são públicas; para perfis reservados, servir ficheiros mediante autorização. Implementar eliminação/retenção e limpeza de ficheiros órfãos. Verificar o histórico antes de tornar o repositório público. Complementar assinatura binária com descodificação, limite de dimensões e remoção de metadados.

### C09 — Alta: tesouraria sem autoria e histórico das alterações

Evidência: [tesourariaController](C:/Users/Djame/erp-centro_trindade/backend/controllers/tesourariaController.js).

Existe a coluna `criado_por`, mas a criação de movimentos não a preenche. Movimentos podem ser alterados/eliminados sem histórico de quem fez a operação e dos valores anteriores.

Melhoria: guardar o autor, registar alterações e motivos, e definir anulação/correção rastreável. Validar valores finitos, precisão e limites; testar resumos e exportações com movimentos de vários anos. Esta observação é de controlo operacional, não uma avaliação de conformidade contabilística.

### C10 — Alta: recuperação de password e criação de contas precisam de atomicidade

Evidência: [redefinição](C:/Users/Djame/erp-centro_trindade/backend/controllers/authController.js:202).

A verificação do token, alteração da password e marcação como usado são operações separadas. Pedidos concorrentes podem verificar o mesmo token antes de ser consumido; uma falha intermédia pode deixar alterações parciais. Criação de conta, criação do token e envio de email também precisam de recuperação clara em caso de falha. Templates de autenticação interpolam nomes sem o escape HTML já usado no contacto.

Melhoria: consumir o token e alterar a password numa transação com bloqueio/condição atómica; armazenar hash do token; invalidar tokens e sessões anteriores. Escapar nomes nos emails e permitir repetir o convite sem duplicar a conta. Não foi enviado email nesta revisão.

### C11 — Alta: limites de pedidos não são globais na Vercel

Evidência: [rateLimit](C:/Users/Djame/erp-centro_trindade/backend/middleware/rateLimit.js).

Os contadores estão na memória de cada instância. A proteção contra tentativas de login, spam e pedidos repetidos varia entre instâncias/reinícios.

Melhoria: usar armazenamento partilhado para os limites relevantes e rever por rota/identidade/IP. Considerar proteção adicional para formulários públicos. Não fazer bloqueios que impeçam o polling normal das doações.

### C12 — Alta: validação de dados e respostas da API incompletas

Aplica-se aos controladores de autenticação, membros, agenda, visitantes, apresentações, documentos, tesouraria, contacto e doações.

Há validações básicas, mas não um schema consistente de tipos, tamanhos, datas, estados, IDs e intervalos. Exemplos: `nome?.trim()` pressupõe string; `Number(valor) <= 0` não rejeita NaN; quantidades precisam de ser inteiros positivos. Em vários UPDATE/DELETE, a API responde sucesso mesmo quando o ID não existe. Erros de input podem acabar como 500.

Melhoria: validar o payload inteiro antes da query e responder 400/404/409 de forma consistente. Normalizar email para uma regra única: a unicidade atual é sobre texto sensível a maiúsculas/minúsculas, permitindo variantes de capitalização. Tratar conflitos do índice único mesmo com pedidos concorrentes.

### C13 — Alta: agenda pública devolve todos os eventos

Evidência: [rota pública](C:/Users/Djame/erp-centro_trindade/backend/routes/agendaRoutes.js:19) e [getEvents](C:/Users/Djame/erp-centro_trindade/backend/controllers/agendaController.js:46).

O GET público devolve descrições, locais e estados de todos os eventos. Filtrar só no React não restringe o que é consultável na API. O modelo atual não distingue evento interno de evento público.

Melhoria: definir visibilidade e filtrar/cortar campos no backend; fornecer uma listagem autenticada para gestão. Decidir se eventos cancelados/concluídos devem estar no histórico público. Rever a regra que impede corrigir eventos passados.

### C14 — Alta: isolamento de ambientes, backups e recuperação ainda por comprovar

O ambiente local usa uma ligação Neon e pode usar o Blob online quando o token está presente. A documentação recomenda separar previews, mas não comprova que as configurações reais estão isoladas. Não encontrei no repositório um procedimento completo de backup/restauro ou um teste de recuperação.

Melhoria: base e armazenamento próprios para desenvolvimento/testes/previews; acesso da aplicação com privilégios mínimos; confirmar retenção e restauro no plano Neon e no Blob, e testar num ambiente separado. Não concluo que o fornecedor não tenha backups: essa configuração não foi consultada. `test:postgres` não deve ser usado indiscriminadamente sobre produção: inclui operações transacionais e sequências podem avançar apesar do rollback.

### C15 — Alta: confirmar o endereço público e o deployment efetivo

O URL longo fornecido anteriormente redireciona visitantes anónimos para login Vercel. Não foi confirmado o domínio curto escolhido nem as variáveis do deployment atual. O `FRONTEND_URL` local é localhost, o que é normal para desenvolvimento e não revela o valor da Vercel.

Melhoria: testar o domínio final em janela anónima, confirmar acesso público, rotas internas, API, login e links de recuperação. Usar o domínio estável nas configurações de produção e na divulgação. Não alterar a proteção de previews indiscriminadamente.

### C16 — Alta: adaptar privacidade e termos à utilização real

Evidência: [política](C:/Users/Djame/erp-centro_trindade/src/pages/politicaprivacidade.jsx), [termos](C:/Users/Djame/erp-centro_trindade/src/pages/termoscondicoes.jsx) e [vídeo incorporado](C:/Users/Djame/erp-centro_trindade/src/components/home/videosection.jsx).

A política remete contactos para a secção 12, que trata cookies; tem afirmações genéricas sobre menores/DPO e não descreve suficientemente os fluxos reais de perfis internos, fotografias públicas, fornecedores e retenção. O iframe YouTube carrega diretamente, enquanto o texto descreve terceiros principalmente como algo visitado por ligação. Os termos de demonstração de doações entram em conflito com a mensagem de sucesso MBWay.

Melhoria: rever os textos com quem é responsável pelos dados da igreja; descrever práticas efetivas e contactos corretos, e definir regras para menores, fotografias, acesso, eliminação e retenção. Avaliar carregamento de conteúdos externos mediante escolha do visitante. Não foi feita uma avaliação jurídica de conformidade.

### C17 — Média: acessibilidade e utilização em telemóvel

Componentes afetados: Navbar, Gallery, calendário, formulários, tabelas e modais de membros, utilizadores, agenda, tesouraria e secretaria. Há controlos clicáveis em `div`/`span`, botões só com ícones sem nome acessível, labels sem associação explícita e modais sem gestão completa de foco/teclado. A galeria automática não tem uma alternativa de redução de movimento nos estilos inspecionados.

Melhoria: controlos semânticos, nomes acessíveis, labels ligadas aos campos, foco inicial/retorno e Escape nos diálogos, navegação por teclado e opção de pausar animações. Testar contraste, zoom e larguras pequenas, sobretudo tabelas e Sidebar. Os media queries existentes são um ponto positivo, mas não equivalem a uma aprovação visual.

### C18 — Média: calendário, estados de erro e operações repetidas

O calendário só mostra o mês atual porque `currentDate` não tem mecanismo de alteração. Várias páginas CRUD não usam o estado de carregamento disponível, e a falha de uma lista pode aparecer como lista vazia ou manter dados antigos, apenas com um toast temporário. Nem todos os formulários impedem gravações duplicadas.

Melhoria: navegação entre meses/anos; estados persistentes distintos de erro, vazio e carregamento; botão de repetir; bloquear submissões em curso. Aplica-se a membros, agenda, visitantes, apresentações, atas, documentos, utilizadores e tesouraria. Minha Área deve distinguir falha de rede de perfil ainda não configurado.

### C19 — Média: desempenho e crescimento das listas

Evidência: [AppRoutes](C:/Users/Djame/erp-centro_trindade/src/routes/AppRoutes.jsx) e compilação realizada.

As páginas públicas e administrativas são importadas antecipadamente; o bundle principal inclui muito código antes de o utilizador precisar dele. Há imagens até aproximadamente 407 kB e um conjunto amplo de fontes/ícones. Listagens carregam os registos completos e filtram no browser; os índices observados são sobretudo PK/FK/email.

Melhoria: carregar rotas/PDFs sob demanda, otimizar fotografias e imagens da galeria, usar lazy loading quando apropriado e reduzir ícones/fontes. Implementar paginação e filtros no servidor conforme o volume crescer; medir consultas antes de adicionar índices de datas/estados. O tamanho de um asset emitido não significa que todos os formatos de fonte são descarregados em cada visita.

### C20 — Média: SEO, conteúdo e links públicos

Evidência: [index.html](C:/Users/Djame/erp-centro_trindade/index.html) e [Footer](C:/Users/Djame/erp-centro_trindade/src/components/Footer.jsx).

Título genérico `TRINDADE`; faltam descrição, metadados de partilha e canonical por página. Não encontrei sitemap/robots no projeto. Existem contactos/IBAN de exemplo e links `#` no rodapé. A âncora de galeria pode não chegar à página inicial quando usada noutra rota. A renderização pública depende de JavaScript.

Melhoria: substituir exemplos pelos dados reais autorizados, corrigir links, definir títulos/descrições e domínio canónico, publicar sitemap das páginas públicas e verificar indexação. Avaliar pré-renderização das páginas públicas. Áreas privadas devem continuar protegidas pela API; robots não é mecanismo de segurança. Nenhuma presença no Google foi confirmada nesta revisão.

### C21 — Média: lint, testes e entrega contínua

Os 14 erros abrangem Footer, Relatórios, Contribua, Login, RedefinirPassword, Calendário, Minha Área, Dashboard, Tesouraria, ProtectedRoute e useCrud. São variáveis/imports não usados, regras de hooks/imutabilidade e separação de exports para Fast Refresh. Estes diagnósticos não demonstram, por si só, que todos esses ecrãs falham em execução.

Melhoria: corrigir/rever cada diagnóstico, manter lint a passar e automatizar build/lint/testes numa pipeline. Os testes existentes são úteis, mas não cobrem os cenários C01–C13 nem fluxos completos no browser. Criar testes isolados de identidade, revogação, preservação de associação, PDFs, indicadores, validação e concorrência; usar base própria. Não encontrei workflow de CI no repositório.

### C22 — Média: manutenção, observabilidade e código legado

Existem scripts antigos MySQL e dependência `mysql2`, embora o runtime principal use PostgreSQL. Existe `tmp-test.png` versionado. Não encontrei um processo documentado de alertas, acompanhamento de erros de produção e recuperação operacional. As listas de permissões repetem-se no frontend/backend e podem divergir.

Melhoria: identificar/arquivar scripts legados para evitar execução acidental, remover artefactos temporários e dependências sem uso após confirmar necessidade. Padronizar regras de domínio/permissões, logs sem dados pessoais/segredos, monitorização e alertas úteis. Rever a documentação depois das correções de fotografias, contas e pagamentos.

**Ordem recomendada:** identidade e sessões (C01–C02), doações (C03), associação e dados oficiais dos membros (C04/C07), documentos e indicadores (C05–C06); depois proteção de dados, rastreabilidade, validação e operação (C08–C16). As melhorias C17–C22 podem seguir por etapas. Antes de introduzir dados reais da igreja, validar os primeiros blocos num ambiente separado.

Limites: revisão estática e verificações técnicas selecionadas; sem teste exaustivo de browser/mobile, envio de emails, pagamento real, restauro de backup ou acesso ao painel de configurações Vercel/Neon. O relatório não confirma a ausência de outros problemas. Não se limpou a base e não se corrigiu nem publicou código nesta revisão.
