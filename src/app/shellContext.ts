import { createContext, useContext } from 'react';

/** Overlays owned by the app shell: search, queue drawer and settings. */
export interface ShellControls {
  openSearch: () => void;
  openQueue: () => void;
  toggleSettings: () => void;
}

export const ShellContext = createContext<ShellControls>({
  openSearch: () => undefined,
  openQueue: () => undefined,
  toggleSettings: () => undefined,
});

export function useShell(): ShellControls {
  return useContext(ShellContext);
}
