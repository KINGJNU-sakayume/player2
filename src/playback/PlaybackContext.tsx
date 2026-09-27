import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { AlbumIdentity, PlayerSnapshot, TrackIdentity } from '../data/types';
import { startSpotifyTrack, transferSpotifyPlayback } from '../spotify/client';
import { loadSpotifySdk } from './sdkLoader';

export type PlaybackStatus = 'idle' | 'sdk-loading' | 'ready' | 'not-ready' | 'unavailable' | 'error';

type PlaybackContextValue = {
  status: PlaybackStatus;
  snapshot: PlayerSnapshot | null;
  deviceId?: string;
  error?: string;
  previous: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  playTrack: (track: TrackIdentity, album?: AlbumIdentity) => Promise<void>;
  activateBrowser: () => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

const idFromUri = (uri?: string) => uri?.split(':').pop() ?? '';

const mapSdkState = (state: SpotifySdkState, deviceId?: string): PlayerSnapshot => {
  const source = state.track_window.current_track;
  const albumId = idFromUri(source.album.uri);
  const album: AlbumIdentity = {
    id: albumId,
    uri: source.album.uri,
    name: source.album.name,
    artistIds: source.artists.map((artist) => idFromUri(artist.uri)),
    artistNames: source.artists.map((artist) => artist.name),
    imageUrl: source.album.images?.[0]?.url,
  };
  const track: TrackIdentity = {
    id: source.id,
    uri: source.uri,
    title: source.name,
    durationMs: source.duration_ms,
    artists: source.artists.map((artist) => ({ id: idFromUri(artist.uri), name: artist.name })),
    album,
  };
  return {
    track,
    positionMs: state.position,
    durationMs: state.duration,
    paused: state.paused,
    deviceId,
    contextUri: state.context?.uri,
    updatedAt: Date.now(),
  };
};

export const PlaybackProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const { status: authStatus, getAccessToken } = auth;
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [snapshot, setSnapshot] = useState<PlayerSnapshot | null>(null);
  const [deviceId, setDeviceId] = useState<string>();
  const [error, setError] = useState<string>();
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceRef = useRef<string>();

  useEffect(() => {
    if (authStatus !== 'connected') {
      playerRef.current?.disconnect();
      playerRef.current = null;
      setSnapshot(null);
      setDeviceId(undefined);
      deviceRef.current = undefined;
      setStatus('idle');
      return;
    }

    let disposed = false;
    let onVisibility: (() => void) | undefined;
    setStatus('sdk-loading');
    setError(undefined);

    loadSpotifySdk()
      .then((Spotify) => {
        if (disposed) return;
        const player = new Spotify.Player({
          name: 'ARC Music Browser',
          getOAuthToken: (callback) => {
            void getAccessToken().then((token) => {
              if (token) callback(token);
            });
          },
          volume: 0.7,
        });
        playerRef.current = player;
        onVisibility = () => {
          if (document.visibilityState !== 'visible') return;
          void player.getCurrentState().then((state) => {
            if (state && !disposed) setSnapshot(mapSdkState(state, deviceRef.current));
          });
        };
        document.addEventListener('visibilitychange', onVisibility);
        player.addListener('ready', ({ device_id }) => {
          deviceRef.current = device_id;
          setDeviceId(device_id);
          setStatus('ready');
          void player.getCurrentState().then((state) => {
            if (state) setSnapshot(mapSdkState(state, device_id));
          });
        });
        player.addListener('not_ready', ({ device_id }) => {
          if (deviceRef.current === device_id) {
            setStatus('not-ready');
            setDeviceId(undefined);
          }
        });
        player.addListener('player_state_changed', (state) => {
          if (state) setSnapshot(mapSdkState(state, deviceRef.current));
        });
        ['initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach((event) => {
          player.addListener(event as 'initialization_error', ({ message }) => {
            setError(message);
            setStatus(event === 'account_error' ? 'unavailable' : 'error');
          });
        });
        return player.connect();
      })
      .then((connected) => {
        if (!disposed && connected === false) {
          setError('Spotify Web Playback SDK could not connect.');
          setStatus('error');
        }
      })
      .catch((cause: unknown) => {
        if (disposed) return;
        setError(cause instanceof Error ? cause.message : 'Spotify playback initialization failed.');
        setStatus('error');
      });

    return () => {
      disposed = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authStatus, getAccessToken]);

  const requirePlayer = useCallback(() => {
    if (!playerRef.current) throw new Error('Spotify browser player is not ready.');
    return playerRef.current;
  }, []);

  const previous = useCallback(async () => requirePlayer().previousTrack(), [requirePlayer]);
  const togglePlay = useCallback(async () => {
    const player = requirePlayer();
    await player.activateElement();
    await player.togglePlay();
  }, [requirePlayer]);
  const next = useCallback(async () => requirePlayer().nextTrack(), [requirePlayer]);
  const seek = useCallback(async (positionMs: number) => requirePlayer().seek(positionMs), [requirePlayer]);

  const playTrack = useCallback(async (track: TrackIdentity, album?: AlbumIdentity) => {
    if (playerRef.current) await playerRef.current.activateElement();
    await startSpotifyTrack(getAccessToken, track, album?.uri, deviceRef.current);
  }, [getAccessToken]);

  const activateBrowser = useCallback(async () => {
    const player = requirePlayer();
    const id = deviceRef.current;
    if (!id) throw new Error('Spotify browser device is not ready.');
    await player.activateElement();
    await transferSpotifyPlayback(getAccessToken, id);
  }, [getAccessToken, requirePlayer]);

  const value = useMemo(() => ({ status, snapshot, deviceId, error, previous, togglePlay, next, seek, playTrack, activateBrowser }), [status, snapshot, deviceId, error, previous, togglePlay, next, seek, playTrack, activateBrowser]);
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};

export const usePlayback = () => {
  const value = useContext(PlaybackContext);
  if (!value) throw new Error('usePlayback must be used within PlaybackProvider.');
  return value;
};
