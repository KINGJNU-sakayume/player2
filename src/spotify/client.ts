import type { AlbumWithTracks, ArtistIdentity, ArtistRelease, TrackIdentity } from '../data/types';
import { mapAlbum, mapAlbumSimple, mapArtist, mapSearchTrack } from './mappers';
import type { SpotifyAlbum, SpotifyAlbumSimple, SpotifyArtist, SpotifySearchResponse, SpotifyTrackSimple } from './types';

const API_URL = 'https://api.spotify.com/v1';
export type TokenProvider = () => Promise<string | null>;

const spotifyRequest = async <T>(tokenProvider: TokenProvider, path: string, init: RequestInit = {}): Promise<T> => {
  const token = await tokenProvider();
  if (!token) throw new Error('Spotify login is required for catalog search and metadata.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify API ${response.status}: ${body || response.statusText}`);
  }
  return (await response.json()) as T;
};

export const searchSpotifyCatalog = async (tokenProvider: TokenProvider, query: string) => {
  const params = new URLSearchParams({ q: query, type: 'artist,album,track', limit: '6' });
  const result = await spotifyRequest<SpotifySearchResponse>(tokenProvider, `/search?${params.toString()}`);
  return {
    artists: (result.artists?.items ?? []).map(mapArtist),
    albums: (result.albums?.items ?? []).map(mapAlbumSimple),
    tracks: (result.tracks?.items ?? []).map(mapSearchTrack),
  };
};

export const getSpotifyArtist = async (tokenProvider: TokenProvider, artistId: string): Promise<ArtistIdentity> => {
  const artist = await spotifyRequest<SpotifyArtist>(tokenProvider, `/artists/${encodeURIComponent(artistId)}`);
  return mapArtist(artist);
};

export const getSpotifyArtistReleases = async (tokenProvider: TokenProvider, artistId: string): Promise<ArtistRelease[]> => {
  const response = await spotifyRequest<{ items: SpotifyAlbumSimple[] }>(
    tokenProvider,
    `/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single&limit=10`,
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
  let next = album.tracks.next;
  while (next && offset < album.total_tracks) {
    const page = await spotifyRequest<{ items: SpotifyTrackSimple[]; next: string | null }>(
      tokenProvider,
      `/albums/${encodedId}/tracks?limit=50&offset=${offset}`,
    );
    if (!page.items.length) break;
    tracks.push(...page.items);
    offset += page.items.length;
    next = page.next;
  }
  return mapAlbum({ ...album, tracks: { ...album.tracks, items: tracks, next: null } });
};

export type SpotifySearchResults = {
  artists: ArtistIdentity[];
  albums: ArtistRelease[];
  tracks: TrackIdentity[];
};
