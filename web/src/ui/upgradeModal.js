// Touch bands match the three vertical thirds of the screen — input.js routes pageY to choice
// indices using the same split, so cards must remain full-width and proportional.
export class UpgradeModal {
  draw(ctx, w, h, choices, level) {
    if (!choices || choices.length === 0) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1c40f';
    ctx.font = `bold ${Math.floor(h * 0.055)}px monospace`;
    ctx.fillText(`LEVEL UP — LV ${level}`, w / 2, h * 0.12);

    const cardW = Math.min(w * 0.7, 600);
    const cardH = h * 0.18;
    const gap   = h * 0.025;
    const totalH = cardH * 3 + gap * 2;
    const startY = (h - totalH) / 2;
    const cardX  = (w - cardW) / 2;

    for (let i = 0; i < choices.length; i++) {
      const upg = choices[i];
      const y = startY + i * (cardH + gap);
      this._card(ctx, cardX, y, cardW, cardH, i + 1, upg.name, upg.desc);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `${Math.floor(h * 0.025)}px monospace`;
    ctx.fillText('Press 1, 2, or 3  ·  Tap a card on touch', w / 2, h * 0.95);

    ctx.restore();
  }

  _card(ctx, x, y, w, h, key, name, desc) {
    ctx.fillStyle = 'rgba(20,20,30,0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Key badge
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x, y, h, h);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(h * 0.55)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(key), x + h / 2, y + h / 2);

    // Name + desc
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(h * 0.32)}px monospace`;
    ctx.fillText(name, x + h + 16, y + h * 0.42);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `${Math.floor(h * 0.22)}px monospace`;
    ctx.fillText(desc, x + h + 16, y + h * 0.74);
  }
}
