# Research: Web FPS (2.5D Raycaster) + Leaderboard

**Feature**: `001-web-fps-raycaster` | **Date**: 2026-04-25

## 1. Rendering approach

| Option | Pros | Cons | Verdict for MVP |
|--------|------|------|-----------------|
| **2.5D Raycaster (Canvas 2D)** | 작은 의존성, `playfuljs` 참고 코드, 저사양 OK | 3D 자유시점 아님 | **채택** |
| Babylon.js 3D | 풀 3D, 템플릿 | 빌드/용량/학습; 잼 마감 리스크 | **비채택(대안)** |

**Source**: `Temp/playfuljs-demos-gh-pages/raycaster/index.html` — `Map`/`Player`/`Camera`/`GameLoop`/`Controls` 구조, 모바일에서 `resolution` 강등, 터치 → 방향 키 에뮬.

## 2. Game feel ("Juice")

- **SFX**: `Temp/1인칭 슈터 게임 개발 레퍼런스.md` — **jsfxr**로 총성·피격·폭사 톤 생성, 짧은 base64/ogg로 로딩.
- **Visual**: Canvas 위 **스프라이트 오버레이**(무기, 히트 플래시), `juice.shake`로 짧은 카메라 오프셋(2D 캔버스 전체 translate).

## 3. Online scoreboard

| Service | Speed | Security note |
|---------|--------|----------------|
| **Dreamlo** | GET/JSON만으로 추가·조회 가능 | private key는 **클라이언트에 두면 위조 위험** — 프로덕션은 **Vercel Serverless route**로 프록시하거나, 잼/수업용이면 "공개 랭킹만" 임시 허용 |

**Decision (초안)**:

- **수업/잼 / 빠른 제출**: 클라이언트에서 Dreamlo 호출(키는 `import.meta.env` / 빌드 시 env, repo 미포함), 스팸은 추후 rate-limit.
- **강한 무결성 필요 시**: `POST /api/score` Serverless + 서버 측 Dreamlo 또는 DB.

`contracts/dreamlo-leaderboard.md`에 URL/형식을 고정.

## 4. Hyper-casual layer (from 기획 + 레퍼런스)

- **10초 룰**: 타이틀 → 1초 이내 "탭/스페이스로 시작" 수준.
- **스워브+타이밍(개념)**: (옵션 A) 자동 전진 복도 + 측면 이동 + 전방/중앙에 적 스폰; (옵션 B) free roam — `spec.md` NEEDS CLARIFICATION 해소 후 1가지로 고정.
- **2분**: 하드캡 120s 또는 "난이도로 평균 2분" — MVP는 **120s 타이머** 권장(측정 쉬움).

## 5. Part 2 (Python samples) takeaways (non-technical mapping)

- **molecatch / bird.py**: `game_ready` / `game_over` / `play_again` 같은 **명시적 상태**; 메인 루프는 한 곳.
- **웹에 옮기기**: `state = 'title' | 'play' | 'over'` + `rAF` 한 프레임 콜백.

## 6. Deployment

- **Vercel**: Git push → URL 갱신(레퍼런스). 정적 + 필요 시 `api/`.
- **Fallback**: Cloudflare Pages / GitHub Pages(동일 static).

## 7. Open points (to close before "implement" lock)

1. **조작 (A) 레일 vs (B) 자유**: 팀 1문장 결정.
2. **Dreamlo vs Firestore**: 키/계정 가용에 따라; 최소 1개.
3. **적 존재 방식**: 스프라이트만 / 간이 2D 위치+거리 / 없이 "타깃 쏘기"만 — P1이 되도록 최소 1.
