export class Weapon {
  constructor() {
    this._paces = 0;
  }

  update(paces) { this._paces = paces; }

  // Centre-screen hitscan: returns the nearest living enemy in the crosshair cone
  hitscan(player, enemyList) {
    const cx = Math.cos(player.direction);
    const cy = Math.sin(player.direction);
    let best = null;
    let bestDist = Infinity;

    for (const e of enemyList) {
      if (e.dead) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dot   = dx * cx + dy * cy;
      if (dot < 0.5) continue;              // behind player
      const dist  = Math.sqrt(dx * dx + dy * dy);
      const cross = dx * cy - dy * cx;
      if (Math.abs(cross / dist) < 0.18 && dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    return best;
  }

  // Simple procedural gun shape; replace with sprite later
  draw(ctx, w, h, paces) {
    const bob  = Math.sin(paces * 0.6) * 3;
    const gw   = w  * 0.30;
    const gh   = h  * 0.42;
    const gx   = w  * 0.5 - gw * 0.5;
    const gy   = h  - gh  + bob;

    ctx.save();
    ctx.fillStyle   = '#778899';
    ctx.strokeStyle = '#445566';
    ctx.lineWidth   = 1.5;

    // barrel
    ctx.fillRect(gx + gw * 0.38, gy + gh * 0.05, gw * 0.18, gh * 0.48);
    // body
    ctx.fillRect(gx + gw * 0.18, gy + gh * 0.38, gw * 0.64, gh * 0.48);
    ctx.strokeRect(gx + gw * 0.18, gy + gh * 0.38, gw * 0.64, gh * 0.48);
    // grip highlight
    ctx.fillStyle = '#556677';
    ctx.fillRect(gx + gw * 0.22, gy + gh * 0.60, gw * 0.18, gh * 0.22);

    ctx.restore();
  }
}
