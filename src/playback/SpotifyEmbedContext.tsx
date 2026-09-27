import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type PlaybackState = {
  playingUri?: string;
  positionMs: number;
  durationMs: number;
  paused: boolean;
  buffering: boolean;
};

type SpotifyEmbedContextValue = PlaybackState & {
  ready: boolean;
  error?: string;
  loadTrack: (uri: string, autoplay?: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (positionMs: number) => void;
};

type EmbedEvent = { data: { playingURI?: string; position?: number; duration?: number; isPaused?: boolean; isBuffering?: boolean } };
type EmbedController = {
  loadEntity: (uri: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (event: 'ready' | 'playback_started' | 'playback_update', callback: (event: EmbedEvent) => void) => void;
};
type SpotifyIframeApi = {
  createController: (element: HTMLElement, options: { width: string; height: string; uri: string }, callback: (controller: EmbedController) => void) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

const SpotifyEmbedContext = createContext<SpotifyEmbedContextValue | null>(null);
const FALLBACK_URI = 'spotify:track:11dFghVXANMlKmJXsNCbNl';

export const SpotifyEmbedProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EmbedController | null>(null);
  const pendingUriRef = useRef<string>();
  const pendingAutoplayRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const [state, setState] = useState<PlaybackState>({ positionMs: 0, durationMs: 0, paused: true, buffering: false });

  useEffect(() => {
    let disposed = false;
    const setup = (api: SpotifyIframeApi) => {
      if (disposed || !mountRef.current || controllerRef.current) return;
      api.createController(
        mountRef.current,
        { width: '100%', height: '152', uri: pendingUriRef.current ?? FALLBACK_URI },
        (controller) => {
          if (disposed) {
            controller.destroy();
            return;
          }
          controllerRef.current = controller;
          controller.addListener('ready', () => {
            setReady(true);
            setError(undefined);
            if (pendingUriRef.current) {
              controller.loadEntity(pendingUriRef.current);
              if (pendingAutoplayRef.current) controller.play();
            }
          });
          controller.addListener('playback_started', (event) => {
            setState((current) => ({ ...current, playingUri: event.data.playingURI ?? current.playingUri, paused: false }));
          });
          controller.addListener('playback_update', (event) => {
            setState({
              playingUri: event.data.playingURI,
              positionMs: event.data.position ?? 0,
              durationMs: event.data.duration ?? 0,
              paused: event.data.isPaused ?? true,
              buffering: event.data.isBuffering ?? false,
            });
          });
        },
      );
    };

    window.onSpotifyIframeApiReady = setup;
    const existing = document.querySelector<HTMLScriptElement>('script[data-arc-spotify-iframe]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      script.dataset.arcSpotifyIframe = 'true';
      script.onerror = () => setError('Spotify Embed API failed to load.');
      document.body.appendChild(script);
    }

    return () => {
      disposed = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      window.onSpotifyIframeApiReady = undefined;
    };
  }, []);

  const loadTrack = useCallback((uri: string, autoplay = true) => {
    pendingUriRef.current = uri;
    pendingAutoplayRef.current = autoplay;
    setState((current) => ({ ...current, playingUri: uri, positionMs: 0, paused: !autoplay }));
    const controller = controllerRef.current;
    if (!controller) return;
    controller.loadEntity(uri);
    if (autoplay) controller.play();
  }, []);

  const play = useCallback(() => controllerRef.current?.play(), []);
  const pause = useCallback(() => controllerRef.current?.pause(), []);
  const togglePlay = useCallback(() => controllerRef.current?.togglePlay(), []);
  const seek = useCallback((positionMs: number) => controllerRef.current?.seek(Math.max(0, positionMs) / 1000), []);

  const value = useMemo(() => ({ ...state, ready, error, loadTrack, play, pause, togglePlay, seek }), [state, ready, error, loadTrack, play, pause, togglePlay, seek]);

  return (
    <SpotifyEmbedContext.Provider value={value}>
      {children}
      <div className={`spotify-engine ${location.pathname === '/now-playing' ? 'visible' : 'parked'}`} aria-label="Spotify player">
        <div ref={mountRef} />
      </div>
    </SpotifyEmbedContext.Provider>
  );
};

export const useSpotifyEmbed = () => {
  const value = useContext(SpotifyEmbedContext);
  if (!value) throw new Error('useSpotifyEmbed must be used within SpotifyEmbedProvider.');
  return value;
};
