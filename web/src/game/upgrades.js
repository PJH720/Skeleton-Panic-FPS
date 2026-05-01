// Upgrade pool. Each upgrade mutates ctx = { player, weapon, gameStats, takenSet, stackCounts }.
// oneShot upgrades are removed from the pool after pick; stackable ones can repeat (some with caps).

const SHOOT_COOLDOWN_FLOOR = 0.05;        // s — fireRateMul can't push below this
const WIDERCONE_CAP        = 3;           // max stacks for the wider-cone upgrade

export const UPGRADES = [
  {
    id: 'firerate', name: 'Faster Trigger', desc: '-15% shoot cooldown', oneShot: false,
    apply: ({ gameStats }) => { gameStats.fireRateMul = Math.max(SHOOT_COOLDOWN_FLOOR, gameStats.fireRateMul * 0.85); },
  },
  {
    id: 'damage', name: 'Heavy Rounds', desc: '+1 weapon damage', oneShot: false,
    apply: ({ gameStats }) => { gameStats.weaponDamage += 1; },
  },
  {
    id: 'movespeed', name: 'Swift Boots', desc: '+15% move speed', oneShot: false,
    apply: ({ player }) => { player.moveSpeedMul *= 1.15; },
  },
  {
    id: 'maxhp', name: 'Vitality', desc: '+25 max HP, full heal', oneShot: false,
    apply: ({ player }) => { player.maxHp += 25; player.hp = player.maxHp; },
  },
  {
    id: 'regen', name: 'Regeneration', desc: '+0.5 HP/s', oneShot: false,
    apply: ({ gameStats }) => { gameStats.hpRegen += 0.5; },
  },
  {
    id: 'widercone', name: 'Wide Sights', desc: '+30% hit cone', oneShot: false,
    apply: ({ gameStats }) => { gameStats.coneTan *= 1.3; },
  },
  {
    id: 'pierce', name: 'Piercing Shot', desc: 'Hit all enemies in cone', oneShot: true,
    apply: ({ gameStats }) => { gameStats.pierce = true; },
  },
  {
    id: 'lifesteal', name: 'Vampiric', desc: 'Heal 2 HP per kill', oneShot: true,
    apply: ({ gameStats }) => { gameStats.lifestealOnKill = 2; },
  },
];

export function xpForLevel(level) {
  return 3 + level;
}

function isEligible(upg, taken, stackCounts) {
  if (upg.oneShot && taken.has(upg.id)) return false;
  if (upg.id === 'widercone' && (stackCounts[upg.id] | 0) >= WIDERCONE_CAP) return false;
  return true;
}

export function pickThree(rng, taken, stackCounts) {
  const pool = UPGRADES.filter(u => isEligible(u, taken, stackCounts));
  // Fisher–Yates shuffle of the eligible pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

export function applyUpgrade(upg, ctx) {
  upg.apply(ctx);
  if (upg.oneShot) ctx.takenSet.add(upg.id);
  ctx.stackCounts[upg.id] = (ctx.stackCounts[upg.id] | 0) + 1;
}
