export type ArtistIdentity = {
  id: string;
  name: string;
  imageUrl?: string;
  genres?: string[];
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
  language?: string;
};

export type AlbumWithTracks = AlbumIdentity & {
  tracks: TrackIdentity[];
};

export type ArtistRelease = AlbumIdentity & {
  durationMs?: number;
};

export type PlayerSnapshot = {
  track: TrackIdentity | null;
  positionMs: number;
  durationMs: number;
  paused: boolean;
  deviceId?: string;
  volume?: number;
  contextUri?: string;
  updatedAt: number;
};

export type SeedArtist = ArtistIdentity & {
  monogram: string;
  releases: AlbumWithTracks[];
};
