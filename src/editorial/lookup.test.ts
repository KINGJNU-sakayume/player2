import { describe, expect, it } from 'vitest';
import { getAlbumEditorial, getArtistEditorial, getSongEditorial } from './lookup';

describe('editorial lookup', () => {
  it('finds seeded artist and album notes', () => {
    expect(getArtistEditorial('vaundy')?.key).toBe('vaundy');
    expect(getAlbumEditorial('Vaundy', 'strobo', 2020)?.key).toBe('strobo');
  });

  it('omits filler for songs without a local note', () => {
    expect(getSongEditorial('Vaundy', 'strobo', 'Audio 001', 2020)).toBeUndefined();
  });
});
