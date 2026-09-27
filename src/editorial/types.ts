export type EditorialBody = {
  short: string;
  full?: string;
};

export type LegacyEditorialMatch = {
  artistName: string;
  albumTitle?: string;
  trackTitle?: string;
  releaseYear?: number;
};

export type EditorialEntry = EditorialBody & {
  key: string;
  match: LegacyEditorialMatch;
};
