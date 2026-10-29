/* NOIR GOLD — blackjack.js: Veintiuno completo (Hit/Stand/Double/Surrender, side bets, conteo) */
'use strict';
const BJ = {
  shoe: [], count: 0, markerRounds: 0, forcedAce: false,
  p: [], d: [], bet: 0, betChips: [], phase: 'bet', busy: false,
  sidePP: false, side213: false, clean: true, doubled: false,
  chipSel: null,

  SUITS: ['♠', '♥', '♦', '♣'],
  RANKS: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],

  enter() {
    this.phase = 'bet';
    this.p = []; this.d = []; this.bet = 0; this.betChips = [];
    this.forcedAce = false; this.doubled = false;
    U.$('bj-hand').innerHTML = '';
    U.$('bj-dealer-hand').innerHTML = '';
    U.$('bj-count').textContent = '';
    U.$('bj-dealer-count').textContent = '';
    U.$('bj-msg').textContent = 'Haz tu apuesta y pide carta';
    U.$('bj-msg').className = 'bj-msg';
    U.$('bj-cap').textContent = 'Mín ' + U.fmt(DATA.MIN_BET) + ' · Máx ' + U.fmt(State.tierCap());
    if (!this.shoe.length) this.buildShoe();
    UI.renderMult('blackjack', 'bj-mult');
    this.renderTrickPanel();
    this.renderBetControls();
    this.renderCountBox();
    UI.show('blackjack');
  },
  leave() {
    if (this.phase === 'play') {
      UI.confirm('ABANDONAR LA MESA', 'Tienes una mano en curso: perderás la apuesta actual.<br>¿Te vas?', 'ABANDONAR').then((ok) => { if (ok) { this.phase = 'bet'; Hub.enter(); } });
    } else Hub.enter();
  },

  /* ---------- zapato de 6 barajas ---------- */
  buildShoe() {
    this.shoe = [];
    for (let deck = 0; deck < 6; deck++)
      for (const s of this.SUITS)
        for (const r of this.RANKS) this.shoe.push({ r, s });
    this.shoe = U.shuffle(this.shoe);
    this.count = 0;
  },
  draw() {
    if (this.shoe.length < 78) {
      this.buildShoe();
      U.toast('El crupier baraja un zapato nuevo. El conteo se reinicia.', 'info');
    }
    const c = this.shoe.pop();
    this.hiLo(c.r);
    return c;
  },
  drawForcedAce() {
    const c = { r: 'A', s: U.pick(this.SUITS) };
    // quitar un as físico del zapato para coherencia del conteo
    const idx = this.shoe.findIndex((x) => x.r === 'A');
    if (idx >= 0) { this.shoe.splice(idx, 1); }
    this.hiLo('A');
    return c;
  },
  hiLo(r) {
    if (['2', '3', '4', '5', '6'].indexOf(r) >= 0) this.count++;
    else if (['10', 'J', 'Q', 'K', 'A'].indexOf(r) >= 0) this.count--;
    this.renderCountBox();
  },
  handVal(hand) {
    let v = 0, aces = 0;
    for (const c of hand) {
      if (c.r === 'A') { aces++; v += 11; }
      else if (['J', 'Q', 'K'].indexOf(c.r) >= 0) v += 10;
      else v += +c.r;
    }
    while (v > 21 && aces > 0) { v -= 10; aces--; }
    return { v, soft: aces > 0 };
  },

  /* ---------- UI de apuesta ---------- */
  renderBetControls() {
    const c = U.$('bj-controls');
    c.innerHTML = '';
    const line = U.el('div', 'bet-line');
    this.chipSel = UI.chipRow(line, (v) => this.addBet(v));
    const stack = U.el('div', 'bet-stack', '<span class="bet-amt" id="bj-bet-amt">0</span>');
    line.insertBefore(stack, line.firstChild);
    const clearB = U.el('button', 'btn btn-ghost btn-deco btn-sm', 'RETIRAR');
    clearB.onclick = () => this.clearBet();
    line.appendChild(clearB);
    c.appendChild(line);

    const sb = U.el('div', 'sidebets');
    const t1 = U.el('button', 'sb-toggle' + (this.sidePP ? ' on' : ''), 'APUESTA LATERAL: PAREJA PERFECTA (25:1)');
    t1.onclick = () => { this.sidePP = !this.sidePP; t1.classList.toggle('on', this.sidePP); Sound.sfx.chips(); };
    const t2 = U.el('button', 'sb-toggle' + (this.side213 ? ' on' : ''), 'APUESTA LATERAL: 21+3 (5:1 a 100:1)');
    t2.onclick = () => { this.side213 = !this.side213; t2.classList.toggle('on', this.side213); Sound.sfx.chips(); };
    sb.appendChild(t1); sb.appendChild(t2);
    c.appendChild(sb);

    const dealB = U.el('button', 'btn btn-gold btn-deco btn-big', 'REPARTIR');
    dealB.onclick = () => this.deal();
    dealB.id = 'bj-deal';
    c.appendChild(dealB);
    this.refreshBetUI();
  },
  refreshBetUI() {
    const amt = U.$('bj-bet-amt');
    if (amt) amt.textContent = U.fmt(this.bet);
    const stack = document.querySelector('#bj-controls .bet-stack');
    if (stack) {
      stack.querySelectorAll('.chip-mini').forEach((x) => x.remove());
      for (const v of this.betChips) {
        const ch = U.el('span', 'chip chip-mini');
        ch.dataset.v = v;
        stack.insertBefore(ch, stack.querySelector('.bet-amt'));
      }
    }
    const deal = U.$('bj-deal');
    if (deal) deal.disabled = this.bet < DATA.MIN_BET;
  },
  addBet(v) {
    const cap = State.tierCap();
    if (this.bet + v > cap) { U.toast('Límite de apuesta del ' + DATA.TIERS[State.run.tier].name + ': ' + U.fmt(cap), 'danger'); return; }
    if (!State.canAfford(this.bet + v + (this.sidePP ? Math.ceil((this.bet + v) / 2) : 0))) { U.toast('No te alcanza para tanto frenesí.', 'danger'); return; }
    this.bet += v;
    this.betChips.push(v);
    this.refreshBetUI();
  },
  clearBet() {
    this.bet = 0; this.betChips = [];
    this.refreshBetUI();
  },

  /* ---------- cartas ---------- */
  cardEl(c, hidden, fromSleeve) {
    const red = c.s === '♥' || c.s === '♦';
    const royal = ['J', 'Q', 'K'].indexOf(c.r) >= 0;
    const ace = c.r === 'A';
    const el = U.el('div', 'card' + (hidden ? ' face-down' : '') + (royal ? ' royal' : '') + (ace ? ' ace' : '') + (fromSleeve ? ' sleeve-anim' : ' enter'));
    el.innerHTML = '<div class="card-inner">' +
      '<div class="card-front ' + (red ? 'c-red' : 'c-black') + '">' +
      '<span class="c-corner">' + c.r + '<br>' + c.s + '</span>' +
      '<span class="c-center">' + (royal ? c.r : (ace ? c.s : c.r)) + '</span>' +
      '<span class="c-corner last">' + c.r + '<br>' + c.s + '</span></div>' +
      '<div class="card-back"></div></div>';
    return el;
  },
  revealHole() {
    const holeEl = U.$('bj-dealer-hand').children[1];
    if (holeEl) { holeEl.classList.remove('face-down'); Sound.sfx.card(); }
  },
  async dealTo(hand, handEl, card, hidden, fromSleeve) {
    hand.push(card);
    const el = this.cardEl(card, hidden, fromSleeve);
    handEl.appendChild(el);
    Sound.sfx.deal();
    await U.sleep(260);
    return el;
  },

  /* ---------- flujo ---------- */
  async deal() {
    if (this.bet < DATA.MIN_BET || this.busy) return;
    this.busy = true;
    this.clean = true;
    this.doubled = false;
    let cost = this.bet;
    if (this.sidePP) cost += Math.ceil(this.bet / 2);
    if (this.side213) cost += Math.ceil(this.bet / 2);
    if (!State.canAfford(cost)) { U.toast('No tienes para las apuestas laterales.', 'danger'); this.busy = false; return; }
    State.addChips(-cost);
    State.recordSpin('blackjack');
    this.phase = 'play';
    U.$('bj-controls').innerHTML = '';
    U.$('bj-msg').textContent = '…';
    U.$('bj-hand').innerHTML = '';
    U.$('bj-dealer-hand').innerHTML = '';

    this.p = [];
    this.d = [];

    await this.dealTo(this.p, U.$('bj-hand'), this.draw());
    await this.dealTo(this.d, U.$('bj-dealer-hand'), this.draw());
    await this.dealTo(this.p, U.$('bj-hand'), this.draw());
    await this.dealTo(this.d, U.$('bj-dealer-hand'), this.draw(), true);
    this.updateCounts(true);

    // apuestas laterales
    if (this.sidePP || this.side213) this.settleSideBets();

    const pBJ = this.handVal(this.p).v === 21;
    const up = this.d[0].r;
    const upTen = ['10', 'J', 'Q', 'K'].indexOf(up) >= 0;
    // peek del crupier con As o 10 visible
    if (up === 'A' || upTen) {
      const dBJ = this.handVal(this.d).v === 21;
      if (dBJ) {
        await U.sleep(400);
        this.revealHole();
        this.updateCounts();
        Sound.sfx.sting();
        if (pBJ) { this.settle('push', 'Ambos tienen Blackjack. Empate.'); }
        else { this.settle('lose', 'Blackjack del crupier. La casa sonríe.'); }
        return;
      }
    }
    if (pBJ) {
      await U.sleep(350);
      FX.winAt(U.$('bj-hand'), true);
      this.settle('blackjack', '¡BLACKJACK! Paga 3 a 2.');
      return;
    }
    this.renderPlayControls();
    this.busy = false;
  },

  settleSideBets() {
    const mult = State.payoutMult('blackjack');
    const [c1, c2] = this.p;
    if (this.sidePP && c1.r === c2.r && c1.s === c2.s) {
      const win = Math.round(Math.ceil(this.bet / 2) * 25 * mult);
      State.addChips(win);
      State.recordWin(win, 'blackjack');
      U.toast('Pareja Perfecta: +' + U.fmt(win), 'success');
      FX.winAt(U.$('bj-hand'));
      Sound.sfx.win(true);
    }
    if (this.side213) {
      const trio = [c1, c2, this.d[0]];
      const flush = trio.every((c) => c.s === trio[0].s);
      const vals = trio.map((c) => (c.r === 'A' ? 14 : (['J', 'Q', 'K'].indexOf(c.r) >= 0 ? 11 + ['J', 'Q', 'K'].indexOf(c.r) : +c.r))).sort((a, b) => a - b);
      const trips = trio[0].r === trio[1].r && trio[1].r === trio[2].r;
      let straight = vals[2] - vals[1] === 1 && vals[1] - vals[0] === 1;
      if (!straight && vals[0] === 2 && vals[1] === 3 && vals[2] === 14) straight = true; // A-2-3
      let pay = 0, lbl = '';
      if (trips && flush) { pay = 100; lbl = 'Escalera Real 21+3'; }
      else if (trips) { pay = 40; lbl = 'Trío 21+3'; }
      else if (straight && flush) { pay = 100; lbl = 'Escalera de color 21+3'; }
      else if (straight) { pay = 10; lbl = 'Escalera 21+3'; }
      else if (flush) { pay = 5; lbl = 'Color 21+3'; }
      if (pay) {
        const win = Math.round(Math.ceil(this.bet / 2) * pay * mult);
        State.addChips(win);
        State.recordWin(win, 'blackjack');
        U.toast(lbl + ': +' + U.fmt(win), 'success');
        FX.winAt(U.$('bj-hand'), pay >= 40);
        Sound.sfx.win(pay >= 40);
      }
    }
  },

  renderPlayControls() {
    const c = U.$('bj-controls');
    c.innerHTML = '';
    const acts = U.el('div', 'act-btns');
    const mk = (label, fn, dis) => {
      const b = U.el('button', 'btn btn-ghost btn-deco', label);
      b.onclick = fn;
      b.disabled = !!dis;
      acts.appendChild(b);
    };
    mk('PEDIR CARTA', () => this.hit());
    mk('PLANTARSE', () => this.stand());
    mk('DOBLAR', () => this.double(), !State.canAfford(this.bet));
    mk('RENDIRSE', () => this.surrender(), this.doubled);
    c.appendChild(acts);
    this.renderTrickPanel();
  },

  async hit() {
    if (this.busy || this.phase !== 'play') return;
    this.busy = true;
    let card;
    if (this.forcedAce) {
      card = this.drawForcedAce();
      this.forcedAce = false;
      await this.dealTo(this.p, U.$('bj-hand'), card, false, true);
    } else {
      card = this.draw();
      await this.dealTo(this.p, U.$('bj-hand'), card);
    }
    this.updateCounts();
    const v = this.handVal(this.p).v;
    if (v > 21) {
      this.settle('lose', 'Te pasas con ' + v + '. El humo se traga tu apuesta.');
    } else if (v === 21) {
      this.busy = false;
      this.stand(true);
    } else if (this.p.length >= DATA.CHARLIE) {
      FX.zoom(1500);
      this.settle('charlie', '¡Cinco cartas sin pasarte! Mano de Charlie: paga 2 a 1.');
    } else {
      this.renderPlayControls();
      this.busy = false;
    }
  },

  async double() {
    if (this.busy || this.phase !== 'play' || !State.canAfford(this.bet)) return;
    this.busy = true;
    State.addChips(-this.bet);
    this.doubled = true;
    FX.zoom(1400);
    Sound.sfx.chips();
    await U.sleep(250);
    await this.hitInner();
    if (this.phase === 'play') this.stand(true);
  },
  async hitInner() {
    let card;
    if (this.forcedAce) { card = this.drawForcedAce(); this.forcedAce = false; await this.dealTo(this.p, U.$('bj-hand'), card, false, true); }
    else { card = this.draw(); await this.dealTo(this.p, U.$('bj-hand'), card); }
    this.updateCounts();
    const v = this.handVal(this.p).v;
    if (v > 21) this.settle('lose', 'Doblas… y te pasas con ' + v + '.');
  },

  surrender() {
    if (this.busy || this.phase !== 'play') return;
    this.settle('surrender', 'Te rindes y recuperas la mitad.');
  },

  async stand(auto) {
    if (this.busy && !auto || this.phase !== 'play') return;
    this.busy = true;
    U.$('bj-controls').innerHTML = '';
    U.$('bj-msg').textContent = 'Turno del crupier…';
    await U.sleep(300);
    this.revealHole();
    this.updateCounts();
    await U.sleep(500);
    while (this.handVal(this.d).v < 17) {
      await this.dealTo(this.d, U.$('bj-dealer-hand'), this.draw());
      this.updateCounts();
      await U.sleep(420);
    }
    const dv = this.handVal(this.d).v;
    const pv = this.handVal(this.p).v;
    if (dv > 21) { FX.zoom(1200); this.settle('win', 'El crupier se pasa con ' + dv + '. ¡Victoria!'); }
    else if (pv > dv) this.settle('win', pv + ' contra ' + dv + '. ¡Victoria!');
    else if (pv < dv) this.settle('lose', pv + ' contra ' + dv + '. La casa gana.');
    else this.settle('push', 'Empate a ' + pv + '. Recuperas tu apuesta.');
  },

  settle(result, msg) {
    this.phase = 'settle';
    const mult = State.payoutMult('blackjack');
    let delta = 0;
    const stake = this.doubled ? this.bet * 2 : this.bet;
    const m = U.$('bj-msg');
    m.className = 'bj-msg';
    if (result === 'win') { delta = Math.round(stake * 1 * mult); m.classList.add('big'); }
    else if (result === 'blackjack') { delta = Math.round(this.bet * DATA.BJ_PAYOUT * mult); m.classList.add('big'); }
    else if (result === 'charlie') { delta = Math.round(stake * DATA.CHARLIE_PAYOUT * mult); m.classList.add('big'); }
    else if (result === 'push') { delta = stake; }
    else if (result === 'surrender') { delta = Math.round(stake / 2); }

    if (delta > 0) {
      State.addChips(delta);
      State.recordWin(delta, 'blackjack');
      if (result !== 'push') {
        FX.winAt(U.$('bj-hand'), delta >= this.bet * 3);
        Sound.sfx.win(delta >= this.bet * 3);
      } else Sound.sfx.push();
    } else {
      Sound.sfx.lose();
      m.classList.add('bad');
    }
    m.textContent = msg + (delta > 0 ? ' +' + U.fmt(delta) : '');

    State.markRound(this.clean);
    const route = State.afterRound();
    this.renderEndControls(route);
    UI.renderMult('blackjack', 'bj-mult');
    UI.renderHUD();
  },

  renderEndControls(route) {
    if (route === 'dead') return; // App.gameover ya tomó la pantalla
    if (route === 'backroom') { setTimeout(() => Backroom.trigger(), 900); return; }
    const c = U.$('bj-controls');
    c.innerHTML = '';
    const acts = U.el('div', 'act-btns');
    const again = U.el('button', 'btn btn-gold btn-deco', 'OTRA MANO');
    again.onclick = () => this.enter();
    const back = U.el('button', 'btn btn-ghost btn-deco', 'VOLVER AL CASINO');
    back.onclick = () => Hub.enter();
    acts.appendChild(again); acts.appendChild(back);
    c.appendChild(acts);
    this.busy = false;
  },

  updateCounts(hideHole) {
    const pv = this.handVal(this.p);
    const pc = U.$('bj-count');
    pc.textContent = this.p.length ? (pv.soft && pv.v <= 21 ? pv.v + 's' : pv.v) : '';
    pc.classList.toggle('bust', pv.v > 21);
    const dc = U.$('bj-dealer-count');
    if (this.markerRounds > 0) {
      const dv = this.handVal(this.d);
      dc.textContent = dv.v;
      dc.classList.toggle('bust', dv.v > 21);
    } else if (hideHole) {
      const up = this.handVal([this.d[0]]);
      dc.textContent = up.v + '+';
    } else {
      const dv = this.handVal(this.d);
      dc.textContent = dv.v;
      dc.classList.toggle('bust', dv.v > 21);
    }
  },

  renderCountBox() {
    const box = U.$('bj-countbox');
    if (this.markerRounds > 0) {
      box.hidden = false;
      U.$('bj-rc').textContent = (this.count > 0 ? '+' : '') + this.count;
      const decks = Math.max(0.5, this.shoe.length / 52);
      U.$('bj-tc').textContent = (Math.round((this.count / decks) * 10) / 10 > 0 ? '+' : '') + Math.round((this.count / decks) * 10) / 10;
      U.$('bj-mr').textContent = this.markerRounds;
    } else box.hidden = true;
  },

  renderTrickPanel() {
    const panel = U.$('bj-tricks');
    const empty = U.$('bj-tricks-empty');
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
        '<span class="tb-name">' + def.ico + ' ' + def.name.toUpperCase() + '</span><span class="tb-charges">×' + t.charges + '</span>');
      b.type = 'button';
      b.setAttribute('data-tip', def.desc);
      b.disabled = this.phase !== 'play' && !(t.id === 'marcadas' && this.phase === 'bet');
      if (t.id === 'asbajo') b.disabled = this.phase !== 'play' || this.forcedAce;
      b.onclick = () => this.useTrick(t.id, def, b);
      panel.appendChild(b);
    }
    if (empty) empty.hidden = any;
  },

  useTrick(id, def, btn) {
    if (!State.useTrick(id)) return;
    this.clean = false;
    if (id === 'asbajo') {
      this.forcedAce = true;
      Sound.sfx.card();
      U.toast('Deslizas un As bajo la manga. La próxima carta es tuya.', 'sus');
      // animación diegética: brasa dorada hacia la mano
      FX.flyChip(btn, U.$('bj-hand'), null, '');
    } else if (id === 'marcadas') {
      this.markerRounds = def.effect.rounds;
      Sound.sfx.card();
      U.toast('Ves marcas invisibles: carta oculta del crupier y conteo real.', 'sus');
      const holeEl = U.$('bj-dealer-hand').children[1];
      if (holeEl) holeEl.classList.add('marked');
      if (this.phase === 'play') this.revealHole();
      this.updateCounts();
    }
    this.renderCountBox();
    this.renderTrickPanel();
    UI.renderInventory();
    State.saveRun();
  },

  onRoundEnd() {
    if (this.markerRounds > 0) {
      this.markerRounds--;
      const holeEl = U.$('bj-dealer-hand').children[1];
      if (holeEl && this.markerRounds === 0 && this.phase === 'settle') holeEl.classList.remove('marked');
      this.renderCountBox();
    }
  }
};
// enganche: al terminar cada mano, decrementar rondas de cartas marcadas
const _bjSettle = BJ.settle.bind(BJ);
BJ.settle = function (result, msg) { _bjSettle(result, msg); this.onRoundEnd(); };
