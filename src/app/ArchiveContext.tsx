import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TrackIdentity } from '../data/types';

type ArchiveContextValue = {
  selectedTrack: TrackIdentity | null;
  selectTrack: (track: TrackIdentity) => void;
  clearTrack: () => void;
  selectedAlbumId?: string;
  selectedArtistId?: string;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export const ArchiveProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackIdentity | null>(null);

  const value = useMemo(() => ({
    selectedTrack,
    selectTrack: setSelectedTrack,
    clearTrack: () => setSelectedTrack(null),
    selectedAlbumId: selectedTrack?.album.id,
    selectedArtistId: selectedTrack?.artists[0]?.id ?? selectedTrack?.album.artistIds[0],
  }), [selectedTrack]);

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};

export const useArchive = () => {
  const value = useContext(ArchiveContext);
  if (!value) throw new Error('useArchive must be used within ArchiveProvider.');
  return value;
};
