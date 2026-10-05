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
| próprio módulo. A pasta "uploads" é criada apenas no desenvolvimento
| local. Na Vercel, as fotografias são guardadas no Blob.
|
*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
if (!process.env.VERCEL) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
if (process.env.VERCEL) app.set("trust proxy", 1);

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

app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "A fotografia não pode exceder 2 MB." });
  if (err.message === "Apenas imagens são permitidas.") return res.status(400).json({ message: err.message });
  console.error("[ERRO NÃO TRATADO]", err);
  res.status(500).json({ message: "Erro interno do servidor." });
});


export default app;
