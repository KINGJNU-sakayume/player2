# ARC Music v7 — Editorial and seed-data specification

## Principle

Spotify/public music metadata and hand-written ARC commentary are different data domains.

Spotify owns facts such as:
- IDs
- names
- artwork
- release dates
- duration
- track sequence

ARC local editorial data owns:
- Artist Editorial Note
- Album Editorial Note
- Song Listening Note
- optional curated/featured release choices

Never inject long editorial prose into Spotify transport models.

## Types

```ts
type EditorialBody = {
  short: string;
  full?: string;
};

type ArtistEditorial = EditorialBody & {
  artistId: string;
  featuredAlbumIds?: string[];
};

type AlbumEditorial = EditorialBody & {
  albumId: string;
};

type SongListeningNote = EditorialBody & {
  trackId: string;
};
```

During initial migration, if Spotify IDs are not yet known, keep an explicit temporary match key:

```ts
type LegacyEditorialMatch = {
  artistName: string;
  albumTitle?: string;
  trackTitle?: string;
  releaseYear?: number;
};
```

Resolve these to stable Spotify IDs as soon as real metadata is available.

## Preview rules

Artist/Album:
- roughly 1 compact paragraph
- visually 2–3 lines at common desktop widths

Song:
- usually 1–2 lines
- a “listening cue”, not a full review

Full drawer:
- may contain multiple paragraphs
- preserve deliberate paragraph breaks
- no markdown-heavy presentation inside the drawer unless later designed

## Seed editorial content

Use the existing v7 reference HTML as the exact initial source for the current Korean short/full notes for:

Artists:
- Vaundy
- Tyler, The Creator
- tripleS

Albums:
- Vaundy — `strobo` (2020)
- Tyler, The Creator — `IGOR` (2019)
- tripleS — `<ASSEMBLE24>` (2024)

Songs with custom Listening Notes:
- `怪獣の花唄`
- `EARFQUAKE`
- `Girls Never Die`

Copy these notes from `reference/music_player_notes_v7_mockup.html` into typed source files during implementation. Do not paraphrase or regenerate them unless the user explicitly requests new writing.

For other songs in the first implementation:
- prefer no Listening Note over auto-generated filler
- do not keep the mockup's generic fallback sentence as production content unless the user specifically wants automatic placeholder notes

## Seed track sequences

The mockup contains real-world track titles for layout testing. Production must fetch actual metadata from Spotify rather than treating these arrays as canonical.

### Vaundy — `strobo`

1. Audio 001
2. 灯火
3. 東京フラッシュ
4. 怪獣の花唄
5. life hack
6. 不可幸力
7. soramimi
8. Audio 002
9. napori
10. 僕は今日も
11. Bye by me

### Tyler, The Creator — `IGOR`

1. IGOR'S THEME
2. EARFQUAKE
3. I THINK
4. EXACTLY WHAT YOU RUN FROM YOU END UP CHASING
5. RUNNING OUT OF TIME
6. NEW MAGIC WAND
7. A BOY IS A GUN*
8. PUPPET
9. WHAT'S GOOD
10. GONE, GONE / THANK YOU
11. I DON'T LOVE YOU ANYMORE
12. ARE WE STILL FRIENDS?

### tripleS — `<ASSEMBLE24>`

1. S
2. Girls Never Die
3. Heart Raider
4. Midnight Flower
5. White Soul Sneakers
6. Chiyu
7. 24
8. Beyond the Beyond
9. Non Scale
10. Dimension

Again: use Spotify's returned duration, track numbering, IDs, availability, artwork, and release metadata in production.

## Lyrics copyright/data rule

The v7 mockup contains non-copyright placeholder lyric text such as “Lyric preview” / “가사 프리뷰”.

Do not replace this by hard-coding copyrighted song lyrics into the repository.

Production lyrics must come through an appropriately licensed/authorized provider or another user-approved source. Until then, keep the mock provider explicitly synthetic.
