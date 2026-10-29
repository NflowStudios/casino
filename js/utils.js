/* NOIR GOLD — utils.js: helpers, RNG, DOM, formato */
'use strict';
const U = {
  $: (id, root) => (root || document).getElementById(id),
  $$: (sel, root) => Array.from((root || document).querySelectorAll(sel)),
  el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  },
  fmt(n) { return Math.round(n).toLocaleString('es-MX'); },
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  rand: () => Math.random(),
  randInt: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  chance: (p) => Math.random() < p,
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  sleep: (ms) => new Promise((res) => setTimeout(res, ms)),
  // tween numérico con callback por frame
  tween(from, to, ms, cb, ease) {
    const t0 = performance.now();
    const easeFn = ease || ((t) => 1 - Math.pow(1 - t, 3)); // easeOutCubic
    return new Promise((res) => {
      function step(now) {
        const t = U.clamp((now - t0) / ms, 0, 1);
        cb(U.lerp(from, to, easeFn(t)));
        if (t < 1) requestAnimationFrame(step); else res(to);
      }
      requestAnimationFrame(step);
    });
  },
  on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); },
  // toast rápido (depende solo del DOM)
  toast(msg, type, ms) {
    const box = U.$('toasts');
    if (!box) return;
    const t = U.el('div', 'toast t-' + (type || 'info'), msg);
    box.appendChild(t);
    setTimeout(() => t.remove(), ms || 3700);
    while (box.children.length > 5) box.firstChild.remove();
  },
  center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
  }
};
// Tooltip global (delegado en data-tip)
(function () {
  const tip = U.$('tooltip');
  let cur = null;
  function show(e) {
    const host = e.target.closest('[data-tip]');
    if (!host) return;
    cur = host;
    tip.textContent = host.getAttribute('data-tip');
    tip.hidden = false;
    move(e);
  }
  function move(e) {
    if (!cur || tip.hidden) return;
    const x = U.clamp(e.clientX + 14, 4, window.innerWidth - tip.offsetWidth - 8);
    const y = U.clamp(e.clientY + 16, 4, window.innerHeight - tip.offsetHeight - 8);
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hide() { tip.hidden = true; cur = null; }
  document.addEventListener('mouseover', show);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseout', (e) => { if (e.target.closest && e.target.closest('[data-tip]')) hide(); });
})();
