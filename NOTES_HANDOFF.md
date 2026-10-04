# player2 노트 작업 인계

2026-10-04 작성. PR #17의 기존 노트 보완 이후, 빠진 표준판 수록곡 66개의 감상 노트를 추가한 현재 상태를 기록한다. 최신 main의 `NOTES_HANDOFF.md`에 정의된 수록곡 키와 기준을 따르고, 이미 검토된 기존 노트 본문은 유지한다.

## 현재 상태

- 아티스트 8개, 앨범 12개, 곡 147개: 총 167개 노트.
- 12개 앨범의 `tracks:`에 표준판 전곡 147개를 원래 순서로 연결했다. 모든 키는 실제 곡 노트에 연결되며 중복이 없다.
- 기존 78개 노트 보완은 main에 반영된 PR #17의 내용을 유지했다. 이번 PR은 미등록 수록곡을 채우고 기존 미번역 곡 5개를 별도 대기로 옮겨 `PENDING_REVIEW`를 비웠다.
- 빠진 곡 노트 66개를 추가했다. 새 곡 감상 본문은 4문단이며 기존 600자·3문단·출처 2개 이상의 기준을 적용했다.
- 전체 기준 통과 99개, **전문 번역만 대기 68개**. 번역이 필요한 곡 전체가 완료된 상태는 아니다.
- 기존 76개 `.translation.json`의 번역 문장과 타임라인은 변경하지 않았다. 기존 번역 브리프와 해설도 최신 main의 내용을 유지했다.

## 앨범별 등록 범위

| 아티스트 | 앨범 | 표준판 트랙 | 새 곡 노트 | 번역 대기 |
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

표준판에 합쳐진 구성은 하나의 트랙 노트에서 다뤘다. 『Parachutes』의 마지막 트랙에는 'Life Is for Living', 『Viva la Vida』에는 'Lovers in Japan/Reign of Love', 'Yes' 뒤의 'Chinese Sleep Chant', 마지막 트랙 뒤의 'The Escapist'를 포함했다. 디럭스 보너스 트랙은 이번 범위에 추가하지 않았다.

## 번역 대기 처리

새로 찾은 저작권 가사의 전문 번역은 사용자에게서 원문을 제공받은 뒤 작업한다. 원문이 없는 상태에서 완성 번역이나 타임라인을 만들어 등록하지 않았다. 기존 미번역 5곡과 새 미번역 63곡은 `src/editorial/quality.ts`의 `PENDING_TRANSLATION`에 명시했다.

이 목록은 감상 본문 품질 기준의 예외가 아니다. `auditSong`은 번역 누락을 계속 문제로 반환하고, `isTranslationPending`은 **번역 누락 하나만 있는 등록 곡**에 한해 대기 상태를 표시한다. 본문·문단·출처·금지 표현 문제가 추가되면 검사에 실패한다. 번역을 추가하면 대기 목록에서도 삭제해야 한다.

한국어만 있는 곡이나 연주곡인 척 표시해 검사를 통과시키지 않는다. 새 연주곡 표시는 'Life in Technicolor', 'Audio 001', 'Audio 002'에만 사용했다. 'Before the Rise', '초월', 'おはよう'는 가사가 있어 번역 대기로 남겼다.

원문 제공 후에는 `.claude/skills/translate-lyrics/SKILL.md`에 따라 기존 감상 해석과 화자·청자를 맞춘 `translation:` 브리프, 150자 이상의 `## 번역에 대하여`, 실제 녹음과 타이밍이 맞는 `.translation.json`을 함께 작성한다. 원문 전문은 저장소에 넣지 않는다.

## 대기 곡 목록

### Parachutes (9곡)

- [dont-panic](src/editorial/notes/songs/dont-panic.md)
- [shiver](src/editorial/notes/songs/shiver.md)
- [spies](src/editorial/notes/songs/spies.md)
- [sparks](src/editorial/notes/songs/sparks.md)
- [trouble](src/editorial/notes/songs/trouble.md)
- [parachutes](src/editorial/notes/songs/parachutes.md)
- [high-speed](src/editorial/notes/songs/high-speed.md)
- [we-never-change](src/editorial/notes/songs/we-never-change.md)
- [everythings-not-lost](src/editorial/notes/songs/everythings-not-lost.md)

