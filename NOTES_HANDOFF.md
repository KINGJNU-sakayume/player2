# player2 노트 작업 인계

2026-10-04. 기존 PR #18과 `codex/notes-complete-tracklists-20261004` 브랜치를 유지한 보수 작업의 실제 상태를 기록한다. 현재 main의 `.claude/skills/translate-lyrics/SKILL.md`를 확인했고, 해당 파일은 수정하지 않았다.

## 실제 완료 범위와 남은 실패

- 아티스트 8개, 앨범 12개, 곡 147개: 총 167개 노트.
- PR #18의 새 Listening Note 66개, 기존 노트 보완, 출처 목록, 표준판 트랙 순서를 유지했다. 가사와 충돌한 해석만 아래 20개 노트에서 수정했다.
- 기존 큐레이션 번역 JSON 76개는 변경하지 않았다. 이번 보수에서 새로 완성한 전문 번역은 **0개**이며, 번역 또는 가사 분류가 미완성인 곡은 **68개**다. PR은 전체 완료 상태가 아니다.
- 확인된 연주곡은 기존의 'Life in Technicolor', 'Audio 001', 'Audio 002' 3개다. 검사 통과를 위해 다른 곡의 언어·연주곡 분류를 바꾸지 않았다.
- 번역 누락에 대한 별도 허용 상태와 테스트·감사 예외를 제거했다. 68개 미완성 곡은 정상 품질 검사에서 실패한다. `PENDING_REVIEW`는 비어 있고 품질 하한은 유지했다.
- 외부에서 취득한 저작권 가사의 전문 번역을 새로 작성할 수 없는 이번 작업의 제약 때문에 번역 자체는 완성하지 못했다. 이를 저장소의 번역 작성 절차나 검사 예외로 만들지 않았다.

## 앨범별 등록 범위

| 아티스트 | 앨범 | 표준판 트랙 | 새 곡 노트 | 번역 미완성 |
| --- | --- | ---: | ---: | ---: |
| Coldplay | [Parachutes](src/editorial/notes/albums/parachutes.md) | 10 | 9 | 9 |
| Coldplay | [A Rush of Blood to the Head](src/editorial/notes/albums/a-rush-of-blood.md) | 11 | 10 | 10 |
| Coldplay | [Viva la Vida or Death and All His Friends](src/editorial/notes/albums/viva-la-vida.md) | 10 | 9 | 8 |
| David Bowie | [The Rise and Fall of Ziggy Stardust and the Spiders from Mars](src/editorial/notes/albums/ziggy-stardust.md) | 11 | 0 | 0 |
| Kenshi Yonezu | [STRAY SHEEP](src/editorial/notes/albums/stray-sheep.md) | 15 | 0 | 0 |
| Kenshi Yonezu | [LOST CORNER](src/editorial/notes/albums/lost-corner.md) | 20 | 19 | 19 |
| NMIXX | [Blue Valentine](src/editorial/notes/albums/blue-valentine.md) | 12 | 0 | 3 |
| The Weeknd | [Starboy](src/editorial/notes/albums/starboy.md) | 18 | 0 | 0 |
| tripleS | [ASSEMBLE](src/editorial/notes/albums/assemble.md) | 7 | 0 | 2 |
| tripleS | [ASSEMBLE24](src/editorial/notes/albums/assemble24.md) | 10 | 9 | 9 |
| Tyler, The Creator | [IGOR](src/editorial/notes/albums/igor.md) | 12 | 0 | 0 |
| Vaundy | [strobo](src/editorial/notes/albums/strobo.md) | 11 | 10 | 8 |

표준판에 합쳐진 구성은 하나의 트랙 노트에서 유지했다. 'Everything’s Not Lost'의 'Life Is for Living', 'Lovers in Japan/Reign of Love', 'Yes'의 'Chinese Sleep Chant', 'Death and All His Friends'의 'The Escapist'를 원래 앨범 녹음에 포함해 확인했다. 디럭스 보너스 트랙은 추가하지 않았다.

## 직접 취득한 원문과 녹음 확인

번역의 입력은 현재 skill에 따라 LRCLIB에서 직접 취득한다. `npm run lyrics:lines`는 저장소의 `NODE_USE_ENV_PROXY=1`과 `https://lrclib.net/api`를 사용한다. 원문은 터미널 및 일시적인 메모리에서만 살폈으며 Markdown·JSON·테스트·문서에 저장하지 않았다. 이 문서에는 가사 대신 녹음 메타데이터와 레코드 ID만 남긴다.

