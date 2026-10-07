# Correções por prioridade — Centro Trindade

Atualizado em 5 de outubro de 2026. Esta ordem prioriza acesso indevido, integridade de dados e continuidade da operação. As correções implementadas foram publicadas no commit `13dc784`; as notas antigas de validação local abaixo descrevem as etapas anteriores. Itens ainda pendentes continuam por concluir.

| Ordem | Auditoria | Correção | Estado |
|---|---|---|---|
| 1 | C00 | Retirar credenciais versionadas e trocar passwords/tokens expostos | Exemplo limpo localmente. Troca de credenciais e publicação pendentes. |
| 2 | C01 | Impedir acesso a membros pela coincidência de email; contas só por convite | Implementado localmente, com testes. Registo público recusado pela API e página informativa. |
| 3 | C02 | Revogar sessões após desativação, eliminação, mudança de perfil/password | Implementado localmente. Estado, perfil e versão da sessão verificados em cada pedido. |
| 4 | C03 | Retirar simulação MBWay apresentada como pagamento real | Implementado localmente. Página informa indisponibilidade; API não cria pedidos simulados. |
| 5 | C04/C07 | Preservar associação à conta; proteger entrada e batismo | Implementado localmente. Associação escolhida pelo administrador; edição de Secretaria preserva ligação. Dados oficiais são de leitura na Minha Área. |
| 6 | C05 | Corrigir reimpressão de documentos e rastreabilidade da emissão | Implementado localmente, com testes: dados/data originais; emissão só após gravação; validação partilhada e histórico disponível ao Pastor. |
| 7 | C06 | Corrigir indicador de conversão e acesso a relatórios de Tesouraria | Indicador e métricas corrigidos localmente. Por pedido do utilizador, a área independente foi removida; relatórios mantidos apenas em Secretaria. Acesso anual de Tesouraria continua pendente de solução dentro da própria Tesouraria. |
| 8 | C08/C16 | Proteger fotografias, definir retenção e alinhar privacidade | Leitura autenticada e uploads privados publicados. As 4 fotografias existentes foram transferidas e as cópias anteriores eliminadas sem falhas reportadas. Leitura privada e API de produção verificadas. Retenção, limpeza automática de órfãos, descodificação/remoção de metadados e textos de privacidade ainda pendentes. |
| 9 | C09 | Guardar autoria e histórico das operações financeiras | Implementado localmente: autoria, snapshots antes/depois, motivos obrigatórios para alterações/eliminações e gravação transacional; consulta das últimas 200 operações. |
| 10 | C10 | Tornar recuperação/convites robustos e atómicos | Implementado: hashes SHA-256, criação transacional de conta/token, conta pendente até configurar password, reenvio explícito sem duplicação, rotação dos links e resposta pública genérica mesmo se o email falhar. SMTP não é uma transação de base; falhas preservam a conta e permitem nova tentativa. |
| 11 | C11/C12 | Limites partilhados e validação consistente da API | Parcial: Membros e Utilizadores têm validação de tipos, limites reais, datas, estados e IDs; login/recuperação/convites usam email normalizado; índice único de email de contas ignora maiúsculas e espaços. Respostas 400/404/409 reforçadas. Outros controladores e limites partilhados pendentes. |
| 12 | C13 | Separar eventos públicos de internos no backend | Pendente. |
| 13 | C14/C15 | Isolar ambientes, testar restauro e confirmar domínio público | Parcial: testes de segurança/serverless isolados; integração exige base de testes separada. Backups e configuração dos ambientes ainda por confirmar. |
| 14 | C17/C18 | Acessibilidade, calendário, erros e submissões repetidas | Pendente. |
| 15 | C19/C20 | Desempenho, paginação, conteúdo e SEO | Pendente; título de partilha CENTRO TRINDADE já enviado no commit anterior. |
| 16 | C21/C22 | Lint global, CI, observabilidade e limpeza de legado | Parcial: novos testes de segurança e lint dos ficheiros abrangidos. Restantes erros da auditoria ainda pendentes. |

## Primeiro bloco implementado

