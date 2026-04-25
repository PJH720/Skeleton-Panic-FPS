# RE Tension Game Making

*English: [README.md](README.md)*

`Temp/`에 모은 **과제 규칙·기획·1인칭 슈터 레퍼런스·`playfuljs` 데모**를 바탕으로, [github/spec-kit](https://github.com/github/spec-kit) 기반 **Spec-Driven Development(SDD)** 로 가벼운 **웹 1인칭 슈터(2.5D 레이캐스터)** 를 만든다.

## 현재 상태

| 항목 | 위치 | 비고 |
|------|------|------|
| 헌장(Constitution) | [`.specify/memory/constitution.md`](.specify/memory/constitution.md) | `Principle.md` + 프로젝트 원칙 |
| 활성 기능 브랜치 | `001-web-fps-raycaster` | `specify init` + `create-new-feature`로 생성 |
| 스펙 / 플랜 / 작업 | [`specs/001-web-fps-raycaster/`](specs/001-web-fps-raycaster/) | `spec.md`, `plan.md`, `tasks.md` 등 |
| **구현** | [`web/`](web/) | `index.html`, `src/main.js` — 레이캐스터·HUD·랭킹(Dreamlo)·juice 모듈 |
| 같은 LAN에서 접속 | [`docs/local-lan-sharing.md`](docs/local-lan-sharing.md) | 사설 IP·포트·방화벽·`serve` 바인딩 요약 |
| AI 에이전트 가이드 | [CLAUDE.md](CLAUDE.md) | Cursor / Claude Code 공통(구조·환경·배포) |

> **Spec Kit** CLI: `specify --help` / `specify check`. 프로젝트 루트에서 `specs/`·`.specify/`가 있으면 SDD 모드다.

## `Temp` 자료 → SDD 산출물 매핑

| `Temp` 자료 | 이 레포에서의 역할 |
|-------------|-------------------|
| [`Temp/Principle.md`](Temp/Principle.md) | 수업 **필수 조건**: 직접 조작, 종료·최종 점수, ~2분, 1인, 온라인 접속(공개 URL+랭킹으로 해석), 직관, 반복, 시청각 → **constitution** + **spec FR/SC** |
| [`Temp/게임 개발 아이디어 및 기획.md`](Temp/게임%20개발%20아이디어%20및%20기획.md) | 하이퍼 캐주얼, BaaS 랭킹, 정적 배포, 주스, 공유 — **plan.md** / **research.md** |
| [`Temp/1인칭 슈터 게임 개발 레퍼런스.md`](Temp/1인칭%20슈터%20게임%20개발%20레퍼런스.md) | 2.5D raycaster, jsfxr, Dreamlo, Vercel, Web Share — **plan** + **tasks** (주스·넷) |
| [`Temp/playfuljs-demos-gh-pages/`](Temp/playfuljs-demos-gh-pages/) (특히 `raycaster/`) | **구현 시 참고 코드**: `Map` / `Player` / `Camera` / `Controls` / `GameLoop` 패턴 (직접 복붙 X, 라이선스·출처 명시) |
| [`Temp/Part 2/`](Temp/Part%202/) | **패턴 참고**만(파이썬/pygame). 웹은 **상태 머신 + 짧은 루프** (타이틀 / 플레이 / 오버) — spec·tasks에 이미 반영 |

원본 참고 자료는 `Temp/`에 두고, **의사결정·요구사항의 단일 출처**는 `specs/001-web-fps-raycaster/spec.md`와 갱신되는 **plan**으로 둔다.

## SDD 워크플로 (권장 순서)

1. **Constitution** — `.specify/memory/constitution.md`가 프로젝트 결정의 상한선이다.  
2. **Specify** — [`specs/001-web-fps-raycaster/spec.md`](specs/001-web-fps-raycaster/spec.md): *무엇·왜* (기술 최소).  
3. **Plan** — [`specs/001-web-fps-raycaster/plan.md`](specs/001-web-fps-raycaster/plan.md) + [research.md](specs/001-web-fps-raycaster/research.md): *스택·구조* (2.5D, Dreamlo, 배포).  
4. **Tasks** — [`specs/001-web-fps-raycaster/tasks.md`](specs/001-web-fps-raycaster/tasks.md): 구현 순서.  
5. **Implement** — `tasks.md` Phase 순서로 `web/` 구현, 마지막에 [`quickstart.md`](specs/001-web-fps-raycaster/quickstart.md)로 검증.

Cursor에서 Spec Kit용 스킬/슬래시를 쓰는 경우: `SPECIFY_FEATURE=001-web-fps-raycaster` (또는 `create-new-feature` 출력의 `export` 안내)를 맞춘 뒤 `/speckit-implement` 등을 실행한다.

## 로컬 실행

빌드 없이 정적 서버로 `web/` 루트를 연다(루트 `package.json` 스크립트).

```bash
npm start
# 또는: npm run dev
# → http://localhost:3000
```

(`package.json`에 별도 의존성은 없고, 위 스크립트는 `npx serve web` 래퍼다.)

직접 `serve`를 쓸 때:

```bash
npx --yes serve web -l 3000
```

**같은 Wi-Fi의 다른 기기**에서 `http://<PC 사설 IP>:3000`으로 열려면, 서버가 `127.0.0.1`이 아닌 **모든 인터페이스**에서 듣도록 설정해야 한다. (`serve` 옵션, 방화벽, DHCP 등은 [`docs/local-lan-sharing.md`](docs/local-lan-sharing.md) 참고.)

**MacBook 트랙패드**로 시야가 끊기면 [`docs/local-lan-sharing.md`](docs/local-lan-sharing.md)의 “MacBook 트랙패드” 절을 본다.

환경 변수·Dreamlo 키는 **커밋하지 않는다** (`.env`, Vite `import.meta.env`, Vercel 대시보드 등). 상세는 [CLAUDE.md](CLAUDE.md) Environment 섹션.

## SDD 리뷰 요약 (2026-04-25)

**맞는 점**

- `Principle.md` 8항이 constitution·spec에 흡수되어 있고, "온라인"을 **PVP가 아닌 공개 URL + 리더보드**로 합리적으로 해석했다.  
- `Temp`의 기술 방향(레이캐스터, jsfxr, Dreamlo, Vercel)이 plan·research·contracts와 정렬돼 있다.  
- `playfuljs`·Part 2는 **한 곳에 매핑 표**로 README에 고정해, 이후 구현 시 출처가 흐려지지 않게 했다.

**열려 있는 결정(구현 직전에 1문장으로 고정 권장)**

- **이동 모델**: [spec.md `FR-010`](specs/001-web-fps-raycaster/spec.md) — 레일(자동 전진) vs `playfuljs`식 자유 이동. MVP는 `tasks.md`가 자유 이동을 기본으로 두고, 레일은 `player` 변형으로 후속 가능.  
- **Dreamlo private 키**: 클라이언트直 vs Vercel API 프록시 — `research.md` / `contracts/dreamlo-leaderboard.md`에 취약성 명시됨. 수업 제출이면 키 노출 정책을 팀이 확정.

**다음 액션**

- `spec.md`의 `NEEDS CLARIFICATION` 항목을 팀이 결정한 뒤 `spec.md`·`plan.md`에 **결정 + 날짜** 한 줄로 박는다.  
- **정적 배포**를 하면 [README](README.md) **현재 상태** 표에 **프로덕션 URL**을 한 줄로 갱신한다(과제·랭킹용 공개 링크).

## 라이선스

저장소 루트에 `LICENSE`가 없다면 수업/팀 정책에 맞게 추가한다. `Temp/playfuljs-demos-gh-pages`는 포크/재사용 시 원저장소·PlayfulJS 라이선스를 따른다.