Spotify 표준판 앨범의 트랙 메타데이터에서 대상 녹음과 길이를 확인했다. 아래 LRCLIB 레코드들은 대상 Spotify 트랙과 길이 차이가 ±3초 이내다. 65곡에는 원어의 타이밍 가사가 있었고, 2곡은 일반 텍스트만 있었으며, 1곡은 가사·연주곡 분류가 미확정이다. 출처 확인은 번역 완성을 대신하지 않는다.

- 'Shiver'는 Spotify 표준판의 304.2초 녹음에 맞춰 304초 레코드를 골랐다. 299초 레코드는 제외했다.
- 'Trouble'은 273.426초 녹음에 맞춰 273초 레코드를 골랐다. 270초 레코드는 허용 오차 밖이었다.
- 'Death and All His Friends'는 길이만 맞고 본곡 후반을 지나치게 앞당긴 레코드 대신 실제 후반과 숨은 곡 구간을 나누는 `17820033`을 확인했다.
- NMIXX는 영어판·로마자 업로드와 구별하여 지정된 Blue Valentine 앨범의 한국어·영어 혼합 가사를 선택했다. 한글 아티스트명 검색을 함께 사용했다. `--lang ko`가 영어 후렴이 많은 원래 한국어 가사를 잘못 배제하던 도구는 기존 언어별 줄 비율 검사로 수정했다. 로마자 가사를 통과시키지는 않는다.
- Kenshi Yonezu는 영어 표기 검색에 없는 후보를 `米津玄師`로 검색했다. '地球儀'는 273초 레코드를 선택하고 다른 길이의 업로드를 제외했다.
- 'Tokyo Flash'는 원문 뒤에 영어 번역이 덧붙은 후보 대신 일본어만 있는 `10223881`을 선택했다.
- 'Dimension'은 다른 유닛의 녹음과 잘못된 instrumental 메타데이터를 제외하고 ASSEMBLE24의 198초 레코드를 확인했다. 'White Soul Sneakers'는 다른 앨범 표기를 가진 후보를 제외했다.
- 'Beyond the Beyond'의 `14101042`는 가사 언어와 길이가 맞지만 아티스트·앨범 필드가 불완전하다. 이를 검증된 앨범 메타데이터로 인용하지 않는다. 새 번역 타임라인도 만들지 않았다.
- 'Before the Rise' (`3436989`)와 'S' (`24770820`)에는 원문이 있지만 synced 가사가 없다. 가사 해석은 검토했으며 임의의 타이밍은 만들지 않았다.
- 'おはよう'의 `12794392`, `22561099`는 길이가 맞지만 instrumental 표시와 빈 가사만 있다. 아티스트명만 들어 있던 `12567294`는 가사 근거에서 제외했다. 독립적인 녹음 확인 없이 `lyricsLanguage: instrumental`로 바꾸지 않았다.

## 가사 해석을 수정한 노트