- Contas novas apenas pelo fluxo de convite já existente em Utilizadores. O endpoint público de registo responde 403, mesmo que alguém ignore a interface.
- Perfil e fotografia exigem `utilizador_id` explícito; email não é prova de identidade. Upload não cria um membro automaticamente.
- Em Membros, o administrador escolhe uma conta cuja identidade confirmou. As contas não são associadas automaticamente por email. Uma ligação já existente é preservada quando o campo não é enviado.
- Secretaria não pode alterar a associação pelo payload da API. A mesma conta não pode ser ligada a dois membros: validação na aplicação e índice único na base.
- JWT novo inclui uma versão de sessão. A API consulta estado/perfil atuais e recusa sessões antigas, contas desativadas/eliminadas ou versões revogadas. Falha na verificação da base bloqueia o acesso e responde 503.
- Alteração de utilizador incrementa a versão. Alteração de password também incrementa e invalida os restantes links de reset, na mesma transação.
- A redefinição consome apenas um token ainda não usado e não expirado; falhas posteriores revertem a transação. Não foi testada concorrência num servidor PostgreSQL de testes nesta etapa.
- Entrada e batismo não são atualizados pelo endpoint pessoal, mesmo com um payload manipulado.
- Doações online estão indisponíveis; a apresentação original com formulário MBWay e imagem PayPal foi reposta a pedido do utilizador, com campos/botão desativados e nota por baixo. Os dados bancários são identificados como exemplos. Não se recolhem dados de doação nem se emitem confirmações MBWay simuladas. Integração real fica para uma etapa própria.

## Alteração da estrutura e verificação

`npm run db:prepare` foi executado com sucesso na base configurada. Adicionou `session_version integer NOT NULL DEFAULT 0` e o índice único parcial `membros_conta_unica`; preservou registos e associações existentes. Outros ambientes terão de executar a preparação antes da publicação desta versão.

Verificações realizadas:

- 19 testes isolados em `npm run test:security`: passaram, sem ligação à base real, envio de emails ou upload de fotografias reais.
- `npm run test:vercel`: passou com autenticação e base simuladas, após compilar a nova versão.
- `npm run build:vercel`: passou. Mantém o aviso conhecido sobre tamanho do bundle.
- Lint direcionado dos controladores/middleware/scripts/testes e páginas de registo, doações e membros: passou. Lint global continua com problemas já identificados; Minha Área ainda tem o diagnóstico anterior de hooks.
- 69 consultas dos controladores e a consulta de sessão foram aceites pelo PostgreSQL via EXPLAIN numa transação READ ONLY, sem execução de escritas.
- `git diff --check`: passou.
- `test:postgres` atualizado para exigir `TEST_DATABASE_URL`; não foi executado porque não está configurada uma base separada para integração. As transações internas de reset usam savepoint dentro da transação de teste, para não escapar ao rollback.

## Antes da publicação

### Segundo bloco — documentos e relatórios

- Os três modelos de PDF recebem o registo selecionado diretamente. A reimpressão preserva o nome/BI do histórico, os dados do documento e a data original de emissão; não altera nem lê o formulário aberto.
- Novos documentos só são descarregados após confirmação da gravação. A geração valida os dados antes do pedido e bloqueia o botão durante a emissão. A API usa a mesma validação de tipo, campos obrigatórios e datas reais; não se emite “Invalid Date”. Documentos antigos incompletos dão uma mensagem de erro, em vez de imprimir dados inválidos.
- Textos de recomendação longos são repartidos em páginas. O histórico fica acessível aos perfis autorizados em modo de leitura, incluindo Pastor; criação/eliminação continuam restritas no backend.
- O relatório conta o estado válido `Tornou-se membro`. O rótulo foi alinhado com esse significado; trata-se do estado atual dos visitantes, não de uma data de conversão que o modelo não guarda.
- Os relatórios ficam apenas no separador da Secretaria, acessível a Administrador, Secretaria e Pastor. A área independente e o respetivo menu foram removidos para evitar duplicação.
- Perfis autorizados a finanças veem receitas, despesas, saldo anual e gráfico mensal; esses valores também entram no PDF. Secretaria continua sem receber valores financeiros.
- A interface e o PDF identificam os totais de membros/visitantes como globais, e as métricas de eventos/apresentações/finanças como anuais. A API rejeita anos inválidos e o frontend ignora respostas de consultas anteriores após mudança de ano.
- Verificação deste bloco: 14 testes isolados de documentos/relatórios passaram; lint direcionado passou; build de produção passou; 9 consultas foram aceites por EXPLAIN em transação READ ONLY; `git diff --check` passou. Não foram emitidos documentos reais nem alterados registos. Não houve publicação nem teste visual completo no browser.

### Passos de publicação

