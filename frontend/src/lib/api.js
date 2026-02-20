import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUsername,
} from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000";

async function requisicao(caminho, opcoes = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(opcoes.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${caminho}`, {
    ...opcoes,
    headers,
  });

  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await atualizarToken();
    if (refreshed) {
      return requisicao(caminho, opcoes);
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Erro na requisicao");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fazerLogin(username, password, lastName = "") {
  const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Usuario ou senha invalidos");
  }

  const data = await response.json();
  saveTokens(data);
  try {
    const usuario = await requisicao("/api/usuarios/eu/");
    saveUsername(usuario.first_name || username, usuario.last_name || lastName);
  } catch {
    saveUsername(username, lastName);
  }
  return data;
}
export const login = fazerLogin;

export async function cadastrarUsuario({ first_name, username, last_name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/usuarios/cadastro/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name,
      username,
      last_name,
      email,
      password,
      preferred_currency: "BRL",
      timezone: "America/Sao_Paulo",
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.username?.[0] || data.email?.[0] || data.password?.[0] || "Falha ao cadastrar";
    throw new Error(message);
  }

  return response.json();
}
export const register = cadastrarUsuario;

export async function atualizarToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await response.json();
  saveTokens({ access: data.access, refresh });
  return true;
}

export function logout() {
  clearTokens();
}

export const sair = logout;

export function buscarVisaoFinancas() {
  return requisicao("/api/financas/");
}

export function buscarContas() {
  return requisicao("/api/financas/contas/");
}

export function criarConta(payload) {
  return requisicao("/api/financas/contas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarConta(id, payload) {
  return requisicao(`/api/financas/contas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function excluirConta(id) {
  return requisicao(`/api/financas/contas/${id}/`, {
    method: "DELETE",
  });
}

export function buscarCartoes() {
  return requisicao("/api/financas/cartoes/");
}

export function criarCartao(payload) {
  return requisicao("/api/financas/cartoes/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarCartao(id, payload) {
  return requisicao(`/api/financas/cartoes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function excluirCartao(id) {
  return requisicao(`/api/financas/cartoes/${id}/`, {
    method: "DELETE",
  });
}

export function buscarCategorias() {
  return requisicao("/api/financas/categorias/");
}

export function criarCategoria(payload) {
  return requisicao("/api/financas/categorias/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarCategoria(id, payload) {
  return requisicao(`/api/financas/categorias/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function excluirCategoria(id) {
  return requisicao(`/api/financas/categorias/${id}/`, {
    method: "DELETE",
  });
}

export function buscarTransacoes() {
  return requisicao("/api/financas/transacoes/");
}

export function criarTransacao(payload) {
  return requisicao("/api/financas/transacoes/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
