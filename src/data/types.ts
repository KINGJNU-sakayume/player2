export type ArtistIdentity = {
  id: string;
  name: string;
  imageUrl?: string;
  genres?: string[];
  spotifyUrl?: string;
  origin?: string;
  role?: string;
  accent?: string;
};

export type AlbumIdentity = {
  id: string;
  uri?: string;
  name: string;
  artistIds: string[];
  artistNames: string[];
  imageUrl?: string;
  releaseDate?: string;
  albumType?: string;
  totalTracks?: number;
  spotifyUrl?: string;
  language?: string;
  lang?: string;
};

export type TrackIdentity = {
  id: string;
  uri?: string;
  title: string;
  artists: ArtistIdentity[];
  album: AlbumIdentity;
  trackNumber?: number;
  discNumber?: number;
  durationMs: number;
  spotifyUrl?: string;
  language?: string;
};

export type AlbumWithTracks = AlbumIdentity & {
  tracks: TrackIdentity[];
};

export type ArtistRelease = AlbumIdentity & {
  durationMs?: number;
};

export type PlaybackDevice = {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  isRestricted: boolean;
  volumePercent?: number;
  supportsVolume: boolean;
};

export type PlayerSnapshot = {
  track: TrackIdentity | null;
  positionMs: number;
  durationMs: number;
  paused: boolean;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  deviceRestricted?: boolean;
  volume?: number;
  contextUri?: string;
  updatedAt: number;
};
