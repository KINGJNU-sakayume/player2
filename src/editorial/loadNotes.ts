import { FieldReader, fileKey, FrontmatterError, parseFrontmatter } from './frontmatter';
import type { AlbumNote, ArtistNote, EditorialBody, SongNote } from './types';

/**
 * Turns the Markdown note files into typed notes. The file name is the key
 * (`notes/albums/stray-sheep.md` → `stray-sheep`); the frontmatter holds the
 * match fields and the `short` preview; the body is the long-form note.
 *
 * A malformed file throws with its path, so `npm run test:run` catches it.
 */

/** `{ path: raw file text }`, as `import.meta.glob(…, { query: '?raw', eager: true })` returns. */
export type NoteFiles = Record<string, string>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function body(fields: FieldReader, full: string, file: string): EditorialBody {
  const written = fields.optionalString('written');
  const updated = fields.optionalString('updated');
  for (const date of [written, updated]) {
    if (date !== undefined && !ISO_DATE.test(date)) throw new FrontmatterError(`${file}: dates must be YYYY-MM-DD, got "${date}".`);
  }
  return {
    short: fields.string('short'),
    full: full || undefined,
    written,
    updated,
    sources: fields.optionalList('sources'),
  };
}

function load<T>(files: NoteFiles, build: (key: string, fields: FieldReader, full: string, file: string) => T): T[] {
  return Object.keys(files)
    .sort()
    .map((file) => {
      const { data, body: full } = parseFrontmatter(files[file]!);
      return build(fileKey(file), new FieldReader(data, file), full, file);
    });
}

export function loadArtistNotes(files: NoteFiles): ArtistNote[] {
  return load(files, (key, fields, full, file) => ({
    key,
    artistIds: fields.list('artistIds'),
    names: fields.list('names'),
    origin: fields.optionalString('origin'),
    ...body(fields, full, file),
  }));
}

export function loadAlbumNotes(files: NoteFiles): AlbumNote[] {
  return load(files, (key, fields, full, file) => ({
    key,
    artist: fields.string('artist'),
    albumIds: fields.optionalList('albumIds') ?? [],
    titles: fields.list('titles'),
    releaseYear: fields.optionalNumber('releaseYear'),
    ...body(fields, full, file),
  })).sort((a, b) => a.artist.localeCompare(b.artist) || (a.releaseYear ?? 0) - (b.releaseYear ?? 0) || a.key.localeCompare(b.key));
}

export function loadSongNotes(files: NoteFiles): SongNote[] {
  return load(files, (key, fields, full, file) => ({
    key,
    artist: fields.string('artist'),
    trackIds: fields.optionalList('trackIds') ?? [],
    titles: fields.list('titles'),
    ...body(fields, full, file),
  }));
}
