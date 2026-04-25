# RE Tension Game Making

*Korean: [README.ko.md](README.ko.md)*

A **2-minute score-attack web FPS (2.5D raycaster)**.  
Fight fast, survive the timer, and post your nickname to the leaderboard.

## Game Overview

- Genre: hyper-casual FPS with 2.5D raycasting
- Session length: about 2 minutes
- Goal: maximize score before time runs out
- Scoring: gain points by defeating enemies
- End conditions: timer reaches zero or HP drops to zero

## Controls

### Desktop

- Move: `WASD` or arrow keys (`IJKL` also supported)
- Look: mouse movement (pointer lock)
- Shoot: mouse click or `Space`

### Mobile

- Touch upper half: move forward
- Touch lower-left / lower-right: turn left / right
- Two-finger touch: shoot

## Gameplay Loop

1. Start from the title screen
2. Fight for 2 minutes (HUD shows score, HP, timer)
3. Enter nickname on game over
4. Submit score to leaderboard

## Quick Start

```bash
npm start
# or npm run dev
```

- Default URL: `http://localhost:3000`
- Scripts serve the `web/` directory directly.

## Project Structure

- `web/`: game implementation (`index.html`, `src/main.js`, etc.)
- `docs/`: run/share guides
- `Temp/`: reference and source materials

## Access from Other Devices

To access on the same Wi-Fi, open `http://<your-local-ip>:3000` on another device.  
For firewall, binding, and trackpad notes, see `docs/local-lan-sharing.md`.

## Development Notes

- Do not commit secrets such as `.env` values or API keys.
- For agent workflow conventions, see `CLAUDE.md` and `AGENTS.md`.

## License

Add a root `LICENSE` if required by your course/team policy.
