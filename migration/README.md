# Migração MySQL → PostgreSQL

A aplicação usa agora `DATABASE_URL` no `.env` para ligar ao PostgreSQL.
As variáveis `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` servem apenas
os scripts antigos de manutenção MySQL (`tabela_atas.js` e
`link_membros_utilizadores.js`). Não executar esses scripts para gerir o Neon.

## Comandos

- `npm run db:prepare`: acrescenta a coluna de último acesso, caso falte.
- `npm run test:postgres`: valida as consultas e testa os controllers numa
  transação que é revertida, sem guardar registos de teste. As sequências de
  IDs avançam durante os testes, comportamento normal do PostgreSQL.
- `node backend/scripts/migrate_mysql_dump_to_postgres.js`: converte o backup
  MySQL em `migration/erp-centro-trindade.postgresql.sql`.
- Acrescentar `--import` apenas para uma base nova: o script recusa importar
  quando já existem tabelas no schema `public`.

O SQL contém dados pessoais e hashes de palavras-passe. Está ignorado pelo Git.
A base MySQL e os seus dados não são modificados por estes comandos PostgreSQL.

## Publicação

O frontend React/Vite usa `npm run build`, pasta de saída `dist` e
`VITE_API_URL` com o endereço público do backend. A API Express requer
`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` e as configurações de email.
O projeto já inclui a entrada Express serverless e o armazenamento Vercel Blob.
Consultar [publicação na Vercel](../DEPLOYMENT.md) para configurar as variáveis
e transferir as fotografias locais. A migração da base não publica a aplicação.
