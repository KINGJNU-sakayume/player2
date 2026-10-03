import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { readConfig } from '../app/config';
import { createAppServices } from '../app/services';
import { findActiveLineIndex } from '../lyrics/lyricSync';
import { PREVIEW_LYRICS, PREVIEW_START } from '../preview/previewData';

const LEMON_ID = '04TshWXkhV1qkqHzf31Hn6';

// The preview plays original test lines, never real lyrics. The fixture note's segment is timed on the
// line the preview starts on; the preview lyrics get a timing so the segment applies to them.
const lines = PREVIEW_LYRICS[LEMON_ID]!.lines;
const startIndex = findActiveLineIndex(lines, PREVIEW_START.positionMs);
const current = lines[startIndex]!;

const fixture = vi.hoisted(() => ({ notes: [] as import('../editorial/types').SongNote[] }));

vi.mock('../preview/previewData', async (importOriginal) => {
  const original = await importOriginal<typeof import('../preview/previewData')>();
  const lemon = original.PREVIEW_LYRICS['04TshWXkhV1qkqHzf31Hn6']!;
  return {
    ...original,
    PREVIEW_LYRICS: { ...original.PREVIEW_LYRICS, '04TshWXkhV1qkqHzf31Hn6': { ...lemon, timing: { lrclibId: 9, durationMs: 256_000 } } },
  };
});

vi.mock('../editorial/songs', async (importOriginal) => {
  const original = await importOriginal<typeof import('../editorial/songs')>();
  // Lookup reads this array; each test fills it with its own notes.
  return { ...original, songNotes: fixture.notes };
});

const BLOCK = [
  'translation:',
  '  sourceLanguage: en',
  '  targetLanguage: ko',
  '  register: haeche',
  '  speaker: 떠난 사람을 떠올리는 화자',
  '  addressee: 떠난 사람',
  '  pronouns:',
  '    - source: you',
  '      target: 너',
  '  written: 2026-10-02',
];

async function setFixtureNote({ listening }: { listening: boolean }) {
  const { loadSongNotes } = await import('../editorial/loadNotes');
  const markdown = [
    '---',
    'artist: kenshi-yonezu',
    `trackIds: [${LEMON_ID}]`,
    'titles: [Lemon]',
    ...(listening ? ['short: 감상 큐 문장.'] : []),
    'sources: [https://example.com/interview]',
    ...BLOCK,
    '---',
    '',
    ...(listening ? ['감상 본문 문단.', ''] : []),
    '## 번역에 대하여',
    '',
    '곁에 없는 사람에게 혼잣말처럼 말을 거는 곡이라 **해체**로 통일한다.',
  ].join('\n');
  const timeline = {
    schemaVersion: 2,
    timing: { lrclibId: 9, durationMs: 256_000 },
    segments: [{ startMs: current.startMs, endMs: current.endMs ?? lines[startIndex + 1]!.startMs, translation: '큐레이션 번역 문장' }],
  };
  fixture.notes.splice(0, fixture.notes.length, ...loadSongNotes({ 'lemon.md': markdown }, { 'lemon.translation.json': timeline }));
}

function renderNowPlaying() {
  window.history.replaceState({}, '', '/?preview#/now-playing');
  const services = createAppServices(readConfig({ BASE_URL: '/', VITE_ENABLE_PREVIEW: 'true' }, 'http://localhost:3000'));
  render(<App services={services} />);
}

describe('curated lyric translation on Now Playing', () => {
  beforeEach(() => {
    fixture.notes.splice(0, fixture.notes.length);
  });

  it('shows the segment under its line, the speech level, and one song note with 번역에 대하여', async () => {
    await setFixtureNote({ listening: true });
    const user = userEvent.setup();
    renderNowPlaying();

    expect(await screen.findByText('큐레이션 번역 문장')).toBeInTheDocument();
    expect(screen.getByText(/Curated ·/)).toHaveTextContent('Curated · 반말 · 해체');
    // The listening cue stays on the page.
    expect(screen.getByText('감상 큐 문장.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Translation note →' }));
    const dialog = screen.getByRole('dialog', { name: 'Lemon' });
    expect(within(dialog).getByText('Listening note / Song')).toBeInTheDocument();
    // Listening body first, then the translation section.
    const body = within(dialog).getByText('감상 본문 문단.');
    const section = within(dialog).getByRole('heading', { name: '번역에 대하여' });
    expect(body.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(dialog).getByText('떠난 사람을 떠올리는 화자 → 떠난 사람')).toBeInTheDocument();
    expect(within(dialog).getByText('반말 · 해체')).toBeInTheDocument();
    expect(within(dialog).getByRole('table', { name: '호칭' })).toHaveTextContent('you너');
    expect(within(dialog).getByText('해체').tagName).toBe('STRONG');
    expect(within(dialog).getByRole('link', { name: 'example.com/interview' })).toHaveAttribute('href', 'https://example.com/interview');
    // No line-by-line pairs: the lyrics never appear in the note.
    expect(dialog).not.toHaveTextContent(current.text);
    expect(dialog).not.toHaveTextContent('큐레이션 번역 문장');
  });

  it('applies the Translation On / Off toggle to the curated translation too', async () => {
    await setFixtureNote({ listening: true });
    const user = userEvent.setup();
    renderNowPlaying();

    expect(await screen.findByText('큐레이션 번역 문장')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Translation (On|Off)/ }));
    await waitFor(() => expect(screen.queryByText('큐레이션 번역 문장')).not.toBeInTheDocument());
    expect(screen.queryByText(/Curated ·/)).not.toBeInTheDocument();
    // Preferences live for the session: switch it back on for the other tests.
    await user.click(screen.getByRole('button', { name: /Translation (On|Off)/ }));
    expect(await screen.findByText('큐레이션 번역 문장')).toBeInTheDocument();
  });

  it('shows only a link to the translation note for a song with no listening note', async () => {
    await setFixtureNote({ listening: false });
    const user = userEvent.setup();
    renderNowPlaying();

    expect(await screen.findByText('큐레이션 번역 문장')).toBeInTheDocument();
    const notes = screen.getAllByRole('button', { name: 'Translation note →' });
    // One in the lyrics header, one where the listening cue would be.
    expect(notes).toHaveLength(2);
    expect(screen.queryByText('Listening note')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Read full note →' })).not.toBeInTheDocument();

    await user.click(notes[1]!);
    const dialog = screen.getByRole('dialog', { name: 'Lemon' });
    expect(within(dialog).getByText('Translation note / Song')).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '번역에 대하여' })).toBeInTheDocument();
  });
});
