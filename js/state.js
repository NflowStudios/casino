/* NOIR GOLD — state.js: estado central (run + meta roguelite persistente) */
'use strict';
const LS_META = 'noirgold.meta.v1';
const LS_RUN = 'noirgold.run.v1';

const State = {
  meta: null,
  run: null,

  /* ---------- META (persistente entre partidas) ---------- */
  defaultMeta() {
    return {
      unlocked: DATA.DEFAULT_UNLOCKED.slice(),
      best: 0,          // récord modo infinito
      victories: 0,
      stats: {
        runs: 0, deaths: 0, bjHands: 0, slotSpins: 0, rlSpins: 0, wins: 0,
        biggestWin: 0, bestRLWin: 0, backrooms: 0, luckWins: 0, crisisCount: 0,
        synergies: 0, jackpots: 0, tierEver: 0, tricksBestRun: 0, peakEver: 0
      }
    };
  },
  loadMeta() {
    try {
      const raw = localStorage.getItem(LS_META);
      if (raw) {
        const m = JSON.parse(raw);
        const def = this.defaultMeta();
        this.meta = Object.assign(def, m);
        this.meta.stats = Object.assign(def.stats, m.stats || {});
        this.meta.unlocked = (m.unlocked || []).filter((id) => DATA.UNLOCKS[id] || DATA.DRINKS.some((d) => d.id === id) || DATA.TRICKS.some((t) => t.id === id) || DATA.AMULETS.some((a) => a.id === id));
        return;
      }
    } catch (e) {}
    this.meta = this.defaultMeta();
  },
  saveMeta() {
    try { localStorage.setItem(LS_META, JSON.stringify(this.meta)); } catch (e) {}
  },

  isUnlocked(id) { return this.meta.unlocked.indexOf(id) >= 0; },
  unlock(id) {
    if (!id || this.meta.unlocked.indexOf(id) >= 0) return;
    this.meta.unlocked.push(id);
    if (this.run) this.run.unlocksThisRun.push(id);
    this.saveMeta();
    U.toast('✦ NUEVO EN EL CATÁLOGO: ' + DATA.itemName(id) + ' — disponible en partidas futuras', 'gold', 5200);
    Sound.sfx.unlock();
  },
  checkUnlocks() {
    if (!this.meta) return;
    for (const id in DATA.UNLOCKS) {
      if (this.meta.unlocked.indexOf(id) < 0 && DATA.UNLOCKS[id].cond(this.meta.stats)) this.unlock(id);
    }
  },

  /* ---------- RUN (partida actual, se puede reanudar) ---------- */
  newRun(mode) {
    this.run = {
      mode,                       // 'story' | 'infinite' | 'legend'
      chips: DATA.START_CHIPS,
      peak: DATA.START_CHIPS,
      sus: 0,
      tier: 0,
      debt: mode === 'story' ? DATA.DEBT : 0,
      drinks: [],                 // {id, roundsLeft, mult, games, type}
      amulets: [],
      tricks: [],                 // {id, charges}
      insurance: false, insuranceUsed: false, favorUsed: false,
      roundTrickCount: 0,
      pendingBackroom: false,
      crisisOn: false,
      debtReadyToasted: false,
      victory: false,
      stats: { hands: 0, tricksUsed: 0, biggestWin: 0, peak: DATA.START_CHIPS },
      unlocksThisRun: []
    };
    this.meta.stats.runs++;
    this.meta.stats.tricksBestRun = 0;
    this.saveMeta();
    this.saveRun();
  },
  saveRun() {
    if (!this.run) return;
    try { localStorage.setItem(LS_RUN, JSON.stringify(this.run)); } catch (e) {}
  },
  loadRun() {
    try {
      const raw = localStorage.getItem(LS_RUN);
      if (!raw) return null;
      const r = JSON.parse(raw);
      if (!r || typeof r.chips !== 'number' || r.chips < 10) { this.clearRun(); return null; }
      this.run = r;
      return r;
    } catch (e) { return null; }
  },
  clearRun() {
    this.run = null;
    try { localStorage.removeItem(LS_RUN); } catch (e) {}
  },

  /* ---------- fichas ---------- */
  addChips(n, opts) {
    const r = this.run;
    if (!r) return;
    r.chips = Math.max(0, r.chips + n);
    if (r.chips > r.peak) {
      r.peak = r.chips;
      if (r.peak > r.stats.peak) r.stats.peak = r.peak;
      if (r.peak > this.meta.stats.peakEver) this.meta.stats.peakEver = r.peak;
    }
    if (n > 0 && n > r.stats.biggestWin) r.stats.biggestWin = n;
    UI.renderHUD(n);
    this.checkCrisis();
    this.checkTier();
    // aviso: fondos suficientes para saldar
    if (r.mode === 'story' && !r.debtReadyToasted && r.chips >= r.debt) {
      r.debtReadyToasted = true;
      U.toast(Icon.svg('phone', 'toast-ico') + 'Tienes lo suficiente: ¡ve al TELÉFONO del casino y salda tu deuda!', 'gold', 6000);
      Sound.sfx.flash();
      Hub.refreshServices();
    }
    if (opts && opts.silent !== true) this.saveRun();
  },
  canAfford(n) { return this.run && this.run.chips >= n; },
  tierCap() { return DATA.TIERS[this.run ? this.run.tier : 0].cap; },

  checkTier() {
    const r = this.run;
    if (!r) return;
    const t = DATA.tierOf(r.chips);
    if (t === r.tier) return;
    const up = t > r.tier;
    r.tier = t;
    if (t > this.meta.stats.tierEver) { this.meta.stats.tierEver = t; this.saveMeta(); }
    document.body.className = document.body.className.replace(/tier-\d/g, 'tier-' + t);
    if (up) {
      FX.flash('rgba(244,208,111,.5)', 900);
      Sound.sfx.ascend();
      U.toast('✦ ASCIENDES: ' + DATA.TIERS[t].name + ' — límite de apuesta: ' + U.fmt(DATA.TIERS[t].cap), 'gold', 5500);
      const badge = U.$('tier-badge');
      if (badge) { badge.textContent = DATA.TIERS[t].name; badge.classList.remove('ascend'); void badge.offsetWidth; badge.classList.add('ascend'); }
      if (t === 2) { FX.dust(true); FX.goldRain(1200); }
    } else {
      U.toast('El lujo se desvanece… vuelves a: ' + DATA.TIERS[t].name, 'danger');
      if (t < 2) FX.dust(false);
    }
    Hub.applyTier();
    UI.renderHUD();
    this.checkUnlocks();
    this.saveRun();
  },

  checkCrisis() {
    const r = this.run;
    if (!r) return;
    const low = r.chips > 0 && r.chips <= r.peak * DATA.CRISIS_PCT && r.chips <= DATA.CRISIS_CAP;
    if (low && !r.crisisOn) {
      r.crisisOn = true;
      document.body.classList.add('crisis');
      Sound.crisis(true);
      this.meta.stats.crisisCount++;
      this.saveMeta();
      U.toast('Crisis: apenas te quedan fichas. La viñeta se cierra sobre ti…', 'danger', 5000);
    } else if (!low && r.crisisOn) {
      r.crisisOn = false;
      document.body.classList.remove('crisis');
      Sound.crisis(false);
      U.toast('Respiras. La luz vuelve a la mesa.', 'info');
    }
  },

  /* ---------- sospecha ---------- */
  susMult() { return this.hasAmulet('marionetista') ? 0.7 : 1; },
  addSuspicion(n) {
    const r = this.run;
    if (!r) return;
    if (n > 0) n = Math.round(n * this.susMult());
    r.sus = U.clamp(r.sus + n, 0, 100);
    if (n > 0) {
      U.toast('+' + n + ' SOSPECHA', 'sus', 2200);
      if (r.sus >= 100 && !r.pendingBackroom) {
        r.pendingBackroom = true;
        Sound.sfx.sting();
        U.toast('El Pit Boss lo ha visto todo. Te espera al final de la ronda…', 'danger', 5000);
      }
    }
    UI.renderHUD();
    this.saveRun();
  },
  // Ronda limpia: reduce sospecha
  markRound(clean) {
    const r = this.run;
    if (!r) return;
    let red = DATA.CLEAN_SUS;
    const bee = this.activeDrink('beesknees');
    if (bee) red *= bee.mult || 2;
    if (clean && red < 0) {
      r.sus = U.clamp(r.sus + red, 0, 100);
    }
    r.roundTrickCount = 0;
    UI.renderHUD();
  },

  /* ---------- tragos ---------- */
  drinkRounds() { return this.hasAmulet('reloj') ? 2 : 0; },
  applyDrink(item) {
    const r = this.run;
    const ef = item.effect;
    if (ef.type === 'instant') { this.addSuspicion(ef.sus); return; }
    if (ef.type === 'insurance') { r.insurance = true; UI.renderInventory(); return; }
    const ex = this.activeDrink(item.id);
    if (ex) { ex.roundsLeft += ef.rounds + this.drinkRounds(); }
    else {
      r.drinks.push({
        id: item.id, roundsLeft: ef.rounds + this.drinkRounds(),
        mult: ef.mult || 1, games: ef.games, type: ef.type
      });
    }
    this.checkSynergies();
    UI.renderInventory();
    this.saveRun();
  },
  activeDrink(id) {
    const r = this.run;
    return r ? r.drinks.find((d) => d.id === id) : null;
  },
  tickDrinks() {
    const r = this.run;
    if (!r) return;
    let changed = false;
    r.drinks = r.drinks.filter((d) => {
      d.roundsLeft--;
      if (d.roundsLeft <= 0) { changed = true; U.toast('El ' + DATA.itemName(d.id) + ' se agota.', 'info', 2500); return false; }
      return true;
    });
    if (changed || r.drinks.length) UI.renderInventory();
  },
  payoutMult(game) {
    let m = 1;
    for (const d of this.run.drinks) {
      if (d.type === 'payout' && (d.games.indexOf('all') >= 0 || d.games.indexOf(game) >= 0)) m *= d.mult;
    }
    if (this.synActive('horadorada')) m *= 1.30;
    if (game === 'blackjack' && this.synActive('coctelsuerte')) m *= 1.10;
    return Math.round(m * 100) / 100;
  },

  /* ---------- amuletos / trucos ---------- */
  hasAmulet(id) { return this.run && this.run.amulets.indexOf(id) >= 0; },
  trick(id) { return this.run ? this.run.tricks.find((t) => t.id === id) : null; },
  useTrick(id) {
    const t = this.trick(id);
    if (!t || t.charges <= 0) return false;
    t.charges--;
    const r = this.run;
    r.stats.tricksUsed++;
    if (r.stats.tricksUsed > this.meta.stats.tricksBestRun) { this.meta.stats.tricksBestRun = r.stats.tricksUsed; this.saveMeta(); }
    const def = DATA.TRICKS.find((x) => x.id === id);
    // Mano Maestra: primer truco de la ronda sin sospecha
    const free = this.synActive('manomaestra') && r.roundTrickCount === 0;
    r.roundTrickCount++;
    if (!free) this.addSuspicion(def ? def.sus : 10);
    else U.toast('Mano Maestra: ese truco pasó desapercibido.', 'success', 3000);
    this.checkUnlocks();
    UI.renderInventory();
    this.saveRun();
    return true;
  },

  /* ---------- sinergias ---------- */
  synActive(id) {
    const r = this.run;
    if (!r) return false;
    for (const s of DATA.SYNERGIES) {
      if (s.id !== id) continue;
      if (s.req.tricks) return s.req.tricks.every((t) => r.tricks.some((x) => x.id === t && x.charges > 0));
      if (s.req.trick && s.req.amulet) return r.tricks.some((x) => x.id === s.req.trick && x.charges > 0) && r.amulets.indexOf(s.req.amulet) >= 0;
      if (s.req.drink && s.req.amulet) return !!this.activeDrink(s.req.drink) && r.amulets.indexOf(s.req.amulet) >= 0;
    }
    return false;
  },
  checkSynergies() {
    const r = this.run;
    if (!r) return;
    r.synSeen = r.synSeen || [];
    for (const s of DATA.SYNERGIES) {
      if (r.synSeen.indexOf(s.id) < 0 && this.synActive(s.id)) {
        r.synSeen.push(s.id);
        this.meta.stats.synergies++;
        this.saveMeta();
        FX.flash('rgba(244,208,111,.4)', 800);
        U.toast('✦ SINERGIA VIP — ' + s.name + ': ' + s.desc.replace(/<[^>]+>/g, ''), 'gold', 6000);
        Sound.sfx.unlock();
        this.checkUnlocks();
      }
    }
  },

  /* ---------- registro de estadísticas ---------- */
  recordWin(amount, game) {
    const r = this.run;
    if (!r || amount <= 0) return;
    r.stats.hands++;
    this.meta.stats.wins++;
    if (amount > this.meta.stats.biggestWin) this.meta.stats.biggestWin = amount;
    if (game === 'roulette' && amount > this.meta.stats.bestRLWin) this.meta.stats.bestRLWin = amount;
    this.saveMeta();
  },
  recordSpin(game) {
    const s = this.meta.stats;
    if (game === 'blackjack') s.bjHands++;
    if (game === 'roulette') s.rlSpins++;
    if (game === 'slots') s.slotSpins++;
    this.saveMeta();
    this.checkUnlocks();
  },

  /* ---------- ADUANA DE FIN DE RONDA ---------- */
  afterRound() {
    const r = this.run;
    if (!r) return 'ok';
    this.tickDrinks();
    this.checkUnlocks();
    // Corpse Reviver: quiebra pero con seguro
    if (r.chips <= 0) {
      if (r.insurance && !r.insuranceUsed) {
        r.insuranceUsed = true;
        r.insurance = false;
        r.chips = 500;
        UI.renderHUD(500);
        U.toast('El Corpse Reviver te devuelve del abismo: 500 fichas. Una sola vez.', 'gold', 5500);
        Sound.sfx.drink();
      }
    }
    if (r.chips <= 0) { this.die(); return 'dead'; }
    if (r.chips < DATA.MIN_BET) { this.die(true); return 'dead'; }
    this.saveRun();
    if (r.pendingBackroom) {
      r.pendingBackroom = false;
      return 'backroom';
    }
    return 'ok';
  },

  die(soft) {
    const r = this.run;
    if (!r) return;
    this.meta.stats.deaths++;
    if (r.mode !== 'story') this.meta.best = Math.max(this.meta.best, r.stats.peak);
    this.saveMeta();
    Sound.crisis(false);
    document.body.classList.remove('crisis');
    FX.dust(false);
    App.gameover(r, soft);
    this.clearRun();
  },

  /* ---------- VICTORIA ---------- */
  payDebt() {
    const r = this.run;
    if (!r || r.mode !== 'story' || r.chips < r.debt) return false;
    r.chips -= r.debt;
    r.victory = true;
    this.meta.victories++;
    this.saveMeta();
    App.victory(r);
    return true;
  }
};
