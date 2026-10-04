# player2 노트 작업 인계

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
