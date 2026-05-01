import { GameMap }    from './game/map.js';
import { Player }     from './game/player.js';
import { Camera }     from './game/camera.js';
import { Input }      from './game/input.js';
import { GameLoop }   from './game/loop.js';
import { HUD }        from './ui/hud.js';
import { Weapon }     from './game/weapon.js';
import { Enemies }    from './game/enemies.js';
import { Juice }      from './game/juice.js';
import { Leaderboard} from './ui/leaderboard.js';
import { UpgradeModal } from './ui/upgradeModal.js';
import { pickThree, applyUpgrade, xpForLevel } from './game/upgrades.js';
import { playSound, resumeAudio } from './game/audio.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const SPAWN_X            = 12;
const SPAWN_Y            = 12;
const SPAWN_DIR          = Math.PI * 0.3;
const CONTACT_COOLDOWN_S = 1.0;
const SCORE_PER_KILL     = 100;
const MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// ── DOM ───────────────────────────────────────────────────────────────────────
const canvas     = /** @type {HTMLCanvasElement} */ (document.getElementById('display'));
const ctx        = canvas.getContext('2d');
const nickForm   = document.getElementById('nick-form');
const nickInput  = document.getElementById('nick-input');
const nickSubmit = document.getElementById('nick-submit');

// ── Modules ───────────────────────────────────────────────────────────────────
const map         = new GameMap();
const player      = new Player(SPAWN_X, SPAWN_Y, SPAWN_DIR);
const camera      = new Camera();
const input       = new Input();
const hud         = new HUD();
const weapon      = new Weapon();
const enemies     = new Enemies();
const juice       = new Juice();
const leaderboard = new Leaderboard();
const upgradeModal = new UpgradeModal();

// ── Game state ────────────────────────────────────────────────────────────────
let state            = 'title';  // 'title' | 'play' | 'levelup' | 'over'
let score            = 0;
let elapsedMs        = 0;
let finalElapsedMs   = 0;
let contactCooldown  = 0;
let bestScore        = parseInt(localStorage.getItem('fps_best_v2') ?? '0', 10);
let nick             = localStorage.getItem('fps_last_nick') ?? '';

// Progression
let level            = 1;
let xp               = 0;
let pendingLevelUps  = 0;
let pendingChoices   = null;
let gameStats        = freshStats();
const takenSet       = new Set();
const stackCounts    = {};

function freshStats() {
  return {
    weaponDamage: 1,
    fireRateMul:  1,
    hpRegen:      0,
    coneTan:      0.18,
    pierce:       false,
    lifestealOnKill: 0,
  };
}

