import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request(path, options);
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

export async function login(username, password) {
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
  return data;
}

export async function refreshToken() {
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

export function fetchFinanceOverview() {
  return request("/api/finance/");
}

export function fetchAccounts() {
  return request("/api/finance/accounts/");
}
