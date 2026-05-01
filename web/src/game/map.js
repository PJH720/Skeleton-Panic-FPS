const SIZE = 24;
export const CAST_RANGE = 14;

// Flat arena: perimeter walls only, open interior.
const MAZE_DATA = (() => {
  const grid = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < SIZE; i++) {
    grid[i] = 1;                          // top row
    grid[(SIZE - 1) * SIZE + i] = 1;      // bottom row
    grid[i * SIZE] = 1;                   // left col
    grid[i * SIZE + (SIZE - 1)] = 1;      // right col
  }
  return grid;
})();

export class GameMap {
  constructor() {
    this.size  = SIZE;
    this.range = CAST_RANGE;
    this.wallGrid = new Uint8Array(MAZE_DATA);
    this.light = 0;
  }

  reset() {
    this.wallGrid = new Uint8Array(MAZE_DATA);
  }

  get(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return -1;
    return this.wallGrid[y * this.size + x];
  }

  isWall(x, y) { return this.get(x, y) > 0; }

  // Iterative ray-walking cast — avoids O(n²) array allocations of the recursive pattern.
  // EPS guards prevent degenerate steps when sin/cos ≈ 0 due to IEEE 754 rounding.
  cast(point, angle, range) {
    const self = this;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const EPS = 1e-10;       // near-zero denominator guard
    const MAX_STEPS = 64;    // hard cap; 24×24 map with range 14 needs ≤ ~28 real steps

    const results = [];
    let origin = { x: point.x, y: point.y, height: 0, distance: 0 };

    for (let i = 0; i < MAX_STEPS; i++) {
      const sX = step(sin, cos, origin.x, origin.y);
      const sY = step(cos, sin, origin.y, origin.x);
      const next = sX.length2 < sY.length2
        ? inspect(sX, 1, 0, origin.distance, sX.y)
        : inspect(sY, 0, 1, origin.distance, sY.x);

      // No progress guard: degenerate float at exact grid boundary
      if (next.distance <= origin.distance + EPS) break;
      if (next.distance > range) break;
      results.push(next);
      origin = next;
    }
    // Sentinel required by renderer: _drawColumn iterates back-to-front, skips !step.height
    results.push({ length2: Infinity });
    return results;

    function step(rise, run, x, y) {
      // Near-zero run means the ray is nearly parallel to this axis — treat as no crossing
      if (Math.abs(run) < EPS) return { length2: Infinity };
      const dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
      const dy = dx * (rise / run);
      return { x: x + dx, y: y + dy, length2: dx * dx + dy * dy };
    }

    function inspect(s, shiftX, shiftY, dist, offset) {
      const dx = cos < 0 ? shiftX : 0;
      const dy = sin < 0 ? shiftY : 0;
      s.height   = self.get(s.x - dx, s.y - dy);
      s.distance = dist + Math.sqrt(s.length2);
      s.shading  = shiftX ? (cos < 0 ? 2 : 0) : (sin < 0 ? 2 : 1);
      s.offset   = offset - Math.floor(offset);
      return s;
    }
  }
}
