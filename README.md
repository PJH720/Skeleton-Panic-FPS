# RE Tension Game Making

*한국어 문서: [README.ko.md](README.ko.md)*

This project builds a lightweight **web first-person shooter (2.5D raycaster)** using **Spec-Driven Development (SDD)** with [github/spec-kit](https://github.com/github/spec-kit), informed by assignment rules, design notes, FPS references, and the `playfuljs` demo collected under `Temp/`.

## Current state

| Item | Location | Notes |
|------|----------|--------|
| Constitution | [`.specify/memory/constitution.md`](.specify/memory/constitution.md) | `Principle.md` + project principles |
| Active feature | `001-web-fps-raycaster` (branch) | From `specify init` + `create-new-feature` |
| Spec / plan / tasks | [`specs/001-web-fps-raycaster/`](specs/001-web-fps-raycaster/) | `spec.md`, `plan.md`, `tasks.md`, etc. |
| **Implementation** | [`web/`](web/) | `index.html`, `src/main.js` — raycaster, HUD, Dreamlo leaderboard, juice modules |
| Same-LAN access | [`docs/local-lan-sharing.md`](docs/local-lan-sharing.md) | Private IP, port, firewall, `serve` binding |
| AI agent guide | [CLAUDE.md](CLAUDE.md) | Cursor / Claude Code (layout, env, deploy) |

> **Spec Kit** CLI: `specify --help` / `specify check`. If `specs/` and `.specify/` exist at the repo root, you are in SDD mode.

## `Temp/` → SDD artifacts

| `Temp` material | Role in this repo |
|-----------------|-------------------|
| [`Temp/Principle.md`](Temp/Principle.md) | **Course requirements**: direct control, end state & final score, ~2 min, single player, online (interpreted as public URL + ranking), clarity, repeatability, audiovisual → **constitution** + **spec FR/SC** |
| [`Temp/게임 개발 아이디어 및 기획.md`](Temp/게임%20개발%20아이디어%20및%20기획.md) | Hyper-casual, BaaS leaderboard, static deploy, juice, share → **plan.md** / **research.md** |
| [`Temp/1인칭 슈터 게임 개발 레퍼런스.md`](Temp/1인칭%20슈터%20게임%20개발%20레퍼런스.md) | 2.5D raycaster, jsfxr, Dreamlo, Vercel, Web Share → **plan** + **tasks** (juice & net) |
| [`Temp/playfuljs-demos-gh-pages/`](Temp/playfuljs-demos-gh-pages/) (esp. `raycaster/`) | **Reference for implementation**: `Map` / `Player` / `Camera` / `Controls` / `GameLoop` (do not copy-paste; cite license & source) |
| [`Temp/Part 2/`](Temp/Part%202/) | **Pattern only** (Python/pygame). Web uses **state machine + short loop** (title / play / over) — reflected in spec & tasks |

Keep originals in `Temp/`. The **single source of truth** for decisions and requirements is `specs/001-web-fps-raycaster/spec.md` and the evolving **plan**.

## SDD workflow (recommended)

1. **Constitution** — [`.specify/memory/constitution.md`](.specify/memory/constitution.md) caps project decisions.  
2. **Specify** — [`specs/001-web-fps-raycaster/spec.md`](specs/001-web-fps-raycaster/spec.md): *what & why* (minimal tech).  
3. **Plan** — [`specs/001-web-fps-raycaster/plan.md`](specs/001-web-fps-raycaster/plan.md) + [research.md](specs/001-web-fps-raycaster/research.md): *stack & shape* (2.5D, Dreamlo, deploy).  
4. **Tasks** — [`specs/001-web-fps-raycaster/tasks.md`](specs/001-web-fps-raycaster/tasks.md): implementation order.  
5. **Implement** — follow `tasks.md` phases in `web/`, then verify with [`quickstart.md`](specs/001-web-fps-raycaster/quickstart.md).

For Spec Kit skills/slash commands in Cursor: set `SPECIFY_FEATURE=001-web-fps-raycaster` (or follow `create-new-feature` export instructions), then run e.g. `/speckit-implement`.

## Run locally

Serve the `web/` root with the root `package.json` scripts (no build step required).

```bash
npm start
# or: npm run dev
# → http://localhost:3000
```

(There are no extra dependencies; the scripts wrap `npx serve web`.)

With `serve` directly:

```bash
npx --yes serve web -l 3000
```

To open from **another device on the same Wi-Fi** at `http://<your-LAN-IP>:3000`, the server must listen on **all interfaces**, not only `127.0.0.1`. See [`docs/local-lan-sharing.md`](docs/local-lan-sharing.md) for `serve` options, firewall, and DHCP.

If the view stutters on a **MacBook trackpad**, see the “MacBook trackpad” section in [`docs/local-lan-sharing.md`](docs/local-lan-sharing.md).

**Do not commit** env vars or Dreamlo keys (`.env`, Vite `import.meta.env`, Vercel dashboard, etc.). Details: [CLAUDE.md](CLAUDE.md) — Environment.

## SDD review snapshot (2026-04-25)

**Aligned**

- The eight `Principle.md` items are reflected in the constitution and spec; “online” is reasonably read as **public URL + leaderboard**, not PvP.  
- Technical direction from `Temp` (raycaster, jsfxr, Dreamlo, Vercel) matches plan, research, and contracts.  
- `playfuljs` and Part 2 are **mapped in one table** so sources stay clear during implementation.

**Open decisions (one sentence each before locking in)**

- **Movement model**: [spec `FR-010`](specs/001-web-fps-raycaster/spec.md) — on-rails (auto-forward) vs `playfuljs`-style free move. MVP tasks default to free move; on-rails can be a `player` variant later.  
- **Dreamlo private key**: client-side vs Vercel API proxy — risks are noted in `research.md` and `contracts/dreamlo-leaderboard.md`. For a course hand-in, the team should fix the key-exposure policy.

**Next steps**

- Resolve `NEEDS CLARIFICATION` in `spec.md` and add **decision + date** in one line in `spec.md` / `plan.md`.  
- After **static deploy**, add the **production URL** to the “Current state” table above (public link for assignment & ranking).

## License

Add a `LICENSE` at the repo root if your course/team policy requires it. `Temp/playfuljs-demos-gh-pages` must follow the upstream repo and PlayfulJS terms when forking or reusing.
