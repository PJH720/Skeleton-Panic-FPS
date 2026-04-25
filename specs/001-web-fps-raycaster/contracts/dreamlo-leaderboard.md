# Contract: Dreamlo Leaderboard (초안)

**Feature**: `001-web-fps-raycaster`  
**Status**: Implementation must verify against [Dreamlo](https://github.com/codecapers/dreamlo) / 공식 URL 최신 문서(마감 직전 재확인).

## Assumptions

- 사용자는 Dreamlo에서 **publicCode** + **privateCode**(또는 구버전 private URL 경로)를 발급받는다.
- **클라이언트에 private 키를 넣는 것은 취약**하다. 잼/수업용 short-lived 키 또는 **서버 프록시** 권장.

## Operations (typical)

### Add score (server-side or direct)

일반적으로 다음 형태의 **HTTP GET** (구현부에서 URL 인코딩 필수):

```http
GET https://dreamlo.com/lb/{privateKey}/add/{name}/{score}
```

- `name`: URL-safe (공백/특수문자 인코딩)  
- `score`: non-negative integer 권장

### List (JSON)

```http
GET https://dreamlo.com/lb/{publicKey}/json
```

Response: Dreamlo의 배열/객체 구조(버전별 상이) — **파서는 1곳**(`web/src/net/dreamlo.js`)에 캡슐화.

## Error handling (UI)

| Condition | User-visible |
|-----------|--------------|
| HTTP non-2xx / parse fail | "랭킹을 불러올 수 없습니다" + [다시] |
| Add fail | "점수는 저장됐어요(로컬). 나중에 다시 시도" |
| No keys configured | "온라인 랭킹 비활성" + 로컬 점수만 |

## Test vectors (after keys exist)

1. `add` 1회 → `json`에 반영(지연 있을 수 있음).  
2. 동일 `name` 재전송 → Dreamlo 정책에 따름(덮기/누적) — **문서 확인**.
