# Publicar na Vercel

O mesmo projeto serve React/Vite e a API Express (`/api`). A API é executada
em Frankfurt (`fra1`), próxima da base Neon. O build da Vercel define
`VITE_API_URL` como vazio, para usar a mesma origem e evitar URLs localhost.

1. Enviar as alterações do projeto para o GitHub, sem `.env`, SQL ou uploads.
2. Na Vercel, importar o repositório. Framework: Vite; diretório raiz: raiz
   do repositório. O `vercel.json` define build, saída e rotas.

Antes de publicar as correções de acesso, executar `npm run db:prepare`.
A preparação adiciona `session_version` e um índice que impede associar a
mesma conta a vários membros; não apaga dados. Se existirem associações
duplicadas, o índice recusa a criação: corrigir essas associações explicitamente.
As sessões emitidas pela versão antiga deixam de ser aceites após a publicação.
Novas contas são criadas por convite em Utilizadores. Em Membros, o administrador
associa explicitamente a conta à pessoa cuja identidade confirmou; o email por
si só nunca concede acesso a um perfil. Secretaria pode editar os dados sem
alterar essa associação. Entrada e batismo são geridos pela equipa autorizada.

Pagamentos online estão desativados até existir uma integração real.
O `.env.example` contém apenas exemplos. Credenciais anteriormente versionadas
devem ser substituídas no Neon/Gmail e atualizadas no `.env` local e na Vercel;
retirá-las da versão atual não as elimina do histórico Git.
3. Configurar as variáveis de ambiente de Production:

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | Ligação Neon com pooling e TLS |
| `JWT_SECRET` | Segredo longo e aleatório, apenas no backend |
| `FRONTEND_URL` | URL HTTPS final do site, sem barra final |
| `EMAIL_USER` | Conta de email utilizada pela aplicação |
| `EMAIL_PASS` | Palavra-passe de aplicação para essa conta |
| `EMAIL_DESTINO` | Destinatário dos formulários |

Não definir `VITE_API_URL` com localhost. Não configurar previews para usar
a base de produção; usar uma branch Neon separada caso se queiram previews.

4. Em Storage, criar Vercel Blob **Public** na mesma região e ligar ao
   projeto. A ligação disponibiliza `BLOB_READ_WRITE_TOKEN`. As fotografias
   mantêm o acesso por URL que já tinham nos uploads locais e passam a ter
   nomes aleatórios. O token fica apenas no backend.
5. Copiar o token Blob para o `.env` local e executar:

   ```bash
   npm run photos:migrate
   npm run photos:migrate -- --apply
   ```

   O primeiro comando verifica as fotografias existentes. O segundo copia
   apenas as fotografias referenciadas pelos membros e atualiza as URLs
   no Neon. Preserva os ficheiros locais. Reexecutar não duplica as já migradas.

6. Publicar/republicar depois de configurar as variáveis e o Blob. Confirmar
   login, membros, dashboard, formulários e upload de fotografia até 2 MB.
   Abrir também uma rota interna diretamente para testar o fallback da SPA.

O limitador atual de pedidos mantém contadores em memória por instância;
os limites não são globais entre instâncias da Vercel.

## Desenvolvimento local

`npm run server` inicia a API local; `npm run dev` inicia o frontend.
Sem token Blob, as novas fotografias continuam em `backend/uploads`.
Com token Blob, o desenvolvimento passa também a usar armazenamento online.

## Fotografias privadas dos membros

O código atualizado exige um Blob privado para novos uploads em produção. Criar um novo armazenamento Blob com acesso Private na Vercel. Guardar o token desse armazenamento em BLOB_PRIVATE_READ_WRITE_TOKEN no .env local e nas variáveis do projeto Vercel. O token é exclusivo do backend; nunca usar prefixo VITE_ nem guardar no Git.

Manter BLOB_READ_WRITE_TOKEN do Blob público durante a transferência: permite ler e eliminar as fotografias antigas. Publicar primeiro o código atualizado, com as duas variáveis configuradas, e confirmar login e leitura de uma fotografia existente. A API aceita temporariamente fontes públicas antigas, mas não devolve os URLs de armazenamento ao frontend; o acesso pela nova rota exige sessão e associação pessoal ou perfil Administrador, Secretaria ou Pastor.

Executar npm run photos:protect para verificar todas as fontes sem alterar dados. A verificação desta etapa encontrou 4 fotografias disponíveis. Depois da configuração e publicação, executar npm run photos:protect -- --apply para transferir para o Blob privado, atualizar cada ligação condicionalmente e eliminar a cópia antiga após a atualização. A transferência é retomável; mantém os movimentos e restantes dados. Em caso de falha de comunicação ambígua, conservar os ficheiros e confirmar a ligação antes de limpar. Rever mensagens de eliminação pendente; não considerar todas as cópias públicas removidas se houver falhas. URLs que tenham sido públicos podem continuar em caches externas; a eliminação da origem não apaga cópias já descarregadas.

