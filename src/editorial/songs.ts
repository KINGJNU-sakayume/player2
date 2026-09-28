import type { SongNote } from './types';

/**
 * Song Listening Notes — edit freely.
 *
 * A listening note is a cue for what to listen for, not a review. `trackIds`
 * come from open.spotify.com/track/<ID>: list the album cut and the single,
 * since the same recording usually has several IDs. `titles` (with the
 * artist's names) is the fallback, so the note also follows the song onto
 * compilations and editions whose IDs are not listed.
 */
export const songNotes: readonly SongNote[] = [
  {
    key: 'kaijuu-no-hanauta',
    artist: 'vaundy',
    trackIds: ['1pCcNaCodPssCc8Aq68gPS'],
    titles: ['怪獣の花唄', 'Kaiju no Hanauta'],
    short:
      '큰 후렴으로 바로 달려가기보다, 벌스에서 리듬과 보컬이 얼마나 억제되어 있는지 들어보면 곡의 상승감이 더 선명해진다.',
    full: '이 곡의 핵심은 후렴 자체의 크기보다 그곳에 도달하기까지 쌓이는 대비에 있다. 벌스에서는 리듬과 보컬이 비교적 가볍게 움직이고, 후렴에 들어서면서 음역과 밀도가 동시에 확장된다.\n\n멜로디가 반복될수록 같은 구절이 조금씩 더 큰 기억처럼 들리는 것도 흥미롭다. 처음에는 단순한 팝 훅으로 들리지만, 곡이 진행될수록 회상과 그리움의 감정이 멜로디에 덧붙는다.',
  },
  {
    key: 'earfquake',
    artist: 'tyler',
    trackIds: ['5hVghJ4KaYES3BFUATCYn0'],
    titles: ['EARFQUAKE'],
    short:
      '부드러운 코드와 불안정한 보컬이 동시에 움직인다. 표면의 달콤함과 화자의 초조함이 어긋나는 지점을 따라가며 들어보면 좋다.',
    full: "'EARFQUAKE'는 매우 부드러운 화성과 멜로디를 사용하지만, 곡 안의 화자는 관계가 무너질까 끊임없이 불안해한다. 이 대비가 『IGOR』 전체의 감정을 압축한다.\n\n보컬의 질감이 매끈하게 정리되지 않고 약간 찌그러진 채 남아 있다는 점도 중요하다. 아름다운 코드 위에 불완전한 목소리를 얹음으로써, 사랑 노래의 안정감보다 매달림과 초조함이 먼저 들리게 한다.",
  },
  {
    key: 'girls-never-die',
    artist: 'triples',
    trackIds: ['0Ol7uhYjodbXAKKarXdn6r', '45OflED18VsURGw2z0Y6Cv'],
    titles: ['Girls Never Die'],
    short:
      '후렴의 전진감뿐 아니라 벌스에서 반복되는 차분한 리듬을 같이 들어보면, ‘계속 나아간다’는 메시지가 과장되지 않고 축적되는 방식이 보인다.',
    full: "'Girls Never Die'는 거대한 선언을 처음부터 밀어붙이기보다 비교적 담담한 벌스에서 출발해 후렴에서 집단적인 에너지를 확장한다. 이 구조 때문에 곡의 메시지가 구호보다 과정처럼 들린다.\n\n여러 목소리가 차례로 등장하고 다시 하나의 후렴으로 모이는 방식은 tripleS라는 프로젝트의 구조와도 잘 맞는다. 한 사람의 극적인 서사보다 여러 목소리가 같은 방향으로 움직이는 감각에 집중해 볼 만하다.",
  },
  {
    key: 'rising',
    artist: 'triples',
    trackIds: ['6QCPweR3aP6nj7P43WpiZs'],
    titles: ['Rising'],
    short:
      '과장된 폭발 대신 담담하게 차오르는 후렴을 가진 곡. 반복될수록 조금씩 넓어지는 멜로디의 폭을 따라가 보면 좋다.',
    full: "'Rising'은 강한 퍼포먼스형 훅보다 서정적인 멜로디와 부드러운 상승감으로 기억되는 곡이다. 발매 직후보다 시간이 지나며 더 많은 사람에게 알려졌다는 점도, 즉각적인 자극보다 반복해서 들을수록 스며드는 곡의 성격과 잘 맞는다.\n\n벌스에서는 비교적 가볍게 흘러가다가 후렴에서 목소리가 겹쳐지며 소리가 한 단계씩 떠오른다. 제목의 ‘떠오른다’는 감각을 극적인 전조나 폭발로 만들기보다 여러 목소리가 조금씩 높이를 맞춰 가는 과정으로 표현한다는 점이, tripleS라는 프로젝트의 방식과도 닮아 있다.",
  },
  {
    key: 'lemon',
    artist: 'kenshi-yonezu',
    trackIds: ['7Cd17G3oNQ34OWUwS8ZxfR', '04TshWXkhV1qkqHzf31Hn6'],
    titles: ['Lemon'],
    short:
      '애도를 다루는 곡이지만 박자는 멈추지 않는다. 슬픔을 안은 채 앞으로 걸어가는 리듬과, 보컬 사이로 짧게 끼어드는 목소리를 따라 들어보면 좋다.',
    full: "'Lemon'은 드라마 『アンナチュラル(언내추럴)』의 주제가로 쓰인 곡으로, 떠난 사람을 오래 붙들고 있는 마음을 다룬다. 그런데 곡은 느린 발라드로 가라앉지 않고 일정한 박자로 계속 걸어간다. 슬픔을 멈춰 선 상태가 아니라, 일상을 살아가는 동안 계속 되돌아오는 감정으로 그리는 방식이다.\n\n현악과 피아노가 넓게 펼쳐지는 사이사이로 짧게 끼어드는 추임새 같은 소리는 매끈하게 정리되지 않은 감정의 흔적처럼 들린다. 아름답게 정돈된 편곡과 설명되지 않는 작은 균열이 함께 있다는 점이 이 곡을 단순한 이별 노래 이상으로 만든다.",
  },
  {
    key: 'kanden',
    artist: 'kenshi-yonezu',
    trackIds: ['6H0PLsSYMzDOqhLgyOlzIj', '5rqSVGsQP2JEc5mPNaFyE1'],
    titles: ['感電', 'Kanden'],
    short:
      '경쾌한 브라스와 튀어 오르는 베이스가 먼저 들리지만, 그 속도가 언제 끊길지 모른다는 초조함을 함께 들으면 곡이 훨씬 위태롭게 들린다.',
    full: "'感電'은 드라마 『MIU404』의 주제가로, 두 형사가 한 팀이 되어 도시를 누비는 이야기의 속도감을 그대로 옮겨 온 듯한 곡이다. 브라스와 베이스가 만드는 탄력 있는 그루브가 곡 전체를 끌고 가고, 보컬은 그 위에서 가볍게 튀어 오르듯 움직인다.\n\n하지만 밝은 표면 아래에는 지금 이 순간의 짜릿함에 매달리는 초조함이 있다. 신나게 달려가는 리듬과 그 속도가 언제 끊길지 모른다는 긴장이 함께 있기 때문에, 곡은 경쾌하면서도 어딘가 위태롭게 들린다. 『STRAY SHEEP』 안에서 몸이 가장 먼저 반응하는 곡이다.",
  },
  {
    key: 'kick-back',
    artist: 'kenshi-yonezu',
    trackIds: ['3khEEPRyBeOUabbmOPJzAG', '7oYCBKvdjrqp5vDbhDBuac'],
    titles: ['KICK BACK'],
    short:
      '몇 초마다 방향을 바꾸는 곡이다. 전개가 뒤집힐 때마다 무엇이 끊기고 무엇이 이어지는지 따라가면, 혼란스러운 구조가 오히려 정교하게 설계되어 있다는 걸 알게 된다.',
    full: "'KICK BACK'은 애니메이션 『체인소 맨』의 오프닝 곡으로, 요네즈 켄시의 곡 가운데서도 가장 과격한 편에 속한다. King Gnu의 츠네타 다이키가 편곡에 참여했고, 드럼과 베이스가 폭주하다가 갑자기 멈추고 전혀 다른 분위기의 구간으로 넘어가는 전개가 쉴 새 없이 이어진다.\n\n이 곡의 재미는 소음과 과잉 속에서도 멜로디가 끝까지 살아 있다는 데 있다. 원하는 것을 손에 넣기 위해 무엇이든 하겠다는 화자의 절박함이 편곡의 폭주와 겹쳐지면서, 혼란 자체가 곡의 메시지가 된다.",
  },
  {
    key: 'yellow',
    artist: 'coldplay',
    trackIds: ['3AJwUDP919kvQ9QcozQPxg'],
    titles: ['Yellow'],
    short:
      '후렴의 기타가 크게 울리는 순간보다, 그 사이사이 목소리가 얼마나 조심스럽게 음을 밀어 올리는지에 집중해 들어보면 좋다.',
    full: "'Yellow'는 Coldplay를 처음 널리 알린 곡으로, 거칠게 긁히는 기타 코드와 여린 팔세토가 강하게 대비된다. 가사는 누군가를 위해 무엇이든 하겠다는 단순한 고백이지만, 목소리는 확신보다 망설임에 가깝게 떨린다.\n\n이 곡에서 ‘노란색’은 구체적인 사물이라기보다 따뜻함과 빛, 동경이 섞인 하나의 감정처럼 쓰인다. 설명되지 않는 색 하나로 모든 감정을 칠해 버리는 듯한 인상이 남는다. 화려한 편곡 없이 밴드의 소리만으로 이만큼의 넓이를 만든다는 점이 초기 Coldplay의 매력이다.",
  },
  {
    key: 'the-scientist',
    artist: 'coldplay',
    trackIds: ['75JFxkI2RXiU7L9VXzMkle', '2LTl1pU074hnzAdy0SpHAb'],
    titles: ['The Scientist'],
    short:
      '처음으로 돌아가고 싶다는 곡이다. 같은 피아노 코드가 반복되는 동안 보컬이 점점 무너졌다가 다시 추스르는 흐름을 따라가 보면 좋다.',
    full: "'The Scientist'는 단순한 피아노 코드의 반복 위에 세워진 발라드다. 무언가를 분석하고 계산하려 했지만 결국 관계를 지키지 못한 화자가 처음으로 돌아가고 싶다고 말하는 곡으로, 제목의 ‘과학자’는 감정을 이해하려다 실패한 사람의 은유처럼 쓰인다.\n\n뮤직비디오가 시간을 거꾸로 되감는 방식으로 만들어진 것도 이 주제와 맞닿아 있다. 후반부에 기타와 드럼이 들어오며 소리가 커지지만, 곡은 끝내 해결되지 않은 채 다시 피아노와 목소리로 돌아온다. 되돌릴 수 없는 것을 되돌리고 싶어 하는 마음이 곡의 구조 자체에 남아 있다.",
  },
  {
    key: 'viva-la-vida',
    artist: 'coldplay',
    trackIds: ['1mea3bSkSGXuIRvnydlB5b', '6WrUT7FOAlDscRWU7ndmyd', '7fcgisGFCr4mfbfNSztr84', '5S6pYZD8WH3OQapDHTDM9M'],
    titles: ['Viva La Vida'],
    short:
      '기타 대신 현악과 팀파니, 종소리가 곡을 끌고 간다. 왕좌에서 내려온 화자의 회상이라는 점을 떠올리며, 끝없이 반복되는 현악의 행진감을 들어보면 좋다.',
    full: "'Viva la Vida'는 한때 세상을 다스렸지만 이제는 모든 것을 잃은 왕의 독백으로 쓰인 곡이다. 쉼 없이 반복되는 현악의 리듬과 팀파니, 종소리가 곡 전체를 행진처럼 끌고 가며, 밴드의 이전 곡들과 달리 기타는 전면에 거의 나서지 않는다.\n\n가사는 몰락을 다루지만 곡의 표면은 밝고 웅장하다. 이 대비 덕분에 곡은 비극이라기보다 무너진 뒤에야 비로소 보이는 것들에 대한 회상처럼 들린다. 공연장에서 관객이 함께 부르는 ‘오-’ 하는 후렴은 한 사람의 몰락을 모두의 노래로 바꿔 놓는다.",
  },
];
