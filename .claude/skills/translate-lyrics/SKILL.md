---
name: translate-lyrics
description: ARC Music에 곡의 큐레이션 가사 번역을 만들 때 사용한다. "OO 가사 번역해줘", "이 곡 번역 올려줘", "존댓말/반말 맞춰서 번역" 같은 요청. 곡의 맥락(화자·청자·관계)을 먼저 조사해 한국어 어체를 정하고, 문장 단위로 곡 전체를 번역해 곡 노트(src/editorial/notes/songs/<key>.md)의 translation 블록과 `## 번역에 대하여` 섹션, 그리고 시간 구간만 담은 <key>.translation.json으로 저장한다.
---

# 가사 번역 (맥락 → 어체 → 번역)

줄 단위 기계 번역은 화자가 누구에게 말하는지 모르기 때문에 존댓말과 반말이 줄마다 흔들린다. 이 스킬은
**번역 전에 맥락을 정하고**, 그 결정을 곡 노트에 근거와 함께 남긴 뒤, 그 결정에 맞춰 곡 전체를 번역한다.
앱은 이 번역을 기계 번역보다 우선 보여주고, 브리프는 곡의 Listening note 안 `번역에 대하여` 섹션으로 보여준다
(별도의 번역 노트나 표시는 없다). 번역 자체는 가사창에서만 보인다(노트에 원문·번역 대역은 없다).

## 저작권 규칙 (반드시 지킨다)

- **원문 가사는 저장소의 어떤 파일에도 쓰지 않는다.** 노트, `.translation.json`, 테스트, 픽스처, 주석, 문서,
  커밋 메시지, PR 설명 모두 해당한다. 원문 텍스트와 줄 타이밍은 앱이 실행될 때 LRCLIB에서만 받아 온다.
- `.translation.json`에는 `startMs`, `endMs`, `translation`만 있다. `text`, `original`, `source`, `lyrics` 같은 원문용 키는
  파서가 거부한다. 원문을 메모·주석 형태로 끼워 넣지 않는다.
- `lyrics:lines`가 보여 주는 원문은 **터미널에서만** 본다. 출력을 파일로 리다이렉트하거나 저장소에 붙여 넣지 않는다.
- `## 번역에 대하여`나 용어집에 원문을 인용해야 하면 근거로 꼭 필요한 몇 단어 이내의 짧은 구절만 쓴다. 여러 줄을 옮기지 않는다.
- 테스트가 필요하면 원문 줄은 `"line one"` 같은 더미 텍스트만 쓴다.
- 사용자가 붙여 넣은 가사 파일은 저장소 밖(스크래치 디렉터리)에 둔다.
- 한국어 번역을 공개 저장소에 커밋하는 것은 저장소 소유자가 위험을 알고 결정한 사항이다. 원문을 남기지 않는 원칙은 그대로 지킨다.

## 출력

곡 하나 = 노트 하나 + 번역 데이터 하나. 같은 디렉터리, 같은 키.

1. `src/editorial/notes/songs/<song-key>.md` — 곡 노트
   - frontmatter의 `translation:` 블록 (브리프)
   - 본문 끝의 `## 번역에 대하여` 섹션 (근거 산문)
2. `src/editorial/notes/songs/<song-key>.translation.json` — 시간 구간과 번역만

**노트가 이미 있으면** 그 파일에 블록과 섹션을 더한다. `short`와 감상 본문은 한 글자도 건드리지 않는다. 출처는 노트의
`sources`에 중복 없이 더하고, 노트에 없는 Spotify 트랙 ID·제목 표기는 `trackIds`·`titles`에 더한다.
**노트가 없으면** 번역 전용 노트를 만든다: `artist`, `trackIds`, `titles`, `written`, `sources`, `translation:` 블록,
`## 번역에 대하여` 섹션만 두고 `short`와 감상 본문은 쓰지 않는다(감상 노트를 지어내지 않는다).
`artist`는 `notes/artists/`의 키여야 한다(`write-note` 스킬 참고).

## 1. 줄 표 확인

```bash
npm run lyrics:lines -- --title "Lemon" --artist "Kenshi Yonezu" --album "Lemon" --duration 4:15
npm run lyrics:lines -- --id 123456          # 후보 중 특정 버전
npm run lyrics:lines -- --file /scratch/lemon.lrc --duration 4:15   # LRCLIB에 접근할 수 없을 때
```

