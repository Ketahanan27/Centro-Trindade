import jwt from "jsonwebtoken";

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
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = decoded;
    next();
  } catch {
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
