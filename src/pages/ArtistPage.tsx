import { Link, useParams } from 'react-router-dom';
import { usePageTitle } from '../app/pageTitle';
import { useSession } from '../app/sessionContext';
import { useArtist, useArtistReleases } from '../catalogue/queries';
import { CoverImage, Portrait } from '../components/CoverImage';
import { NotePreview } from '../components/NotePreview';
import { QuietRow, StateView } from '../components/StateView';
import type { AlbumSummary } from '../domain/types';
import { getAlbumNote, getArtistNote } from '../editorial/lookup';
import { albumTypeLabel, joinArtistNames, pluralise, releaseYear } from '../lib/format';
import { isSpotifyId } from '../lib/spotifyUri';
import { usePlay } from '../playback/hooks';
import { describeSpotifyError, isSpotifyApiError } from '../spotify/errors';
import { detectLineLanguage } from '../translation/languageDetect';

function ReleaseRow({ release }: { release: AlbumSummary }) {
  const play = usePlay();
  const year = releaseYear(release.releaseDate);
  const noted = getAlbumNote({
    id: release.id,
    name: release.name,
    artistNames: release.artists.map((a) => a.name),
    releaseDate: release.releaseDate,
  });
  return (
    <article className="release-card">
      <Link to={`/album/${release.id}`} tabIndex={-1} aria-hidden="true" className="release-cover">
        <CoverImage images={release.images} size={180} alt="" title={release.name} subtitle={joinArtistNames(release.artists)} paletteKey={release.id} />
      </Link>
      <div>
        <div className="label">
          {year ?? '—'} / {albumTypeLabel(release.albumType)}
          {noted && <span className="release-note"> · Editorial note</span>}
        </div>
        <h4 lang={detectLineLanguage(release.name)}>
          <Link className="linkish" to={`/album/${release.id}`}>
            {release.name}
          </Link>
        </h4>
        <div className="release-meta">
          {release.totalTracks !== null && <span>{pluralise(release.totalTracks, 'track')}</span>}
          {release.artists.length > 1 && <span>{joinArtistNames(release.artists)}</span>}
        </div>
      </div>
      <div className="release-actions">
        <button type="button" onClick={() => play({ contextUri: release.uri }, { openNowPlaying: true })}>
          Play
        </button>
        <Link className="release-open" to={`/album/${release.id}`}>
          Open album
        </Link>
      </div>
    </article>
  );
}

function Releases({ artistId }: { artistId: string }) {
  const releases = useArtistReleases(artistId);
  const items = releases.data?.pages.flatMap((p) => p.items) ?? [];
  const total = releases.data?.pages[0]?.total;

  return (
    <section className="artist-grid" aria-labelledby="releases-title">
      <div className="artist-section">
        <h3 id="releases-title">
          Albums{total !== undefined && <span className="section-count">{pluralise(total, 'release')}</span>}
        </h3>
        {releases.isPending ? (
          <QuietRow role="status">Loading releases…</QuietRow>
        ) : releases.isError ? (
          <QuietRow role="alert">{describeSpotifyError(releases.error).body}</QuietRow>
        ) : items.length === 0 ? (
          <QuietRow>Spotify lists no albums or singles for this artist.</QuietRow>
        ) : (
          <>
            {items.map((release) => (
              <ReleaseRow key={release.id} release={release} />
            ))}
            {releases.hasNextPage && (
              <div className="more-row">
                <button type="button" className="plain-action" onClick={() => void releases.fetchNextPage()} disabled={releases.isFetchingNextPage}>
                  {releases.isFetchingNextPage ? 'Loading…' : 'Show more releases'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * The v7 Artist dossier: portrait beside name, origin line and Editorial
 * Note; releases below as restrained horizontal rows.
 */
export function ArtistPage() {
  const { artistId } = useParams();
  const artist = useArtist(artistId);
  const play = usePlay();
  const { mode } = useSession();
  usePageTitle('Artist', artist.data?.name ?? null);

  if (!isSpotifyId(artistId)) {
    return (
      <StateView label="Artist profile" title="Artist unavailable" actions={<Link className="plain-action" to="/library">Library</Link>}>
        <p>This isn’t a valid artist address. Artists open from their Spotify ID.</p>
      </StateView>
    );
  }

  if (artist.isPending) {
    return (
      <StateView label="Artist profile" title="Loading artist…">
        <p>Reading the artist and their releases.</p>
      </StateView>
    );
  }

  if (artist.isError) {
    const notFound = isSpotifyApiError(artist.error) && artist.error.kind === 'not-found';
    const { title, body } = describeSpotifyError(artist.error);
    return (
      <StateView
        label="Artist profile"
        title={title}
        tone={notFound ? 'neutral' : 'alert'}
        actions={
          <>
            {!notFound && (
              <button type="button" className="plain-action" onClick={() => void artist.refetch()}>
                Try again
              </button>
            )}
            <Link className="plain-action" to="/library">
              Library
            </Link>
          </>
        }
      >
        <p>{body}</p>
      </StateView>
    );
  }

  const data = artist.data;
  const note = getArtistNote({ id: data.id, name: data.name });
  // Deprecated Spotify fields are shown only while Spotify still returns them.
  const facts = [
    data.genres.length > 0 ? data.genres.slice(0, 3).join(' / ') : null,
    data.followers !== null ? `${new Intl.NumberFormat('en').format(data.followers)} followers` : null,
  ].filter(Boolean);
  const origin = note?.origin ?? (facts.length > 0 ? facts.join(' · ') : 'Spotify artist');

  return (
    <div className="view active">
      <div className="artist-page">
        <div className="artist-shell">
          <section className="artist-hero">
            <Portrait images={data.images} name={data.name} />
            <div className="artist-copy">
              <div className="artist-number">Artist profile</div>
              <h1 lang={detectLineLanguage(data.name)}>{data.name}</h1>
              <div className="origin">{origin}</div>
              <NotePreview kind="ARTIST" note={note} title={data.name} subtitle={origin} titleLang={detectLineLanguage(data.name)} />
              <div className="object-actions">
                <button type="button" className="plain-action primary" onClick={() => play({ contextUri: data.uri }, { openNowPlaying: true })}>
                  Play artist
                </button>
                {mode === 'spotify' && (
                  <a className="plain-action" href={`https://open.spotify.com/artist/${data.id}`} target="_blank" rel="noopener noreferrer">
                    Open in Spotify<span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </div>
          </section>
          <Releases artistId={data.id} />
        </div>
      </div>
    </div>
  );
}
