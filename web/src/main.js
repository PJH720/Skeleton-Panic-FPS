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
import { playSound, resumeAudio } from './game/audio.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const GAME_TIME_MS        = 120_000;
const DAMAGE_PER_CONTACT  = 10;
const CONTACT_COOLDOWN_S  = 1.0;
const SCORE_PER_KILL      = 100;
const MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// ── DOM ───────────────────────────────────────────────────────────────────────
const canvas     = /** @type {HTMLCanvasElement} */ (document.getElementById('display'));
const ctx        = canvas.getContext('2d');
const nickForm   = document.getElementById('nick-form');
const nickInput  = document.getElementById('nick-input');
const nickSubmit = document.getElementById('nick-submit');

// ── Modules ───────────────────────────────────────────────────────────────────
const map        = new GameMap();
const player     = new Player(15.3, 1.2, Math.PI * 0.3);
const camera     = new Camera();
const input      = new Input();
const hud        = new HUD();
const weapon     = new Weapon();
const enemies    = new Enemies();
const juice      = new Juice();
const leaderboard= new Leaderboard();

// ── Game state ────────────────────────────────────────────────────────────────
let state            = 'title';  // 'title' | 'play' | 'over'
let score            = 0;
let timeLeftMs       = GAME_TIME_MS;
let contactCooldown  = 0;
let endReason        = '';
let bestScore        = parseInt(localStorage.getItem('fps_best_v1') ?? '0', 10);
let nick             = localStorage.getItem('fps_last_nick') ?? '';

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
  score           = 0;
  timeLeftMs      = GAME_TIME_MS;
  contactCooldown = 0;
  endReason       = '';
  map.reset();
  player.reset(15.3, 1.2, Math.PI * 0.3);
  enemies.reset(map);
  juice.reset();
  leaderboard.hide();
  hideNickForm();
  state = 'play';
  input.requestPointerLock(canvas);
  playSound.start();
}

function endGame(reason) {
  endReason = reason;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('fps_best_v1', String(bestScore));
  }
  state = 'over';
  leaderboard.show();
  playSound.gameover();
  showNickForm();
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'title') { updateTitle(); return; }
  if (state === 'over')  { updateOver();  return; }
  updatePlay(dt);
}

function updateTitle() {
  if (input.consumeShoot()) startGame();
  if (input.forward)        startGame();
}

function updatePlay(dt) {
  resumeAudio();

  // Mouse look
  const dx = input.consumeMouseDx();
  if (dx) player.rotate(dx);

  player.update(input, map, dt);
  weapon.update(player.paces);
  enemies.update(dt, player, map);
  juice.update(dt);

  // Countdown timer
  timeLeftMs -= dt * 1000;
  if (timeLeftMs <= 0) { timeLeftMs = 0; endGame('time'); return; }

  // Player death
  if (player.hp <= 0) { endGame('hp'); return; }

  // Enemy contact damage (cooldown-gated)
  contactCooldown = Math.max(0, contactCooldown - dt);
  if (enemies.checkContact(player) && contactCooldown <= 0) {
    player.takeDamage(DAMAGE_PER_CONTACT);
    contactCooldown = CONTACT_COOLDOWN_S;
    juice.hitFlash();
    juice.shake(0.12, 5);
    playSound.damage();
  }

  // Shoot
  if (input.consumeShoot() && player.canShoot()) {
    player.shoot();
    juice.muzzleFlash();
    juice.shake(0.07, 3);
    playSound.shoot();

    const hit = weapon.hitscan(player, enemies.getList());
    if (hit) {
      const killed = hit.takeDamage(1);
      if (killed) { score += SCORE_PER_KILL; playSound.kill(); }
      else        { playSound.hit(); }
    }
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

  if (state === 'title') { renderTitle(w, h); return; }
  if (state === 'play')  { renderPlay(w, h);  return; }
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
  ctx.fillText('FPS RAYCASTER', w / 2, h * 0.46);

  const blink = Math.floor(performance.now() / 600) % 2;
  ctx.fillStyle = blink ? '#ccc' : 'transparent';
  ctx.font = `${Math.floor(h * 0.034)}px monospace`;
  ctx.fillText(MOBILE ? 'TAP TO START' : 'CLICK / SPACE TO START', w / 2, h * 0.62);

  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.font = `${Math.floor(h * 0.024)}px monospace`;
  ctx.fillText('WASD / IJKL · MOUSE LOOK · CLICK / SPACE TO SHOOT', w / 2, h * 0.78);
  ctx.font = `${Math.floor(h * 0.018)}px monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('I=앞  J=좌  K=뒤  L=우', w / 2, h * 0.84);
  ctx.fillText(`BEST SCORE: ${bestScore}`, w / 2, h * 0.87);
}

function renderPlay(w, h) {
  camera.render(ctx, player, map, enemies, weapon, juice);
  hud.draw(ctx, w, h, score, player.hp, player.maxHp, timeLeftMs, bestScore);
  leaderboard.drawMini(ctx, w);
}

function renderOver(w, h) {
  // Semi-transparent overlay (Part 2 Surface+alpha pattern)
  ctx.fillStyle = 'rgba(0,0,0,0.87)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#e74c3c';
  ctx.font = `bold ${Math.floor(h * 0.09)}px monospace`;
  ctx.fillText('GAME OVER', w / 2, h * 0.20);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(h * 0.065)}px monospace`;
  ctx.fillText(`SCORE: ${score}`, w / 2, h * 0.33);

  ctx.fillStyle = '#f1c40f';
  ctx.font = `${Math.floor(h * 0.032)}px monospace`;
  ctx.fillText(`BEST: ${bestScore}`, w / 2, h * 0.42);

  const reasonText = endReason === 'time' ? '시간 초과!' : 'HP 소진!';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `${Math.floor(h * 0.028)}px monospace`;
  ctx.fillText(reasonText, w / 2, h * 0.50);

  leaderboard.draw(ctx, w, h);

  const blink = Math.floor(performance.now() / 700) % 2;
  ctx.fillStyle = blink ? '#888' : 'transparent';
  ctx.font = `${Math.floor(h * 0.026)}px monospace`;
  ctx.fillText(MOBILE ? 'TAP TO RETRY' : 'CLICK / SPACE TO RETRY', w / 2, h * 0.93);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
new GameLoop((dt) => { update(dt); render(); }).start();
