/* NOIR GOLD — roulette.js: Ruleta Art Déco simplificada (plenos + color/paridad + trucos) */
'use strict';
const RL = {
  bets: {}, hist: [], wheelAngle: 0, ballAngle: 0,
  spinning: false, chipSel: null, armedDados: false, biasColor: null,
  usedTrickThisSpin: false, boardBuilt: false, rotor: null, placementHistory: [],

  enter() {
    this.bets = {};
    this.biasColor = null;
    this.armedDados = false;
    this.spinning = false;
    this.usedTrickThisSpin = false;
    this.placementHistory = [];
    this.bindOnce();
    U.$('rl-cap').textContent = 'Mín ' + U.fmt(DATA.MIN_BET) + ' · Máx ' + U.fmt(State.tierCap()) + '/casilla';
    if (!this.boardBuilt) { this.buildBoard(); this.buildWheel(); this.boardBuilt = true; }
    this.renderStacks();
    this.renderHistory();
    this.renderTrickPanel();
    this.updateTotal();
    U.$('rl-result').innerHTML = '<span class="rl-res-ico">✦</span><span id="rl-res-num">—</span>';
    this.chipSel = UI.chipRow(U.$('rl-chips'), null, this.chipSel ? undefined : 10);
    UI.renderMult('roulette', 'rl-mult');
    UI.show('roulette');
    this.placeBall(0, 126, true);
  },
  leave() {
    const total = this.betTotal();
    if (this.spinning) return;
    if (total > 0) {
      UI.confirm('ABANDONAR LA MESA', 'Tienes <b>' + U.fmt(total) + '</b> fichas sobre el tapete que perderás.<br>¿Te vas?', 'ABANDONAR').then((ok) => { if (ok) { this.bets = {}; Hub.enter(); } });
    } else Hub.enter();
  },

  bindOnce() {
    if (this._bound) return;
    this._bound = true;
    U.on(U.$('rl-spin'), 'click', () => this.spin());
    U.on(U.$('rl-undo'), 'click', () => {
      if (this.spinning || !this.placementHistory.length) return;
      const last = this.placementHistory.pop();
      this.removeBet(last.key);
    });
    U.on(U.$('rl-clear'), 'click', () => {
      if (this.spinning) return;
      this.bets = {};
      this.placementHistory = [];
      Sound.sfx.chips();
      this.renderStacks();
      this.updateTotal();
    });
  },

  /* ---------- rueda SVG ---------- */
  buildWheel() {
    const box = U.$('rl-wheel');
    const step = 360 / 37, R = 160;
    const pt = (r, deg) => {
      const a = deg * Math.PI / 180;
      return (R + r * Math.sin(a)).toFixed(2) + ',' + (R - r * Math.cos(a)).toFixed(2);
    };
    let pockets = '';
    let numbers = '';
    for (let i = 0; i < 37; i++) {
      const n = DATA.WHEEL_ORDER[i];
      const a0 = i * step - step / 2, a1 = i * step + step / 2;
      const col = n === 0 ? '#0a7d34' : (DATA.isRed(n) ? '#8e0f28' : '#14161d');
      pockets += '<path d="M' + pt(150, a0) + ' A150,150 0 0 1 ' + pt(150, a1) +
        ' L' + pt(103, a1) + ' A103,103 0 0 0 ' + pt(103, a0) + ' Z" fill="' + col +
        '" stroke="#D4AF37" stroke-width=".7"/>';
      numbers += '<g transform="rotate(' + (i * step).toFixed(3) + ' ' + R + ' ' + R + ')">' +
        '<text x="' + R + '" y="42" text-anchor="middle" font-family="Josefin Sans" font-size="13" font-weight="700" fill="#F2E8D5">' + n + '</text></g>';
    }
    box.innerHTML = '<svg viewBox="0 0 320 320">' +
      '<circle cx="160" cy="160" r="158" fill="#0a0b0f" stroke="#8a7326" stroke-width="3"/>' +
      '<g id="rl-rotor">' + pockets + numbers +
      '<circle cx="160" cy="160" r="100" fill="#800020" stroke="#D4AF37" stroke-width="3"/>' +
      '<circle cx="160" cy="160" r="84" fill="none" stroke="#D4AF37" stroke-width="1.4" opacity=".7"/>' +
      '<circle cx="160" cy="160" r="70" fill="#5a0016" stroke="#D4AF37" stroke-width="1.2" opacity=".85"/>' +
      '<g fill="#D4AF37"><path d="M160,96 l6,52 -6,14 -6,-14 Z"/><path d="M160,224 l6,-52 -6,-14 -6,14 Z"/>' +
      '<path d="M96,160 l52,-6 14,6 -14,6 Z"/><path d="M224,160 l-52,6 -14,-6 14,-6 Z"/></g>' +
      '<circle cx="160" cy="160" r="22" fill="#D4AF37"/><circle cx="160" cy="160" r="15" fill="#8a7326"/>' +
      '</g></svg>';
    this.rotor = box.querySelector('#rl-rotor');
    this.rotor.setAttribute('transform', 'rotate(' + this.wheelAngle + ' 160 160)');
  },
  setWheel(deg) {
    this.wheelAngle = deg;
    if (this.rotor) this.rotor.setAttribute('transform', 'rotate(' + deg + ' 160 160)');
  },
  placeBall(betaDeg, radius, settle) {
    const ball = U.$('rl-ball');
    const a = betaDeg * Math.PI / 180;
    const x = 160 + radius * Math.sin(a) - 6.5;
    const y = 160 - radius * Math.cos(a) - 6.5;
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    ball.classList.toggle('settled', !!settle);
  },

  /* ---------- tablero ---------- */
  buildBoard() {
    const b = U.$('rl-board');
    const mk = (key, label, cls, area) => {
      const c = U.el('div', 'rl-cell ' + cls, label);
      c.dataset.key = key;
      c.style.gridArea = area;
      b.appendChild(c);
    };
    mk('n0', '0', 'green zero', '1 / 1 / 4 / 2');
    for (let n = 1; n <= 36; n++) {
      const row = n % 3 === 0 ? 1 : (n % 3 === 2 ? 2 : 3);
      const col = Math.ceil(n / 3) + 1;
      mk('n' + n, String(n), DATA.isRed(n) ? 'red' : 'black', row + ' / ' + col + ' / ' + row + ' / ' + (col + 1));
    }
    mk('red', 'ROJO', 'outside o-red', '4 / 2 / 5 / 5');
    mk('black', 'NEGRO', 'outside o-black', '4 / 5 / 5 / 8');
    mk('even', 'PAR', 'outside', '4 / 8 / 5 / 11');
    mk('odd', 'IMPAR', 'outside', '4 / 11 / 5 / 14');
    U.on(b, 'click', (e) => {
      const cell = e.target.closest('.rl-cell');
      if (cell) this.onCellClick(cell);
    });
    U.on(b, 'contextmenu', (e) => {
      e.preventDefault();
      const cell = e.target.closest('.rl-cell');
      if (cell) this.removeBet(cell.dataset.key);
    });
  },
  onCellClick(cell) {
    if (this.spinning) return;
    const key = cell.dataset.key;
    if (this.armedDados) {
      if (key === 'red' || key === 'black') {
        this.biasColor = key;
        this.armedDados = false;
        if (!State.useTrick('dados')) return;
        this.usedTrickThisSpin = true;
        U.toast('El plato está lastrado: el ' + (key === 'red' ? 'ROJO' : 'NEGRO') + ' caerá con mucha más frecuencia (1 giro).', 'sus');
        this.renderTrickPanel();
        Sound.sfx.chips();
      } else U.toast('Elige ROJO o NEGRO para lastrar el plato.', 'info');
      return;
    }
    const v = this.selValue();
    const slot = this.bets[key] || (this.bets[key] = { total: 0, chips: [] });
    if (slot.total + v > State.tierCap()) { U.toast('Límite por casilla: ' + U.fmt(State.tierCap()), 'danger'); return; }
    if (this.betTotal() + v > State.run.chips) { U.toast('No tienes tantas fichas.', 'danger'); return; }
    slot.total += v;
    slot.chips.push(v);
    this.placementHistory.push({ key, v });
    Sound.sfx.chips();
    this.renderStacks();
    this.updateTotal();
  },
  removeBet(key) {
    const slot = this.bets[key];
    if (!slot) return;
    const v = slot.chips.pop();
    slot.total -= v || 0;
    if (slot.chips.length === 0) delete this.bets[key];
    Sound.sfx.chips();
    this.renderStacks();
    this.updateTotal();
  },
  selValue() {
    const sel = document.querySelector('#rl-chips .chip.sel');
    return sel ? +sel.dataset.v : 10;
  },
  betTotal() {
    let t = 0;
    for (const k in this.bets) t += this.bets[k].total;
    return t;
  },
  updateTotal() {
    U.$('rl-bet-total').textContent = U.fmt(this.betTotal());
    U.$('rl-spin').disabled = this.spinning || this.betTotal() < DATA.MIN_BET;
    U.$('rl-undo').disabled = this.spinning;
    U.$('rl-clear').disabled = this.spinning;
  },
  renderStacks() {
    U.$$('#rl-board .rl-cell').forEach((c) => {
      const old = c.querySelector('.stack');
      if (old) old.remove();
      const slot = this.bets[c.dataset.key];
      if (!slot || !slot.total) return;
      const st = U.el('span', 'stack');
      const ch = U.el('span', 'st-chip', U.fmt(slot.total));
      ch.dataset.v = slot.total > 1000 ? 5000 : (slot.total > 100 ? 500 : (slot.total > 25 ? 50 : 10));
      st.appendChild(ch);
      c.appendChild(st);
    });
  },
  renderHistory() {
    const h = U.$('rl-history');
    h.innerHTML = '';
    this.hist.slice(0, 8).forEach((n) => {
      const b = U.el('span', 'rh-badge ' + DATA.rlColor(n), String(n));
      h.appendChild(b);
    });
  },

  /* ---------- muestreo con suerte y dados cargados ---------- */
  pays(n) {
    for (const k in this.bets) {
      if (k[0] === 'n') { if (+k.slice(1) === n) return true; if (State.hasAmulet('sortija') && DATA.wheelNeighbors(+k.slice(1)).indexOf(n) >= 0) return true; }
      else if (this.payoutFor(k, 1, n) > 0) return true;
    }
    return false;
  },
  payoutFor(key, amt, n) {
    if (key[0] === 'n') return n === +key.slice(1) ? amt * 36 : 0;
    switch (key) {
      case 'red': return DATA.isRed(n) ? amt * 2 : 0;
      case 'black': return (n !== 0 && !DATA.isRed(n)) ? amt * 2 : 0;
      case 'even': return (n !== 0 && n % 2 === 0) ? amt * 2 : 0;
      case 'odd': return (n % 2 === 1) ? amt * 2 : 0;
    }
    return 0;
  },
  sampleResult() {
    const luck = State.hasAmulet('pata') ? 0.05 : 0;
    const bias = this.biasColor ? (State.synActive('fortuna') ? 4 : 3) : 1;
    const w = [];
    for (let n = 0; n <= 36; n++) {
      let weight = 1;
      if (this.biasColor) {
        const isBias = n !== 0 && (this.biasColor === 'red' ? DATA.isRed(n) : !DATA.isRed(n));
        weight = isBias ? bias : 0.55; // el color contrario cae menos
      }
      if (luck && this.pays(n)) weight *= 1 + luck * 3;
      w.push(weight);
    }
    let total = w.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let n = 0; n <= 36; n++) { r -= w[n]; if (r <= 0) return n; }
    return 0;
  },

  /* ---------- giro ---------- */
  async spin() {
    if (this.spinning || this.betTotal() < DATA.MIN_BET) return;
    this.spinning = true;
    this.usedTrickThisSpin = false;
    const total = this.betTotal();
    State.addChips(-total);
    State.recordSpin('roulette');
    this.updateTotal();
    U.$('rl-msg') && (U.$('rl-result').innerHTML = '<span class="rl-res-ico" style="animation-duration:.8s">✦</span><span id="rl-res-num">…</span>');

    const n = this.sampleResult();
    const step = 360 / 37;
    const idx = DATA.WHEEL_ORDER.indexOf(n);
    // rotación final: el bolsillo ganador arriba del todo
    const targetLocal = ((-idx * step) % 360 + 360) % 360;
    const cur = ((this.wheelAngle % 360) + 360) % 360;
    const delta = ((targetLocal - cur) % 360 + 360) % 360;
    const θ0 = this.wheelAngle;
    const θf = θ0 + 360 * (5 + U.randInt(0, 2)) + delta;
    // bola: en contra, termina arriba (0)
    const β0 = this.ballAngle + 360 * (4 + U.randInt(0, 2));
    const βf = ((this.ballAngle - β0) % 360 + 360) % 360; // ≡ ballAngle pero hacia abajo
    const T = 5200;
    const t0 = performance.now();
    let lastPkt = -1, lastTick = 0;
    let zoomed = false;
    Sound.sfx.chips();

    await new Promise((done) => {
      const frame = (now) => {
        const t = U.clamp((now - t0) / T, 0, 1);
        const eW = 1 - Math.pow(1 - t, 3);          // rueda easeOutCubic
        const eB = 1 - Math.pow(1 - t, 2.6);        // bola un poco más viva
        const θ = U.lerp(θ0, θf, eW);
        const β = U.lerp(β0, βf, eB);
        this.setWheel(θ);
        // radio: espiral hacia dentro al final
        const rr = t < 0.62 ? 146 : U.lerp(146, 124, (t - 0.62) / 0.38);
        this.placeBall(β, rr, t > 0.97);
        // ticks al cruzar bolsillos
        const rel = Math.floor(((β - θ) % 360 + 360) % 360 / step);
        if (rel !== lastPkt && now - lastTick > 55 && t < 0.94) {
          Sound.sfx.tick();
          lastPkt = rel; lastTick = now;
        }
        if (t > 0.66 && !zoomed) { zoomed = true; FX.zoom(1800); } // slow-zoom de tensión
        if (t < 1) requestAnimationFrame(frame);
        else { this.setWheel(θf); this.wheelAngle = θf; this.ballAngle = 0; this.placeBall(0, 124, true); done(); }
      };
      requestAnimationFrame(frame);
    });

    Sound.sfx.reelStop();
    await U.sleep(350);
    this.reveal(n);
  },

  async reveal(n) {
    // resaltar casilla
    U.$$('#rl-board .rl-cell').forEach((c) => c.classList.remove('win-cell'));
    const cell = document.querySelector('#rl-board .rl-cell[data-key="n' + n + '"]');
    if (cell) cell.classList.add('win-cell');
    const res = U.$('rl-res-num');
    if (res) {
      res.textContent = n + ' ' + (n === 0 ? 'VERDE' : (DATA.isRed(n) ? 'ROJO' : 'NEGRO'));
      res.className = DATA.rlColor(n);
    }
    this.hist.unshift(n);
    this.renderHistory();

    // ventana de "Apostar a Destiempo"
    const dt = State.trick('destiempo');
    if (dt && dt.charges > 0 && Object.keys(this.bets).length) {
      const moved = await this.destiempoWindow(n);
      if (moved) await U.sleep(600);
    }
    this.biasColor = null;

    // pagos (con multiplicadores de tragos/sinergias)
    const mult = State.payoutMult('roulette');
    let ret = 0;
    for (const k in this.bets) {
      let r = this.payoutFor(k, this.bets[k].total, n);
      if (!r && k[0] === 'n' && State.hasAmulet('sortija')) {
        const num = +k.slice(1);
        if (DATA.wheelNeighbors(num).indexOf(n) >= 0) {
          r = this.bets[k].total * 18; // 17:1 por número adyacente en la rueda
          U.toast('La Sortija de la Croupier cubre el ' + num + ': su vecino ' + n + ' paga 17:1.', 'gold');
        }
      }
      if (r) ret += Math.round(r * mult);
    }

    if (ret > 0) {
      State.addChips(ret);
      State.recordWin(ret, 'roulette');
      FX.winAt(document.querySelector('.rl-wheelbox'), ret >= 1000);
      Sound.sfx.win(ret >= 1000);
      U.toast('Cobras ' + U.fmt(ret) + ' fichas.', 'success');
      if (ret >= 5000) FX.goldRain(1200);
    } else {
      Sound.sfx.lose();
      U.toast('La rueda no te sonríe. La casa se queda tu apuesta.', 'danger');
    }

    this.bets = {};
    this.renderStacks();
    this.updateTotal();
    State.markRound(!this.usedTrickThisSpin);
    const route = State.afterRound();
    if (route === 'dead') return;
    if (route === 'backroom') { setTimeout(() => Backroom.trigger(), 800); return; }
    this.spinning = false;
    this.renderTrickPanel();
    this.updateTotal();
    UI.renderMult('roulette', 'rl-mult');
    UI.renderHUD();
  },

  destiempoWindow(n) {
    return new Promise((res) => {
      const btn = U.el('button', 'trick-btn flash', '<span class="tb-name">◷ APOSTAR A DESTIEMPO — mueve tu mayor apuesta al ' + n + '</span><span class="tb-charges">¡AHORA!</span>');
      btn.type = 'button';
      btn.style.cssText = 'width:100%;margin-top:.4rem';
      const dt = State.trick('destiempo');
      U.$('rl-tricks').appendChild(btn);
      let done = false;
      const finish = (v) => { if (done) return; done = true; btn.remove(); clearTimeout(timer); res(v); };
      const timer = setTimeout(() => finish(false), 2500);
      btn.onclick = () => {
        // mayor apuesta
        let bestKey = null, bestV = 0;
        for (const k in this.bets) if (this.bets[k].total > bestV) { bestV = this.bets[k].total; bestKey = k; }
        if (!bestKey) return finish(false);
        if (bestKey === 'n' + n) {
          U.toast('Tu mayor apuesta ya está en el ' + n + '. El truco no hace falta… esta vez.', 'info');
          return finish(false);
        }
        if (!State.useTrick('destiempo')) return finish(false);
        this.usedTrickThisSpin = true;
        // mover al número ganador
        delete this.bets[bestKey];
        const nk = 'n' + n;
        const slot = this.bets[nk] || (this.bets[nk] = { total: 0, chips: [] });
        slot.total += bestV;
        slot.chips.push(bestV);
        this.renderStacks();
        FX.flyChip(document.querySelector('.rl-wheelbox'), document.querySelector('#rl-board .rl-cell[data-key="n' + n + '"]'), null, '');
        Sound.sfx.chips();
        U.toast('La ficha se desliza sobre el ' + n + ' cuando nadie mira. El Pit Boss sí miraba.', 'sus', 4500);
        finish(true);
      };
    });
  },

  renderTrickPanel() {
    const panel = U.$('rl-tricks');
    panel.innerHTML = '';
    const r = State.run;
    if (!r) return;
    for (const t of r.tricks) {
      if (t.charges <= 0) continue;
      const def = DATA.TRICKS.find((x) => x.id === t.id);
      if (!def || def.game !== 'roulette') continue;
      if (t.id === 'destiempo') continue; // aparece tras el giro
      const b = U.el('button', 'trick-btn' + (this.armedDados ? ' flash' : ''),
        '<span class="tb-name">' + Icon.svg(def.icon, 'tb-ico') + def.name.toUpperCase() + (this.armedDados ? ' — ELIGE UN COLOR' : '') + '</span><span class="tb-charges">×' + t.charges + '</span>');
      b.type = 'button';
      b.setAttribute('data-tip', def.desc);
      b.disabled = this.spinning || this.biasColor !== null;
      b.onclick = () => {
        this.armedDados = !this.armedDados;
        if (this.armedDados) U.toast('Elige ROJO o NEGRO en el tablero para lastrar el plato.', 'info');
        this.renderTrickPanel();
      };
      panel.appendChild(b);
    }
  }
};
