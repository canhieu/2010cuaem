/**
 * A self-contained, 1200 × 700 keepsake ticket.
 *
 * await GiftTicket.draw(options) -> HTMLCanvasElement
 * await GiftTicket.download(options) -> { url, filename, canvas }
 *
 * options: { recipient, sender, occasion, plan, characterSrc }
 * characterSrc is optional and must be an inline PNG/JPEG/WebP data URL.
 * download() attempts a browser download and also returns the same Blob URL
 * for a visible fallback link. The caller owns URL.revokeObjectURL(url).
 * Include this module in the same #site-script bundle as app.js so exported
 * recipient HTML retains it. Nothing is drawn or downloaded on initial load.
 */
(() => {
  'use strict';

  const WIDTH = 1200;
  const HEIGHT = 700;
  const FILENAME = 've-hen-Thuwcutie.png';
  const FONT = '"Nunito", "Arial Rounded MT Bold", Arial, sans-serif';
  const C = {
    backdrop: '#efe8df', paper: '#fffbf3', pink: '#f5dce0', rose: '#b26878',
    ink: '#594a43', muted: '#8a766b', line: '#ddc9bc', lightPink: '#fcf0ed',
    blue: '#c9dce4', pale: '#fff6ed'
  };
  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const graphemes = (text) => segmenter
    ? Array.from(segmenter.segment(text), ({ segment }) => segment)
    : Array.from(text.normalize('NFC'));
  const clean = (value, fallback) => {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    return value.normalize('NFC').replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
      .replace(/[\t ]+/g, ' ').trim();
  };
  const font = (ctx, size, weight = 700) => { ctx.font = `${weight} ${size}px ${FONT}`; };

  const roundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };
  const fillRound = (ctx, x, y, width, height, radius, color) => {
    ctx.fillStyle = color;
    roundedRect(ctx, x, y, width, height, radius);
    ctx.fill();
  };
  const line = (ctx, x1, y1, x2, y2, color, width = 1.5, dash = []) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  };
  const circle = (ctx, x, y, radius, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  };
  const heart = (ctx, x, y, size, fill, stroke = '') => {
    ctx.save();
    ctx.translate(x, y); ctx.scale(size / 24, size / 24);
    ctx.beginPath();
    ctx.moveTo(12, 21);
    ctx.bezierCurveTo(10, 19, 1, 13, 1, 7);
    ctx.bezierCurveTo(1, 0, 9, -1, 12, 5);
    ctx.bezierCurveTo(15, -1, 23, 0, 23, 7);
    ctx.bezierCurveTo(23, 13, 14, 19, 12, 21);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.restore();
  };
  const envelope = (ctx, x, y, width, height) => {
    fillRound(ctx, x, y, width, height, 9, C.pink);
    ctx.strokeStyle = C.rose; ctx.lineWidth = 2;
    roundedRect(ctx, x, y, width, height, 9); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 5); ctx.lineTo(x + width / 2, y + height * 0.6);
    ctx.lineTo(x + width - 3, y + 5); ctx.stroke();
    heart(ctx, x + width / 2 - height * 0.14, y + height * 0.45, height * 0.28, C.rose);
  };

  // Line breaking never slices a Vietnamese combining sequence or surrogate pair.
  const wrap = (ctx, value, width) => {
    const lines = [];
    for (const paragraph of value.split('\n')) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) { lines.push(''); continue; }
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.measureText(candidate).width <= width) { current = candidate; continue; }
        if (current) { lines.push(current); current = ''; }
        if (ctx.measureText(word).width <= width) { current = word; continue; }
        // Very long unspaced nicknames still fit, at complete grapheme boundaries.
        let part = '';
        for (const cluster of graphemes(word)) {
          if (part && ctx.measureText(part + cluster).width > width) {
            lines.push(part); part = cluster;
          } else part += cluster;
        }
        current = part;
      }
      if (current) lines.push(current);
    }
    return lines.length ? lines : [''];
  };
  const ellipsize = (ctx, value, width) => {
    const parts = graphemes(value.trimEnd());
    while (parts.length && ctx.measureText(`${parts.join('')}…`).width > width) parts.pop();
    return `${parts.join('')}…`;
  };
  const block = (ctx, value, {
    x, y, width, height, maxSize = 28, minSize = 19, maxLines = 2,
    weight = 800, color = C.ink, align = 'left', vertical = 'top', leading = 1.3
  }) => {
    let size = maxSize;
    let lines = [];
    for (; size >= minSize; size -= 1) {
      font(ctx, size, weight);
      lines = wrap(ctx, value, width);
      const totalHeight = size * leading * lines.length;
      if (lines.length <= maxLines && totalHeight <= height) break;
    }
    if (size < minSize) {
      size = minSize;
      font(ctx, size, weight);
      lines = wrap(ctx, value, width);
      const allowed = Math.max(1, Math.min(maxLines, Math.floor(height / (size * leading))));
      if (lines.length > allowed) {
        lines = lines.slice(0, allowed);
        lines[allowed - 1] = ellipsize(ctx, lines[allowed - 1], width);
      }
    }
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    const lineHeight = size * leading;
    const totalHeight = lineHeight * lines.length;
    const top = y + (vertical === 'middle' ? Math.max(0, (height - totalHeight) / 2) : 0);
    const anchorX = align === 'center' ? x + width / 2 : align === 'right' ? x + width : x;
    lines.forEach((text, index) => ctx.fillText(text, anchorX, top + size + index * lineHeight));
    return { lines, size };
  };
  const smallText = (ctx, value, x, y, size = 16, color = C.muted, weight = 600, align = 'left') => {
    font(ctx, size, weight);
    ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = align;
    ctx.fillText(value, x, y);
  };

  const inlineImage = (source) => {
    if (!source) return Promise.resolve(null);
    if (typeof source !== 'string' || !/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(source)) {
      return Promise.reject(new Error('hình trên vé cần là ảnh png, jpg hoặc webp đã nằm trong thiệp.'));
    }
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => image.naturalWidth && image.naturalHeight
        ? resolve(image) : reject(new Error('chưa đọc được hình trên vé. thử lại nhé.'));
      image.onerror = () => reject(new Error('chưa đọc được hình trên vé. thử lại nhé.'));
      image.src = source;
    });
  };
  const nameStub = (ctx, x, label, name) => {
    const y = 452, width = 384, height = 152;
    fillRound(ctx, x, y, width, height, 13, C.lightPink);
    ctx.save();
    roundedRect(ctx, x + 1, y + 1, width - 2, height - 2, 12);
    ctx.strokeStyle = '#d8b4b5'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]); ctx.stroke();
    ctx.restore();
    circle(ctx, x, y + height / 2, 7, C.paper);
    circle(ctx, x + width, y + height / 2, 7, C.paper);
    smallText(ctx, label, x + width / 2, y + 31, 15, C.rose, 700, 'center');
    block(ctx, name, {
      x: x + 24, y: y + 44, width: width - 48, height: 94,
      maxSize: 31, minSize: 21, maxLines: 2, align: 'center', vertical: 'middle'
    });
  };

  const draw = async (options = {}) => {
    const recipient = clean(options.recipient, 'Thuwcutie');
    const sender = clean(options.sender, 'Híu húi');
    const occasion = clean(options.occasion, '20/10');
    const plan = clean(options.plan, 'một buổi xem phim và dạo phố');
    const [character] = await Promise.all([
      inlineImage(options.characterSrc),
      (async () => {
        if (!document.fonts) return;
        await document.fonts.ready;
        // The page embeds Nunito; load its Vietnamese glyphs before measuring.
        await Promise.all([
          document.fonts.load('800 44px "Nunito"', 'Thư Thuwcutie Híu húi một buổi xem phim và dạo phố'),
          document.fonts.load('600 20px "Nunito"', 'ngày hẹn lần tới mình gặp nhau')
        ]);
      })()
    ]);
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH; canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('trình duyệt chưa vẽ được vé hẹn. thử lại nhé.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = C.backdrop; ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // The cut paper silhouette and its separate pink, perforated end.
    ctx.save();
    ctx.shadowColor = '#7e574321'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    fillRound(ctx, 42, 44, 1116, 612, 27, C.paper);
    ctx.restore();
    ctx.save();
    roundedRect(ctx, 42, 44, 1116, 612, 27); ctx.clip();
    ctx.fillStyle = C.pink; ctx.fillRect(912, 44, 246, 612);
    // A few deterministic paper speckles, kept clear of the text blocks.
    for (let i = 0; i < 52; i += 1) {
      circle(ctx, 55 + (i * 137) % 1085, 53 + (i * 89) % 590, 0.65, '#ab87730b');
    }
    ctx.restore();
    line(ctx, 912, 74, 912, 626, '#caa7a8', 2, [6, 7]);
    [44, 656].forEach((y) => circle(ctx, 912, y, 18, C.backdrop));
    [42, 1158].forEach((x) => circle(ctx, x, 350, 15, C.backdrop));

    envelope(ctx, 84, 89, 42, 32);
    smallText(ctx, 'một kế hoạch nhỏ', 144, 105, 21, C.ink, 800);
    smallText(ctx, 'bưu điện bé xíu', 145, 131, 14, C.muted, 600);
    fillRound(ctx, 716, 84, 154, 55, 18, C.lightPink);
    block(ctx, occasion, {
      x: 728, y: 91, width: 130, height: 39, maxSize: 24, minSize: 13,
      maxLines: 2, align: 'center', vertical: 'middle', color: C.rose
    });
    line(ctx, 84, 163, 870, 163, C.line);

    smallText(ctx, 'vé hẹn của tụi mình', 84, 202, 17, C.rose, 800);
    heart(ctx, 838, 183, 19, C.pink, C.rose);
    block(ctx, plan, {
      x: 84, y: 224, width: 786, height: 128,
      maxSize: 46, minSize: 28, maxLines: 2, weight: 900
    });
    smallText(ctx, 'ngày hẹn', 84, 389, 15, C.muted, 700);
    block(ctx, 'lần tới mình gặp nhau', {
      x: 190, y: 365, width: 680, height: 38,
      maxSize: 24, minSize: 19, maxLines: 1, weight: 700, color: C.ink
    });
    line(ctx, 84, 423, 870, 423, C.line, 1.3, [3, 5]);
    nameStub(ctx, 84, 'cuống vé của cậu', recipient);
    nameStub(ctx, 486, 'cuống vé của tớ', sender);
    smallText(ctx, 'hẹn gặp cậu, rồi mình đi nhé.', 477, 634, 14, C.muted, 600, 'center');

    smallText(ctx, 'dành cho', 1035, 97, 16, C.muted, 700, 'center');
    smallText(ctx, 'tụi mình', 1035, 129, 26, C.ink, 800, 'center');
    if (character) {
      const ratio = Math.min(166 / character.naturalWidth, 166 / character.naturalHeight);
      const width = character.naturalWidth * ratio;
      const height = character.naturalHeight * ratio;
      ctx.drawImage(character, 1035 - width / 2, 162 + (166 - height) / 2, width, height);
    } else {
      envelope(ctx, 972, 201, 126, 83);
    }
    line(ctx, 955, 350, 1115, 350, '#cba7a9', 1.4, [4, 5]);
    heart(ctx, 1020, 380, 30, '#d392a1');
    smallText(ctx, 'một chiếc hẹn', 1035, 447, 18, C.ink, 700, 'center');
    smallText(ctx, 'để dành', 1035, 481, 26, C.rose, 800, 'center');
    ctx.save();
    ctx.translate(1035, 553); ctx.rotate(-0.1);
    ctx.strokeStyle = '#c28c99'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(0, 0, 47, 0, Math.PI * 2); ctx.stroke();
    block(ctx, occasion, {
      x: -38, y: -22, width: 76, height: 46, maxSize: 23, minSize: 12,
      maxLines: 2, align: 'center', vertical: 'middle', color: C.rose
    });
    ctx.restore();
    smallText(ctx, 'vé số 01 · giữ lại nhé', 1035, 631, 12, C.muted, 700, 'center');
    return canvas;
  };

  const pngBlob = (canvas) => new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => blob ? resolve(blob)
        : reject(new Error('chưa tạo được ảnh vé hẹn. thử lại nhé.')), 'image/png');
    } catch (_) { reject(new Error('chưa tạo được ảnh vé hẹn. thử lại nhé.')); }
  });
  const download = async (options = {}) => {
    const canvas = await draw(options);
    const blob = await pngBlob(canvas);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = FILENAME; anchor.hidden = true;
    (document.querySelector('dialog[open]') || document.body).append(anchor);
    try { anchor.click(); } catch (_) { /* the returned URL remains usable by a real link. */ }
    finally { anchor.remove(); }
    return { url, filename: FILENAME, canvas };
  };

  window.GiftTicket = Object.freeze({ draw, download });
})();
