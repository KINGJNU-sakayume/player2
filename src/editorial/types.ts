/**
 * ARC's hand-written notes. They are local, source-controlled data and stay
 * separate from Spotify models: pages look a note up and render it only when
 * one exists — no note is ever generated for an arbitrary Spotify entity.
 * Each note is one Markdown file in `src/editorial/notes/` (see loadNotes.ts).
 *
 * - Artist → Editorial Note
 * - Album  → Editorial Note
 * - Song   → Listening Note
 */

export interface EditorialBody {
  /** Preview shown on the page: about 2–3 lines (a song cue is usually shorter). */
  short: string;
  /**
   * Long form for the note drawer, in the small Markdown subset NoteBody
   * renders: paragraphs, `##` / `###` headings, lists, quotes, emphasis, links.
   */
  full?: string;
  /** ISO dates (YYYY-MM-DD) the note was written and last revised. */
  written?: string;
  updated?: string;
  /** References the note relies on: interviews, liner notes, credits (URLs or citations). */
  sources?: string[];
}

export interface ArtistNote extends EditorialBody {
  key: string;
  /** Spotify artist IDs (open.spotify.com/artist/<ID>): the primary match. */
  artistIds: string[];
  /**
   * Every name Spotify may show for the artist. Spotify localises names by
   * account and market (e.g. "Kenshi Yonezu" / "米津玄師"), so the fallback
   * match accepts any of them.
   */
  names: string[];
  /** Origin / role line under the artist name, e.g. "Tokyo, Japan · singer / songwriter". */
  origin?: string;
}

export interface AlbumNote extends EditorialBody {
  key: string;
  /** Key of the artist's entry in artists.ts; its names drive the fallback match. */
  artist: string;
  /** Spotify album IDs. One release often has several (editions, markets). */
  albumIds: string[];
  /** Titles as Spotify may show them, including localised or romanised forms. */
  titles: string[];
  releaseYear?: number;
}

export interface SongNote extends EditorialBody {
  key: string;
  artist: string;
  /** Spotify track IDs: the album cut, the single, and other editions. */
  trackIds: string[];
  titles: string[];
}

export type NoteKind = 'ARTIST' | 'ALBUM' | 'SONG';
