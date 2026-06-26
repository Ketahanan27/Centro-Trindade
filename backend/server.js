import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";

import authRoutes          from "./routes/authRoutes.js";
import membroRoutes        from "./routes/membroRoutes.js";
import agendaRoutes        from "./routes/agendaRoutes.js";
import visitantesRoutes    from "./routes/visitantesRoutes.js";
import apresentacoesRoutes from "./routes/apresentacoesRoutes.js";
import documentosRoutes    from "./routes/documentosRoutes.js";

dotenv.config();

const app = express();

// CORRIGIDO: era app.use(cors()) sem qualquer configuração —
// aceitava pedidos de QUALQUER origem, incluindo sites maliciosos.
// Configurado para permitir apenas a origem do frontend.
app.use(cors({
  origin:         process.env.FRONTEND_URL || "http://localhost:5173",
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials:    true,
}));

app.use(express.json());

// Rotas
app.use("/api/auth",          authRoutes);
app.use("/api/membros",       membroRoutes);
app.use("/api/eventos",       agendaRoutes);
app.use("/api/visitantes",    visitantesRoutes);
app.use("/api/apresentacoes", apresentacoesRoutes);
app.use("/api/documentos",    documentosRoutes);

app.get("/", (_req, res) => {
  res.send("Backend ERP ativo");
});

// ADICIONADO: handler global de erros — sem isto, erros assíncronos não
// tratados crashavam o processo Express silenciosamente
app.use((err, _req, res, _next) => {
  console.error("[ERRO NÃO TRATADO]", err);
  res.status(500).json({ message: "Erro interno do servidor." });
});

// ADICIONADO: handler para rotas não encontradas
app.use((_req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});