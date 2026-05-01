// Difficulty curve constants — see plan §"Difficulty curve"
const HP_BASE = 2,  HP_PER_MIN = 1;
const DMG_BASE = 8, DMG_PER_MIN = 3;
const SPD_BASE = 1.5, SPD_PER_MIN = 0.18, SPD_MAX = 3.2;
const SPAWN_BASE_S = 4.0, SPAWN_MIN_S = 0.45, SPAWN_HALFLIFE_S = 75;
const CAP_BASE = 8, CAP_MAX = 28, CAP_PER_MIN = 2;

const CONTACT_RADIUS    = 0.45;   // grid units
const SPAWN_INITIAL     = 3;
const MIN_SPAWN_DIST    = 5;      // keep first wave off the player

const COLORS = ['#c0392b', '#e74c3c', '#922b21', '#cb4335'];

function statsForElapsed(elapsedS) {
  const m = elapsedS / 60;
  return {
    hp:     Math.max(1, Math.round(HP_BASE  + HP_PER_MIN  * m)),
    damage: Math.max(1, Math.round(DMG_BASE + DMG_PER_MIN * m)),
    speed:  Math.min(SPD_MAX, SPD_BASE + SPD_PER_MIN * m),
  };
}

function spawnIntervalForElapsed(elapsedS) {
  return Math.max(SPAWN_MIN_S, SPAWN_BASE_S * Math.pow(0.5, elapsedS / SPAWN_HALFLIFE_S));
}

function maxAliveForElapsed(elapsedS) {
  const m = elapsedS / 60;
  return Math.min(CAP_MAX, CAP_BASE + Math.floor(CAP_PER_MIN * m));
}

export class Enemy {
  constructor(x, y, stats) {
    this.x      = x;
    this.y      = y;
    this.hp     = stats.hp;
    this.speed  = stats.speed;
    this.damage = stats.damage;
    this.dead   = false;
    this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  /** Returns true if killed */
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) { this.dead = true; return true; }
    return false;
  }

  update(dt, player, map) {
    if (this.dead) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.3) return;
    const nx = (dx / dist) * this.speed * dt;
    const ny = (dy / dist) * this.speed * dt;
    if (!map.isWall(this.x + nx, this.y)) this.x += nx;
    if (!map.isWall(this.x, this.y + ny)) this.y += ny;
  }
}

export class Enemies {
  constructor() {
    this._list       = [];
    this._spawnTimer = 0;
    this._elapsed    = 0;
  }

  reset(map, player) {
    this._list       = [];
    this._spawnTimer = SPAWN_BASE_S;     // first cadence-spawn after base interval
    this._elapsed    = 0;
    for (let i = 0; i < SPAWN_INITIAL; i++) this._trySpawn(map, player);
  }

  getList() { return this._list; }

  update(dt, player, map) {
    this._elapsed += dt;
    this._list = this._list.filter(e => !e.dead);

    this._spawnTimer -= dt;
    if (this._spawnTimer <= 0 && this._list.length < maxAliveForElapsed(this._elapsed)) {
      this._trySpawn(map, player);
      this._spawnTimer = spawnIntervalForElapsed(this._elapsed);
    }

    for (const e of this._list) e.update(dt, player, map);
  }

  /** Returns an enemy touching the player, or null */
  checkContact(player) {
    for (const e of this._list) {
      if (e.dead) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      if (dx * dx + dy * dy < CONTACT_RADIUS * CONTACT_RADIUS) return e;
    }
    return null;
  }

  _trySpawn(map, player) {
    const stats = statsForElapsed(this._elapsed);
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = 1 + Math.random() * (map.size - 2);
      const y = 1 + Math.random() * (map.size - 2);
      if (map.isWall(x, y)) continue;
      if (player) {
        const dx = x - player.x, dy = y - player.y;
        if (dx * dx + dy * dy < MIN_SPAWN_DIST * MIN_SPAWN_DIST) continue;
      }
      this._list.push(new Enemy(x, y, stats));
      return;
    }
  }
}
