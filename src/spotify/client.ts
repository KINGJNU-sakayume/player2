import type { AlbumWithTracks, ArtistIdentity, ArtistRelease, TrackIdentity } from '../data/types';
import { mapAlbum, mapAlbumSimple, mapArtist } from './mappers';
import type { SpotifyAlbum, SpotifyAlbumSimple, SpotifyArtist, SpotifySearchResponse, SpotifyTrack, SpotifyTrackSimple } from './types';

const API_URL = 'https://api.spotify.com/v1';

type TokenProvider = () => Promise<string | null>;

export class SpotifyApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) { super(message); }
}

const spotifyRequest = async <T>(tokenProvider: TokenProvider, path: string, init: RequestInit = {}): Promise<T> => {
  const token = await tokenProvider();
  if (!token) throw new Error('Spotify connection is required.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const body = await response.text();
    const retryAfter = Number(response.headers.get('Retry-After')) || undefined;
    const message = response.status === 401 ? 'Spotify session expired. Reconnect and try again.'
      : response.status === 403 ? 'Spotify denied this action. Premium, app access, or an active device may be required.'
        : response.status === 429 ? `Spotify rate limit reached${retryAfter ? `; retry in ${retryAfter} seconds` : ''}.`
          : `Spotify API ${response.status}: ${body || response.statusText}`;
    throw new SpotifyApiError(response.status, message, retryAfter);
  }
  return (await response.json()) as T;
};

export type SearchResults = { tracks: TrackIdentity[]; artists: ArtistIdentity[]; albums: ArtistRelease[] };
export const searchSpotify = async (tokenProvider: TokenProvider, query: string): Promise<SearchResults> => {
  const params = new URLSearchParams({ q: query, type: 'track,artist,album', limit: '10' });
  const response = await spotifyRequest<SpotifySearchResponse>(tokenProvider, `/search?${params}`);
  return {
    tracks: (response.tracks?.items ?? []).map((track: SpotifyTrack) => ({
      id: track.id, uri: track.uri, title: track.name, durationMs: track.duration_ms,
      trackNumber: track.track_number, discNumber: track.disc_number,
      artists: track.artists.map((artist) => ({ id: artist.id, name: artist.name })),
      album: mapAlbumSimple(track.album),
    })),
    artists: (response.artists?.items ?? []).map(mapArtist),
    albums: (response.albums?.items ?? []).map(mapAlbumSimple),
  };
};

export const getSpotifyArtist = async (tokenProvider: TokenProvider, artistId: string): Promise<ArtistIdentity> => {
  const artist = await spotifyRequest<SpotifyArtist>(tokenProvider, `/artists/${encodeURIComponent(artistId)}`);
  return mapArtist(artist);
};

export const getSpotifyArtistReleases = async (tokenProvider: TokenProvider, artistId: string): Promise<ArtistRelease[]> => {
  const response = await spotifyRequest<{ items: SpotifyAlbumSimple[] }>(
    tokenProvider,
    `/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single&limit=20`,
  );
  const seen = new Set<string>();
  return response.items.map(mapAlbumSimple).filter((album) => {
    const key = `${album.name.toLocaleLowerCase()}-${album.releaseDate?.slice(0, 4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getSpotifyAlbum = async (tokenProvider: TokenProvider, albumId: string): Promise<AlbumWithTracks> => {
  const encodedId = encodeURIComponent(albumId);
  const album = await spotifyRequest<SpotifyAlbum>(tokenProvider, `/albums/${encodedId}`);
  const tracks = [...album.tracks.items];
  let offset = tracks.length;
  while (album.tracks.next && offset < album.total_tracks) {
    const page = await spotifyRequest<{ items: SpotifyTrackSimple[]; next: string | null }>(
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

export const startSpotifyTrack = async (
  tokenProvider: TokenProvider,
  track: TrackIdentity,
  contextUri?: string,
  deviceId?: string,
) => {
  const query = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
  const body = contextUri && track.uri
    ? { context_uri: contextUri, offset: { uri: track.uri } }
    : track.uri
      ? { uris: [track.uri] }
      : null;
  if (!body) throw new Error('This demo track does not have a Spotify URI. Connect and open its Spotify album first.');
  await spotifyRequest<void>(tokenProvider, `/me/player/play${query}`, { method: 'PUT', body: JSON.stringify(body) });
};

export const transferSpotifyPlayback = async (tokenProvider: TokenProvider, deviceId: string) => {
  await spotifyRequest<void>(tokenProvider, '/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
};
