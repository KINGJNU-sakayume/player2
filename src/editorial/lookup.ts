import { albumEditorial, artistEditorial, songEditorial } from './data';
import type { EditorialEntry } from './types';

const normalize = (value?: string) => value?.trim().toLocaleLowerCase().replace(/\s+/g, ' ') ?? '';

const match = (entry: EditorialEntry, artistName: string, albumTitle?: string, trackTitle?: string, releaseYear?: number) => {
  const candidate = entry.match;
  if (normalize(candidate.artistName) !== normalize(artistName)) return false;
  if (candidate.albumTitle && normalize(candidate.albumTitle) !== normalize(albumTitle)) return false;
  if (candidate.trackTitle && normalize(candidate.trackTitle) !== normalize(trackTitle)) return false;
  if (candidate.releaseYear && releaseYear && candidate.releaseYear !== releaseYear) return false;
  return true;
};

export const getArtistEditorial = (artistName: string) => artistEditorial.find((entry) => match(entry, artistName));
export const getAlbumEditorial = (artistName: string, albumTitle: string, releaseYear?: number) => albumEditorial.find((entry) => match(entry, artistName, albumTitle, undefined, releaseYear));
export const getSongEditorial = (artistName: string, albumTitle: string, trackTitle: string, releaseYear?: number) => songEditorial.find((entry) => match(entry, artistName, albumTitle, trackTitle, releaseYear));
