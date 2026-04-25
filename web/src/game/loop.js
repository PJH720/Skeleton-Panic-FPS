export class GameLoop {
  constructor(onTick) {
    this._onTick = onTick;
    this._last = null;
    this._rafId = null;
  }

  start() {
    this._last = performance.now();
    this._rafId = requestAnimationFrame(this._tick.bind(this));
  }

  stop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _tick(now) {
    const dt = Math.min((now - this._last) / 1000, 0.05); // cap delta at 50 ms
    this._last = now;
    this._onTick(dt);
    this._rafId = requestAnimationFrame(this._tick.bind(this));
  }
}
