import rateLimit from "express-rate-limit";
import { PostgresRateLimitStore } from './postgresRateLimitStore.js';

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
  store: new PostgresRateLimitStore('auth'),
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas tentativas. Tente novamente mais tarde." },
});

/* Formulário de contacto público: evita spam/flood de emails. */
export const contactoLimiter = rateLimit({
  store: new PostgresRateLimitStore('contacto'),
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos de contacto. Tente novamente mais tarde." },
});

/* Endpoint público de doações: recebe/expõe dados financeiros e pessoais sem autenticação. */
export const donateLimiter = rateLimit({
  store: new PostgresRateLimitStore('donate'),
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente mais tarde." },
});

/* Rotas GET públicas sem autenticação (ex.: agenda pública): trava scraping/flood. */
export const publicReadLimiter = rateLimit({
  store: new PostgresRateLimitStore('public-read'),
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente mais tarde." },
});

/* Rotas de escrita autenticadas (POST/PUT/DELETE) fora do módulo de autenticação. */
export const writeLimiter = rateLimit({
  store: new PostgresRateLimitStore('write'),
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente mais tarde." },
});