| 곡 키 | 수정한 해석 |
| --- | --- |
| [a-rush-of-blood-to-the-head](src/editorial/notes/songs/a-rush-of-blood-to-the-head.md) | 처음의 인용된 남성 화자와 이후의 직접 고백을 한 화자로 단정하지 않도록 정리했다. |
| [before-the-rise](src/editorial/notes/songs/before-the-rise.md) | 다음 곡을 기다리는 청자라는 추정을 걷고, 자신 있게 나아가려는 화자의 태도를 반영했다. |
| [beyond-the-beyond](src/editorial/notes/songs/beyond-the-beyond.md) | 다른 사람을 판단하는 교훈 대신 꿈·운명·두 세계와 상대에게 함께 넘어가자고 청하는 관계를 반영했다. |
| [boku-wa-kyou-mo](src/editorial/notes/songs/boku-wa-kyou-mo.md) | 부모와 가까운 상대의 기대, 자신이 떠난 뒤에도 음악을 남기려는 말의 구체적인 대상을 반영했다. |
| [bye-by-me](src/editorial/notes/songs/bye-by-me.md) | 단순한 인사 대신 지난날의 기억과 잊어도 된다는 허락을 반영했다. |
| [chiyu](src/editorial/notes/songs/chiyu.md) | 일반적인 공동체 위로 대신 가까운 상대의 눈물, 겨울에서 봄으로 이동하는 장면을 반영했다. |
| [dimension](src/editorial/notes/songs/dimension.md) | 다른 사람과 나누는 세계와 경계를 넘으려는 요청을 반영했다. ASSEMBLE24 재녹음의 편곡 설명은 유지했다. |
| [high-speed](src/editorial/notes/songs/high-speed.md) | 경쟁이나 외부 평가라는 추정을 줄이고, 통제·신뢰·움직임을 멈추려는 요청에 초점을 맞췄다. |
| [life-hack](src/editorial/notes/songs/life-hack.md) | 효율에 대한 독백이라는 해석을 줄이고, 가까운 관계의 불안과 자기 수용을 반영했다. |
| [non-scale](src/editorial/notes/songs/non-scale.md) | 일반적인 자기 평가 대신 측정할 수 없는 사랑과 가까운 상대를 향한 위로를 반영했다. |
| [ohayou](src/editorial/notes/songs/ohayou.md) | 잘못된 LRCLIB 업로드에 기대어 실제 가사로 단정했던 부분을 삭제했다. 제목의 인사말과 앨범 끝의 역할만 구별해 해석했다. |
| [parachutes](src/editorial/notes/songs/parachutes.md) | 빛과 어둠의 대비라는 추정을 줄이고, 폭풍과 흐릿한 공간 속에서 사랑하고 기다리는 화자의 태도를 반영했다. |
| [politik](src/editorial/notes/songs/politik.md) | 귀를 달라는 잘못된 설명을 수정하고, 상대에게 눈을 뜨고 생각을 말해 달라는 요청과 시간·신뢰·사랑의 관계를 반영했다. |
| [s](src/editorial/notes/songs/s.md) | 짧은 제목만으로 추정한 의미 대신 함께 다시 시작하자는 집단적 호명을 반영했다. |
| [soramimi](src/editorial/notes/songs/soramimi.md) | 뜻 없는 음절 중심이라는 해석을 줄이고, 상대의 거절·육체적 욕망·냉소와 소리의 유희를 함께 반영했다. |
| [spies](src/editorial/notes/songs/spies.md) | 마지막 후렴에서 두려움이 안도로, 위해를 가할 수 있는 주체가 반대로 바뀌는 점을 반영했다. |
| [tomare-miyo](src/editorial/notes/songs/tomare-miyo.md) | 추상적인 혼잣말 대신 목적지를 지나쳐 가는 여행과 대화의 상황을 반영했다. |
| [tsuki-wo-miteita](src/editorial/notes/songs/tsuki-wo-miteita.md) | 두 사람이 동시에 같은 달을 본다는 추정을 줄이고, 상대의 기억과 불·폭풍·재회의 장면을 반영했다. |
| [warning-sign](src/editorial/notes/songs/warning-sign.md) | 결말의 귀환을 제외했던 설명을 수정하고, 놓친 신호에 대한 후회와 상대에게 돌아가는 움직임을 반영했다. |
| [white-soul-sneakers](src/editorial/notes/songs/white-soul-sneakers.md) | 가벼운 춤의 기분만으로 설명하지 않고, 상처를 안고 버티는 태도와 규칙에 맞서는 움직임을 반영했다. |

편곡·보컬 질감·프로덕션·앨범 순서에 관한 기존 문단은 가사와 충돌하지 않는 한 유지했다. 나머지 원문을 얻은 곡에서도 기존 노트의 가사 해석을 비교하고 LRCLIB 출처 링크를 추가했다. 'おはよう'는 가사를 확인했다는 식의 설명을 남기지 않았다.

## 정상 품질 검사에서 실패하는 곡

다음 표는 허용 목록이 아니라 실제 미완성 상태의 기록이다. 새 번역에는 문맥에 맞는 `translation:` 브리프, 150자 이상의 `## 번역에 대하여`, 올바른 녹음의 `.translation.json`이 모두 필요하다. 이미 한국어인 줄에는 새 번역 segment를 만들지 않는다.

