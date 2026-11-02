/* NOIR GOLD — duel.js: LA PARTIDA PRIVADA
   Blackjack a 3 victorias contra don Salvatore Moretti en la sala del fondo.
   Apuesta del orgullo: 10% → 15% → 20% → 25% del paño… y la quinta mano, TODO.
   El As de Moretti: una vez por partida cambia su carta oculta a la vista de todos.
   Cuatro finales: EL SOCIO · LA GRAN ESTAFA · LA LECCIÓN · EL REY DE NADA. */
'use strict';
const Duel = {
  shoe: [], count: 0,
  p: [], m: [],
  phase: 'idle',          // idle | deal | play | dealer | settle | between
  busy: false,
  forcedAce: false, markerOn: false,
  lastBet: 0, lastAllIn: false,

  /* ---------- acceso ---------- */
  available() {
    const r = State.run;
    return !!(r && r.mode === 'story' && r.morettiSeen && r.morettiSeen.indexOf(4) >= 0);
  },
  active() {
    const r = State.run;
    return !!(r && r.duel && r.duel.active);
  },

  async tryEnter() {
    const r = State.run;
    if (!r || !this.available()) return;
    if (r.chips < DATA.DUEL.BUYIN) {
      UI.confirm('LA SALA DEL FONDO',
        'El gorila de la puerta niega con la cabeza: <b>«Quinientas mil de entrada, canario.»</b><br>Te faltan <b class="gold">' + U.fmt(DATA.DUEL.BUYIN - r.chips) + '</b> fichas para sentarte.');
      return;
    }
    const ok = await UI.confirm('LA PARTIDA PRIVADA',
      'La sala del fondo huele a cigarro y a decisiones definitivas.<br><br>' +
      '<b>Entrada:</b> ' + U.fmt(DATA.DUEL.BUYIN) + ' fichas — se convierten en tu paño sobre la mesa.<br>' +
      '<b>El duelo:</b> Blackjack a <b>3 victorias</b>. Apuesta del orgullo: 10% → 15% → 20% → 25% del paño… y la <b>quinta mano se juega a TODO O NADA</b> (paño y bolsillo).<br>' +
      '<b>El As de Moretti:</b> una vez por partida, él cambiará su carta oculta a la vista de todos.<br><br>' +
      'Si ganas, <b>la casa iguala tu paño</b> y la deuda queda saldada de otro modo. Si pierdes, la sala se queda la entrada. Tus trucos siguen funcionando aquí… <b>si te atreves</b>.',
      'PAGAR LA ENTRADA');
    if (ok) this.enter();
  },

  enter() {
    const r = State.run;
    if (!r) return;
    State.addChips(-DATA.DUEL.BUYIN);
    r.duel = { active: true, stack: DATA.DUEL.BUYIN, hand: 1, pw: 0, mw: 0, asUsed: false, cheated: false };
    this.p = []; this.m = [];
    this.forcedAce = false; this.markerOn = false;
    this.buildShoe();
    State.saveRun();
    UI.show('duel');
    this.renderBase();
    this.say(U.pick(DATA.DUEL.lines.start), 'moretti');
    this.setMsg('Moretti baraja sin prisa. El paño espera: ' + U.fmt(r.duel.stack) + ' fichas.');
    setTimeout(() => this.startHand(), 1400);
  },

  /* retomar la partida tras recargar la página: se reponen paño y marcador,
     y la mano en curso se vuelve a repartir (la sala no perdona los nervios) */
  resume() {
    const r = State.run;
    if (!this.active()) return;
    this.p = []; this.m = [];
    this.forcedAce = false; this.markerOn = false;
    this.buildShoe();
    UI.show('duel');
    this.renderBase();
    this.say('«El cigarro se consumió esperándote. Sigamos donde estábamos.»', 'moretti');
    this.setMsg('Reanudas el duelo: ' + U.fmt(r.duel.stack) + ' fichas sobre el paño.');
    setTimeout(() => this.startHand(), 1200);
  },

  buildShoe() {
    this.shoe = [];
    for (let deck = 0; deck < 6; deck++)
      for (const s of BJ.SUITS)
        for (const rk of BJ.RANKS) this.shoe.push({ r: rk, s });
    this.shoe = U.shuffle(this.shoe);
    this.count = 0;
  },
  draw() {
    if (this.shoe.length < 78) {
      this.buildShoe();
      U.toast('Moretti ordena un mazo nuevo. «Los naipes, como los amigos, se gastan.»', 'info', 3600);
    }
    const c = this.shoe.pop();
    this.hiLo(c.r);
    return c;
  },
  drawForcedAce() {
    const c = { r: 'A', s: U.pick(BJ.SUITS) };
    const idx = this.shoe.findIndex((x) => x.r === 'A');
    if (idx >= 0) this.shoe.splice(idx, 1);
    this.hiLo('A');
    return c;
  },
  hiLo(rk) {
    if (['2', '3', '4', '5', '6'].indexOf(rk) >= 0) this.count++;
    else if (['10', 'J', 'Q', 'K', 'A'].indexOf(rk) >= 0) this.count--;
    this.renderCountBadge();
  },

  /* ---------- apuesta del orgullo ---------- */
  isAllIn() {
    const r = State.run;
    return r && r.duel && r.duel.hand > DATA.DUEL.STAKES.length;
  },
  betFor() {
    const d = State.run.duel;
    if (d.hand <= DATA.DUEL.STAKES.length) return Math.max(DATA.MIN_BET, Math.round(d.stack * DATA.DUEL.STAKES[d.hand - 1]));
    return d.stack; // TODO: el paño ya incluye el bolsillo
  },

  /* ---------- render base ---------- */
  renderBase() {
    const r = State.run;
    if (!r || !r.duel) return;
    const d = r.duel;
    U.$('duel-score').innerHTML =
      '<span class="duel-side you">TÚ</span>' + this.pips(d.pw) +
      '<span class="duel-sep">·</span>' + this.pips(d.mw) + '<span class="duel-side him">MORETTI</span>';
    const allIn = this.isAllIn();
    const bet = this.betFor();
    U.$('duel-stakes').innerHTML =
      '<span class="ds-hand">MANO ' + d.hand + '</span>' +
      (allIn
        ? '<span class="ds-bet allin">✦ APOSTARLO TODO: ' + U.fmt(bet) + ' ✦</span>'
        : '<span class="ds-bet">APUESTA: ' + Math.round(DATA.DUEL.STAKES[d.hand - 1] * 100) + '% DEL PAÑO — ' + U.fmt(bet) + '</span>') +
      '<span class="ds-stack">PAÑO: <b>' + U.fmt(d.stack) + '</b></span>' +
      (allIn ? '' : '<span class="ds-pocket">BOLSILLO: ' + U.fmt(r.chips) + '</span>');
    U.$('duel-as').classList.toggle('used', d.asUsed);
    this.renderTrickPanel();
  },
  pips(n) {
    let s = '';
    for (let i = 0; i < DATA.DUEL.WINS; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>';
    return '<span class="pips">' + s + '</span>';
  },
  say(txt, who) {
    const el = U.$('duel-say');
    if (!el) return;
    el.innerHTML = (who === 'moretti' ? '<span class="say-who">MORETTI</span>' : '') + txt;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  },
  setMsg(t, cls) {
    const m = U.$('duel-msg');
    if (!m) return;
    m.textContent = t;
    m.className = 'duel-msg' + (cls ? ' ' + cls : '');
  },
  renderCountBadge() {
    const b = U.$('duel-count');
    if (!b) return;
    if (this.markerOn) {
      b.hidden = false;
      b.textContent = 'CONTEO ' + (this.count > 0 ? '+' : '') + this.count;
    } else b.hidden = true;
  },

  updateCounts() {
    const pv = BJ.handVal(this.p);
    const pc = U.$('duel-pcount');
    pc.textContent = this.p.length ? (pv.soft && pv.v <= 21 ? pv.v + 's' : pv.v) : '';
    pc.classList.toggle('bust', pv.v > 21);
    const mc = U.$('duel-mcount');
    if (this.markerOn || this.phase === 'dealer' || this.phase === 'settle') {
      const dv = BJ.handVal(this.m);
      mc.textContent = dv.v;
      mc.classList.toggle('bust', dv.v > 21);
    } else {
      const up = BJ.handVal([this.m[0]]);
      mc.textContent = up.v + '+';
    }
  },

  /* ---------- trucos (funcionan en la sala… con sus consecuencias) ---------- */
  renderTrickPanel() {
    const panel = U.$('duel-tricks');
    if (!panel) return;
    panel.innerHTML = '';
    const r = State.run;
    if (!r) return;
    let any = false;
    for (const t of r.tricks) {
      if (t.charges <= 0) continue;
      const def = DATA.TRICKS.find((x) => x.id === t.id);
      if (!def || def.game !== 'blackjack') continue;
      any = true;
      const b = U.el('button', 'trick-btn',
        '<span class="tb-name">' + Icon.svg(def.icon, 'tb-ico') + def.name.toUpperCase() + '</span><span class="tb-charges">×' + t.charges + '</span>');
      b.type = 'button';
      b.setAttribute('data-tip', def.desc);
      b.disabled = this.phase !== 'play';
      if (t.id === 'asbajo') b.disabled = this.phase !== 'play' || this.forcedAce;
      b.onclick = () => this.useTrick(t.id, def);
      panel.appendChild(b);
    }
    U.$('duel-tricks-empty').hidden = any;
  },
  useTrick(id, def) {
    if (this.phase !== 'play') return;
    if (!State.useTrick(id)) return;
    const d = State.run.duel;
    d.cheated = true; // Moretti no olvida: esto decide el final
    if (id === 'asbajo') {
      this.forcedAce = true;
      Sound.sfx.card();
      U.toast('Deslizas un As bajo la manga, bajo la mirada del don en persona.', 'sus', 4200);
    } else if (id === 'marcadas') {
      this.markerOn = true;
      Sound.sfx.card();
      U.toast('Las marcas del mazo brillan bajo la lámpara: verás la carta oculta de Moretti el resto de la partida.', 'sus', 4800);
      const hole = U.$('duel-mhand').children[1];
      if (hole) hole.classList.add('marked');
      this.revealHole(true);
      this.updateCounts();
      this.renderCountBadge();
    }
    this.renderTrickPanel();
  },
  revealHole(quiet) {
    const hole = U.$('duel-mhand').children[1];
    if (hole) { hole.classList.remove('face-down'); if (!quiet) Sound.sfx.card(); }
  },

  /* ---------- la mano ---------- */
  async startHand() {
    const r = State.run;
    if (!r || !r.duel || !r.duel.active) return;
    const d = r.duel;
    this.phase = 'deal';
    this.busy = true;
    this.p = []; this.m = [];
    U.$('duel-controls').innerHTML = '';
    U.$('duel-phand').innerHTML = '';
    U.$('duel-mhand').innerHTML = '';
    U.$('duel-pcount').textContent = '';
    U.$('duel-mcount').textContent = '';

    // apuesta del orgullo: en la quinta mano, lo de la mesa Y lo del bolsillo
    if (this.isAllIn()) {
      const pocket = r.chips;
      if (pocket > 0) {
        r.chips = 0;
        d.stack += pocket;
        UI.renderHUD();
      }
      this.say(U.pick(DATA.DUEL.lines.allIn), 'moretti');
      Sound.sfx.sting();
      FX.flash('rgba(128,0,32,.32)', 900);
      FX.zoom(1600);
    }
    this.lastBet = this.betFor();
    this.lastAllIn = this.isAllIn();
    this.renderBase();
    this.setMsg(this.lastAllIn ? 'TODO O NADA: ' + U.fmt(this.lastBet) + ' fichas sobre el paño.' : 'Mano ' + d.hand + ' — en juego: ' + U.fmt(this.lastBet) + '.');

    State.recordSpin('blackjack');
    r.stats.hands++;

    await this.dealTo(this.p, U.$('duel-phand'), this.draw());
    await this.dealTo(this.m, U.$('duel-mhand'), this.draw());
    await this.dealTo(this.p, U.$('duel-phand'), this.draw());
    await this.dealTo(this.m, U.$('duel-mhand'), this.draw(), true);
    if (this.markerOn) {
      const hole = U.$('duel-mhand').children[1];
      if (hole) hole.classList.add('marked');
    }
    this.updateCounts();

    const pBJ = BJ.handVal(this.p).v === 21;
    const dBJ = BJ.handVal(this.m).v === 21;
    if (pBJ || dBJ) {
      await U.sleep(600);
      this.revealHole();
      this.updateCounts();
      await U.sleep(500);
      if (pBJ && dBJ) this.settle('push', 'Dos Blackjacks bajo la misma lámpara. Empate.');
      else if (pBJ) this.settle('p', '¡BLACKJACK! Paga 3 a 2 sobre el paño.', true);
      else this.settle('m', 'Blackjack de Moretti. El don ni sonríe.');
      return;
    }
    this.phase = 'play';
    this.busy = false;
    this.renderControls();
    this.setMsg('Tu turno. Moretti espera detrás del humo.');
  },

  async dealTo(hand, handEl, card, hidden) {
    hand.push(card);
    const el = BJ.cardEl(card, hidden);
    handEl.appendChild(el);
    Sound.sfx.deal();
    await U.sleep(280);
    return el;
  },

  renderControls() {
    const c = U.$('duel-controls');
    c.innerHTML = '';
    const acts = U.el('div', 'act-btns');
    const mk = (label, fn) => {
      const b = U.el('button', 'btn btn-ghost btn-deco', label);
      b.onclick = fn;
      acts.appendChild(b);
    };
    mk('PEDIR CARTA', () => this.hit());
    mk('PLANTARSE', () => this.stand());
    c.appendChild(acts);
    this.renderTrickPanel();
  },

  async hit() {
    if (this.busy || this.phase !== 'play') return;
    this.busy = true;
    let card;
    if (this.forcedAce) { card = this.drawForcedAce(); this.forcedAce = false; await this.dealTo(this.p, U.$('duel-phand'), card); }
    else { card = this.draw(); await this.dealTo(this.p, U.$('duel-phand'), card); }
    this.updateCounts();
    const v = BJ.handVal(this.p).v;
    if (v > 21) {
      this.settle('m', 'Te pasas con ' + v + '. Moretti junta las fichas sin mirarlas.');
    } else if (v === 21) {
      this.busy = false;
      this.stand(true);
    } else if (this.p.length >= DATA.CHARLIE) {
      FX.zoom(1500);
      this.settle('p', '¡Cinco cartas sin pasarte! Mano de Charlie: paga 2 a 1.', false, true);
    } else {
      this.renderControls();
      this.busy = false;
    }
  },

  async stand(auto) {
    if (this.busy && !auto || this.phase !== 'play') return;
    this.busy = true;
    this.phase = 'dealer';
    U.$('duel-controls').innerHTML = '';
    this.setMsg('Turno del don…');
    await U.sleep(420);
    this.revealHole();
    this.updateCounts();
    await U.sleep(550);

    // EL AS DE MORETTI: una vez por partida, si está atascado, cambia su carta oculta a la vista
    const d = State.run.duel;
    if (!d.asUsed && this.m.length === 2) {
      const dv = BJ.handVal(this.m).v;
      if (dv >= DATA.DUEL.AS_SWAP_RANGE[0] && dv <= DATA.DUEL.AS_SWAP_RANGE[1]) {
        d.asUsed = true;
        this.say(U.pick(DATA.DUEL.lines.asSwap), 'moretti');
        Sound.sfx.sting();
        FX.flash('rgba(212,175,55,.25)', 700);
        const holeEl = U.$('duel-mhand').children[1];
        if (holeEl) { holeEl.classList.add('swapped'); }
        await U.sleep(1100);
        // la carta vieja se descarta a la vista; la nueva llega boca abajo
        const old = this.m.pop();
        if (holeEl) holeEl.remove();
        if (this.markerOn) U.toast('La carta descartada era un ' + old.r + '. El mazo debe una… y a veces paga.', 'sus', 4200);
        await this.dealTo(this.m, U.$('duel-mhand'), this.draw(), !this.markerOn);
        if (this.markerOn) {
          const nh = U.$('duel-mhand').children[1];
          if (nh) nh.classList.add('marked');
        }
        this.updateCounts();
        this.renderBase();
        await U.sleep(500);
      }
    }

    while (BJ.handVal(this.m).v < 17) {
      await this.dealTo(this.m, U.$('duel-mhand'), this.draw());
      this.updateCounts();
      await U.sleep(430);
    }
    const dv = BJ.handVal(this.m).v;
    const pv = BJ.handVal(this.p).v;
    if (dv > 21) { FX.zoom(1200); this.settle('p', 'Moretti se pasa con ' + dv + '. El cigarro tiembla entre sus dedos.'); }
    else if (pv > dv) this.settle('p', pv + ' contra ' + dv + '. La mano es tuya.');
    else if (pv < dv) this.settle('m', pv + ' contra ' + dv + '. El don gana la mano.');
    else this.settle('push', 'Empate a ' + pv + '. Nadie cede.');
  },

  /* ---------- resolución de mano ---------- */
  settle(outcome, msg, isBJ, isCharlie) {
    const r = State.run;
    const d = r.duel;
    this.phase = 'settle';
    const mult = State.payoutMult('blackjack');
    const bet = this.lastBet;
    const allIn = this.lastAllIn;

    if (outcome === 'p') {
      const pay = Math.round(bet * (isBJ ? DATA.BJ_PAYOUT : (isCharlie ? DATA.CHARLIE_PAYOUT : 1)) * mult);
      d.stack += pay;
      d.pw++;
      State.bumpStreak();
      State.recordWin(pay, 'blackjack');
      FX.winAt(U.$('duel-phand'), pay >= 100000);
      Sound.sfx.win(pay >= 100000);
      if (pay >= 200000) FX.goldRain(1200);
      this.setMsg(msg + ' +' + U.fmt(pay), 'big');
    } else if (outcome === 'm') {
      d.stack -= bet;
      d.mw++;
      State.breakStreak();
      Sound.sfx.lose();
      this.setMsg(msg + ' —' + U.fmt(bet), 'bad');
      // ruina en el todo o nada: EL REY DE NADA
      if (allIn && d.stack <= 0) {
        State.saveRun();
        setTimeout(() => this.ending('rey'), 2100);
        return;
      }
    } else {
      Sound.sfx.push();
      this.setMsg(msg);
    }
    this.renderBase();
    this.updateCounts();
    State.saveRun();

    // ¿fin de la partida?
    if (d.pw >= DATA.DUEL.WINS) { setTimeout(() => this.ending(d.cheated || r.sus >= 40 ? 'estafa' : 'socio'), 1900); return; }
    if (d.mw >= DATA.DUEL.WINS) { setTimeout(() => this.ending('leccion'), 1900); return; }

    // interludio con diálogo
    const L = DATA.DUEL.lines;
    let line;
    if (d.pw === 2) line = U.pick(L.pTwo);
    else if (d.mw === 2) line = U.pick(L.mTwo);
    else if (outcome === 'p') line = U.pick(L.pWin);
    else if (outcome === 'm') line = U.pick(L.mWin);
    else line = U.pick(L.push);
    this.say(line, 'moretti');
    this.phase = 'between';
    setTimeout(() => this.nextHandButton(), 1500);
  },

  nextHandButton() {
    const c = U.$('duel-controls');
    c.innerHTML = '';
    const acts = U.el('div', 'act-btns');
    const b = U.el('button', 'btn btn-gold btn-deco', State.run.duel.hand >= DATA.DUEL.STAKES.length ? 'APOSTARLO TODO' : 'SIGUIENTE MANO');
    b.onclick = () => { State.run.duel.hand++; State.saveRun(); this.startHand(); };
    acts.appendChild(b);
    c.appendChild(acts);
    this.busy = false;
  },

  async abandon() {
    if (!this.active()) { Hub.enter(); return; }
    const ok = await UI.confirm('ABANDONAR LA SALA',
      'Levantarte a mitad del duelo es <b>perder la partida</b>: la sala se queda la entrada íntegra.<br>Moretti no lo olvidará… aunque respeta a los que vuelven.<br>¿Te levantas?', 'LEVANTARSE');
    if (!ok) return;
    const r = State.run;
    r.duel = null;
    State.saveRun();
    this.ending('leccion', true);
  },

  /* ---------- LOS CUATRO FINALES ---------- */
  ending(kind, abandoned) {
    const r = State.run;
    if (!r) return;
    this.phase = 'idle';
    const snap = {
      kind, abandoned: !!abandoned,
      chips: r.chips, peak: r.stats.peak, hands: r.stats.hands, hrWins: r.stats.hrWins || 0,
      bestStreak: r.stats.bestStreak || 0, tricksUsed: r.stats.tricksUsed, backrooms: r.stats.backrooms || 0,
      debt: r.mode === 'story' ? r.debt : 0, mendigo: State.hasAmulet('moneda'),
      sus: r.sus, cheated: r.duel ? r.duel.cheated : false, stack: r.duel ? r.duel.stack : 0
    };

    if (kind === 'socio' || kind === 'estafa') {
      // la casa iguala el paño: el botín entra a la banca antes del epílogo
      const pot = Math.round(r.duel.stack * 2);
      r.debtReadyToasted = true;   // el epílogo manda: sin toasts del teléfono sobre el final
      State.addChips(pot, { silent: true });
      snap.chips = r.chips;
      snap.pot = pot;
      r.victory = true;
      State.meta.victories++;
      State.saveMeta();
      r.duel = null;
      State.saveRun();
      App.duelEnding(snap);
      State.clearRun();
      return;
    }
    if (kind === 'rey') {
      r.chips = 0;
      State.meta.stats.deaths++;
      State.saveMeta();
      r.duel = null;
      State.saveRun();
      App.duelEnding(snap);
      State.clearRun();
      return;
    }
    // LA LECCIÓN: la partida continúa
    r.duel = null;
    r.pendingBackroom = false;
    r.sus = Math.min(r.sus, 75);
    State.saveRun();
    App.duelEnding(snap);
  }
};
