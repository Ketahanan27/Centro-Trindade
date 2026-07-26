import express from "express";
import cors    from "cors";
import helmet  from "helmet";
import fs      from "fs";
import path    from "path";
import { fileURLToPath } from "url";

import authRoutes          from "./routes/authRoutes.js";
import membroRoutes        from "./routes/membroRoutes.js";
import agendaRoutes        from "./routes/agendaRoutes.js";
import visitantesRoutes    from "./routes/visitantesRoutes.js";
import apresentacoesRoutes from "./routes/apresentacoesRoutes.js";
import documentosRoutes    from "./routes/documentosRoutes.js";
import tesourariaRoutes    from "./routes/tesourariaRoutes.js";
import contactoRoutes      from "./routes/contactoRoutes.js";
import dashboardRoutes     from "./routes/dashboardRoutes.js";
import relatoriosRoutes   from "./routes/relatoriosRoutes.js";
import donateRoutes       from "./routes/donateRoutes.js";
import atasRoutes         from "./routes/atasRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

// Helmet com as proteções por omissão (inclui Cross-Origin-Resource-Policy:
// "same-origin"). O relaxamento para "cross-origin" é aplicado apenas à
// rota /uploads abaixo, não à API inteira — assim as respostas JSON da API
// continuam protegidas contra XS-Leaks noutras origens.
app.use(helmet());

app.use(cors({
  origin:         process.env.FRONTEND_URL || "http://localhost:5173",
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials:    true,
}));

// O frontend (Vite, noutra origem/porta) carrega imagens diretamente de
// /uploads — só esta rota precisa do CORP relaxado para "cross-origin".
app.use(
  "/uploads",
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
  express.static(uploadDir)
);

app.use(express.json());

app.get("/", (_req, res) => res.send("Backend ERP ativo"));

app.use("/api/auth",          authRoutes);
app.use("/api/membros",       membroRoutes);
app.use("/api/eventos",       agendaRoutes);
app.use("/api/visitantes",    visitantesRoutes);
app.use("/api/apresentacoes", apresentacoesRoutes);
app.use("/api/documentos",    documentosRoutes);
app.use("/api/tesouraria",    tesourariaRoutes);
app.use("/api/contacto",      contactoRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/relatorios",    relatoriosRoutes);
app.use("/api/donate",        donateRoutes);
app.use("/api/atas",          atasRoutes);
app.use((req, res, next) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

app.use((err, req, res, next) => {
  console.error("[ERRO NÃO TRATADO]", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 5000;
// Vincula explicitamente a 127.0.0.1 (ajustável via HOST no .env) em vez de
// deixar o Node escolher a interface por omissão — evita ambiguidades
// IPv4/IPv6 que por vezes fazem "está a ouvir" e "inacessível" coexistirem.
const HOST = process.env.HOST || "127.0.0.1";

const httpServer = app.listen(PORT, HOST, () => {
  console.log(`Servidor ativo em http://${HOST}:${PORT}`);
});

// Sem este handler, uma falha ao abrir a porta (ex.: EADDRINUSE — porta já
// ocupada por outro processo, muitas vezes um processo anterior do nodemon
// que não terminou corretamente) não fica visível: o processo pode parecer
// "pendurado" enquanto nenhum socket TCP está realmente disponível.
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