### A Rush of Blood to the Head (10곡)

- [politik](src/editorial/notes/songs/politik.md)
- [in-my-place](src/editorial/notes/songs/in-my-place.md)
- [god-put-a-smile-upon-your-face](src/editorial/notes/songs/god-put-a-smile-upon-your-face.md)
- [clocks](src/editorial/notes/songs/clocks.md)
- [daylight](src/editorial/notes/songs/daylight.md)
- [green-eyes](src/editorial/notes/songs/green-eyes.md)
- [warning-sign](src/editorial/notes/songs/warning-sign.md)
- [a-whisper](src/editorial/notes/songs/a-whisper.md)
- [a-rush-of-blood-to-the-head](src/editorial/notes/songs/a-rush-of-blood-to-the-head.md)
- [amsterdam](src/editorial/notes/songs/amsterdam.md)

### Viva la Vida or Death and All His Friends (8곡)

- [cemeteries-of-london](src/editorial/notes/songs/cemeteries-of-london.md)
- [lost](src/editorial/notes/songs/lost.md)
- [42](src/editorial/notes/songs/42.md)
- [lovers-in-japan-reign-of-love](src/editorial/notes/songs/lovers-in-japan-reign-of-love.md)
- [yes](src/editorial/notes/songs/yes.md)
- [violet-hill](src/editorial/notes/songs/violet-hill.md)
- [strawberry-swing](src/editorial/notes/songs/strawberry-swing.md)
- [death-and-all-his-friends](src/editorial/notes/songs/death-and-all-his-friends.md)

### LOST CORNER (19곡)

- [red-out](src/editorial/notes/songs/red-out.md)
- [margherita](src/editorial/notes/songs/margherita.md)
- [pop-song](src/editorial/notes/songs/pop-song.md)
- [shinigami](src/editorial/notes/songs/shinigami.md)
- [mainichi](src/editorial/notes/songs/mainichi.md)
- [lady](src/editorial/notes/songs/lady.md)
- [yumeutsutsu](src/editorial/notes/songs/yumeutsutsu.md)
- [sayonara-mata-itsuka](src/editorial/notes/songs/sayonara-mata-itsuka.md)
- [tomare-miyo](src/editorial/notes/songs/tomare-miyo.md)
- [lens-flare](src/editorial/notes/songs/lens-flare.md)
- [tsuki-wo-miteita](src/editorial/notes/songs/tsuki-wo-miteita.md)
- [m87](src/editorial/notes/songs/m87.md)
- [pale-blue](src/editorial/notes/songs/pale-blue.md)
- [garakuta](src/editorial/notes/songs/garakuta.md)
- [yellow-ghost](src/editorial/notes/songs/yellow-ghost.md)
- [post-human](src/editorial/notes/songs/post-human.md)
- [chikyugi](src/editorial/notes/songs/chikyugi.md)
- [lost-corner](src/editorial/notes/songs/lost-corner.md)
- [ohayou](src/editorial/notes/songs/ohayou.md)

### Blue Valentine (3곡)

- [blue-valentine](src/editorial/notes/songs/blue-valentine.md)
- [crush-on-you](src/editorial/notes/songs/crush-on-you.md)
- [adore-u](src/editorial/notes/songs/adore-u.md)

### ASSEMBLE (2곡)

- [before-the-rise](src/editorial/notes/songs/before-the-rise.md)
- [chowall](src/editorial/notes/songs/chowall.md)

### ASSEMBLE24 (9곡)

- [s](src/editorial/notes/songs/s.md)
- [heart-raider](src/editorial/notes/songs/heart-raider.md)
- [midnight-flower](src/editorial/notes/songs/midnight-flower.md)
- [white-soul-sneakers](src/editorial/notes/songs/white-soul-sneakers.md)
- [chiyu](src/editorial/notes/songs/chiyu.md)
- [24](src/editorial/notes/songs/24.md)
- [beyond-the-beyond](src/editorial/notes/songs/beyond-the-beyond.md)
- [non-scale](src/editorial/notes/songs/non-scale.md)
- [dimension](src/editorial/notes/songs/dimension.md)

### strobo (8곡)

