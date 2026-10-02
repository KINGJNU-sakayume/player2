import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { readConfig } from '../app/config';
import { createAppServices } from '../app/services';
import { findActiveLineIndex } from '../lyrics/lyricSync';
import { PREVIEW_LYRICS, PREVIEW_START } from '../preview/previewData';

const LEMON_ID = '04TshWXkhV1qkqHzf31Hn6';

// The preview plays original test lines, so the fixture is keyed by their hashes.
const lines = PREVIEW_LYRICS[LEMON_ID]!.lines;
const current = lines[findActiveLineIndex(lines, PREVIEW_START.positionMs)]!.text;

vi.mock('./curated/index', async (importOriginal) => {
  // vi.mock is hoisted above the imports, so the factory loads what it needs itself.
  const original = await importOriginal<typeof import('./curated/index')>();
  const { parseCuratedTranslation } = await import('./curated/parse');
  const { lyricLineHash } = await import('./curated/lineHash');
  const { PREVIEW_LYRICS: lyrics, PREVIEW_START: start } = await import('../preview/previewData');
  const { findActiveLineIndex: activeIndex } = await import('../lyrics/lyricSync');
  const lemon = lyrics['04TshWXkhV1qkqHzf31Hn6']!.lines;
  const startText = lemon[activeIndex(lemon, start.positionMs)]!.text;
  const fixture = parseCuratedTranslation('lemon', 'fixture.json', {
    trackIds: ['04TshWXkhV1qkqHzf31Hn6'],
    titles: ['Lemon'],
    artistNames: ['Kenshi Yonezu'],
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    brief: {
      speaker: '떠난 사람을 떠올리는 화자',
      addressee: '떠난 사람',
      register: 'haeche',
      pronouns: [{ source: 'you', target: '너' }],
      reasoning: '곁에 없는 사람에게 혼잣말처럼 말을 거는 곡이라 **해체**로 통일한다.',
      sources: ['https://example.com/interview'],
    },
    lines: { [lyricLineHash(startText)!]: '큐레이션 번역 줄' },
    written: '2026-10-02',
  });
  return {
    ...original,
    getCuratedTranslation: (query: Parameters<typeof original.getCuratedTranslation>[0]) =>
      original.getCuratedTranslation(query, [fixture]),
  };
});

describe('curated lyric translation on Now Playing', () => {
  it('shows the curated line, its speech level and the translation note', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?preview#/now-playing');
    const services = createAppServices(readConfig({ BASE_URL: '/', VITE_ENABLE_PREVIEW: 'true' }, 'http://localhost:3000'));
    render(<App services={services} />);

    expect(await screen.findByText('큐레이션 번역 줄')).toBeInTheDocument();
    expect(screen.getByText(/Curated ·/)).toHaveTextContent('Curated · 반말 · 해체');

    await user.click(screen.getByRole('button', { name: 'Translation note →' }));
    const dialog = screen.getByRole('dialog', { name: 'Lemon' });
    expect(within(dialog).getByText('Translation note / Song')).toBeInTheDocument();
    expect(within(dialog).getByText(/떠난 사람을 떠올리는 화자/)).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '어체 · 반말 · 해체' })).toBeInTheDocument();
    expect(within(dialog).getByText('해체').tagName).toBe('STRONG');
    // The line table pairs the runtime lyrics with the translation.
    const pairs = within(dialog).getAllByRole('listitem').filter((item) => item.textContent?.includes(current));
    expect(pairs[0]).toHaveTextContent('큐레이션 번역 줄');
    expect(within(dialog).getByText(/lines curated/)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'example.com/interview' })).toHaveAttribute('href', 'https://example.com/interview');
  });
});
