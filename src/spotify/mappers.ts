import type {
  AlbumIdentity,
  AlbumWithTracks,
  ArtistIdentity,
  ArtistRelease,
  PlaybackDevice,
  PlayerSnapshot,
  TrackIdentity,
} from '../data/types';
import type {
  SpotifyAlbum,
  SpotifyAlbumSimple,
  SpotifyArtist,
  SpotifyDevice,
  SpotifyPlaybackState,
  SpotifyPlaybackTrack,
  SpotifyTrackSimple,
} from './types';

export const mapArtist = (artist: SpotifyArtist): ArtistIdentity => ({
  id: artist.id,
  name: artist.name,
  imageUrl: artist.images?.[0]?.url,
  genres: artist.genres,
  spotifyUrl: artist.external_urls?.spotify,
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
  spotifyUrl: album.external_urls?.spotify,
});

const mapTrack = (track: SpotifyTrackSimple, album: AlbumIdentity): TrackIdentity => ({
  id: track.id,
  uri: track.uri,
  title: track.name,
  artists: track.artists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    spotifyUrl: artist.external_urls?.spotify,
  })),
  album,
  trackNumber: track.track_number,
  discNumber: track.disc_number,
  durationMs: track.duration_ms,
  spotifyUrl: track.external_urls?.spotify,
});

export const mapAlbum = (album: SpotifyAlbum): AlbumWithTracks => {
  const identity: AlbumIdentity = mapAlbumSimple(album);
  return { ...identity, tracks: album.tracks.items.map((track) => mapTrack(track, identity)) };
};

export const mapPlaybackTrack = (track: SpotifyPlaybackTrack): TrackIdentity => {
  const album: AlbumIdentity = mapAlbumSimple(track.album);
  return mapTrack(track, album);
};

export const mapDevice = (device: SpotifyDevice): PlaybackDevice | null => {
  if (!device.id) return null;
  return {
    id: device.id,
    name: device.name,
    type: device.type,
    isActive: device.is_active,
    isRestricted: device.is_restricted,
    volumePercent: device.volume_percent ?? undefined,
    supportsVolume: device.supports_volume,
  };
};

export const mapPlaybackState = (state: SpotifyPlaybackState): PlayerSnapshot => {
  const track = state.currently_playing_type === 'track' && state.item ? mapPlaybackTrack(state.item) : null;
  return {
    track,
    positionMs: state.progress_ms ?? 0,
    durationMs: track?.durationMs ?? 0,
    paused: !state.is_playing,
    deviceId: state.device.id ?? undefined,
    deviceName: state.device.name,
    deviceType: state.device.type,
    deviceRestricted: state.device.is_restricted,
    volume: state.device.volume_percent ?? undefined,
    contextUri: state.context?.uri,
    updatedAt: Date.now(),
  };
};
