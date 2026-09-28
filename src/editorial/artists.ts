import type { ArtistNote } from './types';

/**
 * Artist Editorial Notes — edit freely.
 *
 * `artistIds` come from open.spotify.com/artist/<ID>. `names` lists every name
 * Spotify may display for the artist so a note still matches when the ID
 * differs. Artists without an entry render from Spotify data alone.
 */
export const artistNotes: readonly ArtistNote[] = [
  {
    key: 'vaundy',
    artistIds: ['2IUl3m1H1EQ7QfNbNWvgru'],
    names: ['Vaundy'],
    origin: 'Tokyo, Japan · singer / songwriter / producer',
    short:
      '장르보다 장면을 먼저 떠올리게 하는 음악가. 록, 팝, 소울의 경계를 가볍게 넘나들면서도 곡마다 강한 인상과 즉각적인 멜로디를 남긴다.',
    full: 'Vaundy의 음악은 특정 장르 하나로 정리하기보다 곡마다 다른 장면과 질감을 설계하는 방식으로 들을 때 더 잘 보인다. 기타 중심의 록에서 소울, 전자음악, 팝으로 빠르게 이동하지만 멜로디를 전면에 두는 태도는 비교적 일관적이다.\n\n초기의 곡들은 도시적이고 느슨한 리듬과 거친 질감이 동시에 존재한다. 정교하게 정돈된 스튜디오 팝이라기보다 한 사람이 여러 장르의 언어를 직접 시험해 보는 듯한 인상이 강하며, 그 폭넓음 자체가 아티스트의 캐릭터를 만든다.',
  },
  {
    key: 'tyler',
    artistIds: ['4V8LLVI7PbaPR0K2TGSxFF'],
    names: ['Tyler, The Creator'],
    origin: 'Los Angeles, USA · rapper / producer / visual director',
    short:
      '앨범마다 새로운 인물·색·화법을 만드는 음악가. 프로덕션과 랩, 영상과 패션을 분리하지 않고 하나의 세계로 묶는 방식이 핵심이다.',
    full: 'Tyler, The Creator의 작품은 음악만 떼어 놓기보다 앨범마다 새로 만드는 인물과 시각 언어를 함께 볼 때 구조가 선명해진다. 초기의 공격적인 랩에서 화려한 코드 진행과 소울, 신시사이저 중심의 프로덕션으로 이동하면서도 자신이 직접 세계를 설계한다는 태도는 유지된다.\n\n각 앨범은 하나의 캐릭터와 색채, 복장, 영상 문법을 갖는다. 그래서 디스코그래피는 단순한 음악적 성장이라기보다 서로 다른 페르소나를 통해 같은 감정과 집착을 여러 각도에서 반복해 보는 연작처럼 읽힌다.',
  },
  {
    key: 'triples',
    artistIds: ['5Z71xE9prhpHrqL5thVMyK'],
    names: ['tripleS', '트리플에스'],
    origin: 'Seoul, Korea · idol group / modular pop project',
    short:
      '고정된 한 팀보다 조합과 재구성을 전제로 움직이는 프로젝트. 음악에서도 여러 유닛과 결을 하나의 큰 서사 안에 축적해 가는 방식이 특징이다.',
    full: "tripleS는 멤버와 유닛의 조합 자체를 작품 구조의 일부로 사용하는 프로젝트다. 따라서 한 가지 대표 이미지나 장르로 그룹을 설명하기보다, 여러 시기의 곡과 유닛이 어떻게 서로 다른 방향을 시험하고 다시 전체 그룹으로 모이는지를 보는 편이 적합하다.\n\n음악적으로는 정교한 팝 프로덕션과 비교적 서늘한 질감, 청춘의 지속성과 집단성을 반복해서 사용한다. 많은 멤버와 콘텐츠를 단순히 양으로 보여주기보다 '조합 가능한 하나의 아카이브'로 보는 것이 이 프로젝트의 성격에 가깝다.",
  },
  {
    key: 'kenshi-yonezu',
    artistIds: ['1snhtMLeb2DYoMOcVbb8iB'],
    names: ['Kenshi Yonezu', '米津玄師', '요네즈 켄시'],
    origin: 'Tokushima, Japan · singer-songwriter / producer / illustrator',
    short:
      '보컬로이드 프로듀서 ‘하치’에서 출발해 자신의 목소리로 J-pop의 한가운데에 선 음악가. 곡을 쓰는 손과 그림을 그리는 손이 같다는 점이 음악의 질감에도 그대로 남아 있다.',
    full: '요네즈 켄시는 2009년 무렵 니코니코 동화에서 ‘하치(ハチ)’라는 이름으로 보컬로이드 곡을 발표하며 활동을 시작했고, 2012년 첫 앨범 『diorama』부터 직접 노래하는 싱어송라이터로 방향을 바꾸었다. 작사·작곡·편곡은 물론 앨범 커버의 그림까지 스스로 그리는 경우가 많아, 그의 디스코그래피는 소리와 그림이 한 사람의 손에서 함께 만들어진 작업의 기록처럼 읽힌다.\n\n초기의 빠르고 뒤틀린 보컬로이드식 멜로디는 시간이 지나며 여백이 많은 팝으로 정리되었지만, 기묘한 리듬과 비틀린 화성, 쉽게 해소되지 않는 감정은 여전히 곡의 중심에 있다. 드라마·애니메이션·영화의 주제가로 널리 알려진 곡이 많으면서도, 각 곡이 의뢰받은 작품의 해설에 머물지 않고 그의 세계 안에서 한 번 더 번역된다는 점이 흥미롭다.',
  },
  {
    key: 'coldplay',
    artistIds: ['4gzpq5DPGxSnKTe4SA8HAU'],
    names: ['Coldplay', '콜드플레이'],
    origin: 'London, UK · band / piano-led alternative pop',
    short:
      '피아노와 기타, 크게 따라 부를 수 있는 후렴으로 거대한 공간을 채우는 밴드. 작고 사적인 고백으로 시작한 노래가 수만 명의 합창으로 커지는 과정이 이 밴드의 역사다.',
    full: 'Coldplay는 1990년대 후반 런던에서 크리스 마틴, 조니 버클랜드, 가이 베리먼, 윌 챔피언이 결성한 밴드다. 2000년 데뷔 앨범 『Parachutes』의 조용하고 내성적인 기타 팝에서 출발해, 앨범을 거듭할수록 피아노와 현악, 전자음과 합창을 끌어들이며 점점 더 큰 공간을 전제로 한 음악으로 확장해 왔다.\n\n이 밴드의 곡은 대체로 단순한 코드와 곧게 뻗는 멜로디 위에 세워진다. 그래서 개별 곡의 장식보다 한 곡이 ‘어디까지 커질 수 있는가’를 들어 보는 편이 흥미롭다. 방 안의 고백 같던 목소리가 공연장 전체의 합창으로 바뀌는 순간, Coldplay의 음악은 가장 큰 설득력을 갖는다.',
  },
];
