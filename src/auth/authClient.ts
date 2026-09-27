import { createCodeChallenge, createCodeVerifier } from './pkce';
import { tokenStore, type StoredToken } from './tokenStore';
import { SPOTIFY_SCOPES } from '../spotify/scopes';

const ACCOUNTS_URL = 'https://accounts.spotify.com';

export const getRedirectUri = () => `${window.location.origin}${import.meta.env.BASE_URL}`;

export const beginSpotifyAuthorization = async (clientId: string) => {
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const state = createCodeVerifier(32);
  tokenStore.setVerifier(verifier);
  tokenStore.setState(state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  });

  window.location.assign(`${ACCOUNTS_URL}/authorize?${params.toString()}`);
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

const persistToken = (response: TokenResponse, fallbackRefreshToken?: string): StoredToken => {
  const token = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? fallbackRefreshToken,
    expiresAt: Date.now() + response.expires_in * 1000,
  };
  tokenStore.write(token);
  return token;
};

export const exchangeAuthorizationCode = async (clientId: string, code: string) => {
  const verifier = tokenStore.getVerifier();
  if (!verifier) throw new Error('PKCE verifier is missing. Start Spotify authorization again.');

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  });

  const response = await fetch(`${ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`Spotify token exchange failed (${response.status}).`);
  tokenStore.clearVerifier();
  tokenStore.clearState();
  return persistToken((await response.json()) as TokenResponse);
};

export const refreshAccessToken = async (clientId: string, refreshToken: string) => {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const response = await fetch(`${ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`Spotify token refresh failed (${response.status}).`);
  return persistToken((await response.json()) as TokenResponse, refreshToken);
};
