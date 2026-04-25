# Implementation Plan: 가벼운 웹 1인칭 슈터(2.5D)

**Branch**: `001-web-fps-raycaster` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-web-fps-raycaster/spec.md`

## Summary

`Principle.md`·헌장·레퍼런스에 맞춰 **브라우저에서 동작하는 가벼운 1인칭 슈터**를 만든다. 3D 엔진·거대한 레벨 대신 **Canvas + 2.5D 레이캐스팅**(`Temp/playfuljs-demos-gh-pages/raycaster` 패턴)으로 맵·플레이어·뷰를 구성한다. **온라인 경쟁**은 실시간 PVP가 아니라 **Vercel(또는 GitHub Pages)에 배포한 공개 URL** + **Dreamlo 리더보드(fetch)**로 달성한다. **주스**는 **jsfxr(또는 사전 생성 ogg) + 캔버스 쉐이크/짧은 스프라이트**로 맞춘다.

MVP **조작/세션**은 다음 중 **하나**로 잠정 확정(구현 Phase에서 최종 1개만 유지): **(A) 자동 전진 + 좌우 피하기 + 클릭/탭 사격(레퍼런스 문서안)** vs **(B) playfuljs식 자유 이동 WASD+회전+사격**. 기본 구현은 **(B)를 먼저** 잡는 것이 `raycaster` 데모와의 코드 재사용이 크다. **(A)** 는 `player.walk`에 전방성분 고정, 사이드만 입력받는 식으로 변형 가능(후속 task).

## Technical Context

**Language/Version**: HTML5, ECMAScript (모던 브라우저; `type=module` 권장)  
**Primary Dependencies**: 없음(바닐 JS) — 또는 선택 시 Vite(번들·env만). 3D 엔진(Babylon)은 **MVP에서 제외**(레퍼런스의 "대안"으로만 기록).  
**Storage**: 랭킹은 **Dreamlo** HTTP API(또는 대체: Firestore; 스펙은 Dreamlo 우선). 로컬은 `localStorage`에 최고 점수.  
**Testing**: 수동 E2E 체크리스트 + 가능하면 **Playwright**로 "시작→점수" 스모크(시간 있을 때).  
**Target Platform**: Web (Desktop + Mobile browser)  
**Project Type**: static web app (싱글 페이지 + 정적 자산)  
**Performance Goals**: 60fps 목표, 저사양에서 ray 수/해상도 강등, 메인 스레드 블로킹 최소화  
**Constraints**: 2.5D만; P2P/실시간 멀티 없음; 시크릿 키는 repo에 없음(환경 변수)  
**Scale/Scope**: 1씬(또는 minimal 메뉴+게임) + 리더보드 모달, 에셋·코드 총량 작게

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 이 플랜에서의 대응 |
|------|-------------------|
| Immediate Playability | 첫 화면에서 큰 "시작", 인게임 중심 UI, 터치 대체 입력 |
| Session Clarity | 90~120s 목표(타이머 또는 밸런스), Game Over + 최종 점수 + Retry |
| Lightweight Online | Dreamlo + 공개 배포 URL; 실시간 PVP 없음 |
| FPS Feel & Juice | 사격/피격 SFX, 히트·죽음 시 쉐이크/플래시 |
| Simplicity | 모듈은 `map`, `player`, `camera`, `input`, `game`, `leaderboard` 수준로 분리, 프레임워크 최소 |

**재검토 시점**: 첫 **playable** 빌드 후(프레임·조작·종료·점수).

## Project Structure

### Documentation (this feature)

```text
specs/001-web-fps-raycaster/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dreamlo-leaderboard.md
└── tasks.md
```

### Source Code (repository root)

```text
web/
├── index.html
├── public/
│   └── assets/          # wall/sky/sfx (작은 jpg/ogg, 배포 크기 절제)
└── src/
    ├── main.js          # entry, rAF 루프, 화면 전환
    ├── game/
    │   ├── loop.js
    │   ├── map.js       # grid, cast (playfuljs cast 패턴)
    │   ├── player.js
    │   ├── camera.js
    │   ├── input.js
    │   ├── enemies.js   # (optional) 2.5D 스프라이트/간이 AI
    │   ├── weapon.js
    │   └── juice.js     # shake, muzzle, hit flash
    ├── ui/
    │   └── hud.js
    └── net/
        └── dreamlo.js
```

**Structure Decision**: **단일 `web/` 정적 사이트**로 유지(과제 시간 절약). Vercel은 `web/` 루트를 루트로 두거나, 루트에 `vercel.json`으로 `output` 지정.

## Complexity Tracking

> 헌장과 충돌하는 과도한 추상화는 하지 않는다. 아래는 예외가 아님(비어 있음).

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0: Research (see research.md)

- 레이캐스터 맵/에셋 크기(32×32 연속 grid 등) `playfuljs` 수준.
- Dreamlo 엔드포인트(공개/비공 키), CORS(호출 방식: 서버리스 proxy vs jsonp 등) — **구현 전 `research.md`에 확정**한다.

## Phase 1: Data & Contracts (see data-model.md, contracts/)

- 점수 엔트리, Dreamlo request/response 형식, 실패 시 폴백.

## Phase 2: Implementation Order

`tasks.md`의 Phase 순서를 따른다: **입력+렌더+한 판** → **Game Over+점수** → **Dreamlo** → **주스+폴리시**.
