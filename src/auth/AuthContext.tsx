import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { beginSpotifyAuthorization, exchangeAuthorizationCode, refreshAccessToken } from './authClient';
import { tokenStore, type StoredToken } from './tokenStore';

export type AuthStatus = 'unconfigured' | 'signed-out' | 'connecting' | 'connected' | 'error';

type AuthContextValue = {
  status: AuthStatus;
  hasClientId: boolean;
  error?: string;
  connect: () => Promise<void>;
  signOut: () => void;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() ?? '';
  const [token, setToken] = useState<StoredToken | null>(() => tokenStore.read());
  const [status, setStatus] = useState<AuthStatus>(() => (clientId ? (tokenStore.read() ? 'connected' : 'signed-out') : 'unconfigured'));
  const [error, setError] = useState<string>();
  const refreshPromise = useRef<Promise<StoredToken> | null>(null);

  useEffect(() => {
    if (!clientId) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const returnedState = params.get('state');
    const authError = params.get('error');
    const cleanCallbackUrl = () => window.history.replaceState({}, '', `${window.location.origin}${window.location.pathname}#/now-playing`);
    if (authError) {
      setError(`Spotify authorization failed: ${authError}`);
      setStatus('error');
      cleanCallbackUrl();
      return;
    }
    if (!code) return;
    if (!returnedState || returnedState !== tokenStore.getState()) {
      setError('Spotify authorization state did not match. Please reconnect.');
      setStatus('error');
      tokenStore.clearVerifier();
      tokenStore.clearState();
      cleanCallbackUrl();
      return;
    }

    let cancelled = false;
    setStatus('connecting');
    exchangeAuthorizationCode(clientId, code)
      .then((nextToken) => {
        if (cancelled) return;
        setToken(nextToken);
        setStatus('connected');
        cleanCallbackUrl();
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : 'Spotify authorization failed.');
        setStatus('error');
        cleanCallbackUrl();
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const getAccessToken = useCallback(async () => {
    if (!clientId) return null;
    const current = tokenStore.read() ?? token;
    if (!current) return null;
    if (current.expiresAt - Date.now() > 60_000) return current.accessToken;
    if (!current.refreshToken) {
      tokenStore.clear();
      setToken(null);
      setStatus('signed-out');
      return null;
    }
    if (!refreshPromise.current) {
      refreshPromise.current = refreshAccessToken(clientId, current.refreshToken).finally(() => {
        refreshPromise.current = null;
      });
    }
    try {
      const refreshed = await refreshPromise.current;
      setToken(refreshed);
      setStatus('connected');
      return refreshed.accessToken;
    } catch (cause) {
      tokenStore.clear();
      setToken(null);
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Spotify token refresh failed.');
      return null;
    }
  }, [clientId, token]);

  const connect = useCallback(async () => {
    if (!clientId) return;
    setError(undefined);
    setStatus('connecting');
    await beginSpotifyAuthorization(clientId);
  }, [clientId]);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setError(undefined);
    setStatus(clientId ? 'signed-out' : 'unconfigured');
  }, [clientId]);

  const value = useMemo(() => ({ status, hasClientId: Boolean(clientId), error, connect, signOut, getAccessToken }), [status, clientId, error, connect, signOut, getAccessToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
};
