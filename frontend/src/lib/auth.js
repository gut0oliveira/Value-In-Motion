const ACCESS_KEY = "vimo_access_token";
const REFRESH_KEY = "vimo_refresh_token";
const FIRST_USERNAME_KEY = "vimo_first_username";
const LAST_USERNAME_KEY = "vimo_last_username";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(tokens) {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
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
  return Boolean(getAccessToken());
}
