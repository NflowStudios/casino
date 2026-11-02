/* NOIR GOLD — hub.js: piso del casino, puertas, servicios, teléfono */
'use strict';
const Hub = {
  enter() {
    // un duelo a medias siempre manda: el don espera en la sala del fondo
    if (Duel.active()) { Duel.resume(); return; }
    const r = State.run;
    // guard anti-bloqueo (bug v1.5): volver al casino con menos del mínimo apostable
    // (p. ej. tras LA LECCIÓN pagando la entrada con todo el bolsillo) dejaba la partida
    // zombie: sin fichas para jugar y sin pantalla de derrota. La casa cobra y cierra el expediente.
    if (r && r.chips < DATA.MIN_BET) { State.die(true); return; }
    UI.show('hub');
    this.applyTier();
    this.refreshServices();
    UI.renderHUD();
    // prioridad cinematográfica: escenas Moretti en cola → luego, eventos nocturnos
    if (r && r.morettiQueue && r.morettiQueue.length) { Moretti.playNext(); return; }
    Events.maybe();
  },
  applyTier() {
    const r = State.run;
    if (!r) return;
    const t = DATA.tierOf(r.chips);
    document.body.classList.remove('tier-0', 'tier-1', 'tier-2');
    document.body.classList.add('tier-' + t);
    U.$('sign-text').textContent = DATA.TIERS[t].sign;
    U.$('tier-badge').textContent = DATA.TIERS[t].name;
    FX.dust(t === 2);
  },
  refreshServices() {
    const r = State.run;
    if (!r) return;
    const phone = U.$('btn-phone');
    const note = U.$('phone-note');
    const ready = r.mode === 'story' && r.chips >= r.debt;
    phone.classList.toggle('phone-ready', ready);
    note.textContent = r.mode === 'story'
      ? (ready ? '¡SALDAR DEUDA!' : 'Faltan ' + U.fmtC(r.debt - r.chips))
      : 'Sin deudas';
    // la ficha negra abre la sala del fondo (solo modo historia, tras cruzar 1.75M)
    const duelBtn = U.$('btn-duel');
    if (duelBtn) {
      const invited = Duel.available();
      duelBtn.hidden = !invited;
      duelBtn.classList.toggle('duel-ready', invited && r.chips >= DATA.DUEL.BUYIN);
      const ds = U.$('duel-note');
      if (ds) ds.textContent = invited ? (r.chips >= DATA.DUEL.BUYIN ? '¡Te espera!' : 'Faltan ' + U.fmtC(DATA.DUEL.BUYIN - r.chips)) : 'Partida Privada';
    }
  },
  async phoneAction() {
    const r = State.run;
    if (!r) return;
    if (r.mode !== 'story') {
      UI.confirm('TELÉFONO PÚBLICO', 'Marcas el número de la familia. Al otro lado, alguien cuelca sin decir palabra. Esto no va contigo… por ahora.');
      return;
    }
    if (r.chips < r.debt) {
      UI.confirm('TELÉFONO PÚBLICO', 'Una voz ronca contesta: <b>"¿Ya tienes nuestros dos millones?"</b><br>Te faltan <b class="gold">' + U.fmt(r.debt - r.chips) + '</b> fichas. Colgan.');
      return;
    }
    const ok = await UI.confirm('SALDAR LA DEUDA', 'Entregarás <b>2,000,000</b> de fichas a la familia Moretti. La deuda quedará saldada para siempre.<br>¿Cierras el trato?', 'SALDAR');
    if (ok) State.payDebt();
  }
};
