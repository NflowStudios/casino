/* NOIR GOLD — fx.js: partículas (canvas), cámara (zoom/shake), viñeta, fichas voladoras */
'use strict';
const FX = {
  cv: null, c2: null, parts: [], rafOn: false, dustTimer: null,

  init() {
    this.cv = U.$('fx-canvas');
    this.c2 = this.cv.getContext('2d');
    this.resize();
    U.on(window, 'resize', () => this.resize());
  },
  resize() {
    this.cv.width = window.innerWidth;
    this.cv.height = window.innerHeight;
  },

  // ---- partículas ----
  burst(x, y, o) {
    o = o || {};
    const n = o.count || 26;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (o.speed || 3) * (0.35 + Math.random());
      this.parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 1.5),
        g: o.gravity === undefined ? 0.09 : o.gravity,
        life: 1, decay: 0.012 + Math.random() * (o.decay || 0.014),
        size: o.size || U.randInt(2, 5),
        color: Array.isArray(o.color) ? U.pick(o.color) : (o.color || '#D4AF37'),
        rect: Math.random() < (o.rectChance === undefined ? 0.45 : o.rectChance),
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3
      });
    }
    this.run();
  },
  goldRain(ms) {
    const t0 = performance.now();
    const iv = setInterval(() => {
      for (let i = 0; i < 6; i++) {
        this.parts.push({
          x: Math.random() * window.innerWidth, y: -12,
          vx: (Math.random() - 0.5) * 1.4, vy: 2 + Math.random() * 3.4,
          g: 0.03, life: 1, decay: 0.006,
          size: U.randInt(2, 6), color: U.pick(['#D4AF37', '#F4D06F', '#F2E8D5', '#E8CE7A']),
          rect: true, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25
        });
      }
      this.run();
      if (performance.now() - t0 > (ms || 1600)) clearInterval(iv);
    }, 40);
  },
  winAt(el, big) {
    const c = U.center(el);
    this.burst(c.x, c.y, {
      count: big ? 60 : 30, speed: big ? 5.5 : 3.6, up: 2.4,
      color: ['#D4AF37', '#F4D06F', '#F2E8D5', '#800020']
    });
    if (big) setTimeout(() => this.burst(c.x, c.y - 30, { count: 40, speed: 4, color: '#F4D06F' }), 220);
  },
  run() {
    if (this.rafOn) return;
    this.rafOn = true;
    const step = () => {
      const ctx = this.c2;
      ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      this.parts = this.parts.filter((p) => p.life > 0 && p.y < this.cv.height + 20);
      for (const p of this.parts) {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life -= p.decay;
        const alpha = Math.max(0, Math.min(1, p.life));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.rect) {
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          const w = Math.max(0.5, p.size * 2 * alpha), h = Math.max(0.5, p.size * 1.2 * alpha);
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.4, p.size * alpha), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (this.parts.length) requestAnimationFrame(step);
      else { this.rafOn = false; ctx.clearRect(0, 0, this.cv.width, this.cv.height); }
    };
    requestAnimationFrame(step);
  },

  // ---- cámara ----
  zoom(ms) {
    const g = U.$('game');
    if (!g) return;
    g.classList.add('zoom');
    setTimeout(() => g.classList.remove('zoom'), ms || 1400);
  },
  shake() {
    const g = U.$('game');
    if (!g) return;
    g.classList.remove('shake');
    void g.offsetWidth; // reflow
    g.classList.add('shake');
    setTimeout(() => g.classList.remove('shake'), 560);
  },
  flash(color, ms) {
    const f = U.el('div');
    f.style.cssText = 'position:fixed;inset:0;z-index:890;pointer-events:none;background:' +
      (color || 'rgba(244,208,111,.55)') + ';opacity:1;transition:opacity ' + (ms || 700) + 'ms';
    document.body.appendChild(f);
    requestAnimationFrame(() => { f.style.opacity = '0'; });
    setTimeout(() => f.remove(), (ms || 700) + 60);
  },

  // ---- ficha voladora (pago / destiempo) ----
  flyChip(fromEl, toEl, done, cls) {
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const chip = U.el('div', 'chip chip-mini ' + (cls || ''), '');
    chip.dataset.v = '500';
    chip.style.cssText = 'position:fixed;z-index:895;left:' + (a.left + a.width / 2 - 13) + 'px;top:' +
      (a.top + a.height / 2 - 13) + 'px;transition:transform .55s cubic-bezier(.3,.9,.4,1);pointer-events:none';
    document.body.appendChild(chip);
    requestAnimationFrame(() => {
      chip.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' +
        (b.top + b.height / 2 - a.top - a.height / 2) + 'px) rotate(340deg)';
    });
    setTimeout(() => { chip.remove(); if (done) done(); }, 580);
  },

  // ---- polvo dorado ambiente (VIP) ----
  dust(on) {
    if (on && !this.dustTimer) {
      const floor = document.querySelector('.floor-props');
      if (!floor) return;
      // puntos CSS animados
      for (let i = 0; i < 9; i++) {
        const d = U.el('i', 'dust-dot');
        d.style.left = (6 + Math.random() * 88) + '%';
        d.style.top = (20 + Math.random() * 70) + '%';
        d.style.animationDuration = (7 + Math.random() * 9) + 's';
        d.style.animationDelay = (-Math.random() * 9) + 's';
        floor.appendChild(d);
      }
      this.dustTimer = true;
    } else if (!on && this.dustTimer) {
      U.$$('.dust-dot').forEach((d) => d.remove());
      this.dustTimer = false;
    }
  }
};
