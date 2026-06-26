// src/utils/api.js
// Wrapper de fetch que injeta automaticamente o token JWT em todos os pedidos
// ao backend. Evita repetir a lógica de autenticação em cada componente.

const BASE_URL = "http://localhost:5000";

/**
 * Equivalente a fetch(), mas com:
 * - Header Authorization: Bearer <token> automático
 * - Content-Type: application/json automático em pedidos com body
 * - Retorna a Response — a gestão de erros fica no componente
 */
export const apiFetch = (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    // Adicionar Content-Type apenas quando há body (POST, PUT)
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    // Adicionar token se existir
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Permitir override de headers por parte do chamador
    ...(options.headers || {}),
  };

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

/**
 * Helper para GET — devolve o JSON já parsed ou lança erro
 * Garante que o resultado é um array quando se espera uma lista
 */
export const apiFetchArray = async (endpoint) => {
  const response = await apiFetch(endpoint);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};