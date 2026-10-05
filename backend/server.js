import app from "./app.js";

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Arranque do servidor HTTP
|--------------------------------------------------------------------------
|
| O bind é feito explicitamente em 127.0.0.1 (ajustável via HOST no .env)
| em vez de deixar o Node escolher a interface por omissão, para evitar
| ambiguidades IPv4/IPv6 que por vezes fazem "está a ouvir" e "inacessível"
| coexistirem.
|
*/
const HOST = process.env.HOST || "127.0.0.1";

const httpServer = app.listen(PORT, HOST, () => {
  console.log(`Servidor ativo em http://${HOST}:${PORT}`);
});

/*
|--------------------------------------------------------------------------
| Tratamento de falhas ao abrir a porta
|--------------------------------------------------------------------------
|
| Sem este handler, um erro como EADDRINUSE (porta já ocupada, muitas vezes
| por uma instância anterior do nodemon que não terminou corretamente)
| passa despercebido: o processo parece "pendurado" sem nenhum socket TCP
| realmente disponível.
|
*/
httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[ERRO] A porta ${PORT} já está em uso por outro processo. ` +
      `Termine esse processo (ex.: noutra janela do terminal, ou noutra ` +
      `instância de "npm run server" ainda ativa) ou defina PORT=<outra porta> no .env.`
    );
  } else if (err.code === "EACCES") {
    console.error(`[ERRO] Sem permissão para usar a porta ${PORT}. Tente uma porta acima de 1024.`);
  } else {
    console.error("[ERRO] Falha ao iniciar o servidor:", err);
  }
  process.exit(1);
});
