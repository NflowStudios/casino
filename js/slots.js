/* NOIR GOLD — slots.js: Tragamonedas 3 carretes + palanca + Hold & Nudge */
'use strict';
const SL = {
  strips: [], pos: [0, 0, 0], holds: [false, false, false],
  SYM_H: 86, LEN: 20,
  bet: 10, chipSel: null, spinning: false, nudges: 0, nudgesBonus: 0,
  usedTrickThisSpin: false, collectTimer: null, tickTimer: null, leverBusy: false,

  enter() {
    this.spinning = false;
    this.nudges = 0;
    this.nudgesBonus = 0;
    this.usedTrickThisSpin = false;
    this.holds = [false, false, false];
    this.bindOnce();
    if (!this.strips.length) {
      this.strips = [DATA.buildStrip(), DATA.buildStrip(), DATA.buildStrip()];
      this.pos = this.strips.map(() => U.randInt(0, 19));
    }
    U.$('sl-cap').textContent = 'Mín ' + U.fmt(DATA.MIN_BET) + ' · Máx ' + U.fmt(Math.min(500, State.tierCap()));
    this.renderReels();
    this.renderPaytable();
    this.renderTrickPanel();
    this.chipSel = UI.chipRow(U.$('sl-chips'), (v) => { this.bet = v; }, this.bet);
    this.setMsg('Tira de la palanca o pulsa GIRAR');
    U.$('sl-collect').hidden = true;
    U.$('sl-nudges').textContent = '';
    this.refreshControls();
    UI.renderMult('slots', 'sl-mult');
    UI.show('slots');
    this.bindLever();
  },
  leave() {
    if (this.spinning) return;
    Hub.enter();
  },

  bindOnce() {
    if (this._bound) return;
    this._bound = true;
    U.on(U.$('sl-spin'), 'click', () => this.spin());
    U.on(U.$('sl-collect'), 'click', () => { if (!U.$('sl-collect').hidden) this.settle(); });
    U.$$('.reel-hold').forEach((b) => U.on(b, 'click', () => this.toggleHold(+b.dataset.reel)));
    U.$$('.nudge-btn').forEach((b) => U.on(b, 'click', () => this.nudge(+b.dataset.reel, +b.dataset.dir)));
  },

  /* ---------- construcción ---------- */
  renderReels() {
    U.$$('#sl-reels .sl-reel').forEach((reel, i) => {
      const strip = reel.querySelector('.sl-strip');
      const syms = this.strips[i].concat(this.strips[i]); // duplicado para el ciclo
      strip.innerHTML = syms.map((s) => {
        if (s === 'B') return '<div class="sym sym-B"><span>BAR</span></div>';
        return '<div class="sym sym-' + s + '">' + DATA.SYM_LABEL[s] + '</div>';
      }).join('');
      this.applyPos(i);
      reel.classList.toggle('held', this.holds[i]);
    });
  },
  applyPos(i) {
    const strip = document.querySelector('#sl-reels .sl-reel[data-reel="' + i + '"] .sl-strip');
    if (strip) strip.style.transform = 'translateY(' + (-(this.pos[i] % this.LEN) * this.SYM_H) + 'px)';
  },
  paylineSyms() {
    return this.pos.map((p, i) => this.strips[i][((Math.round(p) % this.LEN) + 1) % this.LEN]);
  },
  renderPaytable() {
    const pt = U.$('sl-paytable');
    pt.innerHTML = '<h4>TABLA DE PAGOS</h4>';
    for (const row of DATA.PAYTABLE) {
      const r = U.el('div', 'pt-row');
      const sy = U.el('div', 'pt-syms');
      row.syms.forEach((s) => {
        const sp = U.el('span', 'pt-s' + (s === '7' || s === 'W' ? ' gold' : ''), s === 'B' ? 'B' : DATA.SYM_LABEL[s]);
        sy.appendChild(sp);
      });
      const m = U.el('span', 'pt-mult', '×' + row.m);
      r.appendChild(sy); r.appendChild(m);
      pt.appendChild(r);
    }
    const note = U.el('div', 'pt-row', '<span style="font-size:.62rem">★ = comodín</span>');
    pt.appendChild(note);
  },

  /* ---------- controles ---------- */
  refreshControls() {
    const spin = U.$('sl-spin');
    spin.disabled = this.spinning || (!U.$('sl-collect').hidden);
    U.$$('.reel-hold').forEach((b) => { b.disabled = this.spinning || this.nudges > 0; });
    U.$$('.nudge-btn').forEach((b) => { b.disabled = this.spinning || this.nudges <= 0; b.classList.toggle('glow', this.nudges > 0); });
    U.$('sl-nudges').textContent = this.nudges > 0 ? 'EMPUJES: ' + this.nudges : '';
  },
  setMsg(txt, cls) {
    const m = U.$('sl-msg');
    m.className = 'sl-msg' + (cls ? ' ' + cls : '');
    m.textContent = txt;
  },

  bindLever() {
    if (this._leverBound) return;
    this._leverBound = true;
    const knob = U.$('sl-knob');
    let startY = 0, dy = 0, dragging = false;
    U.on(knob, 'pointerdown', (e) => {
      if (this.spinning || this.leverBusy || !U.$('sl-collect').hidden) return;
      dragging = true;
      startY = e.clientY;
      knob.classList.add('drag');
      knob.setPointerCapture(e.pointerId);
    });
    U.on(knob, 'pointermove', (e) => {
      if (!dragging) return;
      dy = U.clamp(e.clientY - startY, 0, 92);
      knob.style.top = dy + 'px';
      if (dy > 55 && !this._leverTick) {
        this._leverTick = true;
        Sound.sfx.tick();
      }
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      knob.classList.remove('drag');
      knob.classList.add('pulled');
      const fire = dy > 55;
      knob.style.top = '0px';
      setTimeout(() => knob.classList.remove('pulled'), 380);
      this._leverTick = false;
      dy = 0;
      if (fire) this.spin(true);
    };
    U.on(knob, 'pointerup', release);
    U.on(knob, 'pointercancel', release);
  },

  /* ---------- giro ---------- */
  async spin(fromLever) {
    if (this.spinning || !U.$('sl-collect').hidden) return;
    if (this.bet > State.run.chips) { U.toast('No te alcanza para esta apuesta.', 'danger'); return; }
    if (this.bet > Math.min(500, State.tierCap())) { U.toast('Límite del ' + DATA.TIERS[State.run.tier].name + ': ' + U.fmt(Math.min(500, State.tierCap())), 'danger'); return; }
    this.spinning = true;
    this.usedTrickThisSpin = false;
    if (fromLever) Sound.sfx.lever();
    else Sound.sfx.chips();
    State.addChips(-this.bet);
    State.recordSpin('slots');
    this.setMsg('Los carretes giran…');
    U.$('sl-msg').classList.remove('big');
    FX.flash('rgba(255,220,140,.12)', 300);

    // determinar paradas objetivo (con asistencia de suerte)
    let targets = this.pos.map((p, i) => this.holds[i] ? Math.round(p) : U.randInt(0, 19));
    const luck = State.hasAmulet('pata') ? 0.05 : 0;
    if (luck && !this.holds.every((h) => h)) {
      // probar si un ±1 en algún carreté libre crea premio
      const symsNow = targets.map((t, i) => this.strips[i][(t + 1) % this.LEN]);
      if (!DATA.evalLine(symsNow) && U.chance(luck)) {
        let best = null;
        for (let i = 0; i < 3; i++) {
          if (this.holds[i]) continue;
          for (const d of [-1, 1]) {
            const t2 = targets.slice();
            t2[i] = ((t2[i] + d) % this.LEN + this.LEN) % this.LEN;
            const res = DATA.evalLine(t2.map((t, j) => this.strips[j][(t + 1) % this.LEN]));
            if (res && (!best || res.m > best.m)) best = { i, d, m: res.m };
          }
        }
        if (best) targets[best.i] = ((targets[best.i] + best.d) % this.LEN + this.LEN) % this.LEN;
      }
    }

    // animar cada carrete no retenido
    const durs = [1250 + U.randInt(0, 250), 1850 + U.randInt(0, 300), 2500 + U.randInt(0, 350)];
    this.tickTimer = setInterval(() => Sound.sfx.reel(), 95);
    const anims = this.pos.map((p, i) => {
      if (this.holds[i]) return Promise.resolve();
      const start = Math.round(p);
      const delta = ((targets[i] - start) % this.LEN + this.LEN) % this.LEN;
      const end = start + this.LEN * (2 + i) + delta;
      const t0 = performance.now();
      return new Promise((done) => {
        const frame = (now) => {
          const t = U.clamp((now - t0) / durs[i], 0, 1);
          const s = 1.15; // easeOutBack suave
          const e = 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
          const cur = U.lerp(start, end, Math.max(0, e));
          this.pos[i] = cur;
          const strip = document.querySelector('#sl-reels .sl-reel[data-reel="' + i + '"] .sl-strip');
          strip.style.transform = 'translateY(' + (-(cur % this.LEN) * this.SYM_H) + 'px)';
          strip.classList.toggle('blur', (end - cur) > 2.2);
          if (t < 1) requestAnimationFrame(frame);
          else {
            this.pos[i] = ((end % this.LEN) + this.LEN) % this.LEN;
            strip.style.transform = 'translateY(' + (-(this.pos[i] % this.LEN) * this.SYM_H) + 'px)';
            strip.classList.remove('blur');
            Sound.sfx.reelStop();
            if (i === 2) FX.zoom(900);
            done();
          }
        };
        requestAnimationFrame(frame);
      });
    });
    await Promise.all(anims);
    clearInterval(this.tickTimer);

    // limpiar retenciones tras el giro
    this.holds = [false, false, false];
    U.$$('#sl-reels .sl-reel').forEach((r) => r.classList.remove('held'));

    // empujes disponibles
    let base = 0;
    const r0 = Math.random();
    if (r0 > 0.5) base = r0 > 0.85 ? 2 : 1;
    this.nudges = base + (State.hasAmulet('trebol') ? 1 : 0) + this.nudgesBonus;
    this.nudgesBonus = 0;
    this.spinning = false;

    if (this.nudges > 0) {
      this.setMsg('Tienes ' + this.nudges + ' empuje(s): ▲▼ para mover un carrete, luego COBRAR.');
      U.$('sl-collect').hidden = false;
      this.armCollectTimer();
    } else {
      await U.sleep(500);
      this.settle();
    }
    this.refreshControls();
  },

  armCollectTimer() {
    clearTimeout(this.collectTimer);
    this.collectTimer = setTimeout(() => { if (!U.$('sl-collect').hidden) this.settle(); }, 8000);
  },

  nudge(i, dir) {
    if (this.spinning || this.nudges <= 0) return;
    this.nudges--;
    this.pos[i] = ((Math.round(this.pos[i]) + dir) % this.LEN + this.LEN) % this.LEN;
    this.applyPos(i);
    Sound.sfx.reel();
    const res = DATA.evalLine(this.paylineSyms());
    if (res) this.setMsg('¡' + res.label + ' (×' + res.m + ')! Pulsa COBRAR.', 'big');
    else this.setMsg('Empujes restantes: ' + this.nudges);
    this.refreshControls();
    this.armCollectTimer();
    if (this.nudges <= 0) setTimeout(() => { if (!U.$('sl-collect').hidden) this.settle(); }, 900);
  },

  toggleHold(i) {
    if (this.spinning || this.nudges > 0) return;
    this.holds[i] = !this.holds[i];
    const reel = document.querySelector('#sl-reels .sl-reel[data-reel="' + i + '"]');
    reel.classList.toggle('held', this.holds[i]);
    Sound.sfx.chips();
    this.setMsg(this.holds[i] ? 'Carrete retenido para el próximo giro.' : 'Carrete liberado.');
  },

  /* ---------- liquidación ---------- */
  settle() {
    clearTimeout(this.collectTimer);
    U.$('sl-collect').hidden = true;
    const syms = this.paylineSyms();
    const res = DATA.evalLine(syms);
    const mult = State.payoutMult('slots');
    if (res) {
      const win = Math.round(this.bet * res.m * mult);
      State.addChips(win);
      State.recordWin(win, 'slots');
      this.setMsg('¡' + res.label + ' +' + U.fmt(win) + ' fichas!', 'big');
      const cab = document.querySelector('#sl-reels .sl-reel[data-reel="1"] .sl-window');
      FX.winAt(cab, res.m >= 40);
      if (res.m >= 100) {
        Sound.sfx.jackpot();
        FX.goldRain(2000);
        FX.flash('rgba(244,208,111,.5)', 900);
        State.meta.stats.jackpots++;
        State.saveMeta();
        U.toast('¡JACKPOT! Los Sietes de Oro llueven sobre el Gran Salón.', 'gold', 5500);
      } else Sound.sfx.win(res.m >= 15);
    } else {
      this.setMsg('Nada. El metal frío no perdona.');
      Sound.sfx.lose();
    }
    State.markRound(!this.usedTrickThisSpin);
    const route = State.afterRound();
    if (route === 'dead') return;
    if (route === 'backroom') { setTimeout(() => Backroom.trigger(), 700); return; }
    this.refreshControls();
    UI.renderMult('slots', 'sl-mult');
    UI.renderHUD();
  },

  /* ---------- trucos ---------- */
  renderTrickPanel() {
    const panel = U.$('sl-tricks');
    panel.innerHTML = '';
    const r = State.run;
    if (!r) return;
    for (const t of r.tricks) {
      if (t.charges <= 0) continue;
      const def = DATA.TRICKS.find((x) => x.id === t.id);
      if (!def || def.game !== 'slots') continue;
      const b = U.el('button', 'trick-btn',
        '<span class="tb-name">' + def.ico + ' ' + def.name.toUpperCase() + (this.nudgesBonus > 0 ? ' LISTO' : '') + '</span><span class="tb-charges">×' + t.charges + '</span>');
      b.type = 'button';
      b.setAttribute('data-tip', def.desc);
      b.disabled = this.spinning || this.nudgesBonus > 0 || !U.$('sl-collect').hidden;
      b.onclick = () => {
        if (!State.useTrick('dedos')) return;
        this.usedTrickThisSpin = true;
        this.nudgesBonus = def.effect.extraNudges;
        U.toast('Frotes los dedos contra el metal: +' + this.nudgesBonus + ' empujes en la próxima tirada.', 'sus');
        this.renderTrickPanel();
      };
      panel.appendChild(b);
    }
  }
};
