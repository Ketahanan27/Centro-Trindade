import rateLimit from "express-rate-limit";

/*
|--------------------------------------------------------------------------
| Limitadores de pedidos por rota
|--------------------------------------------------------------------------
|
| Cada limitador é dimensionado ao risco específico do endpoint que
| protege, em vez de se usar um único limite genérico para toda a API.
|
*/

/* Login, registo e recuperação de password: alvo típico de força bruta e enumeração de contas. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas tentativas. Tente novamente mais tarde." },
});

/* Formulário de contacto público: evita spam/flood de emails. */
export const contactoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos de contacto. Tente novamente mais tarde." },
});

/* Endpoint público de doações: recebe/expõe dados financeiros e pessoais sem autenticação. */
export const donateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente mais tarde." },
});

/* Rotas GET públicas sem autenticação (ex.: agenda pública): trava scraping/flood. */
export const publicReadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente mais tarde." },
});

/* Rotas de escrita autenticadas (POST/PUT/DELETE) fora do módulo de autenticação. */
export const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente mais tarde." },
});
