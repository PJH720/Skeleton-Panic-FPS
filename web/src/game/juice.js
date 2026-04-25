export class Juice {
  constructor() { this.reset(); }

  reset() {
    this._shakeTtl  = 0;
    this._shakeAmp  = 0;
    this._muzzleTtl = 0;
    this._hitTtl    = 0;
    this.offsetX    = 0;
    this.offsetY    = 0;
  }

  shake(duration = 0.15, amplitude = 6) {
    this._shakeTtl = duration;
    this._shakeAmp = amplitude;
  }

  muzzleFlash() { this._muzzleTtl = 0.06; }
  hitFlash()    { this._hitTtl    = 0.14; }

  update(dt) {
    if (this._shakeTtl > 0) {
      this._shakeTtl -= dt;
      const t = this._shakeAmp * (this._shakeTtl / 0.15);
      this.offsetX = (Math.random() * 2 - 1) * t;
      this.offsetY = (Math.random() * 2 - 1) * t;
    } else {
      this.offsetX = this.offsetY = 0;
    }
    if (this._muzzleTtl > 0) this._muzzleTtl -= dt;
    if (this._hitTtl    > 0) this._hitTtl    -= dt;
  }

  applyShake(ctx) {
    if (this.offsetX || this.offsetY) ctx.translate(this.offsetX, this.offsetY);
  }

  drawMuzzleFlash(ctx, w, h) {
    if (this._muzzleTtl <= 0) return;
    const alpha = (this._muzzleTtl / 0.06) * 0.45;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fffaaa';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  drawHitFlash(ctx, w, h) {
    if (this._hitTtl <= 0) return;
    const alpha = (this._hitTtl / 0.14) * 0.38;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
