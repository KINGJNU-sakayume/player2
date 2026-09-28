import type { AlbumNote } from './types';

/**
 * Album Editorial Notes — edit freely.
 *
 * `albumIds` come from open.spotify.com/album/<ID>; list every edition you
 * know of. `titles` is the fallback (with the artist's names and, when both
 * are known, the release year) for editions whose ID is not listed.
 */
export const albumNotes: readonly AlbumNote[] = [
  {
    key: 'strobo',
    artist: 'vaundy',
    albumIds: ['4dKFBa0YCH4636ZtY4L2p7', '6492Fh2wgnINBq0srX9phJ'],
    titles: ['strobo'],
    releaseYear: 2020,
    short:
      '초기 Vaundy의 여러 얼굴을 한 장에 모은 앨범. 도시적인 리듬, 기타의 질감, 즉각적인 멜로디가 빠르게 교차하며 이후 음악의 원형을 보여준다.',
    full: '『strobo』는 한 가지 스타일을 밀어붙이기보다 서로 다른 곡의 개성을 연속해서 보여주는 앨범에 가깝다. 짧은 Audio 트랙 사이로 팝, 록, 소울의 문법이 번갈아 등장하고, 각 곡은 독립적인 싱글처럼 강한 인상을 남긴다.\n\n그럼에도 앨범 전체에는 공통된 속도가 있다. 도쿄의 밤과 개인적인 감정, 느슨한 그루브와 선명한 후렴이 계속 반복되면서 서로 다른 스타일을 하나의 시기 안에 묶는다. 순서대로 들으면 장르의 변화보다 한 아티스트가 자신의 언어를 빠르게 확장해 가는 과정이 더 두드러진다.',
  },
  {
    key: 'igor',
    artist: 'tyler',
    albumIds: ['5zi7WsKlIiUXv09tbGLKsE'],
    titles: ['IGOR'],
    releaseYear: 2019,
    short:
      '관계의 시작과 집착, 질투와 단절을 하나의 흐름으로 엮는다. 개별 곡보다 앨범의 순서와 반복되는 신시사이저·왜곡된 보컬이 만드는 감정선이 중요하다.',
    full: '『IGOR』는 사랑에 빠지는 순간부터 관계가 무너지고, 결국 상대를 놓으려는 지점까지를 하나의 연속된 감정선으로 구성한다. 트랙 사이의 경계가 느슨하고 모티프가 반복되기 때문에 셔플보다 처음부터 끝까지 이어 듣는 방식이 작품의 구조를 더 잘 드러낸다.\n\n거칠게 왜곡된 보컬과 밝고 낭만적인 코드가 동시에 등장한다는 점도 중요하다. 아름다운 화성과 불안정한 음색이 계속 충돌하면서 화자의 감정이 단순한 사랑이나 이별로 정리되지 않게 만든다. 핑크색 표지처럼 표면은 단순하지만 내부는 집착과 자기기만, 체념이 계속 겹쳐지는 앨범이다.',
  },
  {
    key: 'assemble24',
    artist: 'triples',
    albumIds: ['1FEdDqMaOL8oZYzI4n27GM', '3jOqNyGf9Vq9VPOMPRVK1w'],
    titles: ['<ASSEMBLE24>', 'ASSEMBLE24'],
    releaseYear: 2024,
    short:
      '여러 유닛으로 흩어졌던 tripleS가 완전체라는 형식으로 모이는 앨범. 다양한 팝 질감을 유지하면서도 ‘함께 계속 나아간다’는 정서를 중심축으로 둔다.',
    full: "『<ASSEMBLE24>』는 모듈형 그룹이라는 tripleS의 구조를 한 번에 보여주는 앨범이다. 서로 다른 유닛에서 축적된 질감이 한 트랙리스트 안에 모이지만, 앨범은 그 차이를 지우기보다 여러 방향이 동시에 존재하도록 둔다.\n\n중심에는 'Girls Never Die'가 보여주는 지속성과 집단성이 있다. 밝음과 서늘함, 전진감과 회상이 교차하고, 뒤로 갈수록 서로 다른 스타일의 곡들이 하나의 큰 그룹 이미지 안에서 연결된다. 완전체라는 말을 멤버 수의 과시보다 서로 다른 조각이 같은 방향을 바라보는 순간으로 읽게 하는 앨범이다.",
  },
  {
    key: 'assemble',
    artist: 'triples',
    albumIds: ['6ArYgWdHk7mcG4knENgPN5'],
    titles: ['ASSEMBLE', '<ASSEMBLE>'],
    releaseYear: 2023,
    short:
      'tripleS가 처음으로 ‘하나의 그룹’이라는 이름으로 모인 기록. 아직 스물네 명이 모두 모이기 전, 진행 중인 프로젝트의 한 단면을 담은 앨범이다.',
    full: "『ASSEMBLE』은 멤버가 한 명씩 공개되며 합류하던 tripleS가 처음으로 그룹 단위의 앨범을 낸 순간을 담고 있다. 이후 ‘24’라는 숫자로 완성될 프로젝트의 중간 지점이기 때문에, 앨범 전체에 아직 채워지지 않은 자리와 앞으로의 확장을 전제로 한 듯한 여백이 느껴진다.\n\n타이틀곡 'Rising'을 중심으로 밝고 선명한 팝과 조금 더 차분한 곡들이 교차하며, 모듈형 그룹이라는 구조가 음악에서는 어떤 질감으로 나타나는지를 처음 보여 준다. 『<ASSEMBLE24>』와 나란히 들으면 같은 이름 아래에서 그룹이 얼마나 넓어졌는지 비교해 볼 수 있다.",
  },
  {
    key: 'stray-sheep',
    artist: 'kenshi-yonezu',
    albumIds: ['052EiTRYh35MuDVJN9Emdh', '5XuZE4dvsiYEvRndrllt1t'],
    titles: ['STRAY SHEEP'],
    releaseYear: 2020,
    short:
      "'Lemon' 이후 몇 년간의 대표곡이 한 장에 모인 앨범. 서로 다른 작품을 위해 쓰인 곡들이 ‘길 잃은 양’이라는 하나의 이미지 아래 다시 배열된다.",
    full: "『STRAY SHEEP』은 드라마, 애니메이션, 영화, 광고를 위해 쓰인 곡들이 대거 수록된 앨범이다. 'Lemon', '馬と鹿', '感電', '海の幽霊'처럼 이미 각자의 자리가 있던 싱글들이 하나의 트랙리스트 안에서 다시 이어지면서, 개별 타이업의 인상보다 요네즈 켄시라는 작가의 일관된 정서가 더 선명하게 드러난다.\n\n앨범 제목과 같은 뜻의 '迷える羊'가 후반부에 놓여 있는 것도 상징적이다. 상실과 애도, 불안과 들뜸이 교차하는 곡들이 무리에서 떨어진 양처럼 흩어져 있다가, 순서대로 들으면 각자 길을 잃은 사람들을 향한 노래라는 공통의 방향을 갖게 된다. 2020년 여름이라는 발매 시점과 겹쳐 들으면 그 인상은 더 짙어진다.",
  },
  {
    key: 'lost-corner',
    artist: 'kenshi-yonezu',
    albumIds: ['2HfY1kPSmmYfR13OSKYH5T'],
    titles: ['LOST CORNER'],
    releaseYear: 2024,
    short:
      '『STRAY SHEEP』 이후 4년 만의 정규 앨범. 긴 트랙리스트 안에 대규모 타이업 곡과 사적인 소품이 나란히 놓여, 커다란 무대와 작은 방이 한 장 안에 공존한다.',
    full: "『LOST CORNER』는 『STRAY SHEEP』 이후 4년 동안 발표된 싱글과 새 곡을 한데 묶은 앨범이다. 'KICK BACK', '地球儀', 'M八七'처럼 애니메이션·영화와 함께 크게 알려진 곡이 있는가 하면, 제목처럼 ‘잃어버린 구석’에 놓인 듯한 작고 사적인 곡들도 트랙리스트 곳곳에 섞여 있다.\n\n그래서 이 앨범은 대표곡 모음이라기보다 한 사람의 작업실을 천천히 둘러보는 경험에 가깝다. 소음과 과잉으로 밀어붙이는 곡 뒤에 가볍고 느슨한 곡이 이어지고, 그 낙차 덕분에 각 곡의 온도가 더 분명해진다. 커다란 무대 위의 목소리와 방 안에서 흥얼거리는 목소리가 같은 사람의 것이라는 점을 확인하게 되는 앨범이다.",
  },
  {
    key: 'parachutes',
    artist: 'coldplay',
    albumIds: ['6ZG5lRT77aJ3btmArcykra'],
    titles: ['Parachutes'],
    releaseYear: 2000,
    short:
      '데뷔 앨범다운 조심스러움이 매력인 앨범. 어쿠스틱 기타와 여린 팔세토, 비워 둔 공간이 이후의 거대한 사운드와는 전혀 다른 친밀함을 만든다.',
    full: "『Parachutes』는 Coldplay가 아직 경기장이 아니라 작은 방을 상정하고 만든 앨범처럼 들린다. 'Don't Panic'으로 시작해 'Everything's Not Lost'로 끝나는 동안 어쿠스틱 기타, 절제된 드럼, 크리스 마틴의 여린 목소리가 중심을 이루고, 곡 사이의 여백도 넉넉하게 남겨져 있다.\n\n'Yellow'와 'Trouble'처럼 가장 잘 알려진 곡도 과장된 절정보다 조용한 고백에 가깝다. 이후의 앨범들이 더 크고 화려한 사운드로 나아간 것을 알고 들으면, 이 앨범의 소박함은 미숙함이라기보다 밴드의 가장 내밀한 출발점으로 읽힌다.",
  },
  {
    key: 'a-rush-of-blood',
    artist: 'coldplay',
    albumIds: ['0RHX9XECH8IVI3LNgWDpmQ'],
    titles: ['A Rush of Blood to the Head'],
    releaseYear: 2002,
    short:
      "데뷔작의 조용함 위에 피아노와 긴장감을 더한 두 번째 앨범. 'Politik'의 무거운 첫 타격부터 'Amsterdam'의 느린 끝까지, 감정의 진폭이 한층 커졌다.",
    full: "『A Rush of Blood to the Head』는 첫 앨범의 성공 이후 밴드가 스스로에게 더 큰 질문을 던진 앨범이다. 무겁게 내려치는 'Politik'으로 문을 열고, 'The Scientist'와 'Clocks'처럼 피아노가 중심에 선 곡들이 앨범의 뼈대를 이룬다.\n\n곡마다 절박함과 후회, 되돌리고 싶은 마음이 반복되지만 사운드는 오히려 더 단단하고 선명해졌다. 'Clocks'의 쉼 없이 돌아가는 피아노 아르페지오처럼, 멈출 수 없는 감정을 반복되는 패턴으로 표현하는 방식이 앨범 전체의 특징이다. 마지막 곡 'Amsterdam'에서 천천히 고조되는 피아노는 앨범이 쌓아 온 긴장을 조용히 풀어 준다.",
  },
  {
    key: 'viva-la-vida',
    artist: 'coldplay',
    albumIds: ['1CEODgTmTwLyabvwd7HBty', '2Pf1AQbhW6mOIv6fsX6SAb', '71pRFAwHBLrjKYRG7V1Q2o', '6JlhIoegCcjtdbTQbypS8R'],
    titles: ['Viva La Vida or Death and All His Friends', "Viva La Vida (Prospekt's March Edition)"],
    releaseYear: 2008,
    short:
      '브라이언 이노와 함께 밴드의 문법을 바꾼 앨범. 들라크루아의 그림을 표지로 삼은 것처럼, 혁명과 몰락, 삶과 죽음이라는 커다란 주제를 짙은 색채로 그린다.',
    full: '『Viva la Vida or Death and All His Friends』는 브라이언 이노가 프로듀서로 참여하면서 Coldplay가 익숙한 피아노 발라드의 공식을 의도적으로 벗어난 앨범이다. 현악, 종소리, 오르간, 이국적인 리듬이 곡마다 다른 방식으로 쓰이고, 몇몇 곡은 한 트랙 안에서 전혀 다른 곡으로 넘어가는 구성을 취한다.\n\n표지에는 외젠 들라크루아의 『민중을 이끄는 자유의 여신』이 쓰였고, 제목은 프리다 칼로의 그림에서 따왔다. 혁명과 권력, 몰락과 죽음 같은 거대한 주제를 다루지만 앨범은 무겁게 가라앉지 않고, 제목처럼 ‘인생 만세’라는 역설적인 밝음으로 끝까지 밀고 나간다.',
  },
];
