const TOKEN_KEY = 'approvalflow_token';
const USER_KEY = 'approvalflow_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function setStoredUser(userJson: string): void {
  localStorage.setItem(USER_KEY, userJson);
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function clearSession(): void {
  clearToken();
  clearStoredUser();
}
