const BASE = import.meta.env.VITE_API_URL ?? "";

const ROTAS_PUBLICAS = [
  "/api/auth/login",
  "/api/auth/recuperar",
  "/api/auth/redefinir",
  "/api/contacto",
];

const ehRotaPublica = (path) =>
  ROTAS_PUBLICAS.some((pub) => path.startsWith(pub));

export const apiFetch = (path, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE}${path}`, { ...options, headers }).then((res) => {
    if (res.status === 401 && token && !ehRotaPublica(path)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login?sessao=expirada");
      throw new Error("Sessão expirada. Por favor inicie sessão novamente.");
    }
    return res;
  });
};

export const apiFetchArray = async (path, options = {}) => {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erro HTTP ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};
