# Tasks: 가벼운 웹 1인칭 슈터(2.5D)

**Input**: `specs/001-web-fps-raycaster/` (spec.md, plan.md, research.md, data-model.md, contracts/)  
**Prerequisites**: plan.md, spec.md  
**Tests**: 아래 스모크는 수동 체크리스트. 자동화는 선택(Playwright).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 정적 웹 루트와 엔트리 확보

- [X] T001 [P] [US1] `web/index.html` 생성: 풀스크린 canvas, 모바일 viewport, `module` 스크립트 로드
- [X] T002 [P] [US1] `web/src/main.js` 엔트리: 상태 머신(`title` | `play` | `over`) 뼈대, `requestAnimationFrame` 루프
- [X] T003 [P] [US2] `web/src/assets/` 또는 `web/public/assets/` placeholder(빈 폴더 + README 한 줄)
- [X] T004 [P] [US3] 배포용 `vercel.json` 또는 문서화: `web` 루트 서빙(또는 루트 `package.json` `serve` 스크립트)

**Checkpoint**: `npx serve web`으로 빈 페이지 + 콘솔 에러 없음

---

## Phase 2: Foundational — Raycaster + Input (Blocking)

**Purpose**: `playfuljs` 레퍼런스 수준의 맵·플레이어·카메라·입력

- [X] T005 [US1] `web/src/game/map.js`: `Uint8Array` 그리드, `get(x,y)`, `randomize` 또는 고정 미로(과제용)
- [X] T006 [US1] `web/src/game/player.js`: 위치, 방향, `walk`/`rotate`(playfuljs `Player` 패턴)
- [X] T007 [US1] `web/src/game/camera.js`: `Map.cast` + 컬럼 그리기(`Camera` from playfuljs) — **모바일에서 resolution/ range 강등** 유지
- [X] T008 [US1] `web/src/game/input.js`: 키보드 WASD+화살표, **마우스 룩(또는 Q/E)**, `touchstart`/`touchmove`로 전방/좌/우( play demo와 동일한 패턴만 **개선: typo `innerWidth` vs Y fix** 는 복사 시 수정)
- [X] T009 [US1] `web/src/game/loop.js`: `GameLoop`(`seconds` delta), `map.update` 훅(라이트닝 등 최소)
- [X] T010 [P] [US1] `web/src/ui/hud.js`: FPS(선택), 크로스헤어/중앙 점(최소)

**Checkpoint**: **로컬에서 1인칭 벽/스카이/텍스처가 보이고** 이동·회전 가능

---

## Phase 3: User Story 1 — Core loop (MVP) 🎯

**Goal**: 사격(또는 히트 스캔) + 점수/적 또는 타깃

**Independent Test**: 적 1타입 + 명중 시 점수 + 사운드(끊김 X)

- [X] T011 [US1] `web/src/game/weapon.js`: 클릭/스페이스로 **레이 히트**(화면 중앙 ray와 충돌) — 2.5D면 **엔티티**를 스프라이트/간이 2D 위치로 표현(거리 < threshold) 또는 "벽에 그림 1개"로 스코어링 (구현팀 **택1** 문서에 1문단 추가)
- [X] T012 [US1] `web/src/game/enemies.js` (또는 `targets.js`): 1팩 스폰, 화면에 스프라이트 그리기(거리·각도 sort)
- [X] T013 [P] [US4] `web/src/game/juice.js`: `shake`, `muzzle` 플래시(짧은 rect alpha)
- [X] T014 [P] [US4] `playSound` 유틸 + jsfxr 생성 데이터 또는 ogg 2~3개; Howler **선택**

**Checkpoint**: "쏴서" 점수가 오르는 완전한 **싱글 루프**

---

## Phase 4: User Story 2 — End session + final score

**Goal**: 2분(또는 HP 0) 종료, 최종 점수, 다시 하기

- [X] T015 [US2] `web/src/main.js`: `GAME_TIME_MS=120_000` 또는 `HP` 루프 — `over`에서 **최종 점수** + **재시작**
- [X] T016 [US2] `localStorage` `fps_best_v1` 갱신
- [X] T017 [P] [US2] 게임 오버 UI: 반투명 오버레이(Part 2 `Surface`+alpha 패턴과 동일 취지)

**Checkpoint**: 한 판 끝~재시작까지 **새로고침 없이** 동작

---

## Phase 5: User Story 3 — Online leaderboard

**Goal**: Dreamlo 조회/제공 + 키 없을 때 그레이스풀

- [X] T018 [US3] `web/src/net/dreamlo.js`: `list(publicKey)`, `add(privateKey, name, score)` — [contracts/dreamlo-leaderboard.md](./contracts/dreamlo-leaderboard.md) 캡슐화
- [X] T019 [US3] `web/src/ui/leaderboard.js`: 상위 10, 로딩/에러
- [X] T020 [US3] 게임 오버 후 닉 입력(최대 12자) + "제출" (키 없으면 disabled + 설명)
- [ ] T021 [P] [US3] (선택) Vercel `api/submit` 프록시로 private 키를 서버에만

**Checkpoint**: **배포 URL**에서 제출·조회 스모크(키 설정 시)

---

## Phase 6: User Story 4 + Polish

- [ ] T022 [P] [US4] Web Share API: `navigator.share`로 URL+점수(실패 시 클립보드 폴백) — [레퍼런스](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [ ] T023 [P] [US1] `README` 또는 `web/README.md`: 과제용 한 페이지 설치·배포(출처: playfuljs, dreamlo, jsfxr)
- [ ] T024 [US1] 성능: 모바일 ray 수/innerWidth*0.5 캔버스 정책 재확인
- [ ] T025 (선택) Playwright: "시작 → 점수 화면" 스모크

---

## Dependencies & Execution Order

1. Phase 1 → 2 (레이캐스터 있어야 P3~)  
2. Phase 3 (코어) → 4 (종료) → 5 (온라인) → 6 (폴리시)  
3. US3은 US1·US2 후에만 의미 있음

## Notes

- **NEEDS CLARIFICATION** in spec: 레일(A) vs 자유(B) — **T005~T008 착수 전** 팀이 1줄로 확정 권장.  
- Part 2 정신: `while not exit` 대신 `state` + `rAF` 한 곳(이미 `main.js`).
