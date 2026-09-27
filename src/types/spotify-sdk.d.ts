export {};

declare global {
  interface Window {
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }

  type SpotifySdkTrack = {
    id: string;
    uri: string;
    name: string;
    duration_ms: number;
    album: { name: string; uri: string; images?: Array<{ url: string }> };
    artists: Array<{ name: string; uri: string }>;
  };

  type SpotifySdkState = {
    paused: boolean;
    position: number;
    duration: number;
    context: { uri: string };
    track_window: { current_track: SpotifySdkTrack };
  };

  interface SpotifyPlayer {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: 'ready' | 'not_ready', callback: (payload: { device_id: string }) => void): boolean;
    addListener(event: 'player_state_changed', callback: (state: SpotifySdkState | null) => void): boolean;
    addListener(event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error', callback: (payload: { message: string }) => void): boolean;
    togglePlay(): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    activateElement(): Promise<void>;
    getCurrentState(): Promise<SpotifySdkState | null>;
  }
}