Novas substituições e eliminações de membros tentam remover a fotografia anterior; falhas de limpeza são registadas no servidor e requerem reconciliação. Ainda não existe uma fila automática de repetição/limpeza de órfãos, política formal de retenção nem normalização/descodificação completa de imagens. Não apagar ficheiros em massa nem reescrever o histórico Git sem rever as fotografias referenciadas.

Validar após a publicação: pedido sem sessão para /api/membros/ID/foto responde 401; membro não associado não obtém a imagem; sessão autorizada obtém imagem com Cache-Control private, no-store; URL privado direto não abre anonimamente; verificar Minha Área, detalhes de Membros, upload, substituição e eliminação em registos de teste próprios. O Blob privado ainda não foi testado nesta etapa com um armazenamento real.

## Tokens protegidos e convites

Antes de publicar este bloco, executar npm run db:prepare em cada base de ambiente para adicionar convite_pendente, com false por omissão nas contas existentes. Depois de a nova versão estar ativa, executar imediatamente npm run tokens:protect: converte tokens antigos para sha256: seguido do hash, preservando os valores dos links enviados e a sua expiração. Entre deploy e conversão, links antigos ainda não convertidos não são aceites. O comando é idempotente e não imprime tokens. Não executar a conversão enquanto a versão antiga ainda estiver a servir redefinições.

Contas novas guardam convite_pendente=true. Conta e token são criados na mesma transação; o email é enviado depois do commit. Falha do email preserva a conta e revoga apenas o link dessa tentativa. Em Utilizadores → Detalhes, Reenviar convite gera um novo link de 48 horas sem criar outra conta; contas inativas devem ser ativadas primeiro. Contas já configuradas usam Enviar Reset. Configurar password consome o link atomicamente, termina a pendência e revoga sessões. Tokens guardados como hashes não são aceites diretamente no endpoint de redefinição.

Não foi implementada uma fila SMTP com entrega automática: em falhas, o administrador repete o envio manualmente. A resposta pública de recuperação é genérica, incluindo falhas de SMTP, sem confirmar se a conta existe. Não foram enviados convites nem alteradas passwords reais durante os testes isolados.

## Validação de Membros e Utilizadores

Executar db:prepare antes de publicar para criar utilizadores_email_normalizado_unico em lower(trim(email)). O índice impede duplicados mesmo em pedidos concorrentes, sem reescrever emails existentes. Se houver contas duplicadas, a criação falha e exige revisão manual; não juntar ou eliminar automaticamente. Na base configurada não existiam duplicados e o índice foi criado com sucesso.

Membros e Utilizadores passam a validar tipos, tamanhos reais das colunas, estados/perfis e IDs de 1 a 2147483647. Datas são verificadas como calendário real; contactos opcionais vazios ficam nulos. Emails novos são guardados sem espaços exteriores e em minúsculas; login e recuperação aceitam variantes dos emails antigos. Não existe restrição de email único entre membros, porque email não é prova de identidade nem substitui a associação explícita à conta.

Verificações: nove testes de validação, 19 de segurança e oito de convites; build e lint direcionado passaram. Não foram atualizados contactos, nomes, estados ou passwords reais. As restantes áreas ainda precisam da aplicação das mesmas regras.


## Reconciliação de fotografias privadas

`npm run photos:reconcile` analisa o Blob privado configurado e a base configurada, sem eliminar ficheiros. O resultado imprime apenas contagens, sem URLs nem tokens. Confirmar que DATABASE_URL e BLOB_PRIVATE_READ_WRITE_TOKEN pertencem ao mesmo ambiente antes de executar.

`npm run photos:reconcile -- --apply` elimina até 100 ficheiros elegíveis por execução. Só considera nomes gerados pela aplicação sob membros/, no armazenamento privado, com pelo menos 24 horas e sem referência em membros.foto. Termina o inventário antes da limpeza e consulta novamente a base antes de cada remoção. Falhas de base/listagem interrompem a execução; falhas individuais de remoção são contadas e podem ser tentadas novamente numa execução posterior.

A aplicação gera um URL novo por upload; não reutilizar URLs antigos em operações manuais de associação ou migração durante a limpeza. A reconciliação não constitui uma transação entre PostgreSQL e Blob. Ficheiros locais, o Blob público anterior e objetos com nomes desconhecidos exigem revisão própria.

O comando ainda não tem execução agendada: nenhuma eliminação automática recorrente foi ativada. A análise de 6 de outubro de 2026 encontrou quatro objetos, todos referenciados, sem candidatos; nenhum foi eliminado. Retenção de fotografias de membros ativos/inativos e backups continua a exigir uma política própria.
