const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

export const createCodeVerifier = (length = 64) => {
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  return Array.from(random, (value) => alphabet[value % alphabet.length]).join('');
};

const base64UrlEncode = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export const createCodeChallenge = async (verifier: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
};
