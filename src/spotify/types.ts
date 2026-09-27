export type SpotifyImage = { url: string; width?: number; height?: number };
export type SpotifyArtistSimple = { id: string; name: string; uri: string; external_urls?: { spotify?: string } };
export type SpotifyAlbumSimple = {
  id: string;
  uri: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  images: SpotifyImage[];
  artists: SpotifyArtistSimple[];
  external_urls?: { spotify?: string };
};
export type SpotifyTrackSimple = {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  track_number: number;
  disc_number: number;
  artists: SpotifyArtistSimple[];
  external_urls?: { spotify?: string };
};
export type SpotifyTrack = SpotifyTrackSimple & { album: SpotifyAlbumSimple };
export type SpotifyAlbum = SpotifyAlbumSimple & { tracks: { items: SpotifyTrackSimple[]; next: string | null } };
export type SpotifyArtist = {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
  genres?: string[];
  external_urls?: { spotify?: string };
};
export type SpotifySearchResponse = {
  artists?: { items: SpotifyArtist[] };
  albums?: { items: SpotifyAlbumSimple[] };
  tracks?: { items: SpotifyTrack[] };
};
