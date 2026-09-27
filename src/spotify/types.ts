export type SpotifyImage = { url: string; width?: number; height?: number };
export type SpotifyArtistSimple = { id: string; name: string; uri: string };
export type SpotifyAlbumSimple = {
  id: string;
  uri: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  images: SpotifyImage[];
  artists: SpotifyArtistSimple[];
};
export type SpotifyTrackSimple = {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  track_number: number;
  disc_number: number;
  artists: SpotifyArtistSimple[];
};
export type SpotifyAlbum = SpotifyAlbumSimple & { tracks: { items: SpotifyTrackSimple[]; next: string | null } };
export type SpotifyArtist = {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres?: string[];
};
