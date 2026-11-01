/* NOIR GOLD — hub.js: piso del casino, puertas, servicios, teléfono */
'use strict';
const Hub = {
  enter() {
    UI.show('hub');
    this.applyTier();
    this.refreshServices();
    UI.renderHUD();
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
