const FOCAL_LENGTH   = 0.8;
const LIGHT_RANGE    = 5;
const SKEL_ASPECT    = 92 / 128;   // natural width/height of skeleton sprite

const _skelImg = new Image();
_skelImg.src = 'public/assets/skeleton.png';

// RGB base colors per shading index (0=east face, 1=south face, 2=west/north face)
const WALL_RGB = [
  [160, 90, 90],   // 0: east
  [120, 70, 70],   // 1: south
  [ 90, 55, 55],   // 2: west/north (darker)
];

export class Camera {
  constructor() {
    this.width  = 1;
    this.height = 1;
    this._res   = 1;   // ray count = canvas width
    this._col   = 1;   // pixel width per column
  }

  resize(w, h) {
    this.width  = w;
    this.height = h;
    this._res   = w;   // one ray per pixel column
    this._col   = 1;
  }

  // Main render: 3D view + sprites + weapon overlay + juice
  render(ctx, player, map, enemies, weapon, juice) {
    ctx.save();
    juice.applyShake(ctx);

    this._drawSky(ctx);
    this._drawFloor(ctx);
    this._drawColumns(ctx, player, map);
    this._drawSprites(ctx, player, enemies);
    weapon.draw(ctx, this.width, this.height, player.paces);

    ctx.restore();

    // Overlays drawn after ctx.restore so shake doesn't affect them
    juice.drawMuzzleFlash(ctx, this.width, this.height);
    juice.drawHitFlash(ctx, this.width, this.height);
  }

  _drawSky(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.height * 0.5);
    g.addColorStop(0, '#1a1a2e');
    g.addColorStop(1, '#16213e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.width, this.height * 0.5);
  }

  _drawFloor(ctx) {
    const g = ctx.createLinearGradient(0, this.height * 0.5, 0, this.height);
    g.addColorStop(0, '#1c1c1c');
    g.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = g;
    ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
  }

  _drawColumns(ctx, player, map) {
    for (let col = 0; col < this._res; col++) {
      const x     = col / this._res - 0.5;          // -0.5 … +0.5
      const angle = Math.atan2(x, FOCAL_LENGTH);
      const ray   = map.cast(player, player.direction + angle, map.range);
      this._drawColumn(ctx, col, ray, angle);
    }
  }

  _drawColumn(ctx, col, ray, angle) {
    const left  = Math.floor(col * this._col);
    const width = Math.ceil(this._col);

    for (let s = ray.length - 1; s >= 0; s--) {
      const step = ray[s];
      if (!step.height) continue;

      const wall = this._project(step.height, angle, step.distance);
      if (!wall) continue;

      const shade    = Math.max(0, 1 - step.distance / LIGHT_RANGE);
      const base     = WALL_RGB[step.shading] ?? WALL_RGB[0];
      const r = Math.floor(base[0] * shade);
      const g = Math.floor(base[1] * shade);
      const b = Math.floor(base[2] * shade);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(left, wall.top, width, wall.height);
    }
  }

  _project(height, angle, distance) {
    const z = distance * Math.cos(angle);
    if (z < 0.1) return null;
    const wallH = this.height * height / z;
    const bottom = (this.height / 2) * (1 + 1 / z);
    return { top: bottom - wallH, height: wallH };
  }

  // Billboard sprite rendering (2.5D painter's algorithm — far-first)
  _drawSprites(ctx, player, enemies) {
    const list = enemies.getList().filter(e => !e.dead);

    list.sort((a, b) => {
      const da = (a.x - player.x) ** 2 + (a.y - player.y) ** 2;
      const db = (b.x - player.x) ** 2 + (b.y - player.y) ** 2;
      return db - da;
    });

    const halfFOV = Math.atan2(0.5, FOCAL_LENGTH);

    for (const enemy of list) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.2) continue;

      // Angle relative to player direction, clamped to [-π, π]
      const relAngle = ((Math.atan2(dy, dx) - player.direction + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      if (Math.abs(relAngle) > halfFOV + 0.15) continue;

      const sprH  = Math.min(this.height / dist, this.height * 1.5);
      const sprW  = sprH * SKEL_ASPECT;
      const scrX  = ((relAngle / halfFOV) + 1) * 0.5 * this.width;
      const scrY  = this.height / 2 - sprH / 2;
      const sx    = scrX - sprW / 2;

      ctx.save();
      if (_skelImg.complete && _skelImg.naturalWidth > 0) {
        // 'screen' blend: dark background pixels vanish, bone pixels show through
        ctx.globalCompositeOperation = 'screen';
        // Fade with distance for depth
        ctx.globalAlpha = Math.max(0.25, 1 - dist / (LIGHT_RANGE * 1.6));
        ctx.drawImage(_skelImg, sx, scrY, sprW, sprH);
      } else {
        // Fallback while image loads
        ctx.fillStyle = enemy.color;
        ctx.fillRect(sx, scrY, sprW, sprH);
      }
      ctx.restore();
    }
  }
}
