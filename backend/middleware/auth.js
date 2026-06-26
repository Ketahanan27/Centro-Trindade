// CORRIGIDO: este ficheiro estava COMPLETAMENTE VAZIO.
// Sem este middleware nenhuma rota da API tinha autenticação —
// qualquer pessoa podia fazer POST/PUT/DELETE sem token.

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers["authorization"];

  // Formato esperado: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Acesso negado. Token não fornecido."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, perfil }
    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado."
    });
  }

};