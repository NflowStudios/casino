/* NOIR GOLD — events.js: eventos nocturnos entre rondas + escenas de la familia Moretti */
'use strict';

/* ================= EVENTOS NOCTURNOS =================
   Al volver al hub, si han pasado 4+ rondas sin evento, ~20% de probabilidad
   de que la noche del casino te ponga una decisión delante. */
const Events = {
  maybe() {
    const r = State.run;
    if (!r || !DATA.EVENTS || !DATA.EVENTS.length) return;
    if ((r.roundsSinceEvent || 0) < 4) return;
    if (!U.chance(0.20)) return;
    this.play(U.pick(DATA.EVENTS));
  },

  play(ev) {
    const r = State.run;
    if (!r) return;
    r.roundsSinceEvent = 0;
    State.saveRun();
    Sound.sfx.door();
    const m = U.$('modal-event');
    if (!m) return;
    U.$('ev-ico').innerHTML = Icon.svg(ev.icon, 'ev-svg');
    U.$('ev-title').textContent = ev.title;
    U.$('ev-text').innerHTML = ev.text;
    const box = U.$('ev-choices');
    box.innerHTML = '';
    for (const c of ev.choices) {
      const cost = c.cost || 0;
      const b = U.el('button', 'ev-choice',
        '<h4>' + c.label + '</h4><p>' + c.sub + '</p>' +
        (cost ? '<span class="ev-cost">' + Icon.svg('chip') + U.fmt(cost) + '</span>' : '<span class="ev-cost gratis">GRATIS</span>'));
      b.type = 'button';
      if (cost && !State.canAfford(cost)) b.disabled = true;
      b.onclick = () => {
        m.classList.remove('open');
        Sound.sfx.chips();
        try { c.fn(); } catch (e) { /* los efectos nunca tumplan la partida */ }
        State.saveRun();
        UI.renderHUD();
        UI.renderMult('roulette', 'rl-mult');
      };
      box.appendChild(b);
    }
    m.classList.add('open');
  }
};

/* ================= ESCENAS DE LA FAMILIA MORETTI =================
   Cola de escenas encoladas por cruces de umbral de fichas (story).
   Se reproducen al volver al hub, una tras otra. */
const Moretti = {
  playNext() {
    const r = State.run;
    if (!r || !r.morettiQueue || !r.morettiQueue.length) return;
    const idx = r.morettiQueue.shift();
    State.saveRun();
    const sc = DATA.MORETTI[idx];
    if (!sc) {
      if (r.morettiQueue.length) this.playNext();
      return;
    }
    const ov = U.$('moretti-overlay');
    if (!ov) return;
    U.$('mo-ico').innerHTML = Icon.svg(sc.icon, 'mo-svg');
    U.$('mo-kicker').textContent = 'FAMILIA MORETTI · ' + U.fmtC(sc.at) + ' FICHAS EN LA MESA';
    U.$('mo-title').textContent = sc.title;
    U.$('mo-text').innerHTML = sc.text;
    ov.classList.add('on');
    Sound.sfx.sting();
    FX.flash('rgba(128,0,32,.28)', 900);
    U.$('mo-btn').onclick = () => {
      ov.classList.remove('on');
      Sound.sfx.flash();
      if (r.morettiQueue && r.morettiQueue.length) setTimeout(() => this.playNext(), 450);
    };
  }
};
