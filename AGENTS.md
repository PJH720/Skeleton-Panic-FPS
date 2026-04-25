## Learned User Preferences

- 이 프로젝트에서는 GitHub spec-kit 기반 Spec-Driven Development를 쓴다: 헌장(`constitution`) → 스펙(`specify`) → 계획(`plan`) → 작업 분해(`tasks`) → 구현(`implement`) 순으로 진행하는 흐름을 선호한다.
- 백엔드·배포 선택은 범위에 따라 다르다: URL 공유와 가벼운 랭킹이면 정적 호스팅과 Dreamlo·Firebase 등 최소 백엔드가 후보이고, 로그인·DB·실시간 동기화가 필요해지면 Supabase 같은 풀 BaaS를 검토한다.
- Assistant 응답은 한국어로 한다.

## Learned Workspace Facts

- Git 원격은 `https://github.com/PJH720/RE-Tension-Game-Making.git`이며, 기본 브랜치는 `main`으로 통합된 상태다.
- 프로젝트 헌장은 `.specify/memory/constitution.md`에 있고, 활성 스펙·플랜·태스크는 `specs/001-web-fps-raycaster/`에 모아 둔다.
- 목표는 브라우저에서 동작하는 가벼운 1인칭 슈터(2.5D 레이캐스터)이며, `Temp/Principle.md`와 기획·레퍼런스 문서가 요구사항의 주요 근거다.
- MVP 이동·조작은 playfuljs `raycaster` 스타일의 자유 이동을 기본으로 두고, 레일·자동 전진 위주 모드는 후속 버전에서 선택할 수 있게 둔다.
- 온라인 점수는 Dreamlo 같은 경량 HTTP API를 가정하며, 비공개 키·시크릿은 저장소에 넣지 않는다.
- 레이캐스터 에셋이 로컬에 없을 때는 `hunterloftis.github.io/playfuljs-demos/raycaster/` 같은 공개 미러 URL을 쓸 수 있다는 전제가 스펙·구현에 있다.
- `.gitignore`에 `CLAUDE.md`, `.cursor/`, `.claude/`, `.specify/`, `Temp/`, `.env`가 포함되어 있어 해당 경로는 일반적으로 Git에 올리지 않는다.
