import type {
  AlbumWithTracks,
  ArtistIdentity,
  ArtistRelease,
  PlaybackDevice,
  PlayerSnapshot,
  TrackIdentity,
} from '../data/types';
import { mapAlbum, mapAlbumSimple, mapArtist, mapDevice, mapPlaybackState } from './mappers';
import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyArtistAlbumsPage,
  SpotifyDevicesResponse,
  SpotifyPlaybackState,
  SpotifySearchResponse,
  SpotifyTrackSimple,
} from './types';

const API_URL = 'https://api.spotify.com/v1';

type TokenProvider = () => Promise<string | null>;

const describeSpotifyError = async (response: Response, path: string) => {
  let detail = '';
  try {
    const raw = await response.text();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { error?: { message?: string } | string };
        detail = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message ?? raw;
      } catch {
        detail = raw;
      }
    }
  } catch {
    detail = '';
  }

  if (response.status === 401) return 'Spotify authorization expired. Reconnect Spotify.';
  if (response.status === 403) return detail || 'Spotify rejected this playback command. A Premium account may be required.';
  if (response.status === 404 && path.startsWith('/me/player')) {
    return 'No active Spotify device. Open Spotify on your phone, desktop, or speaker, then select that device here.';
  }
  if (response.status === 429) return 'Spotify rate limit reached. Try again shortly.';
  return `Spotify API ${response.status}: ${detail || response.statusText}`;
};

const spotifyFetch = async (tokenProvider: TokenProvider, path: string, init: RequestInit = {}) => {
  const token = await tokenProvider();
  if (!token) throw new Error('Spotify connection is required.');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(await describeSpotifyError(response, path));
  return response;
};

const spotifyJson = async <T>(tokenProvider: TokenProvider, path: string, init: RequestInit = {}) => {
  const response = await spotifyFetch(tokenProvider, path, init);
  return (await response.json()) as T;
};

const spotifyVoid = async (tokenProvider: TokenProvider, path: string, init: RequestInit = {}) => {
  await spotifyFetch(tokenProvider, path, init);
};

const withDevice = (path: string, deviceId?: string) =>
  deviceId ? `${path}${path.includes('?') ? '&' : '?'}device_id=${encodeURIComponent(deviceId)}` : path;

export const getSpotifyArtist = async (tokenProvider: TokenProvider, artistId: string): Promise<ArtistIdentity> => {
  const artist = await spotifyJson<SpotifyArtist>(tokenProvider, `/artists/${encodeURIComponent(artistId)}`);
  return mapArtist(artist);
};

export const getSpotifyArtistReleases = async (
  tokenProvider: TokenProvider,
  artistId: string,
): Promise<ArtistRelease[]> => {
  const releases: ArtistRelease[] = [];
  let offset = 0;

  while (offset < 30) {
    const page = await spotifyJson<SpotifyArtistAlbumsPage>(
      tokenProvider,
      `/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single&limit=10&offset=${offset}`,
    );
    releases.push(...page.items.map(mapAlbumSimple));
    if (!page.next || page.items.length === 0) break;
    offset += page.items.length;
  }

  const seen = new Set<string>();
  return releases.filter((album) => {
    const key = `${album.name.toLocaleLowerCase()}-${album.releaseDate?.slice(0, 4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getSpotifyAlbum = async (tokenProvider: TokenProvider, albumId: string): Promise<AlbumWithTracks> => {
  const encodedId = encodeURIComponent(albumId);
  const album = await spotifyJson<SpotifyAlbum>(tokenProvider, `/albums/${encodedId}`);
  const tracks = [...album.tracks.items];
  let offset = tracks.length;

  while (album.tracks.next && offset < album.total_tracks) {
    const page = await spotifyJson<{ items: SpotifyTrackSimple[]; next: string | null }>(
      tokenProvider,
      `/albums/${encodedId}/tracks?limit=50&offset=${offset}`,
    );
    if (!page.items.length) break;
    tracks.push(...page.items);
    offset += page.items.length;
    if (!page.next) break;
  }

  return mapAlbum({ ...album, tracks: { ...album.tracks, items: tracks, next: null } });
};

export type SpotifySearchResults = {
  artists: ArtistIdentity[];
  albums: ArtistRelease[];
};

export const searchSpotify = async (
  tokenProvider: TokenProvider,
  query: string,
): Promise<SpotifySearchResults> => {
  const q = query.trim();
  if (!q) return { artists: [], albums: [] };
  const response = await spotifyJson<SpotifySearchResponse>(
    tokenProvider,
    `/search?q=${encodeURIComponent(q)}&type=artist,album&limit=6`,
  );
  return {
    artists: (response.artists?.items ?? []).map(mapArtist),
    albums: (response.albums?.items ?? []).map(mapAlbumSimple),
  };
};

export const getSpotifyPlaybackState = async (
  tokenProvider: TokenProvider,
): Promise<PlayerSnapshot | null> => {
  const response = await spotifyFetch(tokenProvider, '/me/player');
  if (response.status === 204) return null;
  return mapPlaybackState((await response.json()) as SpotifyPlaybackState);
};

export const getSpotifyDevices = async (
  tokenProvider: TokenProvider,
): Promise<PlaybackDevice[]> => {
  const response = await spotifyJson<SpotifyDevicesResponse>(tokenProvider, '/me/player/devices');
  return response.devices.map(mapDevice).filter((device): device is PlaybackDevice => Boolean(device));
};

export const startSpotifyTrack = async (
  tokenProvider: TokenProvider,
  track: TrackIdentity,
  contextUri?: string,
  deviceId?: string,
) => {
  if (!track.uri) throw new Error('This track does not have a Spotify playback URI.');
  const body = contextUri
    ? { context_uri: contextUri, offset: { uri: track.uri } }
    : { uris: [track.uri] };

  await spotifyVoid(tokenProvider, withDevice('/me/player/play', deviceId), {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const resumeSpotifyPlayback = async (tokenProvider: TokenProvider, deviceId?: string) => {
  await spotifyVoid(tokenProvider, withDevice('/me/player/play', deviceId), { method: 'PUT' });
};

export const pauseSpotifyPlayback = async (tokenProvider: TokenProvider, deviceId?: string) => {
  await spotifyVoid(tokenProvider, withDevice('/me/player/pause', deviceId), { method: 'PUT' });
};

export const nextSpotifyTrack = async (tokenProvider: TokenProvider, deviceId?: string) => {
  await spotifyVoid(tokenProvider, withDevice('/me/player/next', deviceId), { method: 'POST' });
};

export const previousSpotifyTrack = async (tokenProvider: TokenProvider, deviceId?: string) => {
  await spotifyVoid(tokenProvider, withDevice('/me/player/previous', deviceId), { method: 'POST' });
};

export const seekSpotifyPlayback = async (
  tokenProvider: TokenProvider,
  positionMs: number,
  deviceId?: string,
) => {
  const path = `/me/player/seek?position_ms=${Math.max(0, Math.round(positionMs))}`;
  await spotifyVoid(tokenProvider, withDevice(path, deviceId), { method: 'PUT' });
};

export const transferSpotifyPlayback = async (
  tokenProvider: TokenProvider,
  deviceId: string,
  play = false,
) => {
  await spotifyVoid(tokenProvider, '/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play }),
  });
};