- [tomoshibi](src/editorial/notes/songs/tomoshibi.md)
- [tokyo-flash](src/editorial/notes/songs/tokyo-flash.md)
- [life-hack](src/editorial/notes/songs/life-hack.md)
- [fukakouryoku](src/editorial/notes/songs/fukakouryoku.md)
- [soramimi](src/editorial/notes/songs/soramimi.md)
- [napori](src/editorial/notes/songs/napori.md)
- [boku-wa-kyou-mo](src/editorial/notes/songs/boku-wa-kyou-mo.md)
- [bye-by-me](src/editorial/notes/songs/bye-by-me.md)

## 출처와 확인 원칙

Coldplay 공식 앨범 페이지, REISSUE RECORDS의 앨범 정보, 실제 제목을 확인한 Pitchfork 리뷰, Billboard JAPAN 제작 인터뷰, Real Sound의 『STRAY SHEEP』 트랙별 해설, Spincoaster의 『strobo』 발매 기사, Seoulbeats 및 Sputnikmusic의 tripleS 리뷰 등을 참고했다. 개별 노트의 `sources:`에 해당 링크를 기록했다. 다른 작품으로 연결되는 추정 URL은 사용하지 않았다.

새 곡에 Spotify ID를 지어 넣지 않았다. 확인한 일본어·영어 제목과 아티스트 이름으로 기존 제목 fallback을 사용한다. 재생 시 연결되지 않는 표기가 확인되면 실제 제목 또는 확인한 ID만 보완한다.

## 검증

- `npm run notes:audit`: 167개 중 99개 통과, 68개 번역 대기, 일반 수정 대기 0개, 다른 품질 미달 0개.
- 표준판 147트랙의 곡 파일 존재 여부와 중복 키, 아티스트 연결을 확인했다.
- 기존 번역 JSON 변경 없음.
- `npm run check`: 타입 검사·린트·449개 테스트·프로덕션 빌드 통과. 미리보기의 아티스트 페이지·앨범 곡 배지·재생 곡 노트·드로어는 기존 UI 테스트로 확인했다.
- `git diff --check`: 통과.
- `npm run dev`로 서버를 시작하고 `/?preview`, 아티스트·곡 모듈, 새 곡의 raw Markdown 응답이 HTTP 200으로 정상 제공됨을 확인했다. 실제 브라우저를 통한 수동 시각 검사는 수행하지 않았다.
- 조사 중 확인한 출처 URL 34개의 페이지 제목 또는 곡 메타데이터를 대조했다. 새 곡의 해당 출처는 개별 `sources:`에 기록했다.
- 빌드에는 기존의 500 kB 초과 청크 경고가 남는다. 새 노트가 포함된 JS는 약 1.26 MB이며 gzip 기준 약 392 kB다.

main 병합과 배포는 이번 작업에서 실행하지 않았다.

<details>
<summary>이전 PR #17 인계 기록 (아래의 미등록 상태는 과거 기록)</summary>

PR #17은 기존 노트 78개(아티스트 5·앨범 10·곡 63)를 보강한 변경이다. The Weeknd 관련 노트 20개와 모든 기존 번역 JSON, Spotify ID·제목 별칭·아티스트 연결은 유지했다. 검사 결과 전체 101개 중 90개 통과·11개 pending이다. `npm run check`의 383개 테스트와 프로덕션 빌드, `git diff --check`가 통과했다.

새 환경에서는 최신 main에서 시작한다. `.claude/skills/write-note/SKILL.md`와 `.claude/skills/translate-lyrics/SKILL.md`를 읽고 아래 범위를 이어서 처리한다. 사용자는 누락된 수록곡 노트 66개를 추가하는 범위를 명시적으로 승인했다. 새로운 수록곡 노트나 번역 파일은 아직 작성되지 않았다. 기준을 충족한 기존 노트는 유지한다. 아래 11개만 본문을 다시 늘리는 것으로는 미완성 원인이 해결되지 않는다.

The Weeknd의 아티스트·앨범·곡 노트는 계속 제외한다. `PENDING_REVIEW`는 실제로 기준을 통과한 항목만 제거하고, 검사 기준을 낮추거나 외국어 가사를 한국어·연주곡으로 잘못 표시하지 않는다. URL 접근은 조사와 타이밍 검증을 돕지만 외부에서 가져온 저작권 가사의 전체 새 번역을 허용하는 것은 아니다. 전체 번역에는 사용자가 직접 제공한 원문을 사용해야 한다.