**Tesouraria — rastreabilidade:** criação guarda `criado_por` a partir da sessão confirmada. Cada criação, alteração e eliminação guarda autor e nome, data/hora, motivo e snapshots numa tabela separada, sem FK para o movimento/autor para preservar o histórico após eliminação. Alteração/eliminação bloqueia a linha enquanto grava; falha do histórico reverte a operação inteira. Motivos exigem 5–500 caracteres. Valores positivos com até duas casas decimais e dentro de numeric(10,2), datas reais e observações limitadas são validados antes da ligação. A interface impede submissão repetida enquanto aguarda e permite consultar as últimas 200 operações, incluindo eliminações. Histórico novo não inventa autoria de registos antigos e não reconstrói operações anteriores. Testes isolados de validação, snapshots, autoria não manipulável, rollback e 404: 7 passaram. Permissões de leitura/escrita mantidas no backend. Não foi efetuada operação financeira real nem publicado código. `db:prepare` prepara a tabela aditiva; deve ser executado em cada ambiente antes do deploy.

**Reformulação visual dos PDFs:** todas as sete saídas usam agora um modelo comum com logótipo da igreja incorporado, nome Ministério Centro Trindade, cabeçalho/rodapé, paginação, margens A4 e assinaturas de Secretaria e Pastor na última página. Abrange batismo, membro, recomendação, atas, relatório anual e tesouraria geral/diária. A tesouraria inclui totais calculados sobre os movimentos exportados; o anual inclui apresentações e preserva as restrições financeiras. O logótipo original foi preservado e uma versão leve preparada para incorporação autónoma. Amostras fictícias em `output/pdf`, geradas por `node scripts/preview-pdfs.js`, são ignoradas no Git. Validação visual inclui documentos extensos e células de tabela com texto longo. Não foram emitidos documentos reais.

1. Trocar as credenciais expostas de PostgreSQL e email nos fornecedores. Atualizar a ligação/password da base e a palavra-passe de aplicação do email no `.env` local e na Vercel. Rever também a password MySQL antiga caso esteja em utilização ou tenha sido reutilizada. Não enviar passwords pelo chat.
2. Publicar os ficheiros corrigidos. Não considerar o site em produção protegido por estas alterações enquanto essa publicação não acontecer.
3. Após o deploy, iniciar sessão novamente; os tokens antigos serão recusados intencionalmente.
4. Confirmar convite por email e a associação explícita de uma conta autorizada a um membro. Contas sem ligação passam a mostrar que o perfil ainda não foi configurado.
5. Rever contas e associações já existentes antes da utilização real. Nenhuma foi automaticamente removida ou aprovada nesta etapa.

Limites: não foi feita rotação de credenciais, publicação, alteração de contas existentes, envio de convites reais nem teste completo de browser. A coluna adicional e o índice são compatíveis com a versão anterior ainda publicada, mas os fixes de acesso só entram em vigor com o novo código.

Verificação da Tesouraria: db:prepare executado com sucesso na base configurada; tabela e índice de histórico criados sem alteração dos movimentos existentes. Quatro consultas aceites por EXPLAIN em transação READ ONLY, sem executar operações financeiras. Build, lint direcionado, 7 testes de Tesouraria e 19 testes de segurança passaram. Não houve validação visual completa desta interface no browser.

### Validação de Visitantes, Apresentações e Atas

- Visitantes: nome/convidado por obrigatórios e até 150 caracteres, telefone textual com 9 dígitos, email normalizado dentro do limite da coluna, data real e estado da lista oficial.
- Apresentações: data real obrigatória e quantidade inteira positiva dentro do limite integer da base; NaN, frações, booleanos e valores fora do limite recusados.
- Atas: título/local dentro de 255 caracteres, data real, hora HH:MM ou HH:MM:SS dentro dos intervalos válidos; textos multilineares preservados, limites explícitos e rejeição de caracteres de controlo inválidos.
- As três áreas validam IDs antes da consulta; alterações/eliminações sem registo respondem 404 e conflitos de referências/duplicados respondem 409.
- Campos livres: observações/participantes até 10 000 caracteres; resumo/decisões de atas até 30 000 caracteres. Nenhum texto existente foi reduzido ou reescrito.
- Treze testes isolados, lint direcionado e compilação passaram. Não foram criados, alterados ou eliminados registos reais nos testes.

### Agenda: validação e visibilidade

