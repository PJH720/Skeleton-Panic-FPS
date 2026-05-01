const TWO_PI     = Math.PI * 2;
const TURN_SPEED = Math.PI;   // rad/s
const MOVE_SPEED = 3;         // grid units/s
const SHOOT_COOLDOWN = 0.3;   // s

export class Player {
  constructor(x, y, direction) {
    this.x            = x;
    this.y            = y;
    this.direction    = direction;
    this.paces        = 0;     // accumulated walk distance (drives weapon bob)
    this.hp           = 100;
    this.maxHp        = 100;
    this._cooldown    = 0;
    this.moveSpeedMul = 1;     // mutated by upgrades
    this.fireRateMul  = 1;     // mutated by upgrades; multiplies SHOOT_COOLDOWN
  }

  reset(x, y, direction) {
    this.x = x; this.y = y; this.direction = direction;
    this.paces = 0;
    this.maxHp = 100;          // upgrades may have grown maxHp last run; reset to base
    this.hp = this.maxHp;
    this._cooldown = 0;
    this.moveSpeedMul = 1;
    this.fireRateMul  = 1;
  }

  rotate(angle) {
    this.direction = (this.direction + angle + TWO_PI) % TWO_PI;
  }

  walk(dist, map) {
    const dx = Math.cos(this.direction) * dist;
    const dy = Math.sin(this.direction) * dist;
    if (!map.isWall(this.x + dx, this.y)) this.x += dx;
    if (!map.isWall(this.x, this.y + dy)) this.y += dy;
    this.paces += Math.abs(dist);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  canShoot() { return this._cooldown <= 0; }

  shoot() { this._cooldown = SHOOT_COOLDOWN * this.fireRateMul; }

  update(input, map, dt) {
    if (input.left)     this.rotate(-TURN_SPEED * dt);
    if (input.right)    this.rotate( TURN_SPEED * dt);
    const speed = MOVE_SPEED * this.moveSpeedMul;
    if (input.forward)  this.walk( speed * dt, map);
    if (input.backward) this.walk(-speed * dt, map);
    // Mouse look applied externally (main.js reads consumeMouseDx)
    if (this._cooldown > 0) this._cooldown -= dt;
  }
}
