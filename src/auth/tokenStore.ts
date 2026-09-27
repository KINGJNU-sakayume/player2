export type StoredToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

const TOKEN_KEY = 'arc.spotify.token.v1';
const VERIFIER_KEY = 'arc.spotify.pkce.verifier';
const STATE_KEY = 'arc.spotify.pkce.state';

export const tokenStore = {
  read(): StoredToken | null {
    try {
      const value = localStorage.getItem(TOKEN_KEY);
      return value ? (JSON.parse(value) as StoredToken) : null;
    } catch {
      return null;
    }
  },
  write(token: StoredToken) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
  setVerifier(value: string) {
    sessionStorage.setItem(VERIFIER_KEY, value);
  },
  getVerifier() {
    return sessionStorage.getItem(VERIFIER_KEY);
  },
  clearVerifier() {
    sessionStorage.removeItem(VERIFIER_KEY);
  },
  setState(value: string) {
    sessionStorage.setItem(STATE_KEY, value);
  },
  getState() {
    return sessionStorage.getItem(STATE_KEY);
  },
  clearState() {
    sessionStorage.removeItem(STATE_KEY);
  },
};
