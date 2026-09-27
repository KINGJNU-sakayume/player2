let sdkPromise: Promise<NonNullable<Window['Spotify']>> | null = null;

export const loadSpotifySdk = () => {
  if (window.Spotify) return Promise.resolve(window.Spotify);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-arc-spotify-sdk]');
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (window.Spotify) resolve(window.Spotify);
      else reject(new Error('Spotify Web Playback SDK loaded without a global player object.'));
    };

    if (existing) return;
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.dataset.arcSpotifySdk = 'true';
    script.onerror = () => reject(new Error('Unable to load the Spotify Web Playback SDK.'));
    document.body.appendChild(script);
  });

  return sdkPromise;
};
