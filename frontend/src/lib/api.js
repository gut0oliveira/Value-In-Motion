import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUsername,
} from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000";

let refreshing = false;

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

  // Lógica de Refresh Token para erro 401 (Token Expirado)
  if (response.status === 401 && getRefreshToken() && !refreshing) {
    refreshing = true;
    const refreshed = await atualizarToken();
    refreshing = false;

    if (refreshed) {
      return requisicao(caminho, opcoes);
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || data.error || "Erro na requisição");
  }

  if (response.status === 204) return null;
  return response.json();
}

// --- AUTENTICAÇÃO ---

export async function login(username, password, lastName = "") {
  // Ajustado para o padrão JWT comum no Django
  const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) throw new Error("Usuário ou senha inválidos");

  const data = await response.json();
  saveTokens(data);

  // Busca dados do perfil para salvar o nome amigável (referencia /eu/ do seu urls.py)
  try {
    const usuario = await requisicao("/api/usuarios/eu/");
    saveUsername(usuario.first_name || username, usuario.last_name || lastName);
  } catch {
    saveUsername(username, lastName);
  }

  return data;
}

export async function register(payload) {
  // CORREÇÃO: Alterado de "/registrar/" para "/cadastro/" para bater com seu urls.py
  return requisicao("/api/usuarios/cadastro/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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
  window.location.href = "/login";
}

// Aliases
export const fazerLogin = login;
export const sair = logout;

// --- MÓDULOS FINANCEIROS ---

// Cartões e Parcelamentos
export const buscarCartoes = () => requisicao("/api/financas/cartoes/");
export const criarCartao = (p) => requisicao("/api/financas/cartoes/", { method: "POST", body: JSON.stringify(p) });
export const atualizarCartao = (id, p) => requisicao(`/api/financas/cartoes/${id}/`, { method: "PATCH", body: JSON.stringify(p) });
export const excluirCartao = (id) => requisicao(`/api/financas/cartoes/${id}/`, { method: "DELETE" });

// --- PARCELAMENTOS (Ajustado para bater com seu urls.py) ---
export const buscarParcelamentosCartao = () => 
  requisicao("/api/financas/parcelamentos/"); // Antes era parcelamentos-cartao/

export const criarParcelamentoCartao = (p) => 
  requisicao("/api/financas/parcelamentos/", { method: "POST", body: JSON.stringify(p) });

export const atualizarParcelamentoCartao = (id, p) => 
  requisicao(`/api/financas/parcelamentos/${id}/`, { method: "PATCH", body: JSON.stringify(p) });

export const excluirParcelamentoCartao = (id) => 
  requisicao(`/api/financas/parcelamentos/${id}/`, { method: "DELETE" });

// Contas
export const buscarContas = () => requisicao("/api/financas/contas/");
export const criarConta = (p) => requisicao("/api/financas/contas/", { method: "POST", body: JSON.stringify(p) });
export const atualizarConta = (id, p) => requisicao(`/api/financas/contas/${id}/`, { method: "PATCH", body: JSON.stringify(p) });
export const excluirConta = (id) => requisicao(`/api/financas/contas/${id}/`, { method: "DELETE" });

// Categorias
export const buscarCategorias = () => requisicao("/api/financas/categorias/");
export const criarCategoria = (p) => requisicao("/api/financas/categorias/", { method: "POST", body: JSON.stringify(p) });
export const atualizarCategoria = (id, p) => requisicao(`/api/financas/categorias/${id}/`, { method: "PATCH", body: JSON.stringify(p) });
export const excluirCategoria = (id) => requisicao(`/api/financas/categorias/${id}/`, { method: "DELETE" });

// Transações
export const buscarTransacoes = () => requisicao("/api/financas/transacoes/");
export const criarTransacao = (p) => requisicao("/api/financas/transacoes/", { method: "POST", body: JSON.stringify(p) });
export const atualizarTransacao = (id, p) => requisicao(`/api/financas/transacoes/${id}/`, { method: "PATCH", body: JSON.stringify(p) });
export const excluirTransacao = (id) => requisicao(`/api/financas/transacoes/${id}/`, { method: "DELETE" });

// Visão Geral / Dashboard
export const buscarVisaoFinancas = () => requisicao("/api/financas/");