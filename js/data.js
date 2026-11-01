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
  LUCK_FAIL_PENALTY: 0.4, // fallo prueba de suerte: -40% fichas

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
    { id: 'tragocasa', name: 'Trago de la Casa', price: 100, icon: 'tragocasa',
      desc: 'Destilado de la botella sin etiqueta que Sam esconde bajo la barra. Pago <b>+5% en todos los juegos</b> durante 5 rondas. Barato y con carácter.',
      effect: { type: 'payout', games: ['all'], mult: 1.05, rounds: 5 } },
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
      unlock: 'destiempo' },
    { id: 'dadosmellados', name: 'Dados Mellados', price: 120, charges: 2, sus: 10, icon: 'dadosmellados', game: 'roulette',
      desc: 'Un par de huesos gastados que "caen mejor" de lo que deberían: pago <b>+10% en Ruleta</b> durante 3 giros. Sospecha +10.',
      effect: { payout: { games: ['roulette'], mult: 1.10, rounds: 3 } } },
    { id: 'doping', name: 'Doping del Establo', price: 400, charges: 2, sus: 22, icon: 'doping', game: 'races',
      desc: 'El cuidador del hipódromo inyecta "vitaminas". <b>Elige un caballo: esta carrera corre con 4 veces su forma real.</b> Sospecha +22.',
      unlock: 'doping' },
    { id: 'consejo', name: 'Consejo del Jockey', price: 350, charges: 3, sus: 8, icon: 'consejo', game: 'races',
      desc: 'Un jockey con deudas te susurra la <b>forma real de cada caballo</b> en la carrera actual. Sospecha +8.',
      unlock: 'consejo' }
  ],

  /* ================= AMULETOS (Mercado Negro) ================= */
  AMULETS: [
    { id: 'moneda', name: 'Moneda del Mendigo', price: 150, icon: 'moneda',
      desc: 'Moneda agujereada de un mendigo con suerte extraña. <b>La primera vez que pierdas más de 300 fichas de una vez, recuperas la mitad.</b> Un solo uso por compra.' },
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

  DEFAULT_UNLOCKED: ['ginrickey', 'beesknees', 'tragocasa', 'sidecar', 'manhattan', 'asbajo', 'dedos', 'dadosmellados', 'moneda', 'pata'],

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
    favor: { hint: 'Supera la prueba de suerte de la Habitación Trasera', cond: (m) => m.luckWins >= 1 },
    doping: { hint: 'Gana 10,000 o más en una sola carrera del Hipódromo', cond: (m) => m.bestHRWin >= 10000 },
    consejo: { hint: 'Gana 3 carreras en una sola partida', cond: (m) => m.hrBestRun >= 3 }
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

  /* ================= ESCENAS DE LA FAMILIA MORETTI (modo historia) =================
     Se disparan al cruzar cada umbral de fichas y se reproducen al volver al hub. */
  MORETTI: [
    { at: 100000, icon: 'phone', title: 'LA PRIMERA LLAMADA',
      text: 'El teléfono del pasillo suena una sola vez. El crupier lo coge, escucha, y te tiende el auricular sin mirarte.<br><br>«¿Cien mil?» —una risa ronca, húmeda—. «Con eso la familia apenas paga los cigarros del don. Sigue corriendo, canario. Y no hagas esperar al teléfono.»' },
    { at: 250000, icon: 'favor', title: 'EL COBRADOR HACE SU RONDA',
      text: 'Un gorila de traje a rayas se sienta a tu mesa sin pedir permiso y deja una caja de cerillas vacía junto a tu copa.<br><br>«Doscientos cincuenta. Ya no eres un chiste.» —golpea la mesa dos veces—. «El don ha oído tu nombre. Dos veces en una semana es mucho. Que no sean tres… por ahora.»' },
    { at: 500000, icon: 'phone', title: 'EL DON ALZA LA VISTA',
      text: 'Esta vez el teléfono lo coge el gerente con guantes blancos. La línea cruje como madera vieja.<br><br>«Medio millón.» —un silencio largo—. «Dijeron que eras un don nadie con suerte. La suerte se acaba. La palabra… la palabra es otra cosa. Sigue. Estamos mirando.»' },
    { at: 1000000, icon: 'favor', title: 'LOS OJOS DE LA FAMILIA',
      text: 'Ya nadie finge no verte. Los crupieres te saludan con la cabeza; los matones, con la mirada. En la barra dejan tu whisky favorito sin que lo pidas.<br><br>Un millón. En la Habitación Trasera, alguien marca tu fotografía con una esquina doblada: <b>«activo. rentable. vigilar.»</b>' },
    { at: 1750000, icon: 'lacre', title: 'LA ÚLTIMA CENA',
      text: 'Te esperan junto a la puerta: dos sombras con sombrero y un sobre de lacre borgoña sin abrir.<br><br>«Estás a un paso, canario.» —el sobre desaparece bajo el gabán—. «Cuando tengas el resto, no llames. <b>Vendremos nosotros.</b>»' }
  ],

  /* ================= EVENTOS NOCTURNOS (al volver al hub) ================= */
  EVENTS: [
    { id: 'borracho', icon: 'favor', title: 'EL SISTEMA DEL BORRACHO',
      text: 'Un hombre de sombrero torcido se deja caer a tu lado, oliendo a ginebra barata y a matemática urgente.<br>«Amigo… tengo un sistema. <b>In-fa-li-ble</b>. Solo falta alguien con capital que lo ponga a prueba.»',
      choices: [
        { label: 'ESCUCHARLO', sub: 'Gratis. Qué puede salir mal.',
          fn() {
            if (U.chance(0.5)) {
              State.addPayoutBuff('Consejo del Borracho', ['all'], 1.10, 3);
              U.toast('☾ ¡Funciona! (Esta noche.) Pago +10% durante 3 rondas.', 'success', 4500);
            } else {
              State.addSuspicion(6);
              U.toast('Gritaste «¡PLENO AL 17!» con él. El Pit Boss giró la cabeza.', 'danger', 4500);
            }
          } },
        { label: 'INVITARLE UN TRAGO', sub: 'Ginebra decente para oídos decentes.', cost: 80,
          fn() {
            State.addChips(-80);
            State.addPayoutBuff('Consejo del Borracho', ['all'], 1.10, 3);
            U.toast('Con ginebra decente, el sistema fluye: pago +10% durante 3 rondas.', 'success', 4500);
          } },
        { label: 'PASAR DE ÉL', sub: 'Cada noche hay uno.',
          fn() { U.toast('Se aleja hacia la barra murmurando fórmulas.', 'info', 3200); } }
      ] },
    { id: 'mesa', icon: 'table', title: 'MESA CALIENTE',
      text: 'El paño de la mesa 7 no deja de pagar. Los parroquianos se apiñan como polillas sobre un billete encendido.<br>El fieltro arde… y el Pit Boss ya lo ha notado.',
      choices: [
        { label: 'JUGAR EN LA MESA 7', sub: 'Pagos ×1.5 durante 3 rondas. +8 de sospecha.',
          fn() {
            State.addPayoutBuff('Mesa Caliente', ['all'], 1.5, 3);
            State.addSuspicion(8);
            U.toast('✦ La mesa 7 arde: pagos ×1.5 durante 3 rondas.', 'gold', 4500);
          } },
        { label: 'TU MESA DE SIEMPRE', sub: 'Fundirse con el cuero viejo: -4 de sospecha.',
          fn() {
            State.addSuspicion(-4);
            U.toast('Te fundes con el cuero viejo de tu esquina. Nadie te mira.', 'info', 3800);
          } }
      ] },
    { id: 'redada', icon: 'badge', title: 'REDADA POLICIAL',
      text: 'Silbatos a lo lejos. El humo se traga las luces y media sala contiene la respiración. Alguien apaga el gramófono.',
      choices: [
        { label: 'AL BAÑO, YA', sub: 'Esperar entre azulejos fríos.',
          fn() {
            State.addSuspicion(-2);
            U.toast('Diez minutos eternos entre azulejos fríos. Pasan de largo.', 'info', 4200);
          } },
        { label: 'SEGUIR JUGANDO', sub: 'Sangre fría. O suicidio.',
          fn() {
            if (U.chance(0.5)) {
              State.addPayoutBuff('Sangre Fría', ['all'], 1.05, 3);
              U.toast('Tu calma impresiona al gerente: cortesía de la casa (+5% pago, 3 rondas).', 'success', 4500);
            } else {
              State.addSuspicion(15);
              U.toast('Un uniformado se detiene a tu lado demasiado tiempo. Te ficha.', 'danger', 4500);
            }
          } },
        { label: 'ACEITE PARA LAS PALMAS', sub: 'El sargento también vive.', cost: 100,
          fn() {
            State.addChips(-100);
            State.addSuspicion(-10);
            U.toast('El sargento se acaricia el bigote con tu generosidad. Mira a otro lado.', 'success', 4500);
          } }
      ] },
    { id: 'prestamista', icon: 'fajo', title: 'EL PRESTAMISTA',
      text: 'Un hombre de uñas limpias y sonrisa sucia desliza un fajo bajo tu copa.<br>«Sin papeles. Sin preguntas. La confianza es mi único interés… compuesto.»',
      choices: [
        { label: 'TOMAR EL FAJO', sub: '+500 fichas. +10 de sospecha.',
          fn() {
            State.addChips(500);
            State.addSuspicion(10);
            U.toast('+500 fichas que huelen a otra deuda. El Pit Boss lo anota todo.', 'sus', 4500);
          } },
        { label: 'MANOS LIMPIAS', sub: 'Rechazar con elegancia.',
          fn() { U.toast('«Prudente. Los prudentes duran… poco, pero duran.» Se esfuma.', 'info', 4200); } }
      ] },
    { id: 'cantante', icon: 'note', title: 'LA CANTANTE',
      text: 'Delia Voe, la voz de terciopelo, pasea la mirada por las mesas y se detiene en la tuya.<br>«Esta va por el caballero de la esquina…», dice al micrófono de cromo.',
      choices: [
        { label: 'APLAUDIR DESDE TU MESA', sub: 'La sala te sonríe. +5% de suerte, 5 rondas.',
          fn() {
            State.addLuck(0.05, 5);
            U.toast('♪ La suerte te busca: +5% durante 5 rondas.', 'success', 4200);
          } },
        { label: 'MANDARLE GARDENIAS', sub: 'Cien fichas de flores y una canción para ti.', cost: 100,
          fn() {
            State.addChips(-100);
            State.addLuck(0.10, 5);
            U.toast('♪ Gardenias al camerino. Delia canta para ti: +10% de suerte, 5 rondas.', 'gold', 4800);
          } },
        { label: 'ESCAPAR DISCRETAMENTE', sub: 'No es tu noche de canciones.',
          fn() { U.toast('Sales al pasillo mientras el contrabajo llena tu ausencia.', 'info', 3200); } }
      ] }
  ],

  /* ================= EL HIPÓDROMO NOCTURNO ================= */
  HORSES: [
    { num: 1, name: 'El Sombrero', silk: '#D4AF37' },
    { num: 2, name: 'Viuda Negra', silk: '#800020' },
    { num: 3, name: 'Bala de Plata', silk: '#b9cddb' },
    { num: 4, name: 'Mancarrón', silk: '#7a5c33' },
    { num: 5, name: 'Dama de Copas', silk: '#0a8f3c' },
    { num: 6, name: 'Relámpago', silk: '#4a7fae' }
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
    if (W === 3) return { m: 50, label: '¡TRIPLE COMODÍN!' };
    if (c('7') + W === 3) return { m: 100, label: '¡SIETES DE ORO!' };
    if (c('B') + W === 3) return { m: 25, label: '¡TRIPLE BAR!' };
    for (const su of ['S', 'H', 'D', 'C']) {
      if (c(su) + W === 3) return { m: 6, label: 'TRES ' + ({ S: '♠', H: '♥', D: '♦', C: '♣' })[su] };
    }
    // cualquier pareja idéntica (sin comodín) paga ×2
    if (W === 0) {
      const pair = { '7': 'DE SIETES', B: 'DE BAR', S: '♠♠', H: '♥♥', D: '♦♦', C: '♣♣' };
      for (const x of ['7', 'B', 'S', 'H', 'D', 'C']) {
        if (c(x) === 2) return { m: 2, label: 'PAREJA ' + pair[x] };
      }
    }
    return null;
  },
  PAYTABLE: [
    { syms: ['7', '7', '7'], m: 100 }, { syms: ['W', 'W', 'W'], m: 50 }, { syms: ['B', 'B', 'B'], m: 25 },
    { syms: ['S', 'S', 'S'], m: 6 }, { syms: ['S', 'S'], m: 2 }
  ],

  /* ================= BLACKJACK ================= */
  BJ_PAYOUT: 1.5,        // 3:2
  CHARLIE: 5,            // 5 cartas sin pasarse = pago 2:1
  CHARLIE_PAYOUT: 2
};
