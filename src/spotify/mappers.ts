import type { AlbumIdentity, AlbumWithTracks, ArtistIdentity, ArtistRelease, TrackIdentity } from '../data/types';
import type { SpotifyAlbum, SpotifyAlbumSimple, SpotifyArtist, SpotifyTrack, SpotifyTrackSimple } from './types';

export const mapArtist = (artist: SpotifyArtist): ArtistIdentity => ({
  id: artist.id,
  name: artist.name,
  imageUrl: artist.images?.[0]?.url,
  genres: artist.genres,
});

export const mapAlbumSimple = (album: SpotifyAlbumSimple): ArtistRelease => ({
  id: album.id,
  uri: album.uri,
  name: album.name,
  artistIds: album.artists.map((artist) => artist.id),
  artistNames: album.artists.map((artist) => artist.name),
  imageUrl: album.images?.[0]?.url,
  releaseDate: album.release_date,
  albumType: album.album_type,
  totalTracks: album.total_tracks,
});

export const mapTrack = (track: SpotifyTrackSimple, album: AlbumIdentity): TrackIdentity => ({
  id: track.id,
  uri: track.uri,
  title: track.name,
  artists: track.artists.map((artist) => ({ id: artist.id, name: artist.name })),
  album,
  trackNumber: track.track_number,
  discNumber: track.disc_number,
  durationMs: track.duration_ms,
});

export const mapSearchTrack = (track: SpotifyTrack): TrackIdentity => {
  const album: AlbumIdentity = mapAlbumSimple(track.album);
  return mapTrack(track, album);
};

export const mapAlbum = (album: SpotifyAlbum): AlbumWithTracks => {
  const identity: AlbumIdentity = mapAlbumSimple(album);
  return { ...identity, tracks: album.tracks.items.map((track) => mapTrack(track, identity)) };
};