## 남은 11개 노트의 추가 작업 명세

대상은 기존 미완성 앨범 노트 6개와 곡 노트 5개다. 앨범의 본문을 다시 늘리는 것으로는 누락 문제가 해결되지 않는다. 기존 표준판 트랙 순서를 유지하면서 아래 새 곡 노트 66개가 필요하다. Apple Music의 표준판 트랙 순서와 곡명을 다시 대조했다.

외부 서비스의 원문 가사는 이 문서나 저장소에 기록하지 않았다. 전체 큐레이션 번역을 만들기 위해서는 사용자가 직접 제공한 원문이 필요하다. 제공된 원문은 저장소 밖에서만 읽고, 저장소에는 번역 데이터·브리프·청취 노트만 작성한다. 실제 연주곡으로 확인된 항목에는 번역을 만들지 않는다.

## 기존 미번역 곡 5개

| 아티스트 | 곡 | 노트 키 |
| --- | --- | --- |
| NMIXX | ADORE U | adore-u |
| NMIXX | Blue Valentine | blue-valentine |
| NMIXX | Crush On You | crush-on-you |
| tripleS | Before the Rise | before-the-rise |
| tripleS | Chowall | chowall |

LRCLIB에서 마지막 두 곡에도 의미 있는 한국어·영어 가사가 존재함을 확인했다. 짧은 곡이라는 이유로 연주곡으로 표시할 수 없다.

## 새 곡 노트 66개

### Parachutes — コールドプレイ

