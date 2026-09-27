export type SpotifyImage = { url: string; width?: number; height?: number };
export type SpotifyExternalUrls = { spotify?: string };

export type SpotifyArtistSimple = {
  id: string;
  name: string;
  uri: string;
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyArtist = SpotifyArtistSimple & {
  images: SpotifyImage[];
  genres?: string[];
};

export type SpotifyAlbumSimple = {
  id: string;
  uri: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  images: SpotifyImage[];
  artists: SpotifyArtistSimple[];
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyTrackSimple = {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  track_number: number;
  disc_number: number;
  artists: SpotifyArtistSimple[];
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyAlbum = SpotifyAlbumSimple & {
  tracks: {
    items: SpotifyTrackSimple[];
    next: string | null;
  };
};

export type SpotifyPlaybackTrack = SpotifyTrackSimple & {
  type: 'track';
  album: SpotifyAlbumSimple;
};

export type SpotifyDevice = {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
};

export type SpotifyPlaybackState = {
  device: SpotifyDevice;
  progress_ms: number | null;
  is_playing: boolean;
  item: SpotifyPlaybackTrack | null;
  currently_playing_type?: string;
  context?: { uri?: string } | null;
};

export type SpotifyArtistAlbumsPage = {
  items: SpotifyAlbumSimple[];
  next: string | null;
};

export type SpotifyDevicesResponse = {
  devices: SpotifyDevice[];
};

export type SpotifySearchResponse = {
  artists?: { items: SpotifyArtist[] };
  albums?: { items: SpotifyAlbumSimple[] };
};