// ── Canvas resize ─────────────────────────────────────────────────────────────
function resize() {
  const scale = MOBILE ? 0.5 : 1.0;
  canvas.width  = Math.floor(window.innerWidth  * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  camera.resize(canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

// Re-acquire pointer lock after macOS/browser breaks it (e.g. trackpad back/forward gesture)
canvas.addEventListener('click', () => {
  if (state === 'play') input.requestPointerLock(canvas);
});

// ── Nick form ─────────────────────────────────────────────────────────────────
nickInput.addEventListener('input',   () => { nick = nickInput.value; });
nickInput.addEventListener('keydown', e  => { if (e.key === 'Enter') submitScore(); });
nickSubmit.addEventListener('click',  ()  => submitScore());

function showNickForm() {
  nickInput.value = nick;
  nickForm.style.display = 'block';
  nickInput.focus();
}

function hideNickForm() { nickForm.style.display = 'none'; }

async function submitScore() {
  const name = nick.trim();
  if (!name) return;
  localStorage.setItem('fps_last_nick', name);
  hideNickForm();
  await leaderboard.submit(name, score);
}

// ── State transitions ─────────────────────────────────────────────────────────
function startGame() {
  score            = 0;
  elapsedMs        = 0;
  contactCooldown  = 0;
  level            = 1;
  xp               = 0;
  pendingLevelUps  = 0;
  pendingChoices   = null;
  gameStats        = freshStats();
  takenSet.clear();
  for (const k of Object.keys(stackCounts)) delete stackCounts[k];
  map.reset();
  player.reset(SPAWN_X, SPAWN_Y, SPAWN_DIR);
  enemies.reset(map, player);
  juice.reset();
  leaderboard.hide();
  hideNickForm();
  state = 'play';
  input.modalActive = false;
  input.consumeShoot();   // drain the click that started the run — no stray frame-1 shot
  input.requestPointerLock(canvas);
  playSound.start();
}

function endGame() {
  finalElapsedMs = elapsedMs;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('fps_best_v2', String(bestScore));
  }
  state = 'over';
  input.modalActive = false;
  document.exitPointerLock?.();
  leaderboard.show();
  playSound.gameover();
  showNickForm();
}

function enterLevelUp() {
  pendingChoices = pickThree(Math.random, takenSet, stackCounts);
  if (pendingChoices.length === 0) {     // safety: nothing left to pick (shouldn't happen)
    pendingLevelUps = 0;
    return;
  }
  document.exitPointerLock?.();
  input.modalActive = true;
  input.consumeChoice();                 // drain any stale digit press
  state = 'levelup';
  playSound.start();                     // reuse start chime
}

function exitLevelUp(idx) {
  const upg = pendingChoices?.[idx];
  if (upg) applyUpgrade(upg, { player, weapon, gameStats, takenSet, stackCounts });
  pendingLevelUps = Math.max(0, pendingLevelUps - 1);
  pendingChoices  = null;
  input.consumeShoot();                  // drain the modal-area click that picked the card
  if (pendingLevelUps > 0) {
    enterLevelUp();
    return;
  }
  state = 'play';
  input.modalActive = false;
  input.requestPointerLock(canvas);
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'title')   { updateTitle();   return; }
  if (state === 'over')    { updateOver();    return; }
  if (state === 'levelup') { updateLevelUp(); return; }
  updatePlay(dt);
}

function updateTitle() {
  if (input.consumeShoot()) startGame();
  if (input.forward)        startGame();
}

function updateLevelUp() {
  const c = input.consumeChoice();
  if (c >= 1 && c <= 3) exitLevelUp(c - 1);
  // Drain shoot so a click on the modal-area doesn't bleed into the next 'play' frame
  input.consumeShoot();
}

function updatePlay(dt) {
  resumeAudio();

  // Mouse look
  const dx = input.consumeMouseDx();
  if (dx) player.rotate(dx);

  // Player fire-rate multiplier reflects current upgrades
  player.fireRateMul = gameStats.fireRateMul;

  player.update(input, map, dt);
  weapon.update(player.paces);
  enemies.update(dt, player, map);
  juice.update(dt);

  // Elapsed time count-up (drives enemy scaling)
  elapsedMs += dt * 1000;

  // HP regen
  if (gameStats.hpRegen > 0 && player.hp > 0) {
    player.hp = Math.min(player.maxHp, player.hp + gameStats.hpRegen * dt);
  }

  // Player death
  if (player.hp <= 0) { endGame(); return; }

  // Enemy contact damage (cooldown-gated, per-enemy damage)
  contactCooldown = Math.max(0, contactCooldown - dt);
  const touching = enemies.checkContact(player);
  if (touching && contactCooldown <= 0) {
    player.takeDamage(touching.damage);
    contactCooldown = CONTACT_COOLDOWN_S;
    juice.hitFlash();
    juice.shake(0.12, 5);
    playSound.damage();
    if (player.hp <= 0) { endGame(); return; }
  }

  // Shoot
  if (input.consumeShoot() && player.canShoot()) {
    player.shoot();
    juice.muzzleFlash();
    juice.shake(0.07, 3);
    playSound.shoot();

    const list = enemies.getList();
    const targets = gameStats.pierce
      ? weapon.hitscanAll(player, list, gameStats.coneTan)
      : (() => { const h = weapon.hitscan(player, list, gameStats.coneTan); return h ? [h] : []; })();

    for (const t of targets) {
      const killed = t.takeDamage(gameStats.weaponDamage);
      if (killed) {
        score += SCORE_PER_KILL;
        if (gameStats.lifestealOnKill > 0) {
          player.hp = Math.min(player.maxHp, player.hp + gameStats.lifestealOnKill);
        }
        gainXp(1);
        playSound.kill();
      } else {
        playSound.hit();
      }
    }
  }

  // Frame-boundary entry into level-up — never mid-collision
  if (pendingLevelUps > 0) enterLevelUp();
}

function gainXp(amount) {
  xp += amount;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    pendingLevelUps++;
  }
}

