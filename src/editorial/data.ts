import type { EditorialEntry } from './types';

/**
 * ARC notes are intentionally opt-in.
 *
 * Add a note here only when you have deliberately written it in GitHub.
 * Prefer a stable Spotify ID in `spotifyId`. The optional `match` object is
 * only a migration fallback for older hand-written notes.
 *
 * Example:
 * {
 *   key: 'my-artist-note',
 *   spotifyId: 'SPOTIFY_ARTIST_ID',
 *   short: '짧은 노트',
 *   full: '긴 노트',
 * }
 */
export const artistEditorial: EditorialEntry[] = [];

export const albumEditorial: EditorialEntry[] = [];

export const songEditorial: EditorialEntry[] = [];
