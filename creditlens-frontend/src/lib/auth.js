const TOKEN_KEY = "credlens_token";
const AUTH_CHANGE_EVENT = "credlens-auth-change";

export function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAccessToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export { AUTH_CHANGE_EVENT };
