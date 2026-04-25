# Quickstart: 로컬에서 게임 띄우기

**Feature**: `001-web-fps-raycaster` | **Date**: 2026-04-25

## 사전 조건

- Node 없이: 정적 서버만 있으면 됨.
- Node 사용 시: `npx`로 한 번 띄우기(아래).

## 1) 정적 서버 (권장: 프로젝트 루트)

로컬에서 `file://`로 열면 CORS/모듈 이슈가 날 수 있으므로 **http 서버**를 쓴다.

```bash
cd "/path/to/RE Tension Game Making"
# 예: web/ 이 루트가 되도록
npx --yes serve web -l 3000
```

브라우저에서 `http://localhost:3000` 접속.

## 2) 환경 변수 (Dreamlo 등)

- **Vite 사용 시**: `.env.local` (gitignore)에 `VITE_DREAMLO_PRIVATE_KEY=...` 등.
- **바닐라**: 빌드 스크립트에서 `import.meta.env` 대신, 잼용으로 **빈 값이면 "랭킹 비활성 + 로컬만"** UI.

## 3) 체크리스트 (5분)

1. [ ] 타이틀 → 시작 → 이동/시야/사격 가능  
2. [ ] ~2분 내 종료 + 최종 점수 + 재시작  
3. [ ] (키 있을 때) 랭킹 조회/제출 스모크  

## 4) 배포 (Vercel)

- `web`을 루트로 `vercel.json` `output` 또는 루트 `package.json` `build`가 static export만 하게 구성(구현 task에서 상세).
