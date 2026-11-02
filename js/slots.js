/* NOIR GOLD — slots.js: Tragamonedas clásico de 3 carretes + palanca */
'use strict';
const SL = {
  strips: [], pos: [0, 0, 0],
  SYM_H: 86, LEN: 20,
  bet: 10, chipSel: null, spinning: false,
  usedTrickThisSpin: false, freeSpin: false, tickTimer: null, leverBusy: false,

  enter() {
    this.spinning = false;
    this.usedTrickThisSpin = false;
    this.freeSpin = false;
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
    U.$('sl-spin').disabled = this.spinning;
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
      if (this.spinning || this.leverBusy) return;
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
    if (this.spinning) return;
    if (this.bet > State.run.chips && !this.freeSpin) { U.toast('No te alcanza para esta apuesta.', 'danger'); return; }
    if (this.bet > Math.min(500, State.tierCap())) { U.toast('Límite del ' + DATA.TIERS[State.run.tier].name + ': ' + U.fmt(Math.min(500, State.tierCap())), 'danger'); return; }
    this.spinning = true;
    this.refreshControls();
    if (fromLever) Sound.sfx.lever();
    else Sound.sfx.chips();

    // Dedos de Oro: la tirada es gratis
    if (this.freeSpin) {
      this.freeSpin = false;
      U.toast('Tirada cortesía de tus dedos de oro. El encargado no vio nada.', 'gold');
    } else {
      State.addChips(-this.bet);
    }
    State.recordSpin('slots');
    this.setMsg('Los carretes giran…');
    U.$('sl-msg').classList.remove('big');
    FX.flash('rgba(255,220,140,.12)', 300);

    // determinar paradas objetivo (con asistencia de suerte)
    const targets = this.pos.map(() => U.randInt(0, 19));
    const luck = State.luckBonus();
    if (luck) {
      // probar si un ±1 en algún carrete crea premio
      const symsNow = targets.map((t, i) => this.strips[i][(t + 1) % this.LEN]);
      if (!DATA.evalLine(symsNow) && U.chance(luck)) {
        let best = null;
        for (let i = 0; i < 3; i++) {
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

    // animar cada carrete
    const durs = [1250 + U.randInt(0, 250), 1850 + U.randInt(0, 300), 2500 + U.randInt(0, 350)];
    this.tickTimer = setInterval(() => Sound.sfx.reel(), 95);
    const anims = this.pos.map((p, i) => {
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

    await U.sleep(520);
    this.settle();
  },

  /* ---------- liquidación ---------- */
  settle() {
    const syms = this.paylineSyms();
    const res = DATA.evalLine(syms);
    const mult = State.payoutMult('slots');
    if (res) {
      let win = Math.round(this.bet * res.m * mult);
      if (State.hasAmulet('trebol')) win = Math.round(win * 1.15); // Trébol: +15% en slots
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
      State.bumpStreak();
    } else {
      this.setMsg('Nada. El metal frío no perdona.');
      Sound.sfx.lose();
      State.breakStreak();
      State.mendigoRefund(this.bet);
    }
    State.markRound(!this.usedTrickThisSpin);
    this.usedTrickThisSpin = false;
    this.spinning = false;
    const route = State.afterRound();
    if (route === 'dead') return;
    if (route === 'backroom') { setTimeout(() => Backroom.trigger(), 700); return; }
    this.refreshControls();
    this.renderTrickPanel();
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
        '<span class="tb-name">' + Icon.svg(def.icon, 'tb-ico') + def.name.toUpperCase() + (this.freeSpin ? ' LISTO' : '') + '</span><span class="tb-charges">×' + t.charges + '</span>');
      b.type = 'button';
      b.setAttribute('data-tip', def.desc);
      b.disabled = this.spinning || this.freeSpin;
      b.onclick = () => {
        if (!State.useTrick('dedos')) return;
        this.usedTrickThisSpin = true;
        this.freeSpin = true;
        U.toast('Tus dedos distraen al encargado: la próxima tirada es gratis.', 'sus');
        this.renderTrickPanel();
      };
      panel.appendChild(b);
    }
  }
};