- 출력: LRCLIB 레코드, `.translation.json`에 넣을 `"timing"` 한 줄, 그리고 `번호  startMs  endMs  원문` 표(터미널 전용).
  `endMs`는 다음 줄의 시작이고, 마지막 줄은 곡 끝까지다.
- Spotify 재생 시간과 길이가 맞는 버전(±3초)을 고른다. 앱도 같은 방식으로 LRCLIB 가사를 고른다.
- `lrclib.net`에 접근할 수 없으면(샌드박스 네트워크 정책) 사용자에게 허용 도메인에 추가해 달라고 하거나,
  LRC 파일을 받아 `--file`로 처리한다. 이때도 `"timing"`은 그 LRC가 나온 LRCLIB 레코드의 ID와 길이여야 한다.

## 2. 문장 단위로 segment 묶기

- segment 하나가 번역 한 단위다. LRCLIB가 한 문장을 두 줄로 나눴으면 두 줄을 하나의 segment로 묶는다
  (`startMs` = 첫 줄 시작, `endMs` = 문장이 끝나는 줄의 `endMs`). 앱은 첫 줄 아래에 번역을 보여 주고 다음 줄에서도 유지한다.
- 한 줄에 두 문장이 있으면 segment를 둘로 나눠도 된다. 같은 줄 안에서 시작하는 segment들은 앱에서 공백으로 이어 보인다.
- `startMs`는 줄 표의 시작 시각을 그대로 쓴다(±400ms 안이어야 `--check`를 통과한다).
- segment는 시간순이고 서로 겹치지 않는다. `endMs`는 `timing.durationMs + 3000` 이하.
- 이미 한국어인 줄(K-pop의 한국어 부분)은 segment를 만들지 않는다. 덮이지 않은 줄은 기계 번역으로 간다.

## 3. 맥락 조사와 브리프

WebSearch / WebFetch와 저장소 안의 자료로 확인한다:

- 곡의 배경: 타이업(드라마·애니메이션·영화) 내용, 작사자 인터뷰, 뮤직비디오, 발매 당시 코멘트
- 앨범 안의 위치와 앞뒤 곡, 아티스트의 다른 곡에서 쓰는 화법
- 저장소의 노트: `src/editorial/notes/`(아티스트·앨범·곡 노트). 해석이 노트와 어긋나지 않게 한다.

정할 것: **화자**(누가 부르는가), **청자**(누구에게, 혹은 혼잣말인가), **관계**, **상황**(시점·장소·사건).

### 어체 결정

`translation.register`는 하나를 고르고, 곡 전체에서 유지한다.

| 값 | 어체 | 쓰는 경우 |
| --- | --- | --- |
| `haeche` | 반말 · 해체 (-아/-어, -지, -야) | 연인·친구·가까운 사람에게 직접 말을 건다 |
| `haerache` | 반말 · 해라체 (-는다, -다, -라) | 독백, 내레이션, 다짐, 일기·선언 같은 문어적 화법 |
| `haeyoche` | 존댓말 · 해요체 (-아요/-어요) | 거리가 있거나 공손한 상대, 의도적으로 정중한 화자 |
| `hapsyoche` | 존댓말 · 하십시오체 (-습니다) | 찬가, 기도, 공식적 선언처럼 격식 있는 화법 |

판단 단서:

- **일본어**: 君/お前 → 너(해체·해라체). あなた → 거리감·성숙함·격식이 있으면 당신, 가까운 연인이면 너.
  です/ます체가 쓰이면 해요체를 우선 검토한다. 문말 だ/である·체언 종결은 해라체, ね/よ/の 같은 말 걸기 종결은
  해체에 가깝다. 僕/俺/私는 대개 나(존댓말 어체일 때만 저).
- **영어**: 높임 구분이 없으므로 관계로 정한다. 연인·친구는 해체, 독백·서사는 해라체, 신·대중·윗사람에게 바치는
  곡은 해요체나 하십시오체.
- 곡 안에서 화자나 청자가 실제로 바뀌면(인용문, 듀엣, 시점 전환) 그 부분만 다른 어체를 쓸 수 있다. 이때는
  `## 번역에 대하여`에 어느 부분이 왜 다른지 적는다.
- 한국어는 대명사를 자주 생략한다. "너", "당신"을 줄마다 넣지 말고, 처음 정한 호칭은 끝까지 바꾸지 않는다.

