/* NOIR GOLD — main.js: arranque, menú, modos, finales */
'use strict';
const App = {
  init() {
    State.loadMeta();
    FX.init();
    Icon.paint(); /* sistema de iconografía: pinta [data-ico] y [data-scene] */
    // sonido persistido
    let muted = false;
    try { muted = localStorage.getItem('noirgold.muted') === '1'; } catch (e) {}
    Sound.muted = muted;
    Sound.setMuted(muted);

    this.bind();
    this.renderMenu();
    UI.show('menu');
    document.body.dataset.screen = 'menu';

    // reanudar partida previa
    const saved = State.loadRun();
    const cont = U.$('btn-continue');
    if (saved) {
      cont.hidden = false;
      cont.textContent = 'CONTINUAR PARTIDA (' + (saved.mode === 'story' ? 'HISTORIA' : 'INFINITO') + ' · ' + U.fmt(saved.chips) + ' FICHAS)';
    } else cont.hidden = true;

    // primera interacción → audio
    const wake = () => { Sound.init(); Sound.startAmbient(); };
    U.on(document, 'pointerdown', wake, { once: true });
    U.on(document, 'keydown', wake, { once: true });

    window.addEventListener('beforeunload', () => State.saveRun());
  },

  bind() {
    // navegación global
    U.$$('[data-nav]').forEach((b) => U.on(b, 'click', () => {
      const to = b.dataset.nav;
      if (to === 'menu') this.renderMenu(), UI.show('menu');
    }));
    U.$$('[data-close]').forEach((b) => U.on(b, 'click', () => {
      const m = U.$(b.dataset.close);
      if (m) m.classList.remove('open');
    }));
    U.$$('modal-x');
    U.$$('.modal').forEach((m) => U.on(m, 'click', (e) => { if (e.target === m && m.id !== 'modal-confirm') m.classList.remove('open'); }));

    U.on(U.$('btn-new'), 'click', () => this.startNew());
    U.on(U.$('btn-continue'), 'click', () => this.resumeRun());
    U.on(U.$('btn-help'), 'click', () => { this.renderHelp(); U.$('modal-help').classList.add('open'); });
    U.on(U.$('mode-story'), 'click', () => { State.newRun('story'); Hub.enter(); Sound.sfx.chips(); });
    U.on(U.$('mode-infinite'), 'click', () => { State.newRun('infinite'); Hub.enter(); Sound.sfx.chips(); });
    U.on(U.$('btn-go-again'), 'click', () => { UI.show('select'); });
    U.on(U.$('btn-v-new'), 'click', () => { UI.show('select'); });

    // hub
    U.on(U.$('door-bj'), 'click', () => BJ.enter());
    U.on(U.$('door-rl'), 'click', () => RL.enter());
    U.on(U.$('door-sl'), 'click', () => SL.enter());
    U.on(U.$('door-hr'), 'click', () => HR.enter());
    U.on(U.$('btn-bar'), 'click', () => Bar.open());
    U.on(U.$('btn-market'), 'click', () => Market.open());
    U.on(U.$('btn-phone'), 'click', () => Hub.phoneAction());
    U.on(U.$('btn-duel'), 'click', () => Duel.tryEnter());
    U.on(U.$('duel-abandon'), 'click', () => Duel.abandon());
    U.on(U.$('btn-e-back'), 'click', () => Hub.enter());
    U.on(U.$('btn-e-new'), 'click', () => { UI.show('select'); });
    U.$$('.mkt-tab').forEach((t) => U.on(t, 'click', () => Market.setTab(t.dataset.tab)));

    // salir de mesas
    U.$$('[data-leave]').forEach((b) => U.on(b, 'click', () => {
      const g = b.dataset.leave;
      if (g === 'bj') BJ.leave();
      if (g === 'rl') RL.leave();
      if (g === 'sl') SL.leave();
      if (g === 'hr') HR.leave();
    }));

    // sonido / menú
    U.on(U.$('btn-sound'), 'click', () => Sound.toggle());
    U.on(U.$('btn-exit'), 'click', async () => {
      if (!State.run) { this.renderMenu(); UI.show('menu'); return; }
      const ok = await UI.confirm('SALIR AL MENÚ', 'La partida quedará guardada y podrás continuarla después.<br>El permadeath no perdona: si quiebras, se pierde todo.', 'SALIR');
      if (ok) { State.saveRun(); this.renderMenu(); UI.show('menu'); }
    });

    // victoria: leyenda
    U.on(U.$('btn-v-legend'), 'click', () => {
      const r = State.run;
      if (r) { r.mode = 'legend'; r.debt = 0; State.saveRun(); }
      Hub.enter();
      U.toast('Eres una LEYENDA del Gran Salón. Sigue jugando sin deuda.', 'gold', 5000);
    });

    // teclado
    U.on(document, 'keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') Sound.toggle();
      if (e.key === 'Escape') {
        const open = U.$$('.modal.open').pop();
        if (open && open.id !== 'modal-confirm') open.classList.remove('open');
      }
    });
  },

  renderMenu() {
    const best = U.$('menu-best');
    best.textContent = 'Récord Infinito: ' + U.fmt(State.meta.best) + ' · Victorias: ' + State.meta.victories;
    const saved = State.run || State.loadRun();
    const cont = U.$('btn-continue');
    if (saved) {
      cont.hidden = false;
      cont.textContent = 'CONTINUAR PARTIDA (' + (saved.mode === 'story' ? 'HISTORIA' : (saved.mode === 'legend' ? 'LEYENDA' : 'INFINITO')) + ' · ' + U.fmt(saved.chips) + ' FICHAS)';
    } else cont.hidden = true;
    const mb = U.$('mode-best');
    if (mb) mb.textContent = U.fmt(State.meta.best);
  },

  async startNew() {
    if (State.run) {
      const ok = await UI.confirm('NUEVA PARTIDA', 'Tienes una partida en curso (' + U.fmt(State.run.chips) + ' fichas).<br>Si empiezas otra, la actual se pierde para siempre.', 'EMPEZAR DE CERO');
      if (!ok) return;
    }
    UI.show('select');
  },
  resumeRun() {
    if (!State.run) State.loadRun();
    if (!State.run) { U.$('btn-continue').hidden = true; return; }
    document.body.classList.remove('tier-0', 'tier-1', 'tier-2');
    document.body.classList.add('tier-' + DATA.tierOf(State.run.chips));
    Hub.enter();
    UI.renderHUD();
    UI.renderInventory();
  },

  /* ---------- finales ---------- */
  gameover(r, soft) {
    Sound.crisis(false);
    Sound.sfx.door();
    document.body.classList.remove('crisis');
    const st = U.$('go-stats'), lost = U.$('go-lost'), unl = U.$('go-unlocks');
    U.$('go-flavor').textContent = soft
      ? 'Apenas te quedan fichas para el autobús. La casa siempre gana… hasta la próxima.'
      : 'Cero fichas. La casa siempre gana… hasta la próxima.';
    st.innerHTML =
      '<li><span>Modo</span><b>' + (r.mode === 'story' ? 'Historia' : (r.mode === 'legend' ? 'Leyenda' : 'Infinito')) + '</b></li>' +
      '<li><span>Pico de riqueza</span><b>' + U.fmt(r.stats.peak) + '</b></li>' +
      '<li><span>Deuda pendiente</span><b class="neg">' + (r.mode === 'story' ? U.fmt(r.debt) : '—') + '</b></li>' +
      '<li><span>Manos jugadas</span><b>' + r.stats.hands + '</b></li>' +
      '<li><span>Carreras ganadas</span><b>' + (r.stats.hrWins || 0) + '</b></li>' +
      '<li><span>Mejor racha</span><b>×' + (r.stats.bestStreak || 0) + '</b></li>' +
      '<li><span>Trucos usados</span><b>' + r.stats.tricksUsed + '</b></li>' +
      '<li><span>Mayor victoria</span><b class="pos">' + U.fmt(r.stats.biggestWin) + '</b></li>';
    const lostItems = [];
    if (r.drinks.length) lostItems.push('<li>' + r.drinks.length + ' trago(s) activos</li>');
    if (r.tricks.length) lostItems.push('<li>' + r.tricks.filter((t) => t.charges > 0).length + ' truco(s) con cargas</li>');
    if (r.amulets.length) lostItems.push('<li>' + r.amulets.length + ' amuleto(s): ' + r.amulets.map((a) => DATA.itemName(a)).join(', ') + '</li>');
    lost.innerHTML = lostItems.join('') || '<li><span>Solo tu orgullo.</span></li>';
    unl.innerHTML =
      '<li><span>Catálogo</span><b>' + State.meta.unlocked.length + ' objetos</b></li>' +
      (r.unlocksThisRun.length ? '<li class="pos"><span>Nuevo esta partida</span><b>' + r.unlocksThisRun.map((id) => DATA.itemName(id)).join(', ') + '</b></li>' : '') +
      '<li><span>Récord Infinito</span><b>' + U.fmt(State.meta.best) + '</b></li>' +
      '<li style="color:var(--cream-dim)"><span>El mercado negro recuerda a sus clientes…</span></li>';
    UI.show('gameover');
    FX.flash('rgba(128,0,32,.3)', 800);
  },

  victory(r) {
    Sound.crisis(false);
    document.body.classList.remove('crisis');
    FX.goldRain(3000);
    Sound.sfx.jackpot();
    setTimeout(() => FX.goldRain(2200), 1300);
    U.$('v-stats').innerHTML =
      '<li><span>Pico de riqueza</span><b>' + U.fmt(r.stats.peak) + '</b></li>' +
      '<li><span>Manos jugadas</span><b>' + r.stats.hands + '</b></li>' +
      '<li><span>Carreras ganadas</span><b>' + (r.stats.hrWins || 0) + '</b></li>' +
      '<li><span>Mejor racha</span><b>×' + (r.stats.bestStreak || 0) + '</b></li>' +
      '<li><span>Trucos usados</span><b>' + r.stats.tricksUsed + '</b></li>' +
      '<li><span>Fichas restantes</span><b class="pos">' + U.fmt(r.chips) + '</b></li>' +
      '<li><span>Victorias totales</span><b>' + State.meta.victories + '</b></li>';
    U.$('btn-v-legend').hidden = r.chips < 100;
    UI.show('victory');
  },

  /* ---------- LOS CUATRO FINALES DE LA PARTIDA PRIVADA ---------- */
  duelEnding(s) {
    Sound.crisis(false);
    document.body.classList.remove('crisis');
    const wrap = U.$('ending-wrap');
    wrap.className = 'e-wrap deco-frame e-' + s.kind;
    const E = {
      socio: {
        kicker: 'EL FINAL DE LA NOCHE',
        title: 'EL SOCIO',
        flavor: 'Repliegas el paño por última vez. Moretti estudia tus manos — las cartas, no las fichas — y suelta una risa ronca.<br>«Ganaste limpio. Y eso, en mi negocio, es más raro que la honestidad.»<br>Empuja hacia ti el montón duplicado y, con él, una llave de latón: <b>el Gold Crown ahora tiene un socio que conoce los dos lados del paño.</b> La deuda queda saldada… y bien invertida.'
      },
      estafa: {
        kicker: 'EL FINAL DE LA NOCHE',
        title: 'LA GRAN ESTAFA',
        flavor: 'Ganas. Nadie puede probar cómo, pero todos lo saben — tú más que nadie.<br>Moretti firma el pago sin dejarte mirarle los ojos. «Vete. Rápido.»<br>Esa noche sales rico por la puerta de servicio. Un coche arranca a dos farolas de ti y no deja de seguirte hasta el amanecer. <b>Ganar fue fácil. Dejar de jugar, eso es lo difícil.</b>'
      },
      leccion: {
        kicker: 'LA SALA DEL FONDO',
        title: 'LA LECCIÓN',
        flavor: s.abandoned
          ? 'Te levantas a mitad de partida. Moretti no dice nada: junta las fichas con la palma abierta, casi con delicadeza.<br>«La silla se enfría, canario. Cuando puedas pagarla otra vez, <b>la sala sigue aquí. Yo respeto al que vuelve.</b>»'
          : 'Moretti junta las fichas con la palma abierta, casi con delicadeza.<br>«Quinientas mil. Caro, ¿verdad? No: barato. La lección del siglo.»<br>Te devuelve la ficha negra — gastada de tanto bolsillo —. «Guárdala. Cuando puedas pagar la silla, <b>la sala sigue aquí. Yo respeto al que vuelve.</b>»'
      },
      rey: {
        kicker: 'EXPEDIENTE CERRADO',
        title: 'EL REY DE NADA',
        flavor: 'La última carta cae y el paño se queda con todo: lo de la mesa y lo del bolsillo.<br>Silencio. Moretti apaga el cigarro, se levanta y pone frente a ti un vaso servido de la botella buena.<br>«Casi nadie llega tan lejos, canario.» —golpea tu hombro, una sola vez—. «Bebe. La casa invita. <b>Solo esta vez.</b>»'
      }
    }[s.kind];
    let flavor = E.flavor;
    // detalle de la Moneda del Mendigo: Moretti la reconoce en los finales de victoria
    if ((s.kind === 'socio' || s.kind === 'estafa') && s.mendigo) {
      flavor += '<br><br>Al pagar, Moretti nota la moneda agujereada que llevas al cuello y sonríe por primera vez: «El mendigo del puente sigue vivo, ¿eh? Quédate esa moneda, canario. <b>Es la única suerte de esta casa que no se puede comprar.</b>»';
    }
    if (s.kind === 'estafa' && s.cheated) {
      flavor += '<br><br><span class="e-note">Moretti no olvidó tus trucos. Los sombreros que te siguen tampoco.</span>';
    }
    U.$('e-kicker').textContent = E.kicker;
    U.$('e-title').textContent = E.title;
    U.$('e-flavor').innerHTML = flavor;
    U.$('e-stats').innerHTML =
      '<li><span>Ficha final</span><b class="pos">' + U.fmt(s.chips) + '</b></li>' +
      (s.kind === 'socio' || s.kind === 'estafa' ? '<li><span>La casa igualó tu paño</span><b>+' + U.fmt(s.pot || 0) + '</b></li>' : '') +
      '<li><span>Pico de riqueza</span><b>' + U.fmt(s.peak) + '</b></li>' +
      '<li><span>Manos jugadas</span><b>' + s.hands + '</b></li>' +
      '<li><span>Carreras ganadas</span><b>' + s.hrWins + '</b></li>' +
      '<li><span>Mejor racha</span><b>×' + s.bestStreak + '</b></li>' +
      '<li><span>Trucos usados</span><b>' + s.tricksUsed + '</b></li>' +
      '<li><span>Visitas a la sala trasera</span><b>' + s.backrooms + '</b></li>' +
      (s.kind === 'leccion' || s.kind === 'rey' ? '<li><span>Deuda pendiente</span><b class="neg">' + U.fmt(s.debt) + '</b></li>' : '');
    U.$('btn-e-back').hidden = s.kind !== 'leccion';
    U.$('btn-e-new').hidden = s.kind === 'leccion';
    U.$('btn-e-menu').hidden = s.kind === 'leccion';
    UI.show('ending');
    if (s.kind === 'socio') { FX.goldRain(3200); Sound.sfx.jackpot(); setTimeout(() => FX.goldRain(2400), 1400); }
    else if (s.kind === 'estafa') { FX.flash('rgba(128,0,32,.4)', 1100); Sound.sfx.sting(); }
    else if (s.kind === 'rey') { FX.flash('rgba(0,0,0,.75)', 1300); Sound.sfx.door(); FX.shake(); }
    else { Sound.sfx.door(); }
  },

  /* ---------- ayuda ---------- */
  renderHelp() {
    U.$('help-body').innerHTML =
      '<div class="help-grid">' +
      '<section class="help-sec"><h3>EL OBJETIVO</h3>' +
      '<p><b>Modo Historia:</b> salda la deuda de <span class="gold">2,000,000</span> de fichas con la familia Moretti. Cuando reúnas el dinero, usa el <b>Teléfono</b> del casino. <b>Modo Infinito:</b> sobrevive y acumula tu pico de riqueza.</p>' +
      '<p>Caer a 0 fichas es <b>bancarrota permanente</b>: pierdes tragos, trucos y amuletos. El catálogo desbloqueado persiste entre partidas.</p></section>' +
      '<section class="help-sec"><h3>LA SOSPECHA</h3>' +
      '<p>Cada truco aumenta la sospecha del <b>Pit Boss</b> (esquina inferior izquierda). Las rondas limpias y ciertos tragos la reducen.</p>' +
      '<p>Al llegar a <b>100%</b> te llevan a la <b>Habitación Trasera</b>: sobornar (35% de tus fichas), entregar todos tus trucos, o jugarle una moneda a la suerte.</p></section>' +
      '<section class="help-sec"><h3>LA ECONOMÍA NOIR</h3>' +
      '<p><b>La Barra (Tragos):</b> mejoras temporales por rondas.</p>' +
      '<p><b>El Callejón (Mercado Negro):</b> trucos con cargas y amuletos pasivos por partida.</p>' +
      '<p>Ciertas combinaciones activan <b>Sinergias VIP</b> (ej.: Old Fashioned + Reloj de Oro = <span class="gold">Hora Dorada</span>).</p></section>' +
      '<section class="help-sec"><h3>LA RACHA CALIENTE</h3>' +
      '<p>Cada victoria consecutiva suma <b>+5% de pago</b> en todos los juegos, hasta <b>+50%</b>. Perder una ronda la enfría.</p>' +
      '<p>La victoria que enciende la racha no cobra el bono: cobra la siguiente. Consérvala… pero cuidado: <b>desde la cuarta victoria seguida la casa empieza a contar</b> (+2 de sospecha por victoria, +3 desde la novena), aunque el bono ya esté al máximo.</p></section>' +
      '<section class="help-sec"><h3>LA PARTIDA PRIVADA</h3>' +
      '<p>En el modo Historia, al cruzar <span class="gold">1.75M</span>, don Salvatore Moretti te entrega la <b>Ficha Negra</b>: la entrada a la sala del fondo.</p>' +
      '<p>Duelo de Blackjack <b>a 3 victorias</b> con entrada de <b>500,000</b>. La apuesta del orgullo escala (10% → 15% → 20% → 25% del paño) y la <b>quinta mano se apuesta TODO</b>: paño y bolsillo. El <b>As de Moretti</b>: una vez por partida, el don cambia su carta oculta a la vista de todos.</p>' +
      '<p>Ganar limpio te hace <b>EL SOCIO</b>; ganar con trucos o con la sospecha disparada, <b>LA GRAN ESTAFA</b>. Perder es <b>LA LECCIÓN</b> — puedes volver a pagar la entrada —. Arruinarte en el todo o nada es <b>EL REY DE NADA</b>.</p></section>' +
      '<section class="help-sec"><h3>ESA NOCHE EN EL CASINO</h3>' +
      '<p>Al volver al piso, la noche puede sorprenderte: borrachos con sistemas infalibles, mesas calientes, redadas, prestamistas y cantantes que dedican canciones.</p>' +
      '<p>En el modo Historia, la familia Moretti te irá poniendo ojo al cruzar cada umbral de riqueza.</p></section>' +
      '<section class="help-sec"><h3>CONTROLES</h3>' +
      '<p>Clic para todo. Botón derecho retira fichas de la ruleta.</p>' +
      '<p><b>M</b> silencia · <b>Esc</b> cierra ventanas.</p>' +
      '<p>El sonido es jazz sintetizado en vivo: cada noche suena distinto.</p></section>' +
      '<section class="help-sec wide"><h3>LAS MESAS</h3><div class="help-tables">' +
      '<div class="help-table"><h5>♦ BLACKJACK</h5><p>Pide, plántate, dobla o ríndete. Apuestas laterales: Pareja Perfecta y 21+3. Con <i>Cartas Marcadas</i> verás la carta oculta y el conteo real.</p></div>' +
      '<div class="help-table"><h5>♦ RULETA ART DÉCO</h5><p>Apuesta a <b>número pleno</b> (paga 35:1), al <b>color</b> o a <b>par/impar</b> (pagan 1:1). La <i>Sortija de la Croupier</i> cubre adyacentes. En los últimos giros, la cámara se acerca…</p></div>' +
      '<div class="help-table"><h5>♦ TRAGAMONEDAS</h5><p>Elige tu ficha, tira de la palanca y alinea tres símbolos. <b>★ es el comodín:</b> sustituye a cualquier símbolo. <b>Dos símbolos iguales pagan ×2.</b></p></div>' +
      '<div class="help-table"><h5>♦ HIPÓDROMO NOCTURNO</h5><p>Seis corredores, una recta, pago <b>a ganador</b> según la pizarra. La forma real de cada caballo es secreta… salvo que un jockey con deudas te la susurre. Ganar mucho seguido atrae la mirada del bookie.</p></div>' +
      '</div></section>' +
      '</div>';
  }
};
App.init();
