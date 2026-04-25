import { listScores, addScore } from '../net/dreamlo.js';

// Works with Vite (import.meta.env) and plain serve (window globals)
const PUBLIC_KEY  = import.meta.env?.VITE_DREAMLO_PUBLIC_KEY  ?? window.DREAMLO_PUBLIC_KEY  ?? '';
const PRIVATE_KEY = import.meta.env?.VITE_DREAMLO_PRIVATE_KEY ?? window.DREAMLO_PRIVATE_KEY ?? '';
const MINI_REFRESH_MS = 15_000;

export class Leaderboard {
  constructor() {
    this._visible     = false;
    this._entries     = [];
    this._loading     = false;
    this._error       = null;
    this._submitDone  = false;
    this._submitError = null;
    this._submitting  = false;
    this._lastFetchAt = 0;

    if (PUBLIC_KEY) this._fetch();
    else this._error = '온라인 랭킹 비활성 (키 없음)';
  }

  show() {
    this._visible    = true;
    this._submitDone = false;
    this._submitError = null;
    if (PUBLIC_KEY) this._fetch();
    else this._error = '온라인 랭킹 비활성 (키 없음)';
  }

  hide() { this._visible = false; }
  isVisible() { return this._visible; }

  async submit(name, score) {
    if (!PRIVATE_KEY) { this._submitError = '온라인 랭킹 비활성'; return; }
    this._submitting  = true;
    this._submitError = null;
    try {
      await addScore(PRIVATE_KEY, name, score);
      this._submitDone = true;
      if (PUBLIC_KEY) await this._fetch();
    } catch {
      this._submitError = '점수 저장 실패 — 나중에 다시 시도';
    } finally {
      this._submitting = false;
    }
  }

  async _fetch() {
    if (!PUBLIC_KEY || this._loading) return;
    this._loading = true;
    this._error   = null;
    try {
      this._entries = await listScores(PUBLIC_KEY);
      this._lastFetchAt = Date.now();
    } catch {
      this._error = '랭킹을 불러올 수 없습니다';
    } finally {
      this._loading = false;
    }
  }

  _refreshIfStale() {
    if (!PUBLIC_KEY || this._loading) return;
    if (Date.now() - this._lastFetchAt > MINI_REFRESH_MS) this._fetch();
  }

  drawMini(ctx, w) {
    if (!PUBLIC_KEY) return;
    this._refreshIfStale();

    const panelW = Math.min(220, w * 0.48);
    const rowH = 16;
    const rows = Math.max(3, Math.min(5, this._entries.length || 3));
    const panelH = 30 + rowH * rows;
    const px = w - panelW - 12;
    const py = 38;

    ctx.save();
    ctx.fillStyle = 'rgba(5,5,15,0.72)';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = 'rgba(231,76,60,0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, panelW, panelH);

    ctx.textAlign = 'left';
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('TOP RANKING', px + 8, py + 14);

    if (this._loading && this._entries.length === 0) {
      ctx.font = '11px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText('로딩 중...', px + 8, py + 30);
      ctx.restore();
      return;
    }

    if (this._error && this._entries.length === 0) {
      ctx.font = '10px monospace';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('랭킹 연결 실패', px + 8, py + 30);
      ctx.restore();
      return;
    }

    this._entries.slice(0, 5).forEach((e, i) => {
      const y = py + 30 + i * rowH;
      const medal = ['1.', '2.', '3.'][i] ?? `${i + 1}.`;
      ctx.font = i < 3 ? 'bold 11px monospace' : '11px monospace';
      ctx.fillStyle = i < 3 ? ['#f1c40f', '#bdc3c7', '#cd7f32'][i] : '#ddd';
      ctx.fillText(`${medal} ${e.name}`, px + 8, y);
      ctx.textAlign = 'right';
      ctx.fillText(String(e.score), px + panelW - 8, y);
      ctx.textAlign = 'left';
    });

    ctx.restore();
  }

  draw(ctx, w, h) {
    if (!this._visible) return;

    const pw = Math.min(w * 0.88, 340);
    const ph = Math.min(h * 0.72, 440);
    const px = (w - pw) / 2;
    const py = (h - ph) / 2 - h * 0.06;

    ctx.save();
    ctx.fillStyle = 'rgba(5,5,15,0.92)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    ctx.textAlign = 'center';
    ctx.font = 'bold 19px monospace';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('RANKING', w / 2, py + 34);

    if (this._loading) {
      ctx.font = '13px monospace';
      ctx.fillStyle = '#888';
      ctx.fillText('로딩 중...', w / 2, py + 74);
    } else if (this._error) {
      ctx.font = '12px monospace';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText(this._error, w / 2, py + 74);
    } else if (this._entries.length === 0) {
      ctx.font = '12px monospace';
      ctx.fillStyle = '#666';
      ctx.fillText('(아직 기록 없음)', w / 2, py + 74);
    } else {
      const rowH = 26;
      this._entries.slice(0, 10).forEach((e, i) => {
        const ry = py + 58 + i * rowH;
        const medal = ['🥇','🥈','🥉'][i] ?? `${i + 1}.`;
        ctx.textAlign = 'left';
        ctx.font = i < 3 ? 'bold 13px monospace' : '13px monospace';
        ctx.fillStyle = i < 3 ? ['#f1c40f','#bdc3c7','#cd7f32'][i] : '#ccc';
        ctx.fillText(`${medal} ${e.name}`, px + 18, ry);
        ctx.textAlign = 'right';
        ctx.fillText(String(e.score), px + pw - 16, ry);
      });
    }

    if (this._submitDone) {
      ctx.font = '12px monospace';
      ctx.fillStyle = '#2ecc71';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 제출 완료!', w / 2, py + ph - 20);
    } else if (this._submitError) {
      ctx.font = '11px monospace';
      ctx.fillStyle = '#e74c3c';
      ctx.textAlign = 'center';
      ctx.fillText(this._submitError, w / 2, py + ph - 20);
    } else if (this._submitting) {
      ctx.font = '11px monospace';
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.fillText('제출 중...', w / 2, py + ph - 20);
    }

    ctx.restore();
  }
}