- Eventos existentes e novos têm publico=false por omissão. Nenhum evento foi aprovado automaticamente para divulgação.
- GET /api/eventos devolve apenas eventos públicos Agendados, filtrados no PostgreSQL, com campos definidos e Cache-Control no-store.
- GET /api/eventos/internos exige sessão e perfil Administrador, Secretaria ou Pastor e mantém todos os eventos na gestão.
- Gestão inclui opções de Estado e Visibilidade; indicar Público divulga título, descrição, data, hora e local no calendário do site.
- Validação de título/local, descrição multilinear, calendário real, hora, estado, booleano de visibilidade e IDs antes da query.
- Novos eventos não aceitam datas passadas; eventos históricos podem ser corrigidos, sem permitir eliminação de eventos passados. A eliminação usa uma condição na própria query e distingue 400 de 404.
- Datas de referência calculadas em Europe/Lisbon, sem depender do fuso horário do servidor.
- Sete testes de Agenda, lint direcionado e compilação passaram. Nenhum evento real criado ou eliminado; coluna de visibilidade adicionada preservando os dados existentes.

### Limites de pedidos partilhados — 6 de outubro de 2026

- Login/recuperação, contacto, doações, leituras públicas e escritas autenticadas usam contadores PostgreSQL, partilhados entre instâncias, em vez de memória local.
- Incremento e reinício de janela são atómicos com INSERT ON CONFLICT; cada grupo tem uma chave distinta. Os limites e janelas anteriores foram mantidos.
- A base guarda hash da chave, contador e expiração, sem guardar o IP em texto simples. O hash não constitui anonimização garantida.
- Excesso de pedidos responde 429 com cabeçalhos de repetição. Falha do armazenamento responde 503; não existe fallback que contorne o limite.
- Limpeza oportunista limitada remove contadores expirados há mais de um dia a cada 1000 pedidos por instância. Não é uma política de retenção com horário garantido; uma limpeza agendada pode ser acrescentada posteriormente.
- JSON malformado responde 400 e pedidos acima do limite do parser respondem 413, sem mensagens internas.
- A tabela e o índice foram preparados sem alterar registos da igreja. Quatro testes isolados e teste serverless passaram; consulta atómica validada com EXPLAIN READ ONLY.
- Dashboard principal fica reservado para a atualização seguinte, conforme decisão do utilizador. Alterações locais de estilos da Agenda e Tesouraria foram preservadas e não incluídas neste bloco.

### Contacto público — 6 de outubro de 2026

- Validação de objeto, tipos, campos obrigatórios, limites de tamanho e caracteres de controlo antes de abrir SMTP; email normalizado, telemóvel opcional de nove dígitos e mensagem multilinear até 10000 caracteres.
- Formulário aplica limites, associa etiquetas aos campos e anuncia o resultado de forma acessível.
- Transporte SMTP tem limites de espera e é fechado após o envio. Configuração ausente devolve 503; falha/rejeição do envio principal devolve 502, sem detalhes internos.
- Sucesso exige aceitação do destinatário pelo SMTP, que não garante a entrega final na caixa de entrada. Se apenas a confirmação falhar, preserva o sucesso principal e indica que não é necessário reenviar.
- Seis testes com SMTP simulado cobrem validação, normalização/HTML, aceitação, falha principal, falha secundária e configuração ausente. Nenhum email real enviado durante os testes.

### Fotografias: descodificação e remoção de metadados — 6 de outubro de 2026

- Novos uploads JPEG/PNG/GIF/WebP são descodificados com Sharp; cabeçalhos falsos, dados truncados, animações, ficheiros acima de 2 MB e imagens acima de 16 milhões de píxeis são recusados com 400.
- Orientação EXIF aplicada aos píxeis antes de remover metadados. Recompressão WebP sem EXIF/GPS, IPTC, XMP ou perfil ICC incorporado; dimensão máxima de 1600 píxeis por lado, sem ampliar imagens pequenas.
- O armazenamento privado/local guarda apenas o resultado processado; dados anexados ao ficheiro original não são copiados. Leitura e permissões das fotografias existentes preservadas.
- Onze testes de fotografias, 19 testes de segurança, lint direcionado, compilação de produção e teste serverless passaram. Imagens de teste são sintéticas e eliminadas após os testes.
- Não foi efetuada conversão em massa das fotografias existentes. Retenção, reconciliação automática de órfãos e textos de privacidade continuam pendentes.

### Reconciliação de fotografias privadas — 6 de outubro de 2026

- Novo comando photos:reconcile com análise por omissão e eliminação apenas com --apply; nenhuma tarefa recorrente ativada.
- Inventário paginado completo, nomes/prefixos gerados pela aplicação, armazenamento privado, margem de 24 horas e verificação adicional de referências antes de cada remoção.
- Lotes de até 100 eliminações; falhas de base/listagem interrompem a limpeza. Falhas individuais do armazenamento ficam contadas para nova tentativa. Logs contêm contagens, sem URLs pessoais.
- Seis testes isolados passaram. Análise real: quatro ficheiros, quatro referências, zero candidatos e zero eliminações. Não foram alterados registos de membros.
- Não cobre ficheiros locais, objetos públicos antigos ou nomes desconhecidos. Não substitui política de retenção de membros/backups nem constitui transação entre serviços. Operações manuais não devem reutilizar URLs durante a limpeza.

