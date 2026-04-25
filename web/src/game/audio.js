let _ctx = null;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

export function initAudio() {
  try { getCtx(); } catch { /* no audio support */ }
}

export function resumeAudio() {
  if (_ctx && _ctx.state === 'suspended') _ctx.resume();
}

// ── Buffer loading ────────────────────────────────────────────────────────────

const BASE = 'public/assets/sfx/';
const ZOMBIE_COUNT = 24;

async function loadBuffer(path) {
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return await getCtx().decodeAudioData(arr);
  } catch {
    return null;
  }
}

// Buffers — populated asynchronously; null until loaded
const buf = {
  shoot:    null,
  hit:      null,
  damage:   null,
  start:    null,
  gameover: null,
  zombies:  /** @type {AudioBuffer[]} */ ([]),
};

(async () => {
  const [shoot, hit, damage, start, gameover, ...zomBufs] = await Promise.all([
    loadBuffer('shoot.ogg'),
    loadBuffer('hit.ogg'),
    loadBuffer('damage.ogg'),
    loadBuffer('start.ogg'),
    loadBuffer('gameover.ogg'),
    ...Array.from({ length: ZOMBIE_COUNT }, (_, i) => loadBuffer(`zombie-${i + 1}.wav`)),
  ]);
  buf.shoot    = shoot;
  buf.hit      = hit;
  buf.damage   = damage;
  buf.start    = start;
  buf.gameover = gameover;
  buf.zombies  = zomBufs.filter(Boolean);
})();

// ── Playback ──────────────────────────────────────────────────────────────────

function playBuffer(buffer, volume = 1) {
  if (!buffer) return;
  try {
    const ac  = getCtx();
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    src.buffer = buffer;
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch { /* audio unavailable */ }
}

function randomZombie() {
  if (!buf.zombies.length) return null;
  return buf.zombies[Math.floor(Math.random() * buf.zombies.length)];
}

export const playSound = {
  shoot:    () => playBuffer(buf.shoot,    0.5),
  hit:      () => playBuffer(buf.hit,      0.6),
  kill:     () => playBuffer(randomZombie(), 0.8),
  damage:   () => playBuffer(randomZombie(), 0.7),
  start:    () => playBuffer(buf.start,    0.6),
  gameover: () => playBuffer(buf.gameover, 0.6),
};
