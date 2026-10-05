import jwt from "jsonwebtoken";
import db from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Verificação do token JWT
|--------------------------------------------------------------------------
|
| O algoritmo aceite é fixado explicitamente em "HS256". Sem isto,
| jwt.verify aceitaria qualquer algoritmo declarado no próprio cabeçalho do
| token — incluindo "none" em bibliotecas mal configuradas, ou permitindo
| um ataque de confusão de algoritmo caso o segredo HS256 seja reaproveitado
| como chave pública RS256.
|
*/
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (!Number.isSafeInteger(decoded.id) || decoded.id <= 0 || !Number.isSafeInteger(decoded.session_version)) {
      return res.status(401).json({ message: "Sessão expirada. Inicie sessão novamente." });
    }
    const users = await db.query(
      "SELECT id, perfil, estado, session_version FROM utilizadores WHERE id = $1",
      [decoded.id]
    );
    const user = users[0];
    if (!user || user.estado !== "Ativo" || user.session_version !== decoded.session_version) {
      return res.status(401).json({ message: "Sessão expirada. Inicie sessão novamente." });
    }
    req.user = { id: user.id, perfil: user.perfil };
    return next();
  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError)) {
      console.error("[verifyToken]", error.code ?? "erro");
      return res.status(503).json({ message: "Não foi possível verificar a sessão. Tente novamente." });
    }
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

/*
|--------------------------------------------------------------------------
| Controlo de acesso por perfil (RBAC)
|--------------------------------------------------------------------------
*/
export const permit = (...roles) => (req, res, next) => {
  const perfil = req.user?.perfil;
  if (!perfil || !roles.includes(perfil)) {
    return res.status(403).json({ message: "Acesso negado. Perfil não autorizado." });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user?.perfil !== "Administrador") {
    return res.status(403).json({ message: "Acesso restrito a administradores." });
  }
  next();
};
