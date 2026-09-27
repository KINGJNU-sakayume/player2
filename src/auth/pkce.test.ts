import { describe, expect, it } from 'vitest';
import { createCodeChallenge, createCodeVerifier } from './pkce';

describe('PKCE', () => {
  it('creates RFC 7636-compatible random verifiers', () => {
    const first = createCodeVerifier(); const second = createCodeVerifier();
    expect(first).toHaveLength(64); expect(first).toMatch(/^[A-Za-z0-9._~-]+$/); expect(first).not.toBe(second);
  });
  it('creates the known S256 challenge', async () => {
    expect(await createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });
});
