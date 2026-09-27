import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import type { AlbumIdentity, PlaybackDevice, PlayerSnapshot, TrackIdentity } from '../data/types';
import {
  getSpotifyDevices,
  getSpotifyPlaybackState,
  nextSpotifyTrack,
  pauseSpotifyPlayback,
  previousSpotifyTrack,
  resumeSpotifyPlayback,
  seekSpotifyPlayback,
  startSpotifyTrack,
  transferSpotifyPlayback,
} from '../spotify/client';

export type PlaybackStatus = 'idle' | 'syncing' | 'ready' | 'no-playback' | 'error';

type PlaybackContextValue = {
  status: PlaybackStatus;
  snapshot: PlayerSnapshot | null;
  devices: PlaybackDevice[];
  activeDevice?: PlaybackDevice;
  error?: string;
  refresh: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  previous: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  playTrack: (track: TrackIdentity, album?: AlbumIdentity) => Promise<void>;
  transferToDevice: (deviceId: string) => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export const PlaybackProvider = ({ children }: { children: ReactNode }) => {
  const { status: authStatus, getAccessToken } = useAuth();
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [snapshot, setSnapshot] = useState<PlayerSnapshot | null>(null);
  const [devices, setDevices] = useState<PlaybackDevice[]>([]);
  const [preferredDeviceId, setPreferredDeviceId] = useState<string>();
  const [error, setError] = useState<string>();

  const refreshPlayback = useCallback(async () => {
    if (authStatus !== 'connected') return;
    try {
      const nextSnapshot = await getSpotifyPlaybackState(getAccessToken);
      setSnapshot(nextSnapshot);
      setStatus(nextSnapshot?.track ? 'ready' : 'no-playback');
      setError(undefined);
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Unable to read Spotify playback state.');
    }
  }, [authStatus, getAccessToken]);

  const refreshDevices = useCallback(async () => {
    if (authStatus !== 'connected') return;
    try {
      const nextDevices = await getSpotifyDevices(getAccessToken);
      setDevices(nextDevices);
      const active = nextDevices.find((device) => device.isActive);
      if (active) setPreferredDeviceId(active.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load Spotify devices.');
    }
  }, [authStatus, getAccessToken]);

  const refresh = useCallback(async () => {
    await Promise.all([refreshPlayback(), refreshDevices()]);
  }, [refreshDevices, refreshPlayback]);

  useEffect(() => {
    if (authStatus !== 'connected') {
      setSnapshot(null);
      setDevices([]);
      setPreferredDeviceId(undefined);
      setStatus('idle');
      setError(undefined);
      return;
    }

    setStatus('syncing');
    void refresh();

    const interval = window.setInterval(() => {
      void refreshPlayback();
    }, 4000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authStatus, refresh, refreshPlayback]);

  const activeDevice = useMemo(() => {
    const snapshotDeviceId = snapshot?.deviceId;
    return devices.find((device) => device.id === snapshotDeviceId)
      ?? devices.find((device) => device.isActive)
      ?? devices.find((device) => device.id === preferredDeviceId);
  }, [devices, preferredDeviceId, snapshot?.deviceId]);

  const targetDeviceId = useCallback(async () => {
    let target = activeDevice ?? devices.find((device) => !device.isRestricted);
    if (!target) {
      const nextDevices = await getSpotifyDevices(getAccessToken);
      setDevices(nextDevices);
      target = nextDevices.find((device) => device.isActive)
        ?? nextDevices.find((device) => !device.isRestricted);
    }
    if (!target) {
      throw new Error('Open Spotify on a phone, desktop, or speaker first. ARC controls a real Spotify Connect device.');
    }
    if (target.isRestricted) {
      throw new Error(`${target.name} does not allow Web API playback control.`);
    }
    setPreferredDeviceId(target.id);
    return target.id;
  }, [activeDevice, devices, getAccessToken]);

  const runCommand = useCallback(async (command: (deviceId: string) => Promise<void>) => {
    const deviceId = await targetDeviceId();
    await command(deviceId);
    await delay(180);
    await refreshPlayback();
    await refreshDevices();
  }, [refreshDevices, refreshPlayback, targetDeviceId]);

  const previous = useCallback(
    async () => runCommand((deviceId) => previousSpotifyTrack(getAccessToken, deviceId)),
    [getAccessToken, runCommand],
  );

  const togglePlay = useCallback(async () => {
    if (!snapshot) throw new Error('There is no current Spotify playback session.');
    await runCommand((deviceId) =>
      snapshot.paused
        ? resumeSpotifyPlayback(getAccessToken, deviceId)
        : pauseSpotifyPlayback(getAccessToken, deviceId),
    );
  }, [getAccessToken, runCommand, snapshot]);

  const next = useCallback(
    async () => runCommand((deviceId) => nextSpotifyTrack(getAccessToken, deviceId)),
    [getAccessToken, runCommand],
  );

  const seek = useCallback(
    async (positionMs: number) => runCommand((deviceId) => seekSpotifyPlayback(getAccessToken, positionMs, deviceId)),
    [getAccessToken, runCommand],
  );

  const playTrack = useCallback(async (track: TrackIdentity, album?: AlbumIdentity) => {
    const deviceId = await targetDeviceId();
    await startSpotifyTrack(getAccessToken, track, album?.uri, deviceId);
    await delay(220);
    await refreshPlayback();
    await refreshDevices();
  }, [getAccessToken, refreshDevices, refreshPlayback, targetDeviceId]);

  const transferToDevice = useCallback(async (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (device?.isRestricted) throw new Error(`${device.name} does not allow Spotify Web API control.`);
    await transferSpotifyPlayback(getAccessToken, deviceId, false);
    setPreferredDeviceId(deviceId);
    await delay(180);
    await refresh();
  }, [devices, getAccessToken, refresh]);

  const value = useMemo(() => ({
    status,
    snapshot,
    devices,
    activeDevice,
    error,
    refresh,
    refreshDevices,
    previous,
    togglePlay,
    next,
    seek,
    playTrack,
    transferToDevice,
  }), [
    status,
    snapshot,
    devices,
    activeDevice,
    error,
    refresh,
    refreshDevices,
    previous,
    togglePlay,
    next,
    seek,
    playTrack,
    transferToDevice,
  ]);

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};

export const usePlayback = () => {
  const value = useContext(PlaybackContext);
  if (!value) throw new Error('usePlayback must be used within PlaybackProvider.');
  return value;
};
