import { describe, expect, it } from 'vitest';
import { adoptLegacyStorage, storageKey } from './storageNamespace';

describe('storage namespace', () => {
  it('prefixes keys with this app’s name', () => {
    expect(storageKey('preferences.v1')).toBe('player2.preferences.v1');
  });

  it('copies shared settings from the old arc. keys', () => {
    window.localStorage.setItem('arc.preferences.v1', '{"translation":false}');
    window.localStorage.setItem('arc.spotify.session.v1', '{"accessToken":"other-app"}');
    adoptLegacyStorage(window.localStorage);
    expect(window.localStorage.getItem('player2.preferences.v1')).toBe('{"translation":false}');
    expect(window.localStorage.getItem('arc.preferences.v1')).toBe('{"translation":false}');
    expect(window.localStorage.getItem('player2.spotify.session.v1')).toBeNull();
  });

  it('never overwrites a value already saved under the new key', () => {
    window.localStorage.setItem('player2.player.volume.v1', '0.3');
    window.localStorage.setItem('arc.player.volume.v1', '0.9');
    adoptLegacyStorage(window.localStorage);
    expect(window.localStorage.getItem('player2.player.volume.v1')).toBe('0.3');
  });
});
