# ARC Music v7 — Spotify web player

ARC Music is a restrained personal music archive that keeps the canonical v7 Now Playing, Artist, and Album compositions while using Spotify for authentication, metadata, search, and audio playback. There is no mock playback path, global footer player, Catalogue mode, or Specimen mode.

## Prerequisites

- Node.js 22 and npm
- A Spotify account eligible for the Web Playback SDK (**Spotify Premium is required for browser streaming**)
- A Spotify Developer application whose owner/user is allowed to use the app
- A modern browser with Web Crypto and Media Source support

## Spotify application setup

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Enable/use the **Web API** and **Web Playback SDK** products.
3. Add the exact redirect URI for each environment. Redirect URI matching is exact, including protocol, port, path, and trailing slash.
4. Copy the public Client ID. A client secret is neither needed nor safe in this SPA.

Registered redirect URIs for this repository:

- Development: `http://127.0.0.1:5173/`
- Production: `https://kingjnu-sakayume.github.io/player2/`

Spotify does not accept `localhost` as a substitute when `127.0.0.1` was registered. If the Pages owner/repository changes, register and configure the corresponding `https://<owner>.github.io/<repository>/` URI.

```bash
npm install
cp .env.example .env.local
# Set the public client ID; keep the development redirect URI shown above.
npm run dev -- --host 127.0.0.1
```

Environment variables:

```text
VITE_SPOTIFY_CLIENT_ID=<public client id>
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
```

Never add a client secret, access token, refresh token, lyrics key, or translation key to a `VITE_` variable. Vite variables are public browser code. ARC uses Authorization Code with PKCE (random verifier, S256 challenge, CSRF state validation, code exchange, and refresh) and stores the personal browser session locally so a reload can restore it. Disconnect removes the stored token.

The minimal playback scopes are `streaming`, `user-read-email`, `user-read-private`, `user-read-playback-state`, `user-read-currently-playing`, and `user-modify-playback-state`.

## How playback works

After login, one application-level `Spotify.Player` creates the **ARC Music Browser** Spotify Connect device. SDK state is authoritative for track, position, duration, pause state, context, and device readiness. The displayed clock only interpolates between SDK snapshots and is reset by every new snapshot; it never simulates a song. Search tracks and album rows send a real Web API start/resume request to that browser device. Routes live under a `HashRouter`, so navigation does not unmount the player and remains safe on GitHub Pages.

Use **Settings → Use browser device** if another Connect device is active. A play gesture invokes the SDK's `activateElement()` for browsers that block autoplay. Transport controls intentionally appear only on Now Playing.

## Search, metadata, and local notes

The top-bar Search opens a compact, keyboard-accessible Spotify search overlay. Track results play; artist and album results navigate to real ID-backed routes. Artist releases and complete album sequences come from Spotify, not local track arrays.

Hand-authored notes remain separate from Spotify models in `src/editorial/data.ts`. Edit `artistEditorial`, `albumEditorial`, and `songEditorial` there. Only matched entries render; arbitrary Spotify entities receive no generated prose. Prefer the real Spotify ID as the entry key when adding or migrating notes.

## Synchronized lyrics and translation

Production lyrics use the public LRCLIB provider through `src/lyrics/LrclibLyricsProvider.ts`. It first asks for an exact title/artist/album/duration match, falls back to restrained search, parses synchronized LRC timestamps, and caches results in memory. Requests are aborted/stale-guarded on track changes. Lyric selection uses the real/interpolated Spotify position, so pause and seek remain synchronized.

To replace LRCLIB, implement the `LyricsProvider` interface in `src/lyrics/types.ts` and instantiate it in `NowPlayingPage`. A provider requiring a private credential needs a backend or serverless proxy; GitHub Pages cannot safely hold that key. `MockLyricsProvider` exists only as a test/development fixture and is not imported by production.

Translation is deliberately omitted: no secure translation service is configured and fake translations are never shown. Add a `TranslationProvider` only behind a secure credential boundary.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run check
npm run preview
```

## GitHub Pages deployment

`.github/workflows/deploy-pages.yml` installs, runs all checks, derives Vite's repository base path, and deploys `dist/` on `main`. Set repository **Actions variables**:

- `VITE_SPOTIFY_CLIENT_ID`
- `VITE_SPOTIFY_REDIRECT_URI=https://kingjnu-sakayume.github.io/player2/`

Select **Settings → Pages → Source: GitHub Actions**. Do not use Actions secrets for the client ID merely to imply secrecy—it is necessarily public—but never configure a client secret.

Spotify Development Mode can restrict the app to its owner/allowlisted users, eligible account plans, and current platform quotas. Spotify API responses may also omit unavailable media or fields. ARC handles 401 (expired authorization), 403 (account/app/device restriction), and 429 (rate limit with `Retry-After`) as user-visible states.

## Troubleshooting

- **State mismatch / missing verifier:** restart Connect Spotify in the same tab; do not restore an old callback URL.
- **`INVALID_CLIENT` or redirect mismatch:** copy the URI above exactly into both Spotify Dashboard and `VITE_SPOTIFY_REDIRECT_URI`.
- **Account error / playback forbidden:** verify Premium eligibility and that the account can access the app in Development Mode.
- **Device not ready:** keep the tab open, allow protected content/audio, then use **Use browser device** and click play once.
- **Autoplay blocked:** interact with the page and retry; ARC calls the official SDK activation method during that gesture.
- **No active track:** choose a track in ARC Search or from a real album page.
- **429:** wait for the displayed retry interval; do not repeatedly search.
- **Lyrics unavailable:** LRCLIB may not have synchronized lyrics for that exact recording; playback remains available.
