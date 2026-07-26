import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import membroRoutes from "./routes/membroRoutes.js";
import agendaRoutes from "./routes/agendaRoutes.js";
import visitantesRoutes from "./routes/visitantesRoutes.js";
import apresentacoesRoutes from "./routes/apresentacoesRoutes.js";
import documentosRoutes from "./routes/documentosRoutes.js";
import tesourariaRoutes from "./routes/tesourariaRoutes.js";
import contactoRoutes from "./routes/contactoRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import relatoriosRoutes from "./routes/relatoriosRoutes.js";
import donateRoutes from "./routes/donateRoutes.js";
import atasRoutes from "./routes/atasRoutes.js";

/*
|--------------------------------------------------------------------------
| Preparação do diretório de uploads
|--------------------------------------------------------------------------
|
| __dirname não existe em ESM, por isso é reconstruído a partir do URL do
| próprio módulo. A pasta "uploads" é criada no arranque caso ainda não
| exista, para que o multer (usado nas rotas de membros) tenha sempre um
| destino válido.
|
*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

/*
|--------------------------------------------------------------------------
| Segurança e CORS
|--------------------------------------------------------------------------
|
| O Helmet corre com as proteções por omissão, incluindo
| Cross-Origin-Resource-Policy: "same-origin". Esse valor só é relaxado
| para "cross-origin" na rota /uploads, mais abaixo — as respostas JSON da
| API continuam protegidas contra XS-Leaks vindos de outras origens.
|
*/
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

/*
|--------------------------------------------------------------------------
| Ficheiros estáticos de upload
|--------------------------------------------------------------------------
|
| O frontend, servido pelo Vite noutra origem/porta, carrega imagens
| diretamente de /uploads. Só esta rota precisa do CORP relaxado para
| "cross-origin"; o resto da API mantém a política por omissão do Helmet.
|
*/
app.use(
  "/uploads",
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
  express.static(uploadDir)
);

app.use(express.json());

app.get("/", (_req, res) => res.send("Backend ERP ativo"));

/*
|--------------------------------------------------------------------------
| Registo dos módulos da API
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);
app.use("/api/membros", membroRoutes);
app.use("/api/eventos", agendaRoutes);
app.use("/api/visitantes", visitantesRoutes);
app.use("/api/apresentacoes", apresentacoesRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/tesouraria", tesourariaRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/donate", donateRoutes);
app.use("/api/atas", atasRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

app.use((err, req, res, next) => {
  console.error("[ERRO NÃO TRATADO]", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Erro interno do servidor." });
});

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
