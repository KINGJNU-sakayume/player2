import type { AlbumWithTracks, SeedArtist, TrackIdentity } from './types';

const coverVaundy = 'https://i.scdn.co/image/ab67616d00001e02c8d4e8e5d8c3829163f12ff3';
const coverIgor = 'https://i.scdn.co/image/ab67616d00001e0230a635de2bb0caa4e26f6abb';
const coverAssemble = 'https://i.scdn.co/image/ab67616d00001e024b9eb26603f674ec91dcd545';

const track = (
  album: Omit<AlbumWithTracks, 'tracks'>,
  artists: SeedArtist[],
  title: string,
  durationSeconds: number,
  trackNumber: number,
): TrackIdentity => ({
  id: `${album.id}:${trackNumber}`,
  title,
  artists: artists.map(({ id, name, imageUrl, genres, origin, role, accent }) => ({ id, name, imageUrl, genres, origin, role, accent })),
  album,
  trackNumber,
  discNumber: 1,
  durationMs: durationSeconds * 1000,
  language: album.language,
});

const baseArtists: Record<string, SeedArtist> = {
  vaundy: {
    id: 'vaundy',
    name: 'Vaundy',
    monogram: 'V',
    origin: 'Tokyo, Japan',
    role: 'singer / songwriter / producer',
    accent: '#b91f2e',
    releases: [],
  },
  tyler: {
    id: 'tyler',
    name: 'Tyler, The Creator',
    monogram: 'T',
    origin: 'Los Angeles, USA',
    role: 'rapper / producer / visual director',
    accent: '#d88fae',
    releases: [],
  },
  triples: {
    id: 'triples',
    name: 'tripleS',
    monogram: 'S',
    origin: 'Seoul, Korea',
    role: 'idol group / modular pop project',
    accent: '#e76046',
    releases: [],
  },
};

const stroboBase: Omit<AlbumWithTracks, 'tracks'> = {
  id: 'strobo',
  name: 'strobo',
  artistIds: ['vaundy'],
  artistNames: ['Vaundy'],
  imageUrl: coverVaundy,
  releaseDate: '2020',
  albumType: 'Album',
  totalTracks: 11,
  language: 'Japanese',
  lang: 'ja',
};
const igorBase: Omit<AlbumWithTracks, 'tracks'> = {
  id: 'igor',
  name: 'IGOR',
  artistIds: ['tyler'],
  artistNames: ['Tyler, The Creator'],
  imageUrl: coverIgor,
  releaseDate: '2019',
  albumType: 'Album',
  totalTracks: 12,
  language: 'English',
  lang: 'en',
};
const assembleBase: Omit<AlbumWithTracks, 'tracks'> = {
  id: 'assemble24',
  name: '<ASSEMBLE24>',
  artistIds: ['triples'],
  artistNames: ['tripleS'],
  imageUrl: coverAssemble,
  releaseDate: '2024',
  albumType: 'Album',
  totalTracks: 10,
  language: 'Korean',
  lang: 'ko',
};

const vaundy = baseArtists.vaundy;
const tyler = baseArtists.tyler;
const triples = baseArtists.triples;

const strobo: AlbumWithTracks = {
  ...stroboBase,
  tracks: [
    ['Audio 001', 23], ['灯火', 178], ['東京フラッシュ', 258], ['怪獣の花唄', 224], ['life hack', 226],
    ['不可幸力', 200], ['soramimi', 213], ['Audio 002', 68], ['napori', 203], ['僕は今日も', 327], ['Bye by me', 242],
  ].map(([title, seconds], index) => track(stroboBase, [vaundy], String(title), Number(seconds), index + 1)),
};

const igor: AlbumWithTracks = {
  ...igorBase,
  tracks: [
    ["IGOR'S THEME", 200], ['EARFQUAKE', 190], ['I THINK', 212], ['EXACTLY WHAT YOU RUN FROM YOU END UP CHASING', 14],
    ['RUNNING OUT OF TIME', 177], ['NEW MAGIC WAND', 195], ['A BOY IS A GUN*', 210], ['PUPPET', 179],
    ["WHAT'S GOOD", 205], ['GONE, GONE / THANK YOU', 375], ["I DON'T LOVE YOU ANYMORE", 161], ['ARE WE STILL FRIENDS?', 265],
  ].map(([title, seconds], index) => track(igorBase, [tyler], String(title), Number(seconds), index + 1)),
};

const assemble24: AlbumWithTracks = {
  ...assembleBase,
  tracks: [
    ['S', 73], ['Girls Never Die', 187], ['Heart Raider', 179], ['Midnight Flower', 166], ['White Soul Sneakers', 183],
    ['Chiyu', 170], ['24', 153], ['Beyond the Beyond', 182], ['Non Scale', 206], ['Dimension', 197],
  ].map(([title, seconds], index) => track(assembleBase, [triples], String(title), Number(seconds), index + 1)),
};

vaundy.releases = [strobo];
tyler.releases = [igor];
triples.releases = [assemble24];

export const seedArtists: SeedArtist[] = [vaundy, tyler, triples];
export const seedAlbums: AlbumWithTracks[] = [strobo, igor, assemble24];

export const defaultSeedTrack = strobo.tracks[3];

export const findSeedArtist = (id: string) => seedArtists.find((artist) => artist.id === id);
export const findSeedAlbum = (id: string) => seedAlbums.find((album) => album.id === id);
export const findSeedTrack = (albumId: string, trackId: string) => findSeedAlbum(albumId)?.tracks.find((item) => item.id === trackId);