[표준판 트랙 목록](https://music.apple.com/jp/album/parachutes/1122782080?uo=4)

| 순서 | 곡 | 새 노트 키 | 번역 준비 |
| ---: | --- | --- | --- |
| 1 | Don't Panic | `dont-panic` | 원문 필요 |
| 2 | Shiver | `shiver` | 원문 필요 |
| 3 | Spies | `spies` | 원문 필요 |
| 4 | Sparks | `sparks` | 원문 필요 |
| 6 | Trouble | `trouble` | 원문 필요 |
| 7 | Parachutes | `parachutes` | 원문 필요 |
| 8 | High Speed | `high-speed` | 원문 필요 |
| 9 | We Never Change | `we-never-change` | 원문 필요 |
| 10 | Everything's Not Lost | `everythings-not-lost` | 원문 필요 |

### A Rush of Blood to the Head — コールドプレイ

[표준판 트랙 목록](https://music.apple.com/jp/album/a-rush-of-blood-to-the-head/1122775993?uo=4)

| 순서 | 곡 | 새 노트 키 | 번역 준비 |
| ---: | --- | --- | --- |
| 1 | Politik | `politik` | 원문 필요 |
| 2 | In My Place | `in-my-place` | 원문 필요 |
| 3 | God Put a Smile Upon Your Face | `god-put-a-smile-upon-your-face` | 원문 필요 |
| 5 | Clocks | `clocks` | 원문 필요 |
| 6 | Daylight | `daylight` | 원문 필요 |
| 7 | Green Eyes | `green-eyes` | 원문 필요 |
| 8 | Warning Sign | `warning-sign` | 원문 필요 |
| 9 | A Whisper | `a-whisper` | 원문 필요 |
| 10 | A Rush of Blood to the Head | `a-rush-of-blood-to-the-head` | 원문 필요 |
| 11 | Amsterdam | `amsterdam` | 원문 필요 |

### Viva La Vida or Death and All His Friends — コールドプレイ

[표준판 트랙 목록](https://music.apple.com/jp/album/viva-la-vida-or-death-and-all-his-friends/1122773394?uo=4)

| 순서 | 곡 | 새 노트 키 | 번역 준비 |
| ---: | --- | --- | --- |
| 1 | Life in Technicolor | `life-in-technicolor` | 연주곡 — 번역 불필요 |
| 2 | Cemeteries of London | `cemeteries-of-london` | 원문 필요 |
| 3 | Lost! | `lost` | 원문 필요 |
| 4 | 42 | `42` | 원문 필요 |
| 5 | Lovers in Japan / Reign of Love | `lovers-in-japan-reign-of-love` | 원문 필요 |
| 6 | Yes | `yes` | 원문 필요 |
| 8 | Violet Hill | `violet-hill` | 원문 필요 |
| 9 | Strawberry Swing | `strawberry-swing` | 원문 필요 |
| 10 | Death and All His Friends | `death-and-all-his-friends` | 원문 필요 |

### LOST CORNER — 米津玄師

[표준판 트랙 목록](https://music.apple.com/jp/album/lost-corner/1759899363?uo=4)

| 순서 | 곡 | 새 노트 키 | 번역 준비 |
| ---: | --- | --- | --- |
| 1 | RED OUT | `red-out` | 원문 필요 |
| 3 | マルゲリータ + アイナ・ジ・エンド | `margherita` | 원문 필요 |
| 4 | POP SONG | `pop-song` | 원문 필요 |
| 5 | 死神 | `shinigami` | 원문 필요 |
| 6 | 毎日 - Every Day | `mainichi` | 원문 필요 |
| 7 | LADY | `lady` | 원문 필요 |
| 8 | ゆめうつつ - Daydream | `yumeutsutsu` | 원문 필요 |
| 9 | さよーならまたいつか!- Sayonara | `sayonara-mata-itsuka` | 원문 필요 |
| 10 | とまれみよ - Stop Look Both Ways | `tomare-miyo` | 원문 필요 |
| 11 | LENS FLARE | `lens-flare` | 원문 필요 |
| 12 | 月を見ていた - Moongazing | `tsuki-wo-miteita` | 원문 필요 |
| 13 | M八七 | `m87` | 원문 필요 |
| 14 | Pale Blue | `pale-blue` | 원문 필요 |
| 15 | がらくた - JUNK | `garakuta` | 원문 필요 |
| 16 | YELLOW GHOST | `yellow-ghost` | 원문 필요 |
| 17 | POST HUMAN | `post-human` | 원문 필요 |
| 18 | 地球儀 - Spinning Globe | `chikyugi` | 원문 필요 |
| 19 | LOST CORNER | `lost-corner` | 원문 필요 |
| 20 | おはよう | `ohayou` | 원문 필요 |

### <ASSEMBLE24> — tripleS

[표준판 트랙 목록](https://music.apple.com/jp/album/assemble24/1743890798?uo=4)

| 순서 | 곡 | 새 노트 키 | 번역 준비 |
| ---: | --- | --- | --- |
| 1 | S | `s` | 원문 필요 |
| 3 | Heart Raider | `heart-raider` | 원문 필요 |
| 4 | Midnight Flower | `midnight-flower` | 원문 필요 |
| 5 | White Soul Sneakers | `white-soul-sneakers` | 원문 필요 |
| 6 | Chiyu | `chiyu` | 원문 필요 |
| 7 | 24 | `24` | 원문 필요 |
| 8 | Beyond the Beyond | `beyond-the-beyond` | 원문 필요 |
| 9 | Non Scale | `non-scale` | 원문 필요 |
| 10 | Dimension | `dimension` | 원문 필요 |

### strobo — Vaundy

[표준판 트랙 목록](https://music.apple.com/jp/album/strobo/1706831732?uo=4)

| 순서 | 곡 | 새 노트 키 | 번역 준비 |
| ---: | --- | --- | --- |
| 1 | Audio 001 | `audio-001` | 연주곡 — 번역 불필요 |
| 2 | 灯火 | `tomoshibi` | 원문 필요 |
| 3 | 東京フラッシュ | `tokyo-flash` | 원문 필요 |
| 5 | life hack | `life-hack` | 원문 필요 |
| 6 | 不可幸力 | `fukakouryoku` | 원문 필요 |
| 7 | soramimi | `soramimi` | 원문 필요 |
| 8 | Audio 002 | `audio-002` | 연주곡 — 번역 불필요 |
| 9 | napori | `napori` | 원문 필요 |
| 10 | 僕は今日も | `boku-wa-kyou-mo` | 원문 필요 |
| 11 | Bye by me | `bye-by-me` | 원문 필요 |

가사는 제목별 텍스트 파일 또는 LRC 파일로 제공할 수 있다. 파일명에 위 노트 키를 쓰면 곡을 구분하기 쉽다. 한국어·영어 혼합곡은 원어 전체를 제공하면 한국어는 그대로 두고 번역이 필요한 부분을 확인한다. LRCLIB 타이밍은 별도로 검증하며 원문 파일은 커밋하지 않는다.

</details>
