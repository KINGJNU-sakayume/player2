import type { AlbumNote, ArtistNote, NoteKind, SongNote } from './types';

/**
 * The quality floor for hand-written notes (see .claude/skills/write-note).
 * The loaders only check that a note is well-formed; this checks that it is
 * written to the standard the skill asks for, so a thin note fails
 * `npm run check` instead of shipping. `npm run notes:audit` prints the same
 * audit as a table while writing.
 *
 * Lengths are characters of the trimmed text, spaces included.
 */
export const FLOOR = {
  artistBody: 1200,
  albumBody: 1800,
  songBody: 600,
  songParagraphs: 3,
  translationAbout: 150,
  sources: 2,
} as const;

/** Phrases the skill rules out: hearsay instead of a judgement, and promotional clichés. */
export const BANNED_PHRASES: readonly { pattern: RegExp; reason: string }[] = [
  { pattern: /평이 (있|나왔|많)/, reason: 'hearsay ("~라는 평이 있다"): judge it with evidence or leave it out' },
  { pattern: /전해진다|라고 한다/, reason: 'hearsay ("전해진다", "라고 한다"): state the checked fact or leave it out' },
  { pattern: /명반|전설적|귀를 사로잡|역대급|완성도 높/, reason: 'promotional cliché: say what is good and how' },
];

const SECONDARY_SOURCE = /wikipedia\.org|open\.spotify\.com/;

export type AuditKind = Lowercase<NoteKind>;

export interface NoteAudit {
  /** `artists/<key>`, `albums/<key>` or `songs/<key>`, as in PENDING_REVIEW. */
  id: string;
  kind: AuditKind;
  key: string;
  artist: string;
  bodyLength: number;
  paragraphs: number;
  shortLength: number;
  sources: number;
  /** Length of the `## 번역에 대하여` section; null when the song has no translation. */
  translationAbout: number | null;
  problems: string[];
}

/** Blocks of the body that are prose, not headings. */
export function countParagraphs(text: string | undefined): number {
  if (!text) return 0;
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block && !block.startsWith('#')).length;
}

function commonProblems(texts: (string | undefined)[], sources: string[] | undefined): string[] {
  const problems: string[] = [];
  const list = sources ?? [];
  if (list.length < FLOOR.sources) problems.push(`needs at least ${FLOOR.sources} sources (has ${list.length})`);
  if (list.length > 0 && list.every((source) => SECONDARY_SOURCE.test(source))) {
    problems.push('needs a source beyond Wikipedia and Spotify (interview, official site, liner notes, review)');
  }
  const text = texts.filter(Boolean).join('\n');
  for (const { pattern, reason } of BANNED_PHRASES) {
    const match = pattern.exec(text);
    if (match) problems.push(`"${match[0]}": ${reason}`);
  }
  return problems;
}

function bodyLength(text: string | undefined): number {
  return text?.trim().length ?? 0;
}

export function auditArtist(note: ArtistNote): NoteAudit {
  const problems = commonProblems([note.short, note.full], note.sources);
  const length = bodyLength(note.full);
  if (length < FLOOR.artistBody) problems.push(`body is ${length} characters; an artist note needs ${FLOOR.artistBody}+`);
  if (!note.eras?.length) problems.push('needs "eras" for the discography timeline');
  return {
    id: `artists/${note.key}`,
    kind: 'artist',
    key: note.key,
    artist: note.key,
    bodyLength: length,
    paragraphs: countParagraphs(note.full),
    shortLength: note.short.length,
    sources: note.sources?.length ?? 0,
    translationAbout: null,
    problems,
  };
}

export function auditAlbum(note: AlbumNote, songs: readonly SongNote[]): NoteAudit {
  const problems = commonProblems([note.short, note.full], note.sources);
  const length = bodyLength(note.full);
  if (length < FLOOR.albumBody) problems.push(`body is ${length} characters; an album review needs ${FLOOR.albumBody}+`);
  if (!note.tracks?.length) {
    problems.push('needs "tracks": the song note keys of the tracklist, in order');
  } else {
    const byKey = new Map(songs.map((song) => [song.key, song]));
    const seen = new Set<string>();
    for (const track of note.tracks) {
      if (seen.has(track)) problems.push(`track "${track}" is listed twice`);
      seen.add(track);
      const song = byKey.get(track);
      if (!song) problems.push(`track "${track}" has no song note (notes/songs/${track}.md)`);
      else if (song.artist !== note.artist) problems.push(`track "${track}" is a song note of "${song.artist}", not "${note.artist}"`);
    }
  }
  return {
    id: `albums/${note.key}`,
    kind: 'album',
    key: note.key,
    artist: note.artist,
    bodyLength: length,
    paragraphs: countParagraphs(note.full),
    shortLength: note.short.length,
    sources: note.sources?.length ?? 0,
    translationAbout: null,
    problems,
  };
}

