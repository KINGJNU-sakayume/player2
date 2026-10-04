# Notes 작업 인수인계

2026-10-04 작성. 기존 `notes_handoff.md` 및 `notes_handoffs.md`를 작업 공간과 저장소 기본 브랜치에서 찾지 못해, 이번 작업 결과를 새로 기록한 문서다. 사용자가 지정한 대안인 **수정 대기 노트 보완**과 **등록된 앨범의 미등록 표준판 수록곡 노트 작성**을 진행했다.

## 현재 상태

- 아티스트 8개, 앨범 12개, 곡 147개: 총 167개 노트.
- 12개 앨범의 `tracks:`에 표준판 전곡 147개를 원래 순서로 연결했다. 모든 키는 실제 곡 노트에 연결되며 중복이 없다.
- 기존 `PENDING_REVIEW` 78개 노트의 감상 본문·출처·앨범 목록·번역 해설 부족을 보완했다. 이 목록은 현재 비어 있다.
- 빠진 곡 노트 66개를 추가했다. 새 곡 감상 본문은 4문단이며 기존 600자·3문단·출처 2개 이상의 기준을 적용했다.
- 전체 기준 통과 99개, **전문 번역만 대기 68개**. 번역이 필요한 곡 전체가 완료된 상태는 아니다.
- 기존 76개 `.translation.json`의 번역 문장과 타임라인은 변경하지 않았다. 번역 해설을 수정한 경우 `translation.updated`를 기록했다.

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
- [yume-utsutsu](src/editorial/notes/songs/yume-utsutsu.md)
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
- 새로 사용한 출처 URL 34개의 페이지 제목 또는 곡 메타데이터를 확인했다.
- 빌드에는 기존의 500 kB 초과 청크 경고가 남는다. 새 노트가 포함된 JS는 약 1.27 MB이며 gzip 기준 약 391 kB다.

main 병합과 배포는 이번 작업에서 실행하지 않았다.
