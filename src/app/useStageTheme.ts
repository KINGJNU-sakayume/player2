import { useEffect, useMemo, type CSSProperties } from 'react';
import { pickImageUrl } from '../lib/images';
import { NEUTRAL_BASE } from '../palette/mapPaletteToTokens';
import { mapPaletteToStageTheme, type StageTone } from '../palette/stageTheme';
import { useAlbumPalette } from '../palette/usePalette';
import { usePlayerSelector } from '../playback/hooks';

export interface StageVars {
  tone: StageTone;
  /** The album-coloured surface, for `theme-color`. */
  background: string;
  /** `--s-*` custom properties; the phone's Now Playing, mini player and lyrics read them. */
  style: CSSProperties;
}

/** player1's stage tokens under the names the phone stylesheet reads. */
const STAGE_NAMES = {
  '--bg': '--s-bg',
  '--paper': '--s-paper',
  '--surface': '--s-surface',
  '--surface-strong': '--s-surface-strong',
  '--ink': '--s-ink',
  '--ink-2': '--s-ink-2',
  '--muted': '--s-muted',
  '--subtle': '--s-dim',
  '--line': '--s-line',
  '--line-2': '--s-line-soft',
  '--active': '--s-main',
  '--active-text': '--s-main-text',
  '--cover-shadow': '--s-shadow',
  '--stage-glow': '--s-glow',
} as const;

/**
 * The playing album's colour as a whole surface (player1's stage theme). Null
 * until the cover has been read, or when it cannot be; the phone stylesheet
 * then keeps its neutral stage.
 */
export function useStageTheme(): StageVars | null {
  const track = usePlayerSelector((state) => state.snapshot.track);
  const albumId = track?.album.id || null;
  // A 64 px image is plenty for a 48 px sample and keeps extraction cheap.
  const imageUrl = track ? pickImageUrl(track.album.images, 64) : null;
  const palette = useAlbumPalette(albumId, imageUrl);

  return useMemo(() => {
    const theme = mapPaletteToStageTheme(palette);
    if (!theme) return null;
    const style: Record<string, string> = {};
    for (const [from, to] of Object.entries(STAGE_NAMES)) style[to] = theme.tokens[from as keyof typeof STAGE_NAMES];
    return { tone: theme.tone, background: theme.tokens['--bg'], style: style as CSSProperties };
  }, [palette]);
}

/** Keeps the browser chrome (status bar, Safari toolbar) the colour of the surface behind it. */
export function useThemeColor(color: string | null): void {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const previous = meta.content;
    meta.content = color ?? NEUTRAL_BASE.bg;
    return () => {
      meta.content = previous;
    };
  }, [color]);
}
