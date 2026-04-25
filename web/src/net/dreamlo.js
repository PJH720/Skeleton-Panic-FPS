const BASE = 'https://dreamlo.com/lb';

function parseEntries(data) {
  const raw = data?.dreamlo?.leaderboard?.entry;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((e, i) => ({
    rank: i + 1,
    name: String(e.name ?? '???').slice(0, 16),
    score: Number(e.score) || 0,
  }));
}

export async function listScores(publicKey) {
  const res = await fetch(`${BASE}/${publicKey}/json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseEntries(await res.json());
}

export async function addScore(privateKey, name, score) {
  const safe = encodeURIComponent(name.slice(0, 16));
  const res = await fetch(`${BASE}/${privateKey}/add/${safe}/${Math.floor(score)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