| 앨범 | 곡 키 | 원어 | Spotify 길이(초) | LRCLIB ID | 확보한 자료 |
| --- | --- | --- | ---: | --- | --- |
| Parachutes | [dont-panic](src/editorial/notes/songs/dont-panic.md) | 영어 | 136.866 | 3456773 | 타이밍 원문 |
| Parachutes | [shiver](src/editorial/notes/songs/shiver.md) | 영어 | 304.200 | 15801 | 타이밍 원문 |
| Parachutes | [spies](src/editorial/notes/songs/spies.md) | 영어 | 318.773 | 15888 | 타이밍 원문 |
| Parachutes | [sparks](src/editorial/notes/songs/sparks.md) | 영어 | 227.093 | 309186 | 타이밍 원문 |
| Parachutes | [trouble](src/editorial/notes/songs/trouble.md) | 영어 | 273.426 | 16114 | 타이밍 원문 |
| Parachutes | [parachutes](src/editorial/notes/songs/parachutes.md) | 영어 | 46.200 | 14435 | 타이밍 원문 |
| Parachutes | [high-speed](src/editorial/notes/songs/high-speed.md) | 영어 | 256.466 | 13797 | 타이밍 원문 |
| Parachutes | [we-never-change](src/editorial/notes/songs/we-never-change.md) | 영어 | 249.400 | 314359 | 타이밍 원문 |
| Parachutes | [everythings-not-lost](src/editorial/notes/songs/everythings-not-lost.md) | 영어 | 436.440 | 13601 | 타이밍 원문 |
| A Rush of Blood to the Head | [politik](src/editorial/notes/songs/politik.md) | 영어 | 318.626 | 14466 | 타이밍 원문 |
| A Rush of Blood to the Head | [in-my-place](src/editorial/notes/songs/in-my-place.md) | 영어 | 226.680 | 13920 | 타이밍 원문 |
| A Rush of Blood to the Head | [god-put-a-smile-upon-your-face](src/editorial/notes/songs/god-put-a-smile-upon-your-face.md) | 영어 | 297.306 | 13713 | 타이밍 원문 |
| A Rush of Blood to the Head | [clocks](src/editorial/notes/songs/clocks.md) | 영어 | 307.879 | 13450 | 타이밍 원문 |
| A Rush of Blood to the Head | [daylight](src/editorial/notes/songs/daylight.md) | 영어 | 327.800 | 13510 | 타이밍 원문 |
| A Rush of Blood to the Head | [green-eyes](src/editorial/notes/songs/green-eyes.md) | 영어 | 223.040 | 13741 | 타이밍 원문 |
| A Rush of Blood to the Head | [warning-sign](src/editorial/notes/songs/warning-sign.md) | 영어 | 331.133 | 16180 | 타이밍 원문 |
| A Rush of Blood to the Head | [a-whisper](src/editorial/notes/songs/a-whisper.md) | 영어 | 238.333 | 13200 | 타이밍 원문 |
| A Rush of Blood to the Head | [a-rush-of-blood-to-the-head](src/editorial/notes/songs/a-rush-of-blood-to-the-head.md) | 영어 | 351.400 | 13198 | 타이밍 원문 |
| A Rush of Blood to the Head | [amsterdam](src/editorial/notes/songs/amsterdam.md) | 영어 | 319.360 | 13249 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [cemeteries-of-london](src/editorial/notes/songs/cemeteries-of-london.md) | 영어 | 201.106 | 13428 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [lost](src/editorial/notes/songs/lost.md) | 영어 | 236.213 | 14127 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [42](src/editorial/notes/songs/42.md) | 영어 | 237.400 | 13167 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [lovers-in-japan-reign-of-love](src/editorial/notes/songs/lovers-in-japan-reign-of-love.md) | 영어 | 411.013 | 1049006 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [yes](src/editorial/notes/songs/yes.md) | 영어 | 426.653 | 16237 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [violet-hill](src/editorial/notes/songs/violet-hill.md) | 영어 | 222.653 | 16158 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [strawberry-swing](src/editorial/notes/songs/strawberry-swing.md) | 영어 | 249.666 | 15916 | 타이밍 원문 |
| Viva La Vida or Death and All His Friends | [death-and-all-his-friends](src/editorial/notes/songs/death-and-all-his-friends.md) | 영어 | 378.853 | 17820033 | 타이밍 원문 |
| LOST CORNER | [red-out](src/editorial/notes/songs/red-out.md) | 일본어 | 151.626 | 11746031 | 타이밍 원문 |
| LOST CORNER | [margherita](src/editorial/notes/songs/margherita.md) | 일본어 | 183.120 | 12414227 | 타이밍 원문 |
| LOST CORNER | [pop-song](src/editorial/notes/songs/pop-song.md) | 일본어 | 199.160 | 11929497 | 타이밍 원문 |
| LOST CORNER | [shinigami](src/editorial/notes/songs/shinigami.md) | 일본어 | 180.973 | 12206559 | 타이밍 원문 |
| LOST CORNER | [mainichi](src/editorial/notes/songs/mainichi.md) | 일본어 | 182.253 | 13504285 | 타이밍 원문 |
| LOST CORNER | [lady](src/editorial/notes/songs/lady.md) | 일본어 | 208.106 | 11929499 | 타이밍 원문 |
| LOST CORNER | [yumeutsutsu](src/editorial/notes/songs/yumeutsutsu.md) | 일본어 | 305.106 | 14452926 | 타이밍 원문 |
| LOST CORNER | [sayonara-mata-itsuka](src/editorial/notes/songs/sayonara-mata-itsuka.md) | 일본어 | 201.280 | 32191339 | 타이밍 원문 |
| LOST CORNER | [tomare-miyo](src/editorial/notes/songs/tomare-miyo.md) | 일본어 | 170.640 | 13504283 | 타이밍 원문 |
| LOST CORNER | [lens-flare](src/editorial/notes/songs/lens-flare.md) | 일본어 | 174.906 | 11731980 | 타이밍 원문 |
| LOST CORNER | [tsuki-wo-miteita](src/editorial/notes/songs/tsuki-wo-miteita.md) | 일본어 | 253.280 | 13504284 | 타이밍 원문 |
| LOST CORNER | [m87](src/editorial/notes/songs/m87.md) | 일본어 | 263.160 | 13504276 | 타이밍 원문 |
| LOST CORNER | [pale-blue](src/editorial/notes/songs/pale-blue.md) | 일본어 | 297.213 | 11929515 | 타이밍 원문 |
| LOST CORNER | [garakuta](src/editorial/notes/songs/garakuta.md) | 일본어 | 237.600 | 14452820 | 타이밍 원문 |
| LOST CORNER | [yellow-ghost](src/editorial/notes/songs/yellow-ghost.md) | 일본어 | 172.520 | 11732077 | 타이밍 원문 |
| LOST CORNER | [post-human](src/editorial/notes/songs/post-human.md) | 일본어 | 244.773 | 11732088 | 타이밍 원문 |
| LOST CORNER | [chikyugi](src/editorial/notes/songs/chikyugi.md) | 일본어 | 274.600 | 3069994 | 타이밍 원문 |
| LOST CORNER | [lost-corner](src/editorial/notes/songs/lost-corner.md) | 일본어 | 223.213 | 11732129 | 타이밍 원문 |
| LOST CORNER | [ohayou](src/editorial/notes/songs/ohayou.md) | 미확정 | 140.360 | 12794392, 22561099 | 가사·연주곡 분류 미확정 |
| Blue Valentine | [blue-valentine](src/editorial/notes/songs/blue-valentine.md) | 한국어·영어 | 186.000 | 38111968 | 타이밍 원문 |
| Blue Valentine | [crush-on-you](src/editorial/notes/songs/crush-on-you.md) | 한국어·영어 | 159.000 | 24453590 | 타이밍 원문 |
| Blue Valentine | [adore-u](src/editorial/notes/songs/adore-u.md) | 한국어·영어 | 150.000 | 24453589 | 타이밍 원문 |
| ASSEMBLE | [before-the-rise](src/editorial/notes/songs/before-the-rise.md) | 한국어·영어 | 53.373 | 3436989 | 일반 텍스트만 있음 |
| ASSEMBLE | [chowall](src/editorial/notes/songs/chowall.md) | 한국어·영어 | 63.026 | 4745603 | 타이밍 원문 |
| <ASSEMBLE24> | [s](src/editorial/notes/songs/s.md) | 한국어·영어 | 73.266 | 24770820 | 일반 텍스트만 있음 |
| <ASSEMBLE24> | [heart-raider](src/editorial/notes/songs/heart-raider.md) | 한국어·영어 | 179.533 | 23718089 | 타이밍 원문 |
| <ASSEMBLE24> | [midnight-flower](src/editorial/notes/songs/midnight-flower.md) | 한국어·영어 | 166.880 | 38215774 | 타이밍 원문 |
| <ASSEMBLE24> | [white-soul-sneakers](src/editorial/notes/songs/white-soul-sneakers.md) | 한국어·영어 | 183.280 | 14045929 | 타이밍 원문 |
| <ASSEMBLE24> | [chiyu](src/editorial/notes/songs/chiyu.md) | 한국어·영어 | 170.186 | 24547834 | 타이밍 원문 |
| <ASSEMBLE24> | [24](src/editorial/notes/songs/24.md) | 한국어·영어 | 153.373 | 35370986 | 타이밍 원문 |
| <ASSEMBLE24> | [beyond-the-beyond](src/editorial/notes/songs/beyond-the-beyond.md) | 한국어·영어 | 182.293 | 14101042 | 타이밍 원문 |
| <ASSEMBLE24> | [non-scale](src/editorial/notes/songs/non-scale.md) | 한국어·영어 | 206.226 | 14046183 | 타이밍 원문 |
| <ASSEMBLE24> | [dimension](src/editorial/notes/songs/dimension.md) | 한국어·영어 | 197.333 | 34894328 | 타이밍 원문 |
| strobo | [tomoshibi](src/editorial/notes/songs/tomoshibi.md) | 일본어 | 178.891 | 1408288 | 타이밍 원문 |
| strobo | [tokyo-flash](src/editorial/notes/songs/tokyo-flash.md) | 일본어 | 258.857 | 10223881 | 타이밍 원문 |
| strobo | [life-hack](src/editorial/notes/songs/life-hack.md) | 일본어 | 226.442 | 1407912 | 타이밍 원문 |
| strobo | [fukakouryoku](src/editorial/notes/songs/fukakouryoku.md) | 일본어 | 200.241 | 1408136 | 타이밍 원문 |
| strobo | [soramimi](src/editorial/notes/songs/soramimi.md) | 일본어 | 213.444 | 1407942 | 타이밍 원문 |
| strobo | [napori](src/editorial/notes/songs/napori.md) | 일본어 | 203.785 | 1407932 | 타이밍 원문 |
| strobo | [boku-wa-kyou-mo](src/editorial/notes/songs/boku-wa-kyou-mo.md) | 일본어 | 327.546 | 2734181 | 타이밍 원문 |
| strobo | [bye-by-me](src/editorial/notes/songs/bye-by-me.md) | 일본어 | 242.414 | 1405452 | 타이밍 원문 |

