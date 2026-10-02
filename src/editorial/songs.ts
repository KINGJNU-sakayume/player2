import { loadSongNotes } from './loadNotes';
import type { SongNote } from './types';

/**
 * Song Listening Notes — one Markdown file per song in `notes/songs/`.
 *
 * A listening note is a cue for what to listen for, not a review. `trackIds`
 * come from open.spotify.com/track/<ID>: list the album cut and the single,
 * since the same recording usually has several IDs. `titles` (with the
 * artist's names) is the fallback, so the note also follows the song onto
 * compilations and editions whose IDs are not listed.
 */
export const songNotes: readonly SongNote[] = loadSongNotes(
  import.meta.glob<string>('./notes/songs/*.md', { query: '?raw', import: 'default', eager: true }),
);
