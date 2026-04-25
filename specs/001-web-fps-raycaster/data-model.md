# Data Model: 001-web-fps-raycaster

**Date**: 2026-04-25

## Client-side (in-memory + optional localStorage)

### RunState

| Field | Type | Description |
|-------|------|-------------|
| `score` | number | 처치·콤보·목표에 따른 가산(규칙은 구현에서 단일 점수식으로 고정) |
| `timeLeftMs` | number \| null | 하드캡 타이머 사용 시 |
| `hp` | number | optional, 0이면 game over |
| `endedReason` | enum | `'time' \| 'hp' \| 'win' \| 'abort'` |
| `startedAt` | number (epoch ms) | 통계/디버그 |

### LocalHiScore

| Field | Type | Description |
|-------|------|-------------|
| `bestScore` | number | `localStorage` 키 예: `fps_best_v1` |
| `lastNickname` | string | 랭킹 제출용 기본값 |

## Leaderboard (Dreamlo — concept)

Dreamlo는 보통 `name` + `score` + (내부) 날짜. **정확한 필드명·정렬**은 [contracts/dreamlo-leaderboard.md](./contracts/dreamlo-leaderboard.md)에 맞춘다.

### RankEntry (view model for UI)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | 표시 닉(길이 제한 클램프) |
| `score` | number | |
| `rank` | number | 1-based, 클라이언트에서 index+1 |

## No persisted user account

- 로그인 없음(과제·잼). 닉은 매 제출마다 입력 또는 랜덤 생성.