### Calendário público — 6 de outubro de 2026

- Navegação para mês anterior/seguinte, incluindo transição de ano, e botão Hoje. A mudança de mês limpa a seleção anterior; o dia selecionado mostra a data e permite voltar ao resumo mensal.
- Dias são botões com nomes acessíveis, estado selecionado e indicação do dia atual; funcionam com Tab, Enter e Espaço. Cabeçalho e resultados anunciam atualizações.
- Erro persistente com Tentar novamente; carregamento protegido contra respostas após desmontagem ou tentativa anterior.
- Estilos reforçam foco visível, legibilidade dos avisos, espaçamento em telemóvel e redução de movimento.
- Lint direcionado, compilação de produção e teste serverless passaram. Não foram alterados eventos reais. Não houve teste visual exaustivo em dispositivos.

### Lint global e efeitos de carregamento — 6 de outubro de 2026

- Corrigidos os oito diagnósticos restantes; npm run lint passa globalmente sem desativar regras.
- Contexto PerfilContext/usePerfil separado da rota protegida; imports atualizados sem alterar permissões.
- Avisos de sessão expirada/link de redefinição inválido derivados sem efeitos síncronos. Aviso de sessão continua a ser limpo ao escrever/tentar login; redefinição bloqueia submissões em curso e sem token.
- Listas CRUD e carregamento técnico do dashboard ignoram respostas após desmontagem ou substituição da consulta. Design do dashboard preservado para a atualização posterior.
- Import do logótipo sem uso e valor ultimosMembros sem uso removidos. Restantes estilos locais preservados.
- Lint global, 108 testes isolados, compilação de produção e teste serverless passaram. Nenhum dado real alterado nem email enviado. Testes completos de interação no navegador e pipeline CI continuam pendentes.

### Verificação automática — 7 de outubro de 2026

- Workflow GitHub Actions em push main, pull_request e workflow_dispatch; Node 24, npm ci e sequência check:ci que interrompe na primeira falha.
- Inclui lint, 108 testes isolados, compilação de produção e verificação serverless. Sem segredos de produção, migrações, test:postgres ou limpeza de fotos.
- Permissão contents:read, sem persistir credenciais de checkout, limite de 15 minutos e cancelamento de execuções antigas da mesma referência.
- Regras de bloqueio de merge/publicação e teste de recuperação de backups continuam pendentes; não foram alteradas configurações da Vercel ou políticas do repositório.

### Agenda pública informativa — 7 de outubro de 2026

- Por pedido do utilizador, removidos navegação entre meses, botão Hoje e seleção interativa de dias.
- Calendário apresenta o mês atual e lista os eventos públicos desse mês; dias são elementos informativos, sem clique ou cursor interativo.
- Erro de carregamento continua visível e indica atualização da página; carregamento protegido contra respostas após desmontagem preservado.
- Lint direcionado, build de produção e verificação serverless passaram. Gestão interna da Agenda preservada.

### Dashboard escuro — 7 de outubro de 2026

- Implementada a proposta escura aprovada: quatro indicadores para gestão, barras de entradas de membros, distribuição circular de visitantes, resumo financeiro, eventos e pendências; números fictícios substituídos por consultas reais.
- Membros ativos são o total atual; novos membros usam entrada no mês e o gráfico usa entrada no ano; visitantes mensais contam registos pela data_visita. Distribuição por estado inclui todos os registos, não uma taxa de conversão mensal.
- Período calculado em Europe/Lisbon e intervalos de datas parametrizados. Saldo mensal explicitamente receitas menos despesas, sem o apresentar como saldo acumulado.
- Finanças apenas Administrador/Tesouraria/Pastor. Agregados detalhados de membros/visitantes e membros sem conta apenas Administrador/Secretaria/Pastor; contas por ativar só Administrador. Membro/Tesouraria recebem apenas eventos públicos; gestão vê internos também. Resposta privada sem cache.
- Gráficos têm tabelas alternativas de valores; foco visível, layout adaptável e estados de vazio/erro/carregamento. Sem conta associada não implica criar obrigatoriamente uma conta.
- Lint global, 114 testes isolados, build e verificação serverless passaram. Consultas verificadas por leitura na base atual, sem alteração de registos. Não houve validação visual exaustiva em dispositivos.