function updateOver() {
  if (input.consumeShoot()) {
    hideNickForm();
    state = 'title';
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (state === 'title')   { renderTitle(w, h);   return; }
  if (state === 'play')    { renderPlay(w, h);    return; }
  if (state === 'levelup') { renderLevelUp(w, h); return; }
  renderOver(w, h);
}

function renderTitle(w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a0000');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#e74c3c';
  ctx.font = `bold ${Math.floor(h * 0.10)}px monospace`;
  ctx.fillText('RE TENSION', w / 2, h * 0.34);

  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.floor(h * 0.04)}px monospace`;
  ctx.fillText('SURVIVE THE SWARM', w / 2, h * 0.46);

  const blink = Math.floor(performance.now() / 600) % 2;
  ctx.fillStyle = blink ? '#ccc' : 'transparent';
  ctx.font = `${Math.floor(h * 0.034)}px monospace`;
  ctx.fillText(MOBILE ? 'TAP TO START' : 'CLICK / SPACE TO START', w / 2, h * 0.62);

  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.font = `${Math.floor(h * 0.024)}px monospace`;
  ctx.fillText('WASD / IJKL · MOUSE LOOK · CLICK / SPACE TO SHOOT', w / 2, h * 0.78);
  ctx.font = `${Math.floor(h * 0.020)}px monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.fillText('LEVEL UP TO PICK UPGRADES (1 / 2 / 3)', w / 2, h * 0.83);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText(`BEST SCORE: ${bestScore}`, w / 2, h * 0.87);
}

function renderPlay(w, h) {
  camera.render(ctx, player, map, enemies, weapon, juice);
  hud.draw(ctx, w, h, score, player.hp, player.maxHp, elapsedMs, level, xp, xpForLevel(level), bestScore);
  leaderboard.drawMini(ctx, w);
}

function renderLevelUp(w, h) {
  // Draw the frozen play scene under the modal
  renderPlay(w, h);
  upgradeModal.draw(ctx, w, h, pendingChoices, level);
}

function renderOver(w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.87)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#e74c3c';
  ctx.font = `bold ${Math.floor(h * 0.09)}px monospace`;
  ctx.fillText('GAME OVER', w / 2, h * 0.20);

  const secs = Math.max(0, Math.floor(finalElapsedMs / 1000));
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(h * 0.045)}px monospace`;
  ctx.fillText(`SURVIVED ${mm}:${ss}`, w / 2, h * 0.30);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(h * 0.06)}px monospace`;
  ctx.fillText(`SCORE ${score}`, w / 2, h * 0.40);

  ctx.fillStyle = '#f1c40f';
  ctx.font = `${Math.floor(h * 0.030)}px monospace`;
  ctx.fillText(`LV ${level}  ·  BEST ${bestScore}`, w / 2, h * 0.47);

  leaderboard.draw(ctx, w, h);

  const blink = Math.floor(performance.now() / 700) % 2;
  ctx.fillStyle = blink ? '#888' : 'transparent';
  ctx.font = `${Math.floor(h * 0.026)}px monospace`;
  ctx.fillText(MOBILE ? 'TAP TO RETRY' : 'CLICK / SPACE TO RETRY', w / 2, h * 0.93);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
new GameLoop((dt) => { update(dt); render(); }).start();
