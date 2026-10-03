# Legacy curated lyric translations

> New curated work belongs in `src/lyrics/curated/`, where each validated
> object keeps its synchronized timestamp, original text, and Korean
> translation together. Complete local packages are resolved before LRCLIB
> and never use machine translation.

This directory is retained as a migration-safe compatibility archive for songs
that have not yet been converted. Its hash matching and partial machine fallback
apply only to those legacy files; do not author new translations here.

One JSON file per song: `<artist-key>/<song-key>.json` (for example `kenshi-yonezu/lemon.json`). Each file holds a
**translation brief** — speaker, addressee, relationship, the Korean speech level kept throughout and why — and the
translated lines, keyed by a hash of the original line.

**Original lyrics never go in this directory** (or anywhere else in the repository). The app loads the original lines
from LRCLIB at runtime and matches them to the translations by hash; lines a file does not cover fall back to machine
translation.

- Schema: [`src/translation/curated/types.ts`](../translation/curated/types.ts), validated by
  [`parse.ts`](../translation/curated/parse.ts) during `npm run test:run`.
- Workflow: [`.claude/skills/translate-lyrics/SKILL.md`](../../.claude/skills/translate-lyrics/SKILL.md) and
  `npm run lyrics:lines` ([`scripts/lyrics-lines.ts`](../../scripts/lyrics-lines.ts)).