`## 번역에 대하여` 섹션에는 결정의 근거를 2–4문장의 산문으로 쓴다: 가사 안의 단서(호칭, 문말), 배경 조사 결과,
다른 해석을 버린 이유. `**굵게**`, `*기울임*`을 쓸 수 있다.

## 4. 번역

- **브리프를 먼저 완성하고**, 그 브리프를 기준으로 곡 전체를 한 번에 번역한다. segment마다 따로 번역하지 않는다.
- 의미가 먼저고, 그다음 자연스러운 한국어 리듬이다. 노래로 부를 수 있게 맞출 필요는 없다.
- 반복되는 구절은 회차마다 segment가 따로 있다. 같은 원문이면 같은 번역을 쓰되, 의도적으로 다르게 옮길 때만 다르게 쓴다.
- 말장난, 중의성, 반복되는 핵심어는 `translation.glossary`에 원어 → 번역과 이유를 남긴다. 호칭은 `translation.pronouns`.
- 자체 점검: ① 모든 segment의 문말이 정한 어체인지 ② 호칭이 일관된지 ③ 반복 구절의 번역이 의도대로인지
  ④ 덮이지 않은 줄이 없는지.

## 5. 파일 쓰기

노트 (`src/editorial/notes/songs/<song-key>.md`, 키는 소문자·하이픈):

```markdown
---
artist: kenshi-yonezu
trackIds: [04TshWXkhV1qkqHzf31Hn6, 7Cd17G3oNQ34OWUwS8ZxfR]
titles: [Lemon]
short: >
  (이미 있던 감상 큐 — 건드리지 않는다. 번역 전용 노트면 이 줄이 없다)
written: 2026-10-02
sources:
  - https://…
translation:
  sourceLanguage: ja
  targetLanguage: ko
  register: haeche
  speaker: …
  addressee: …
  relationship: …
  situation: …
  pronouns:
    - source: あなた
      target: 너
      note: …
  glossary:
    - source: …
      target: …
      note: …
  written: 2026-10-02
---

(이미 있던 감상 본문 — 건드리지 않는다)

## 번역에 대하여

어체를 이렇게 정한 이유를 2–4문장의 산문으로.
```

- `translation:` 아래는 공백 2칸, `pronouns`/`glossary` 항목은 `- source:` 다음 줄들을 `source`와 같은 열에 맞춘다.
  긴 값은 `note: >` 다음 줄에 더 들여 써서 여러 줄로 쓸 수 있다. 스키마: `src/translation/curated/types.ts`, 검증: `parse.ts`.
- 고쳐 쓸 때는 `translation.updated`를 추가하고 `translation.written`은 그대로 둔다.

번역 데이터 (`src/editorial/notes/songs/<song-key>.translation.json`):

```json
{
  "schemaVersion": 2,
  "timing": { "lrclibId": 123456, "durationMs": 255000 },
  "segments": [
    { "startMs": 12340, "endMs": 18900, "translation": "번역 문장" }
  ]
}
```

- 곡 매칭 정보(trackIds, titles, artistNames)는 넣지 않는다. 노트에서 상속한다.
- `timing`은 1단계에서 출력된 값을 그대로 쓴다. 앱은 이 곡의 가사를 검색하지 않고 `timing.lrclibId` 레코드에서 바로
  받아 온다(재생 중인 트랙과 길이가 ±3초 이내일 때). 그래서 **Spotify의 그 녹음과 길이가 맞는 레코드**를 골라야 한다.
  번역은 LRCLIB 레코드 ID가 같거나 길이가 ±3초 이내일 때만 적용된다.

## 6. 확인하고 커밋

1. `npm run lyrics:lines -- --check <song-key>`: 각 segment의 시작이 LRCLIB 줄 시작과 ±400ms 안인지, segment로 덮이지
   않은 줄, LRCLIB 레코드 ID와 길이가 `timing`과 맞는지 확인한다(LRCLIB 접근이 안 되면 `--file`을 함께 준다).
2. `npm run check`: 노트 ↔ `.translation.json` ↔ `## 번역에 대하여` 짝, 스키마(어체 값, 구간 정렬·겹침, 빈 번역, 원문용 키)를 검사한다.
3. `git diff`를 직접 읽고 원문 가사가 한 줄도 들어가지 않았는지 확인한다.
4. 커밋 메시지 예: `translations: add Lemon (ja → ko, 해체)`. 원문을 메시지에 넣지 않는다.
5. 사용자에게 화자·청자·어체 결정을 한두 문장으로 알리고, 확신이 낮은 해석이 있으면 말한다.