export function auditSong(note: SongNote): NoteAudit {
  const about = note.translation?.about;
  const problems = commonProblems([note.short, note.full, about], note.sources);
  const length = bodyLength(note.full);
  const paragraphs = countParagraphs(note.full);
  if (!note.short) problems.push('needs a "short" listening cue');
  if (length < FLOOR.songBody) problems.push(`listening note is ${length} characters; a song note needs ${FLOOR.songBody}+`);
  if (paragraphs < FLOOR.songParagraphs) problems.push(`listening note has ${paragraphs} paragraphs; a song note needs ${FLOOR.songParagraphs}+`);
  if (!note.translation && !note.lyricsLanguage) {
    problems.push('needs a curated translation (translate-lyrics), or "lyricsLanguage: ko | instrumental" when none is needed');
  }
  if (about !== undefined && about.length < FLOOR.translationAbout) {
    problems.push(`"번역에 대하여" is ${about.length} characters; it needs ${FLOOR.translationAbout}+`);
  }
  return {
    id: `songs/${note.key}`,
    kind: 'song',
    key: note.key,
    artist: note.artist,
    bodyLength: length,
    paragraphs,
    shortLength: note.short?.length ?? 0,
    sources: note.sources?.length ?? 0,
    translationAbout: about?.length ?? null,
    problems,
  };
}

export function auditNotes(artists: readonly ArtistNote[], albums: readonly AlbumNote[], songs: readonly SongNote[]): NoteAudit[] {
  return [...artists.map(auditArtist), ...albums.map((album) => auditAlbum(album, songs)), ...songs.map(auditSong)];
}

/**
 * Notes written before the quality floor and not yet rewritten to it. The
 * floor test skips them, and fails once one of them passes, so the list only
 * shrinks: rewrite a note, then remove its line here.
 */
export const PENDING_REVIEW: ReadonlySet<string> = new Set([
  // Coldplay
  'artists/coldplay',
  'albums/a-rush-of-blood',
  'albums/parachutes',
  'albums/viva-la-vida',
  'songs/the-scientist',
  'songs/viva-la-vida',
  'songs/yellow',
  // David Bowie: the song notes (3 paragraphs, about 350–480 characters) predate the 600-character floor.
  'songs/five-years',
  'songs/hang-on-to-yourself',
  'songs/it-aint-easy',
  'songs/lady-stardust',
  'songs/moonage-daydream',
  'songs/rock-n-roll-suicide',
  'songs/soul-love',
  'songs/star',
  'songs/starman',
  'songs/suffragette-city',
  'songs/ziggy-stardust',
  // Kenshi Yonezu
  'artists/kenshi-yonezu',
  'albums/lost-corner',
  'albums/stray-sheep',
  'songs/decollete',
  'songs/flamingo',
  'songs/himawari',
  'songs/kanaria',
  'songs/kanden',
  'songs/kanpanella',
  'songs/kick-back',
  'songs/lemon',
  'songs/machigai-sagashi',
  'songs/mayoeru-hitsuji',
  'songs/paprika',
  'songs/placebo',
  'songs/teenage-riot',
  'songs/uma-to-shika',
  'songs/umi-no-yuurei',
  'songs/yasashii-hito',
  // NMIXX
  'artists/nmixx',
  'albums/blue-valentine',
  'songs/adore-u',
  'songs/blue-valentine',
  'songs/crush-on-you',
  'songs/game-face',
  'songs/o-o-part-1-baila',
  'songs/o-o-part-2-superhero',
  'songs/phoenix',
  'songs/podium',
  'songs/reality-hurts',
  'songs/rico',
  'songs/shape-of-love',
  'songs/spinnin-on-it',
  // The Weeknd
  'artists/the-weeknd',
  'albums/starboy',
  'songs/starboy',
  'songs/party-monster',
  'songs/false-alarm',
  'songs/reminder',
  'songs/rockin',
  'songs/secrets',
  'songs/true-colors',
  'songs/stargirl-interlude',
  'songs/sidewalks',
  'songs/six-feet-under',
  'songs/love-to-lay',
  'songs/a-lonely-night',
  'songs/attention',
  'songs/ordinary-life',
  'songs/nothing-without-you',
  'songs/all-i-know',
  'songs/die-for-you',
  'songs/i-feel-it-coming',
  // tripleS
  'artists/triples',
  'albums/assemble',
  'albums/assemble24',
  'songs/beam',
  'songs/before-the-rise',
  'songs/chowall',
  'songs/colorful',
  'songs/girls-never-die',
  'songs/new-look',
  'songs/rising',
  'songs/the-baddest',
  // Tyler, The Creator
  'albums/igor',
  'songs/a-boy-is-a-gun',
  'songs/are-we-still-friends',
  'songs/earfquake',
  'songs/exactly-what-you-run-from-you-end-up-chasing',
  'songs/gone-gone-thank-you',
  'songs/i-dont-love-you-anymore',
  'songs/i-think',
  'songs/igors-theme',
  'songs/new-magic-wand',
  'songs/puppet',
  'songs/running-out-of-time',
  'songs/whats-good',
  // Vaundy
  'artists/vaundy',
  'albums/strobo',
  'songs/kaijuu-no-hanauta',
]);
