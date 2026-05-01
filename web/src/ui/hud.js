export class HUD {
  draw(ctx, w, h, score, hp, maxHp, elapsedMs, level, xp, xpNeeded, bestScore) {
    this._crosshair(ctx, w, h);
    this._score(ctx, score, bestScore);
    this._hpBar(ctx, w, h, hp, maxHp);
    this._xpBar(ctx, w, h, level, xp, xpNeeded);
    this._timer(ctx, w, elapsedMs);
  }

  _crosshair(ctx, w, h) {
    const cx = w / 2, cy = h / 2, s = 9;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
    ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
    ctx.stroke();
    ctx.restore();
  }

  _score(ctx, score, best) {
    ctx.save();
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${score}`, 14, 28);
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(`BEST   ${best}`, 14, 46);
    ctx.restore();
  }

  _hpBar(ctx, w, h, hp, maxHp) {
    const bw = 130, bh = 13;
    const bx = 14, by = h - 32;
    const ratio = Math.max(0, Math.min(1, hp / maxHp));
    const barColor = ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = barColor;
    ctx.fillRect(bx, by, bw * ratio, bh);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HP ${Math.round(hp)} / ${maxHp}`, bx + bw / 2, by + bh - 1);
    ctx.restore();
  }

  _xpBar(ctx, w, h, level, xp, xpNeeded) {
    const bw = 130, bh = 7;
    const bx = 14, by = h - 14;
    const ratio = xpNeeded > 0 ? Math.max(0, Math.min(1, xp / xpNeeded)) : 0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(bx, by, bw * ratio, bh);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`LV ${level}`, bx + bw + 8, by + bh);
    ctx.restore();
  }

  _timer(ctx, w, elapsedMs) {
    const secs = Math.max(0, Math.floor(elapsedMs / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    ctx.save();
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(`${mm}:${ss}`, w - 14, 28);
    ctx.restore();
  }
}
