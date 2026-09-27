# ARC Music v7

ARC Music is a restrained personal music archive/player built from the ARC v7 specification supplied with this implementation. It has three primary surfaces—**Now Playing**, **Artist**, and **Album**—plus one shared editorial/listening-note drawer. It deliberately does **not** include the superseded Catalogue/Specimen modes or a persistent bottom playback bar.

## Stack

- React + TypeScript + Vite
- React Router with hash routing (robust on GitHub Pages refreshes)
- Spotify Authorization Code with PKCE
- Spotify Web Playback SDK for authoritative browser playback state
- Spotify Web API for artist/album metadata and playback requests
- Source-controlled ARC editorial notes
- Replaceable lyrics/translation provider interfaces; the included providers are synthetic development mocks only
- Vitest pure/domain tests
- GitHub Actions → GitHub Pages

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and set VITE_SPOTIFY_CLIENT_ID
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`.

The app is also usable without a Spotify Client ID as an archive/design preview. In that mode, the three seeded subjects can be browsed but playback controls are disabled; there is no fake independent playback timer.

## Spotify developer app setup

Create a Spotify developer application with Web API / Web Playback SDK access and use the **Authorization Code with PKCE** flow. This frontend never needs or accepts a Spotify client secret.

Register redirect URIs **exactly**:

- Local development: `http://127.0.0.1:5173/`
- GitHub Pages production: `https://kingjnu-sakayume.github.io/player2/`

If the repository owner/name changes, update the registered production redirect URI to match the deployed Pages URL exactly.

### Environment variable

```text
VITE_SPOTIFY_CLIENT_ID=<public Spotify client id>
```

For GitHub Actions, create a repository Actions **Variable** named `VITE_SPOTIFY_CLIENT_ID`. Do not put a client secret, access token, refresh token, or private provider key in the repository or a `VITE_` variable.

## Playback behavior

When Spotify is connected, the app loads the Web Playback SDK and creates an `ARC Music Browser` Spotify Connect device. The Now Playing transport is the only visible transport in the product and exposes:

- previous
- play/pause
- next
- seek/progress
- current and total time

The progress display interpolates from the latest authoritative SDK snapshot and resets whenever Spotify reports new state. Route changes do not unmount the playback provider, so playback state survives navigation.

Spotify Web Playback SDK streaming requires an eligible Spotify Premium account. Account/device/SDK errors are treated as designed UI states. If the browser device is ready, **Settings → Use browser device** transfers the current Spotify session to it without auto-starting a new track.

## Archive/demo data

The local archive seeds the v7 reference subjects:

- Vaundy — `strobo`
- Tyler, The Creator — `IGOR`
- tripleS — `<ASSEMBLE24>`

The track arrays exist only for the archive preview. Once a Spotify entity is opened through a real Spotify ID, its metadata and complete album track sequence are fetched from Spotify.

## Editorial notes

ARC editorial writing is intentionally separate from Spotify transport models.

Edit:

- Artist Editorial Notes: `src/editorial/data.ts` → `artistEditorial`
- Album Editorial Notes: `src/editorial/data.ts` → `albumEditorial`
- Song Listening Notes: `src/editorial/data.ts` → `songEditorial`

Only the seeded entities show notes. Missing notes are omitted rather than filled with generated prose.

## Lyrics and translation

Spotify is not assumed to supply the synchronized lyrics required by the v7 layout. Provider boundaries live in:

- `src/lyrics/types.ts`
- `src/lyrics/MockLyricsProvider.ts`
- `src/translation/TranslationProvider.ts`
- `src/translation/MockTranslationProvider.ts`

The current providers return clearly synthetic, non-copyright development text. To use a licensed lyrics service, implement `LyricsProvider`; if a translation service is used, implement `TranslationProvider`. Providers requiring a private API key must run behind a backend/serverless boundary—never expose the secret in GitHub Pages frontend code.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run check
```

`npm run check` is what the Pages workflow runs before deployment.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys `dist/` on every push to `main`. The Vite base path is derived from `GITHUB_REPOSITORY`, while hash routing keeps application routes stable under `/player2/`.

In GitHub repository settings, ensure **Pages → Build and deployment → Source** is set to **GitHub Actions**.

## Known limitations

- Spotify playback depends on Spotify account eligibility/Premium and browser support.
- Seed archive tracks intentionally do not embed hard-coded Spotify track URIs; they are browsing/design data. Real Spotify album tracks can request playback because the API supplies their URIs.
- The included lyrics and translations are synthetic placeholders, not production lyric data.
- Artist origin/role metadata exists only for the local editorial subjects; arbitrary Spotify artists use Spotify metadata such as images/genres.
