const MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

/** Trackpad horizontal scroll → look; tuned near movementX * 0.003 */
const WHEEL_LOOK_X = 0.002;

const KEY_MAP = {
  ArrowUp: 'forward',  KeyW: 'forward',  KeyI: 'forward',
  ArrowDown: 'backward', KeyS: 'backward', KeyK: 'backward',
  ArrowLeft: 'left',   KeyA: 'left',     KeyJ: 'left',
  ArrowRight: 'right', KeyD: 'right',    KeyL: 'right',
};

export class Input {
  constructor() {
    this.forward  = false;
    this.backward = false;
    this.left     = false;
    this.right    = false;
    this._shootQueued = false;
    this._mouseDx = 0;
    this._locked  = false;

    document.addEventListener('keydown', this._onKey.bind(this, true));
    document.addEventListener('keyup',   this._onKey.bind(this, false));
    document.addEventListener('click',   this._onMouseClick.bind(this));
    document.addEventListener('mousemove',        this._onMouseMove.bind(this));
    document.addEventListener('touchstart', this._onTouch.bind(this),   { passive: false });
    document.addEventListener('touchmove',  this._onTouch.bind(this),   { passive: false });
    document.addEventListener('touchend',   this._onTouchEnd.bind(this),{ passive: false });
    document.addEventListener('pointerlockchange', () => {
      this._locked = !!document.pointerLockElement;
    });
    document.addEventListener('wheel', this._onWheel.bind(this), { passive: false });
  }

  requestPointerLock(element) {
    if (!MOBILE && !this._locked) element.requestPointerLock?.();
  }

  /** Returns true once per press (edge-trigger) */
  consumeShoot() {
    const v = this._shootQueued;
    this._shootQueued = false;
    return v;
  }

  /** Returns accumulated mouse-look delta and resets it */
  consumeMouseDx() {
    const v = this._mouseDx;
    this._mouseDx = 0;
    return v;
  }

  _onKey(val, e) {
    const action = KEY_MAP[e.code];
    if (action) { this[action] = val; e.preventDefault(); return; }
    if (e.code === 'Space' && val) { this._shootQueued = true; e.preventDefault(); }
  }

  _onMouseClick() { this._shootQueued = true; }

  _onMouseMove(e) {
    if (this._locked) this._mouseDx += e.movementX * 0.003;
  }

  /**
   * macOS trackpad often sends horizontal look as wheel deltaX, not mousemove.
   * preventDefault only when we apply deltaX so browser back/forward gestures do not steal the event.
   */
  _onWheel(e) {
    if (!this._locked || Math.abs(e.deltaX) < 1e-6) return;
    this._mouseDx += e.deltaX * WHEEL_LOOK_X;
    e.preventDefault();
  }

  // Touch layout: top-half = forward, bottom-left = turn left, bottom-right = turn right
  // Second simultaneous touch = shoot.  (Fixes playfuljs typo: pageX not pageY for right check)
  _onTouch(e) {
    e.preventDefault();
    this._clearMove();
    const t = e.touches[0];
    if (t.pageY < window.innerHeight * 0.5) {
      this.forward = true;
    } else if (t.pageX < window.innerWidth * 0.5) {
      this.left = true;
    } else {
      this.right = true;                     // fixed: was pageY > innerWidth (typo in playfuljs)
    }
    if (e.touches.length > 1) this._shootQueued = true;
  }

  _onTouchEnd(e) {
    e.preventDefault();
    if (e.touches.length === 0) this._clearMove();
  }

  _clearMove() {
    this.forward = this.backward = this.left = this.right = false;
  }
}
