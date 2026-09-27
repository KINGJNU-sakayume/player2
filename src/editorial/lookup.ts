import { albumEditorial, artistEditorial, songEditorial } from './data';
import type { EditorialEntry } from './types';

type EditorialQuery = {
  spotifyId?: string;
  artistName: string;
  albumTitle?: string;
  trackTitle?: string;
  releaseYear?: number;
};

const normalize = (value?: string) => value?.trim().toLocaleLowerCase().replace(/\s+/g, ' ') ?? '';

const matchesLegacy = (entry: EditorialEntry, query: EditorialQuery) => {
  if (!entry.match) return false;
  const candidate = entry.match;
  if (normalize(candidate.artistName) !== normalize(query.artistName)) return false;
  if (candidate.albumTitle && normalize(candidate.albumTitle) !== normalize(query.albumTitle)) return false;
  if (candidate.trackTitle && normalize(candidate.trackTitle) !== normalize(query.trackTitle)) return false;
  if (candidate.releaseYear && query.releaseYear && candidate.releaseYear !== query.releaseYear) return false;
  return true;
};

export const findEditorial = (entries: EditorialEntry[], query: EditorialQuery) =>
  entries.find((entry) =>
    (entry.spotifyId && query.spotifyId && entry.spotifyId === query.spotifyId)
    || matchesLegacy(entry, query),
  );

export const getArtistEditorial = (spotifyId: string, artistName: string) =>
  findEditorial(artistEditorial, { spotifyId, artistName });

export const getAlbumEditorial = (
  spotifyId: string,
  artistName: string,
  albumTitle: string,
  releaseYear?: number,
) => findEditorial(albumEditorial, { spotifyId, artistName, albumTitle, releaseYear });

export const getSongEditorial = (
  spotifyId: string,
  artistName: string,
  albumTitle: string,
  trackTitle: string,
  releaseYear?: number,
) => findEditorial(songEditorial, { spotifyId, artistName, albumTitle, trackTitle, releaseYear });
