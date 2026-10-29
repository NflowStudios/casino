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
    U.on(U.$('btn-bar'), 'click', () => Bar.open());
    U.on(U.$('btn-market'), 'click', () => Market.open());
    U.on(U.$('btn-phone'), 'click', () => Hub.phoneAction());
    U.$$('.mkt-tab').forEach((t) => U.on(t, 'click', () => Market.setTab(t.dataset.tab)));

    // salir de mesas
    U.$$('[data-leave]').forEach((b) => U.on(b, 'click', () => {
      const g = b.dataset.leave;
      if (g === 'bj') BJ.leave();
      if (g === 'rl') RL.leave();
      if (g === 'sl') SL.leave();
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
    st.innerHTML =
      '<li>Modo: <b>' + (r.mode === 'story' ? 'Historia' : 'Infinito') + '</b></li>' +
      '<li>Pico de riqueza: <b>' + U.fmt(r.stats.peak) + '</b></li>' +
      '<li>Deuda pendiente: <b class="neg">' + (r.mode === 'story' ? U.fmt(r.debt) : '—') + '</b></li>' +
      '<li>Manos jugadas: <b>' + r.stats.hands + '</b></li>' +
      '<li>Trucos usados: <b>' + r.stats.tricksUsed + '</b></li>' +
      '<li>Mayor victoria: <b class="pos">' + U.fmt(r.stats.biggestWin) + '</b></li>';
    const lostItems = [];
    if (r.drinks.length) lostItems.push('<li>' + r.drinks.length + ' trago(s) activos</li>');
    if (r.tricks.length) lostItems.push('<li>' + r.tricks.filter((t) => t.charges > 0).length + ' truco(s) con cargas</li>');
    if (r.amulets.length) lostItems.push('<li>' + r.amulets.length + ' amuleto(s): ' + r.amulets.map((a) => DATA.itemName(a)).join(', ') + '</li>');
    lost.innerHTML = lostItems.join('') || '<li>Solo tu orgullo.</li>';
    unl.innerHTML =
      '<li>' + State.meta.unlocked.length + ' objetos en el catálogo</li>' +
      (r.unlocksThisRun.length ? '<li class="pos">Desbloqueado esta partida: ' + r.unlocksThisRun.map((id) => DATA.itemName(id)).join(', ') + '</li>' : '') +
      '<li>Récord Infinito: <b>' + U.fmt(State.meta.best) + '</b></li>' +
      '<li style="color:var(--cream-dim)">El mercado negro recuerda a sus clientes…</li>';
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
      '<li>Pico de riqueza: <b>' + U.fmt(r.stats.peak) + '</b></li>' +
      '<li>Manos jugadas: <b>' + r.stats.hands + '</b></li>' +
      '<li>Trucos usados: <b>' + r.stats.tricksUsed + '</b></li>' +
      '<li>Fichas restantes: <b class="pos">' + U.fmt(r.chips) + '</b></li>' +
      '<li>Victorias totales: <b>' + State.meta.victories + '</b></li>';
    U.$('btn-v-legend').hidden = r.chips < 100;
    UI.show('victory');
  },

  /* ---------- ayuda ---------- */
  renderHelp() {
    U.$('help-body').innerHTML =
      '<h3>EL OBJETIVO</h3>' +
      '<p><b>Modo Historia:</b> salda la deuda de <span class="gold">2,000,000</span> de fichas con la familia Moretti antes de quedarte sin nada. Cuando reúnas el dinero, usa el <b>Teléfono</b> del casino. <b>Modo Infinito:</b> sobrevive y acumula tu pico de riqueza. Caer a 0 fichas es <b>bancarrota permanente</b>: pierdes tragos, trucos y amuletos de la partida. El catálogo desbloqueado persiste entre partidas.</p>' +
      '<h3>LA SOSPECHA</h3>' +
      '<p>Cada truco que uses aumenta la sospecha del <b>Pit Boss</b> (esquina inferior izquierda). Las rondas limpias y ciertos tragos la reducen. Al llegar a <b>100%</b> te llevan a la <b>Habitación Trasera</b>: sobornar (35% de tus fichas), entregar todos tus trucos, o jugarle una moneda a la suerte.</p>' +
      '<h3>LA ECONOMÍA NOIR</h3>' +
      '<p><b>La Barra (Tragos):</b> mejoras temporales por rondas. <b>El Callejón (Mercado Negro):</b> trucos con cargas (alto riesgo, alta recompensa) y amuletos pasivos permanentes por partida. Ciertas combinaciones activan <b>Sinergias VIP</b> (ej.: Old Fashioned + Reloj de Oro = <span class="gold">Hora Dorada</span>).</p>' +
      '<h3>LAS MESAS</h3>' +
      '<p><b>Blackjack:</b> pide, plántate, dobla o ríndete. Apuestas laterales: Pareja Perfecta y 21+3. Con <i>Cartas Marcadas</i> verás la carta oculta y el conteo real de cartas.</p>' +
      '<p><b>Ruleta Art Déco:</b> apuesta a <b>número pleno</b> (paga 35:1), al <b>color</b> o a <b>par/impar</b> (pagan 1:1). La <i>Sortija de la Croupier</i> cubre números adyacentes. En los últimos giros, la cámara se acerca…</p>' +
      '<p><b>Tragamonedas:</b> elige tu ficha, tira de la palanca y alinea tres símbolos. <b>★ es el comodín:</b> sustituye a cualquier símbolo para completar la combinación.</p>' +
      '<h3>CONTROLES</h3>' +
      '<p>Clic para todo. Botón derecho retira fichas de la ruleta. <b>M</b> silencia. <b>Esc</b> cierra ventanas. El sonido es jazz sintetizado en vivo: cada noche suena distinto.</p>';
  }
};
App.init();
