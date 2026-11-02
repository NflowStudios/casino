/* NOIR GOLD — races.js: EL HIPÓDROMO NOCTURNO
   Seis corredores, una sola recta, apuesta a ganador.
   Las odds las pone la pizarra; la forma real solo la saben los jockeys. */
'use strict';
const HR = {
  runners: [], betHorse: null, bet: 10, chipSel: null,
  racing: false, armedDoping: false, showForm: false,
  usedTrickThisRace: false, narrTimer: null, hoofTimer: null,

  enter() {
    this.racing = false;
    this.armedDoping = false;
    this.bindOnce();
    if (!this.runners.length) this.newRace();
    U.$('hr-cap').textContent = 'Mín ' + U.fmt(DATA.MIN_BET) + ' · Máx ' + U.fmt(State.tierCap());
    this.renderRunners();
    this.renderTrack();
    this.renderTrickPanel();
    this.chipSel = UI.chipRow(U.$('hr-chips'), (v) => { this.bet = v; this.refreshBet(); }, this.bet);
    this.setNarr('Los corredores calientan bajo los faroles. Elige un caballo.');
    this.setMsg('');
    this.refreshBet();
    UI.renderMult('races', 'hr-mult');
    UI.show('races');
  },
  leave() {
    if (this.racing) return;
    Hub.enter();
  },
  bindOnce() {
    if (this._bound) return;
    this._bound = true;
    U.on(U.$('hr-run'), 'click', () => this.run());
  },

  /* ---------- nueva carrera: pizarras y formas ---------- */
  newRace() {
    const weights = U.shuffle([12, 10, 8, 6, 4, 2]);
    this.runners = U.shuffle(DATA.HORSES).map((h, i) => {
      const w = weights[i];
      const p = w / 42;
      // la pizarra redondea las odds: a veces paga un poco más o menos de lo justo
      const odds = Math.max(2, Math.round((1 / p) * (0.92 + Math.random() * 0.12)));
      return { num: h.num, name: h.name, silk: h.silk, w, p, odds };
    });
    this.betHorse = null;
    this.showForm = false;
    this.armedDoping = false;
  },

  /* ---------- pizarra de corredores ---------- */
  renderRunners() {
    const box = U.$('hr-runners');
    if (!box) return;
    box.innerHTML = '';
    this.runners.forEach((rn, i) => {
      const sel = this.betHorse === i;
      const b = U.el('button', 'hr-runner' + (sel ? ' sel' : '') + (this.armedDoping ? ' arm' : ''));
      b.type = 'button';
      b.innerHTML =
        '<i class="hr-silk" style="--silk:' + rn.silk + '"></i>' +
        '<span class="hr-rn"><b>' + rn.name.toUpperCase() + '</b>' +
        '<small>PAGA <em>' + rn.odds + ':1</em>' +
        (this.showForm ? ' · FORMA <em>' + Math.round(rn.p * 100) + '%</em>' : '') +
        '</small></span>' +
        '<span class="hr-rnum">' + rn.num + '</span>';
      b.setAttribute('data-tip', this.showForm
        ? 'Forma real: gana ' + Math.round(rn.p * 100) + '% de las veces. La pizarra paga ' + rn.odds + ':1.'
        : 'La pizarra paga ' + rn.odds + ':1. La forma real… esa la sabe el jockey.');
      b.onclick = () => {
        if (this.racing) return;
        if (this.armedDoping) { this.applyDoping(i); return; }
        this.betHorse = i;
        Sound.sfx.chips();
        this.renderRunners();
        this.renderTrack();
        this.refreshBet();
      };
      box.appendChild(b);
    });
  },

  refreshBet() {
    const r = State.run;
    if (!r) return;
    U.$('hr-bet-amt').textContent = U.fmt(this.bet);
    U.$('hr-bet-horse').textContent = this.betHorse !== null ? this.runners[this.betHorse].name.toUpperCase() : '—';
    U.$('hr-run').disabled = this.racing || this.betHorse === null || this.bet > r.chips;
  },

  /* ---------- pista ---------- */
  horseSVG(rn) {
    return '<svg viewBox="0 0 120 78" class="hr-svg" aria-hidden="true">' +
      '<g class="hr-legs hr-legsA" stroke="#0b0c10" stroke-width="7" stroke-linecap="round" fill="none">' +
        '<line x1="66" y1="44" x2="90" y2="67"/><line x1="60" y1="46" x2="72" y2="60"/>' +
        '<line x1="26" y1="46" x2="5" y2="67"/><line x1="33" y1="46" x2="44" y2="60"/></g>' +
      '<g class="hr-legs hr-legsB" stroke="#0b0c10" stroke-width="7" stroke-linecap="round" fill="none">' +
        '<line x1="66" y1="44" x2="79" y2="55"/><line x1="60" y1="46" x2="66" y2="67"/>' +
        '<line x1="26" y1="46" x2="17" y2="57"/><line x1="33" y1="46" x2="40" y2="67"/></g>' +
      '<path d="M14,42 L38,31 L56,10 L72,4 L90,10 L84,18 L70,30 L74,46 L38,52 L19,49 Z" fill="#12141b" stroke="#8a7326" stroke-width="1.5"/>' +
      '<path d="M60,8 L64,-1 L67,8 Z" fill="#12141b" stroke="#8a7326" stroke-width="1.2"/>' +
      '<path d="M15,41 Q3,48 8,64" stroke="#0b0c10" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M32,28 L42,26 L44,12 L34,14 Z" fill="' + rn.silk + '" stroke="#0b0c10" stroke-width="1.2"/>' +
      '<circle cx="43" cy="10" r="4.6" fill="#12141b" stroke="#8a7326" stroke-width="1"/>' +
      '<path d="M42,26 L54,32" stroke="' + rn.silk + '" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  },
  renderTrack() {
    const track = U.$('hr-track');
    if (!track) return;
    track.classList.remove('running');
    track.innerHTML = '<div class="hr-finishline" aria-hidden="true"></div>';
    this.runners.forEach((rn, i) => {
      const lane = U.el('div', 'hr-lane' + (this.betHorse === i ? ' mine' : ''));
      lane.dataset.lane = i;
      lane.innerHTML =
        '<div class="hr-lane-tag"><i style="--silk:' + rn.silk + '"></i><span>' + rn.name.toUpperCase() + '</span></div>' +
        '<div class="hr-lane-run"><div class="hr-horse">' + this.horseSVG(rn) + '</div></div>';
      track.appendChild(lane);
    });
  },

  setNarr(t) { const n = U.$('hr-narr'); if (n) n.textContent = t; },
  setMsg(t, cls) {
    const m = U.$('hr-msg');
    if (!m) return;
    m.textContent = t;
    m.className = 'hr-msg' + (cls ? ' ' + cls : '');
  },

  /* ---------- trucos del hipódromo ---------- */
  renderTrickPanel() {
    const panel = U.$('hr-tricks');
    if (!panel) return;
    panel.innerHTML = '';
    const r = State.run;
    if (!r) return;
    for (const t of r.tricks) {
      if (t.charges <= 0) continue;
      const def = DATA.TRICKS.find((x) => x.id === t.id);
      if (!def || def.game !== 'races') continue;
      const b = U.el('button', 'trick-btn' + (this.armedDoping && t.id === 'doping' ? ' flash' : ''),
        '<span class="tb-name">' + Icon.svg(def.icon, 'tb-ico') + def.name.toUpperCase() +
        (this.armedDoping && t.id === 'doping' ? ' — ELIGE CABALLO' : '') + '</span><span class="tb-charges">×' + t.charges + '</span>');
      b.type = 'button';
      b.setAttribute('data-tip', def.desc);
      b.disabled = this.racing;
      b.onclick = () => {
        if (this.racing) return;
        if (t.id === 'doping') {
          this.armedDoping = !this.armedDoping;
          if (this.armedDoping) U.toast('Elige al caballo que correrá «con vitaminas» en la pizarra.', 'info');
          this.renderRunners();
          this.renderTrickPanel();
        } else if (t.id === 'consejo') {
          if (!State.useTrick('consejo')) return;
          this.usedTrickThisRace = true;
          this.showForm = true;
          U.toast('El jockey se inclina: «Mira la forma, no la pizarra.» Probabilidades reales al descubierto.', 'sus', 4500);
          this.renderRunners();
          this.renderTrickPanel();
        }
      };
      panel.appendChild(b);
    }
  },

  applyDoping(i) {
    if (!State.useTrick('doping')) { this.armedDoping = false; this.renderRunners(); return; }
    this.usedTrickThisRace = true;
    const rn = this.runners[i];
    rn.w *= 4;
    const tot = this.runners.reduce((a, x) => a + x.w, 0);
    this.runners.forEach((x) => { x.p = x.w / tot; });
    this.armedDoping = false;
    U.toast('«Vitaminas» para ' + rn.name.toUpperCase() + '. Corre con cuatro veces su forma… y el bookie no sabe nada.', 'sus', 5200);
    this.renderRunners();
    this.renderTrickPanel();
  },

  /* ---------- la carrera ---------- */
  async run() {
    const r = State.run;
    if (this.racing || !r) return;
    if (this.betHorse === null) { U.toast('Elige un caballo en la pizarra.', 'danger'); return; }
    if (this.bet > State.tierCap()) { U.toast('Límite de apuesta del ' + DATA.TIERS[r.tier].name + ': ' + U.fmt(State.tierCap()), 'danger'); return; }
    if (!State.canAfford(this.bet)) { U.toast('No te alcanza para esta apuesta.', 'danger'); return; }
    this.racing = true;
    this.usedTrickThisRace = false;
    this.refreshBet();
    State.addChips(-this.bet);
    State.recordSpin('races');
    this.setMsg('');

    // ganador por pesos: la forma manda
    const tot = this.runners.reduce((a, x) => a + x.w, 0);
    let pick = Math.random() * tot, winner = 0;
    for (let i = 0; i < this.runners.length; i++) { pick -= this.runners[i].w; if (pick <= 0) { winner = i; break; } }

    // tiempos de llegada: el ganador siempre primero, los demás detrás
    const arr = this.runners.map((_, i) => i === winner ? 0.93 + Math.random() * 0.03 : 0);
    let prev = 0.965 + Math.random() * 0.02;
    for (let i = 0; i < this.runners.length; i++) {
      if (i === winner) continue;
      prev += 0.014 + Math.random() * 0.075;
      arr[i] = prev;
    }
    const sorted = arr.slice().sort((a, b) => a - b);
    const photo = (sorted[1] - sorted[0]) < 0.02;

    // personalidades de carrera: quién sale rápido, quién remonta
    const ease = this.runners.map(() => 0.82 + Math.random() * 0.46);
    const sAmp = this.runners.map(() => 2.2 + Math.random() * 3.4);
    const sFq = this.runners.map(() => 1 + Math.random() * 2.2);
    const sPh = this.runners.map(() => Math.random() * Math.PI * 2);
    const D = 8800;
    const Dtot = D * sorted[sorted.length - 1];

    // campana de salida
    Sound.beep(1046, 0.16, 'square', 0.07);
    setTimeout(() => Sound.beep(1318, 0.24, 'square', 0.07), 180);
    const track = U.$('hr-track');
    track.classList.add('running');
    FX.flash('rgba(255,220,140,.10)', 400);
    this.setNarr('¡SUENA LA CAMPANA! Se rompen los cajones…');

    const lanes = U.$$('.hr-lane-run');
    const horses = lanes.map((l) => l.querySelector('.hr-horse'));
    const laneW = lanes.length ? lanes[0].clientWidth : 600;
    const horseW = 88, pad = 34;
    const maxX = Math.max(60, laneW - horseW - pad);
    const t0 = performance.now();

    // narración en vivo
    this.narrTimer = setInterval(() => {
      const orde = horses.map((h, i) => ({ i, x: h._x || 0 })).sort((a, b) => b.x - a.x);
      const A = this.runners[orde[0].i].name.toUpperCase();
      const B = this.runners[orde[1].i].name.toUpperCase();
      const tn = (performance.now() - t0) / Dtot;
      const pool = tn < 0.3 ? [
        '¡ARRANCAN! Barro, focos y gritos…',
        A + ' sale con ganas desde el cajón…'
      ] : tn < 0.62 ? [
        A + ' manda en la recta; el jockey lo contiene…',
        '¡' + B + ' aprieta por fuera, sombra contra farol!',
        'El público se pone de pie: ' + A + ' no afloja…'
      ] : [
        '¡Remontada de ' + B + ' por dentro!',
        'La meta está cerca… ¡' + A + ' y ' + B + ' la pelean hocico a hocico!'
      ];
      this.setNarr(U.pick(pool));
    }, 1900);

    // cascos
    this.hoofTimer = setInterval(() => {
      Sound.beep(78 + Math.random() * 40, 0.05, 'sine', 0.045);
    }, 165);

    await new Promise((done) => {
      const frame = (now) => {
        const tn = U.clamp((now - t0) / Dtot, 0, 1);
        for (let i = 0; i < this.runners.length; i++) {
          let p;
          if (tn >= arr[i]) p = 100;
          else {
            const base = Math.pow(tn / arr[i], ease[i]);
            const wob = Math.sin(tn * sFq[i] * Math.PI * 2 + sPh[i]) * sAmp[i] * (1 - tn);
            p = U.clamp(base * 100 + wob, 0, 99.2);
          }
          const x = p / 100 * maxX;
          if (horses[i]) { horses[i].style.left = x + 'px'; horses[i]._x = x; }
        }
        if (tn < 1) requestAnimationFrame(frame);
        else done();
      };
      requestAnimationFrame(frame);
    });

    clearInterval(this.narrTimer);
    clearInterval(this.hoofTimer);
    track.classList.remove('running');

    // foto final
    if (photo) {
      const ph = U.$('hr-photo');
      this.setNarr('¡FOTO FINAL! El juez se inclina sobre la película…');
      if (ph) ph.classList.add('on');
      FX.zoom(1600);
      Sound.sfx.sting();
      await U.sleep(1700);
      if (ph) ph.classList.remove('on');
    }

    // resaltar al ganador un instante
    const laneEl = document.querySelector('.hr-lane[data-lane="' + winner + '"]');
    if (laneEl) laneEl.classList.add('winner');
    Sound.sfx.reelStop();
    await U.sleep(photo ? 500 : 900);
    this.settle(winner, photo);
  },

  async settle(winner, photo) {
    const r = State.run;
    const rn = this.runners[winner];
    const mine = this.betHorse === winner;
    const mult = State.payoutMult('races');
    if (mine) {
      const win = Math.round(this.bet * this.runners[this.betHorse].odds * mult);
      State.addChips(win);
      State.recordWin(win, 'races');
      r.hrStreak = (r.hrStreak || 0) + 1;
      State.bumpStreak();
      let sus = 0;
      if (this.runners[this.betHorse].odds >= 8) sus += 6;
      if (r.hrStreak % 2 === 0) sus += 4;
      if (sus) {
        State.addSuspicion(sus);
        U.toast('El bookie apunta tu nombre en la libreta.', 'sus', 3800);
      }
      FX.winAt(U.$('hr-track'), win >= 2000);
      Sound.sfx.win(win >= 2000);
      if (win >= 2000) FX.goldRain(1300);
      this.setMsg((photo ? '¡POR UN HOCICO! ' : '') + rn.name.toUpperCase() + ' GANA — cobras ' + U.fmt(win) + ' fichas.', 'win');
      this.setNarr(photo
        ? 'La foto no miente: ' + rn.name.toUpperCase() + ' por un pescuezo. El bookie paga a regañadientes.'
        : '¡' + rn.name.toUpperCase() + ' cruza primero! El bookie paga a regañadientes.');
    } else {
      State.breakStreak();
      r.hrStreak = 0;
      State.mendigoRefund(this.bet);
      Sound.sfx.lose();
      this.setMsg(rn.name.toUpperCase() + ' se lleva la carrera. El bookie se queda tu apuesta.', 'lose');
      this.setNarr(photo
        ? 'Foto final… y el hocico de ' + rn.name.toUpperCase() + ' llega antes. El bookie sonríe torcido.'
        : '¡' + rn.name.toUpperCase() + ' gana! El bookie barre tu apuesta con una sonrisa torcida.');
    }

    State.markRound(!this.usedTrickThisRace);
    const route = State.afterRound();
    if (route === 'dead') return;
    if (route === 'backroom') { setTimeout(() => Backroom.trigger(), 1400); return; }

    await U.sleep(2400); // un respiro para leer el resultado
    this.racing = false;
    this.newRace();
    this.renderRunners();
    this.renderTrack();
    this.renderTrickPanel();
    this.refreshBet();
    UI.renderMult('races', 'hr-mult');
    UI.renderHUD();
  }
};
