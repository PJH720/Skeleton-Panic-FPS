const HP_PER_ENEMY   = 2;
const MOVE_SPEED     = 1.5;    // grid units/s
const CONTACT_RADIUS = 0.45;   // grid units
const MAX_ENEMIES    = 8;
const SPAWN_INTERVAL = 7;      // s between additional spawns
const SPAWN_INITIAL  = 3;

const COLORS = ['#c0392b', '#e74c3c', '#922b21', '#cb4335'];

export class Enemy {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.hp   = HP_PER_ENEMY;
    this.dead = false;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
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
    const nx = (dx / dist) * MOVE_SPEED * dt;
    const ny = (dy / dist) * MOVE_SPEED * dt;
    if (!map.isWall(this.x + nx, this.y)) this.x += nx;
    if (!map.isWall(this.x, this.y + ny)) this.y += ny;
  }
}

export class Enemies {
  constructor() {
    this._list        = [];
    this._spawnTimer  = SPAWN_INTERVAL;
  }

  reset(map) {
    this._list       = [];
    this._spawnTimer = 3;          // first extra spawn after 3 s
    for (let i = 0; i < SPAWN_INITIAL; i++) this._trySpawn(map);
  }

  getList() { return this._list; }

  update(dt, player, map) {
    // Prune dead enemies
    this._list = this._list.filter(e => !e.dead);

    this._spawnTimer -= dt;
    if (this._spawnTimer <= 0 && this._list.length < MAX_ENEMIES) {
      this._trySpawn(map);
      this._spawnTimer = SPAWN_INTERVAL;
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

  _trySpawn(map) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = 1 + Math.random() * (map.size - 2);
      const y = 1 + Math.random() * (map.size - 2);
      if (!map.isWall(x, y)) { this._list.push(new Enemy(x, y)); return; }
    }
  }
}