## 검증

- `npm run notes:audit`: 총 167개 중 99개 통과, 일반 검토 예외 0개, 68개 품질 미달. 종료 코드 1. 68개의 실패 사유는 모두 큐레이션 번역 누락이다.
- 표준판 147개 트랙의 곡 노트 연결, 중복 키와 아티스트 연결을 확인했다.
- 기존 번역 JSON 76개는 변경하지 않았다. 원문 또는 번역 저장 형식도 바꾸지 않았다.
- 번역 검사 도구는 노트의 목표 언어와 같은 줄에 segment를 요구하지 않도록 수정했다. 외국어 줄의 누락, 타이밍 시작점, LRCLIB ID와 길이 검사는 유지한다. 실제 가사 대신 직접 만든 검사 문장으로 회귀 테스트를 추가했다.
- 기존 76곡에 `npm run lyrics:lines -- --check <song-key>`를 각각 실행했다. 62곡 통과, 14곡 실패. 실패에는 영어로 판정된 한국어·영어 혼합 줄, 영어 문장, 감탄사 등 덮이지 않은 줄이 포함된다. 한국어 줄을 제외한 뒤에도 남은 실제 결과이며 검사 규칙을 더 완화하지 않았다. 기존 번역 JSON은 수정하지 않았으므로 다음 곡의 커버리지 실패는 해결되지 않았다: `beam`, `colorful`, `game-face`, `girls-never-die`, `new-look`, `o-o-part-1-baila`, `o-o-part-2-superhero`, `phoenix`, `podium`, `rico`, `rising`, `shape-of-love`, `spinnin-on-it`, `the-baddest`.
- `npm run check`: 타입 검사와 린트 통과. 테스트 452개 중 384개 통과, 68개 실패. 종료 코드 1. 실패는 모두 정상 품질 검사의 번역 누락이며, 이후 빌드 단계는 실행되지 않았다.
- 프로덕션 빌드를 별도로 실행해 통과했다. 기존 500 kB 초과 청크 경고는 남는다.
- `git diff --check`: 통과. main 대비 추가된 내용과 68곡의 LRCLIB 원문을 대조한 검사에서 원문 줄 혼입 0건을 확인했고 변경 문단을 직접 검토했다. LRCLIB 원문은 저장소 밖에도 가사 파일로 저장하지 않았다.

main 병합·배포·UI·재생·SDK 변경은 실행하지 않았다. 기존 PR #18의 브랜치를 계속 사용한다.
