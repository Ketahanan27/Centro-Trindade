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
app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});