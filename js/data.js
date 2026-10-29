/* NOIR GOLD — data.js: catálogos declarativos (balance sin tocar lógica) */
'use strict';
const DATA = {
  DEBT: 2000000,
  START_CHIPS: 1000,
  MIN_BET: 10,
  CRISIS_PCT: 0.15,      // crisis si fichas < 15% del pico (y <= 50k)
  CRISIS_CAP: 50000,
  CLEAN_SUS: -4,         // reducción por ronda limpia
  BRIBE_PCT: 0.35,      // soborno: 35% de fichas
  LUCK_FAIL_PENALTY: 0.5, // fallo prueba de suerte: -50% fichas

  TIERS: [
    { id: 0, name: 'SÓTANO CLANDESTINO', min: 0, cap: 500, sign: 'SPEAKEASY' },
    { id: 1, name: 'CLUB PRIVADO', min: 50000, cap: 5000, sign: 'CLUB PRIVADO' },
    { id: 2, name: 'GRAN SALÓN VIP', min: 500000, cap: 50000, sign: 'NOIR GOLD' }
  ],
  tierOf(chips) {
    let t = 0;
    for (const tier of this.TIERS) if (chips >= tier.min) t = tier.id;
    return t;
  },

  /* ================= TRAGOS (Barra) ================= */
  DRINKS: [
    { id: 'ginrickey', name: 'Gin Rickey', price: 80, icon: 'ginrickey',
      desc: 'Ginebra y lima. El Pit Boss olvida un poco: <b>-10 de sospecha</b> al instante.',
      effect: { type: 'instant', sus: -10 } },
    { id: 'beesknees', name: "Bee's Knees", price: 100, icon: 'beesknees',
      desc: 'Miel y limón. Durante 4 rondas, las <b>rondas limpias reducen el doble</b> de sospecha.',
      effect: { type: 'cleanBonus', mult: 2, rounds: 4 } },
    { id: 'sidecar', name: 'Sidecar', price: 120, icon: 'sidecar',
      desc: 'Coñac y Triple Sec. Pago <b>+10% en Ruleta</b> durante 5 rondas.',
      effect: { type: 'payout', games: ['roulette'], mult: 1.10, rounds: 5 } },
    { id: 'manhattan', name: 'Manhattan', price: 150, icon: 'manhattan',
      desc: 'Whisky y vermut rojo. Pago <b>+10% en Blackjack</b> durante 5 rondas.',
      effect: { type: 'payout', games: ['blackjack'], mult: 1.10, rounds: 5 } },
    { id: 'oldfashioned', name: 'Old Fashioned', price: 200, icon: 'oldfashioned',
      desc: 'Azúcar, angostura y bourbon. Pago <b>+15% en todos los juegos</b> durante 3 rondas. <span class="gold">Combina con el Reloj de Oro.</span>',
      effect: { type: 'payout', games: ['all'], mult: 1.15, rounds: 3 },
      unlock: 'oldfashioned' },
    { id: 'french75', name: 'French 75', price: 250, icon: 'french75',
      desc: 'Ginebra y champán. Pago <b>+25% en Tragamonedas</b> durante 3 rondas.',
      effect: { type: 'payout', games: ['slots'], mult: 1.25, rounds: 3 },
      unlock: 'french75' },
    { id: 'corpse', name: 'Corpse Reviver Nº2', price: 400, icon: 'corpse',
      desc: 'Absenta y cóctel fúnebre. <b>Una vez por partida:</b> si quiebras, conservas 500 fichas.',
      effect: { type: 'insurance', amount: 500 },
      unlock: 'corpse' }
  ],

  /* ================= TRUCOS (Mercado Negro) ================= */
  TRICKS: [
    { id: 'asbajo', name: 'As bajo la Manga', price: 350, charges: 3, sus: 15, icon: 'asbajo', game: 'blackjack',
      desc: 'Tu <b>próxima carta es un As</b> en Blackjack. Sospecha +15 por uso.' },
    { id: 'dedos', name: 'Dedos de Oro', price: 400, charges: 2, sus: 12, icon: 'dedos', game: 'slots',
      desc: 'Tus dedos distraen al encargado: <b>tu próxima tirada de Tragamonedas es gratis</b>. Sospecha +12.',
      effect: { freeSpin: true } },
    { id: 'dados', name: 'Dados Cargados', price: 450, charges: 3, sus: 18, icon: 'dados', game: 'roulette',
      desc: 'El mecánico del callejón lastra el plato: el <b>color que elijas cae el triple</b> de a menudo durante un giro. Sospecha +18.',
      effect: { bias: 3 },
      unlock: 'dados' },
    { id: 'marcadas', name: 'Cartas Marcadas', price: 500, charges: 2, sus: 10, icon: 'marcadas', game: 'blackjack',
      desc: 'Durante 8 rondas ves la <b>carta oculta del crupier</b> y el <b>conteo de cartas</b>. Sospecha +10.',
      effect: { rounds: 8 },
      unlock: 'marcadas' },
    { id: 'destiempo', name: 'Apostar a Destiempo', price: 600, charges: 2, sus: 20, icon: 'destiempo', game: 'roulette',
      desc: 'Tras ver el número ganador, <b> mueve tu mayor apuesta a ese número</b>. Sospecha +20.',
      unlock: 'destiempo' }
  ],

  /* ================= AMULETOS (Mercado Negro) ================= */
  AMULETS: [
    { id: 'pata', name: 'Pata de Conejo', price: 300, icon: 'pata',
      desc: '<b>+5% de suerte global:</b> la fortuna te sonríe en la ruleta, los carretes y los volados.' },
    { id: 'trebol', name: 'Trébol de Cuatro Hojas', price: 400, icon: 'trebol',
      desc: 'Los premios del <b>Tragamonedas pagan +15%</b>.',
      unlock: 'trebol' },
    { id: 'sortija', name: 'Sortija de la Croupier', price: 600, icon: 'sortija',
      desc: 'Tus apuestas a <b>número pleno cubren los números adyacentes</b> de la rueda (pagan 17:1).',
      unlock: 'sortija' },
    { id: 'marionetista', name: 'Dado del Marionetista', price: 700, icon: 'marionetista',
      desc: 'Toda la sospecha que generas se reduce <b>30%</b>.',
      unlock: 'marionetista' },
    { id: 'reloj', name: 'Reloj de Oro', price: 800, icon: 'reloj',
      desc: 'Los tragos duran <b>+2 rondas</b>. <span class="gold">Combina con el Old Fashioned.</span>',
      unlock: 'reloj' },
    { id: 'favor', name: 'Favor de la Mafia', price: 1000, icon: 'favor',
      desc: '<b>Una vez por partida:</b> el Pit Boss te deja ir sin consecuencias (se consume).',
      unlock: 'favor' }
  ],

  DEFAULT_UNLOCKED: ['ginrickey', 'beesknees', 'sidecar', 'manhattan', 'asbajo', 'dedos', 'pata'],

  /* Condiciones de desbloqueo (se evalúan contra meta.stats / run) */
  UNLOCKS: {
    oldfashioned: { hint: 'Alcanza el Club Privado (50,000) en cualquier partida', cond: (m) => m.tierEver >= 1 },
    french75: { hint: 'Juega 15 tiradas de Tragamonedas (total histórico)', cond: (m) => m.slotSpins >= 15 },
    corpse: { hint: 'Sufre la crisis de la viñeta 2 veces (total histórico)', cond: (m) => m.crisisCount >= 2 },
    marcadas: { hint: 'Juega 25 manos de Blackjack (total histórico)', cond: (m) => m.bjHands >= 25 },
    dados: { hint: 'Alcanza el Gran Salón VIP (500,000) en cualquier partida', cond: (m) => m.tierEver >= 2 },
    destiempo: { hint: 'Sobrevive a una visita a la Habitación Trasera', cond: (m) => m.backrooms >= 1 },
    trebol: { hint: 'Consigue el jackpot de 3 Sietes en el Tragamonedas', cond: (m) => m.jackpots >= 1 },
    sortija: { hint: 'Gana 5,000 o más en un solo giro de Ruleta', cond: (m) => m.bestRLWin >= 5000 },
    marionetista: { hint: 'Usa 10 trucos en una sola partida', cond: (m) => m.tricksBestRun >= 10 },
    reloj: { hint: 'Activa una Sinergia VIP', cond: (m) => m.synergies >= 1 },
    favor: { hint: 'Supera la prueba de suerte de la Habitación Trasera', cond: (m) => m.luckWins >= 1 }
  },

  /* ================= SINERGIAS VIP ================= */
  SYNERGIES: [
    { id: 'horadorada', name: 'Hora Dorada',
      req: { drink: 'oldfashioned', amulet: 'reloj' },
      desc: 'Old Fashioned activo + Reloj de Oro: pago <b>+30% adicional</b> en todos los juegos.' },
    { id: 'coctelsuerte', name: 'Cóctel de la Suerte',
      req: { drink: 'manhattan', amulet: 'pata' },
      desc: 'Manhattan activo + Pata de Conejo: el Blackjack paga <b>+10% extra</b>.' },
    { id: 'manomaestra', name: 'Mano Maestra',
      req: { tricks: ['asbajo', 'marcadas'] },
      desc: 'As bajo la Manga + Cartas Marcadas: el <b>primer truco de cada ronda no genera sospecha</b>.' },
    { id: 'fortuna', name: 'Fortuna Falsificada',
      req: { trick: 'dados', amulet: 'pata' },
      desc: 'Dados Cargados + Pata de Conejo: el color sesgado cae <b>4 veces</b> más, no 3.' }
  ],

  itemById(id) {
    return this.DRINKS.find((d) => d.id === id) || this.TRICKS.find((t) => t.id === id) ||
      this.AMULETS.find((a) => a.id === id);
  },
  itemName(id) {
    const it = this.itemById(id);
    return it ? it.name : id;
  },

  /* ================= RULETA ================= */
  WHEEL_ORDER: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
  REDS: new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]),
  isRed(n) { return this.REDS.has(n); },
  wheelNeighbors(n) {
    const i = this.WHEEL_ORDER.indexOf(n);
    return [this.WHEEL_ORDER[(i + 36) % 37], this.WHEEL_ORDER[(i + 1) % 37]];
  },
  rlColor(n) { return n === 0 ? 'green' : (this.isRed(n) ? 'red' : 'black'); },

  /* ================= TRAGAMONEDAS ================= */
  // Símbolos: '7' siete, 'B' BAR, 'W' comodín estrella, S/H/D/C = ♠ ♥ ♦ ♣
  SYM_LABEL: { '7': '7', 'B': 'BAR', 'W': '★', 'S': '♠', 'H': '♥', 'D': '♦', 'C': '♣' },
  buildStrip() {
    const a = [];
    ['S', 'H', 'D', 'C'].forEach((s) => { for (let i = 0; i < 4; i++) a.push(s); });
    a.push('B', 'B', '7', 'W');
    return U.shuffle(a);
  },
  evalLine(s) {
    const c = (x) => s.filter((v) => v === x).length;
    const W = c('W');
    if (c('7') + W === 3) return { m: 100, label: '¡SIETES DE ORO!' };
    if (W === 3) return { m: 50, label: '¡TRIPLE COMODÍN!' };
    if (c('B') + W === 3) return { m: 40, label: '¡TRIPLE BAR!' };
    for (const su of ['S', 'H', 'D', 'C']) {
      if (c(su) + W === 3) return { m: 15, label: 'TRES ' + ({ S: '♠', H: '♥', D: '♦', C: '♣' })[su] };
    }
    if (W === 2) return { m: 10, label: 'PAREJA DE COMODINES' };
    if (c('7') === 2) return { m: 5, label: 'PAREJA DE SIETES' };
    if (c('B') === 2) return { m: 3, label: 'PAREJA DE BAR' };
    return null;
  },
  PAYTABLE: [
    { syms: ['7', '7', '7'], m: 100 }, { syms: ['W', 'W', 'W'], m: 50 }, { syms: ['B', 'B', 'B'], m: 40 },
    { syms: ['S', 'S', 'S'], m: 15 }, { syms: ['W', 'W'], m: 10 }, { syms: ['7', '7'], m: 5 }, { syms: ['B', 'B'], m: 3 }
  ],

  /* ================= BLACKJACK ================= */
  BJ_PAYOUT: 1.5,        // 3:2
  CHARLIE: 5,            // 5 cartas sin pasarse = pago 2:1
  CHARLIE_PAYOUT: 2
};
