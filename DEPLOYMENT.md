# Publicar na Vercel

O mesmo projeto serve React/Vite e a API Express (`/api`). A API é executada
em Frankfurt (`fra1`), próxima da base Neon. O build da Vercel define
`VITE_API_URL` como vazio, para usar a mesma origem e evitar URLs localhost.

1. Enviar as alterações do projeto para o GitHub, sem `.env`, SQL ou uploads.
2. Na Vercel, importar o repositório. Framework: Vite; diretório raiz: raiz
   do repositório. O `vercel.json` define build, saída e rotas.
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
