# ARC Music v7

ARC Music is a personal music player/archive whose playback is provided by the **real Spotify Embed iFrame API**. The app does not create a Spotify Connect browser device and does not simulate playback.

## Production architecture

- React + TypeScript + Vite
- Spotify Embed iFrame API: actual in-page playback, play/pause, seek, playback position events
- Spotify Web API + Authorization Code with PKCE: catalog search and live artist/album/track metadata
- LRCLIB: synchronized LRC lyrics when a matching record exists
- Source-controlled ARC editorial notes: only explicitly hard-coded entries are shown
- GitHub Actions → GitHub Pages

## Setup

Create a Spotify developer app and register these redirect URIs exactly:

- local: `http://127.0.0.1:5173/`
- production: `https://kingjnu-sakayume.github.io/player2/`

Set:

`VITE_SPOTIFY_CLIENT_ID=<your public Spotify client id>`

For GitHub Pages, add it at **Settings → Secrets and variables → Actions → Variables**. Do not add a client secret.

## Playback

Audio is played by Spotify's official Embed. The custom ARC transport controls the Embed controller and receives authoritative `playback_update` events for position/duration. Previous/next loads the adjacent Spotify track from the live album sequence.

No Web Playback SDK, Spotify Connect browser device, fake progress clock, preview MP3, or mock playback is used.

## Search / artist / album

The header search queries Spotify's live catalog for artists, albums, and tracks. Artist and album pages are fetched from Spotify Web API by Spotify ID. Album track rows load the actual Spotify track into the Embed and open Now Playing.

## Lyrics

Lyrics are fetched at runtime from LRCLIB using track title, artist, album, and duration. Only synchronized LRC data is rendered. If synchronized lyrics are unavailable, ARC says so and does not fabricate text.

## Notes

Editorial notes live in `src/editorial/data.ts`. The UI calls the editorial lookup and renders a preview/drawer only when a matching hard-coded entry exists. No generated fallback notes are shown.

## Commands

```bash
npm install
npm run check
npm run dev
```

The GitHub Pages workflow runs typecheck, lint, tests, build, and deploy on pushes to `main`.
