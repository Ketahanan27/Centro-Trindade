# Correções por prioridade — Centro Trindade

Atualizado em 5 de outubro de 2026. Esta ordem prioriza acesso indevido, integridade de dados e continuidade da operação. “Implementado localmente” não significa publicado: estas correções ainda não foram enviadas ao GitHub/Vercel.

| Ordem | Auditoria | Correção | Estado |
|---|---|---|---|
| 1 | C00 | Retirar credenciais versionadas e trocar passwords/tokens expostos | Exemplo limpo localmente. Troca de credenciais e publicação pendentes. |
| 2 | C01 | Impedir acesso a membros pela coincidência de email; contas só por convite | Implementado localmente, com testes. Registo público recusado pela API e página informativa. |
| 3 | C02 | Revogar sessões após desativação, eliminação, mudança de perfil/password | Implementado localmente. Estado, perfil e versão da sessão verificados em cada pedido. |
| 4 | C03 | Retirar simulação MBWay apresentada como pagamento real | Implementado localmente. Página informa indisponibilidade; API não cria pedidos simulados. |
| 5 | C04/C07 | Preservar associação à conta; proteger entrada e batismo | Implementado localmente. Associação escolhida pelo administrador; edição de Secretaria preserva ligação. Dados oficiais são de leitura na Minha Área. |
| 6 | C05 | Corrigir reimpressão de documentos e rastreabilidade da emissão | Implementado localmente, com testes: dados/data originais; emissão só após gravação; validação partilhada e histórico disponível ao Pastor. |
| 7 | C06 | Corrigir indicador de conversão e acesso a relatórios de Tesouraria | Indicador e métricas corrigidos localmente. Por pedido do utilizador, a área independente foi removida; relatórios mantidos apenas em Secretaria. Acesso anual de Tesouraria continua pendente de solução dentro da própria Tesouraria. |
| 8 | C08/C16 | Proteger fotografias, definir retenção e alinhar privacidade | Parcial local: leitura autenticada, uploads privados e transferência preparados; criação/configuração do Blob privado, publicação e transferência das 4 fotografias existentes pendentes. Retenção, descodificação/remoção de metadados e textos de privacidade ainda pendentes. |
| 9 | C09 | Guardar autoria e histórico das operações financeiras | Implementado localmente: autoria, snapshots antes/depois, motivos obrigatórios para alterações/eliminações e gravação transacional; consulta das últimas 200 operações. |
| 10 | C10 | Tornar recuperação/convites robustos e atómicos | Parcial: redefinição de password transacional, consumo condicional do token, revogação de sessões e escape HTML dos nomes. Hash dos tokens e atomicidade/reenvio de convites ainda pendentes. |
| 11 | C11/C12 | Limites partilhados e validação consistente da API | Pendente; validação específica da associação de contas já reforçada. |
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
