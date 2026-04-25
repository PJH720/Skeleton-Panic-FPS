const TIMER_WARN_MS = 30_000;

export class HUD {
  draw(ctx, w, h, score, hp, maxHp, timeLeftMs, bestScore) {
    this._crosshair(ctx, w, h);
    this._score(ctx, score, bestScore);
    this._hpBar(ctx, w, h, hp, maxHp);
    this._timer(ctx, w, timeLeftMs);
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
    const ratio = hp / maxHp;
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
    ctx.fillText(`HP ${hp}`, bx + bw / 2, by + bh - 1);
    ctx.restore();
  }

  _timer(ctx, w, timeLeftMs) {
    const warn = timeLeftMs < TIMER_WARN_MS;
    const secs = Math.max(0, Math.ceil(timeLeftMs / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    ctx.save();
    ctx.font = `bold ${warn ? 22 : 18}px monospace`;
    ctx.fillStyle = warn ? '#e74c3c' : '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(`${mm}:${ss}`, w - 14, 28);
    ctx.restore();
  }
}
