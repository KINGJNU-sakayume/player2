import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { readConfig } from './app/config';
import { createAppServices } from './app/services';
import { getArtistNote, getSongNote } from './editorial/lookup';
import { findActiveLineIndex } from './lyrics/lyricSync';
import { TEST_TRANSLATIONS_KO } from './lyrics/providers/testLines';
import { PREVIEW_LYRICS, PREVIEW_START } from './preview/previewData';

function renderApp(search: string, hash = '') {
  window.history.replaceState({}, '', `/${search}${hash}`);
  const services = createAppServices(readConfig({ BASE_URL: '/', VITE_ENABLE_PREVIEW: 'true' }, 'http://localhost:3000'));
  return render(<App services={services} />);
}

/** The test line the preview is on when it starts (Lemon, 57 s in). */
function startLine() {
  const lines = PREVIEW_LYRICS['04TshWXkhV1qkqHzf31Hn6']!.lines;
  return lines[findActiveLineIndex(lines, PREVIEW_START.positionMs)]!.text;
}

beforeEach(() => {
  window.location.hash = '';
});

describe('ARC Music (preview archive)', () => {
  it('offers setup guidance and the preview when Spotify is not configured', async () => {
    const user = userEvent.setup();
    renderApp('');
    expect(await screen.findByRole('heading', { name: 'Spotify isn’t configured' })).toBeInTheDocument();
    expect(screen.getByText('http://localhost:3000/')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preview without Spotify' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Lemon' })).toBeInTheDocument();
  });

  it('renders the v7 Now Playing with synced lyrics, translation, Listening Note and working transport', async () => {
    const user = userEvent.setup();
    renderApp('?preview', '#/now-playing');

    expect(await screen.findByRole('heading', { level: 1, name: 'Lemon' })).toBeInTheDocument();
    expect(await screen.findByText('08 / 15')).toBeInTheDocument();
    const line = startLine();
    expect(await screen.findByText(line)).toBeInTheDocument();
    expect(await screen.findByText(TEST_TRANSLATIONS_KO[line]!)).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Next lines' })).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Listening note')).toBeInTheDocument();
    const lemonCue = getSongNote({ id: '04TshWXkhV1qkqHzf31Hn6' })!.short!;
    expect(screen.getByText(lemonCue)).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /Translation/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    await waitFor(() => expect(screen.queryByText(TEST_TRANSLATIONS_KO[line]!)).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next track' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'まちがいさがし' })).toBeInTheDocument();
    expect(screen.queryByText(lemonCue)).not.toBeInTheDocument();
    const nextCue = getSongNote({ title: 'まちがいさがし', artistNames: ['米津玄師'] })!.short!;
    expect(screen.getByText(nextCue)).toBeInTheDocument();
    expect(screen.getByText('Listening note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read full note →' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Seek' })).toHaveAttribute('aria-valuemax', '302');
  });

  it('opens the shared note drawer, closes it on Escape and returns focus', async () => {
    const user = userEvent.setup();
    renderApp('?preview', '#/artist/1snhtMLeb2DYoMOcVbb8iB');

    expect(await screen.findByRole('heading', { level: 1, name: 'Kenshi Yonezu' })).toBeInTheDocument();
    expect(screen.getByText('Tokushima, Japan · singer-songwriter / producer / illustrator')).toBeInTheDocument();
    const more = screen.getByRole('button', { name: 'Read full note →' });
    await user.click(more);
    const dialog = screen.getByRole('dialog', { name: 'Kenshi Yonezu' });
    expect(within(dialog).getByText('Editorial note / Artist')).toBeInTheDocument();
    const introduction = getArtistNote({ id: '1snhtMLeb2DYoMOcVbb8iB' })!.full!.split('\n\n')[0]!;
    expect(within(dialog).getByText(introduction)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close note' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(more).toHaveFocus());
    expect(screen.queryByRole('dialog', { name: 'Kenshi Yonezu' })).not.toBeInTheDocument();
  });

  it.each([
    ['tripleS', '5Z71xE9prhpHrqL5thVMyK', /조합을 전제로 움직이는 스물네 명/],
    ['Coldplay', '4gzpq5DPGxSnKTe4SA8HAU', /크게 따라 부를 수 있는 후렴/],
  ])('shows the %s Editorial Note on the Artist page', async (name, id, text) => {
    renderApp('?preview', `#/artist/${id}`);
    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(await screen.findAllByText(/· Editorial note/)).not.toHaveLength(0);
  });

  it('marks noted tracks in an album sequence and shows the album note', async () => {
    renderApp('?preview', '#/album/0RHX9XECH8IVI3LNgWDpmQ');
    expect(await screen.findByRole('heading', { level: 1, name: 'A Rush of Blood to the Head' })).toBeInTheDocument();
    expect(screen.getByText(/데뷔작의 조용함 위에/)).toBeInTheDocument();
    const scientist = screen.getByRole('button', { name: /The Scientist/ });
    expect(within(scientist).getByText('Note')).toBeInTheDocument();
    expect(within(screen.getByRole('button', { name: /Politik/ })).getByText('Note')).toBeInTheDocument();
  });

  it('lists the library with liked songs and artists first', async () => {
    renderApp('?preview', '#/library');
    expect(await screen.findByRole('heading', { level: 1, name: 'Library' })).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Liked songs', 'Artists', 'Liked albums', 'Playlists', 'Recently played']);
    expect(await screen.findAllByRole('link', { name: 'Kenshi Yonezu' })).not.toHaveLength(0);
  });
});
