import { describe, expect, it } from 'vitest';
import { FrontmatterError, fileKey, parseFrontmatter } from './frontmatter';
import { loadAlbumNotes } from './loadNotes';

describe('parseFrontmatter', () => {
  it('reads scalars, numbers, quoted strings and lists', () => {
    const { data, body } = parseFrontmatter(
      [
        '---',
        '# a comment',
        'artist: kenshi-yonezu',
        'origin: Tokyo, Japan · singer / songwriter',
        'releaseYear: 2020',
        'titles: [感電, "Tyler, The Creator", \'It\'\'s\', Prospekt\'s March]',
        'quoted: "a \\"b\\""',
        'sources:',
        '  - https://example.com/interview',
        '  - "Liner notes, 2020"',
        'short: >',
        '  first line',
        '  second line',
        '---',
        '',
        'Body paragraph.',
        '',
        '## Heading',
      ].join('\n'),
    );
    expect(data).toEqual({
      artist: 'kenshi-yonezu',
      origin: 'Tokyo, Japan · singer / songwriter',
      releaseYear: 2020,
      titles: ['感電', 'Tyler, The Creator', "It's", "Prospekt's March"],
      quoted: 'a "b"',
      sources: ['https://example.com/interview', 'Liner notes, 2020'],
      short: 'first line second line',
    });
    expect(body).toBe('Body paragraph.\n\n## Heading');
  });

  it('accepts Windows line endings and an empty body', () => {
    expect(parseFrontmatter('---\r\nshort: x\r\n---\r\n')).toEqual({ data: { short: 'x' }, body: '' });
  });

  it.each([
    ['no opening fence', 'short: x\n---\n'],
    ['no closing fence', '---\nshort: x\n'],
    ['a line that is not a key', '---\nshort x\n---\n'],
    ['a duplicate key', '---\nshort: x\nshort: y\n---\n'],
    ['an unclosed quote in a list', '---\ntitles: ["a, b]\n---\n'],
    ['a block list item without a dash', '---\nsources:\n  https://example.com\n---\n'],
  ])('rejects %s', (_label, source) => {
    expect(() => parseFrontmatter(source)).toThrow(FrontmatterError);
  });
});

describe('note loading', () => {
  it('uses the file name as the key and the body as the full note', () => {
    const [note] = loadAlbumNotes({
      './notes/albums/test-album.md':
        '---\nartist: test\ntitles: [Test]\nreleaseYear: 2001\nwritten: 2026-10-02\nsources: [https://example.com]\nshort: Preview.\n---\n\nFull.\n',
    });
    expect(note).toEqual({
      key: 'test-album',
      artist: 'test',
      albumIds: [],
      titles: ['Test'],
      releaseYear: 2001,
      short: 'Preview.',
      full: 'Full.',
      written: '2026-10-02',
      updated: undefined,
      sources: ['https://example.com'],
    });
    expect(fileKey('./notes/songs/kick-back.md')).toBe('kick-back');
  });

  it('names the file when a required field is missing or a date is malformed', () => {
    expect(() => loadAlbumNotes({ './notes/albums/broken.md': '---\nartist: test\nshort: x\n---\n' })).toThrow(/broken\.md.*titles/);
    expect(() =>
      loadAlbumNotes({ './notes/albums/dated.md': '---\nartist: test\ntitles: [T]\nwritten: 2 Oct 2026\nshort: x\n---\n' }),
    ).toThrow(/dated\.md.*YYYY-MM-DD/);
  });
});
