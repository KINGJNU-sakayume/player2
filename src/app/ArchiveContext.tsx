import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { defaultSeedTrack, findSeedAlbum, findSeedArtist } from '../data/seed';
import type { TrackIdentity } from '../data/types';

type ArchiveContextValue = {
  selectedTrack: TrackIdentity;
  selectTrack: (track: TrackIdentity) => void;
  selectedAlbumId: string;
  selectedArtistId: string;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export const ArchiveProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTrack, setSelectedTrack] = useState(defaultSeedTrack);
  const selectedAlbumId = selectedTrack.album.id;
  const selectedArtistId = selectedTrack.artists[0]?.id ?? selectedTrack.album.artistIds[0] ?? 'vaundy';

  const value = useMemo(() => ({
    selectedTrack,
    selectTrack: setSelectedTrack,
    selectedAlbumId,
    selectedArtistId,
  }), [selectedTrack, selectedAlbumId, selectedArtistId]);

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};

export const useArchive = () => {
  const value = useContext(ArchiveContext);
  if (!value) throw new Error('useArchive must be used within ArchiveProvider.');
  return value;
};

export const getSeedAccentForTrack = (track: TrackIdentity) => findSeedArtist(track.artists[0]?.id ?? '')?.accent ?? '#b91f2e';
export const getSeedLanguageForTrack = (track: TrackIdentity) => findSeedAlbum(track.album.id)?.language ?? track.language;
