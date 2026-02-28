const ACCESS_KEY = "vimo_access_token";
const REFRESH_KEY = "vimo_refresh_token";
const FIRST_USERNAME_KEY = "vimo_first_username";
const LAST_USERNAME_KEY = "vimo_last_username";
const JWT_EXP_SKEW_SECONDS = 30;

function tokenValido(valor) {
  if (typeof valor !== "string") return false;
  const limpo = valor.trim();
  if (!limpo) return false;
  if (limpo === "undefined" || limpo === "null") return false;
  return true;
}

function decodeJwtPayload(token) {
  if (!tokenValido(token)) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;

  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function tokenExpirado(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const agora = Math.floor(Date.now() / 1000);
  return payload.exp <= agora + JWT_EXP_SKEW_SECONDS;
}

export function getAccessToken() {
  const token = localStorage.getItem(ACCESS_KEY);
  return tokenValido(token) ? token : null;
}

export function getRefreshToken() {
  const token = localStorage.getItem(REFRESH_KEY);
  return tokenValido(token) ? token : null;
}

export function saveTokens(tokens) {
  const access = typeof tokens?.access === "string" ? tokens.access : "";
  const refresh = typeof tokens?.refresh === "string" ? tokens.refresh : "";

  if (tokenValido(access)) {
    localStorage.setItem(ACCESS_KEY, access);
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }

  if (tokenValido(refresh)) {
    localStorage.setItem(REFRESH_KEY, refresh);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function saveUsername(firstUsername, lastUsername = "") {
  localStorage.setItem(FIRST_USERNAME_KEY, firstUsername || "");
  if (lastUsername) {
    localStorage.setItem(LAST_USERNAME_KEY, lastUsername);
  } else {
    localStorage.removeItem(LAST_USERNAME_KEY);
  }
}

export function getFirstUsername() {
  return localStorage.getItem(FIRST_USERNAME_KEY);
}

export function getLastUsername() {
  return localStorage.getItem(LAST_USERNAME_KEY);
}

export function getUsername() {
  const first = getFirstUsername() || "";
  const last = getLastUsername() || "";
  return `${first} ${last}`.trim();
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(FIRST_USERNAME_KEY);
  localStorage.removeItem(LAST_USERNAME_KEY);
}

export function isAuthenticated() {
  const refresh = getRefreshToken();
  return Boolean(refresh && !tokenExpirado(refresh));
}

export function isAccessTokenExpired() {
  const access = getAccessToken();
  if (!access) return true;
  return tokenExpirado(access);
}
