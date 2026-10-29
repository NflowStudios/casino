/* NOIR GOLD — ui.js: pantallas, HUD, Pit Boss, inventario, confirmación */
'use strict';
const UI = {
  lastChips: 0,

  show(id) {
    U.$$('.screen').forEach((s) => s.classList.remove('active'));
    const sc = U.$('screen-' + id);
    if (sc) sc.classList.add('active');
    document.body.dataset.screen = id;
    this.renderHUD();
  },

  /* ---------- HUD ---------- */
  renderHUD(delta) {
    const r = State.run;
    const chipsEl = U.$('hud-chips');
    if (!chipsEl || !r) return;
    // contador animado
    if (this.lastChips !== r.chips) {
      const from = this.lastChips || 0;
      U.tween(from, r.chips, 480, (v) => { chipsEl.textContent = U.fmt(v); });
      if (delta !== undefined && delta !== 0) this.flyDelta(delta);
      this.lastChips = r.chips;
    }
    // modo / deuda / récord
    const modeLabel = U.$('hud-mode-label'), debtBar = U.$('hud-debt'), fill = U.$('hud-debt-fill'), dl = U.$('hud-debt-label');
    if (r.mode === 'story' || r.mode === 'legend') {
      modeLabel.textContent = r.mode === 'legend' ? 'LEYENDA' : 'HISTORIA · DEUDA';
      debtBar.style.display = '';
      if (r.mode === 'legend') {
        fill.style.width = '100%';
        dl.textContent = 'DEUDA SALDADA';
        debtBar.classList.remove('full');
      } else {
        const pct = U.clamp(r.chips / r.debt, 0, 1) * 100;
        fill.style.width = pct + '%';
        dl.textContent = U.fmt(r.chips) + ' / ' + U.fmt(r.debt);
        debtBar.classList.toggle('full', r.chips >= r.debt);
      }
    } else {
      modeLabel.textContent = 'INFINITO · RÉCORD ' + U.fmt(State.meta.best);
      debtBar.style.display = 'none';
    }
    // sospecha
    U.$('sus-fill').style.width = r.sus + '%';
    U.$('sus-num').textContent = r.sus + '%';
    document.body.classList.toggle('sus-mid', r.sus >= 34 && r.sus < 67);
    document.body.classList.toggle('sus-hot', r.sus >= 67);
    this.updatePitBoss();
    this.renderInventory();
  },
  flyDelta(n) {
    const host = U.$('hud-chips-delta');
    if (!host) return;
    host.textContent = (n > 0 ? '+' : '') + U.fmt(n);
    host.style.color = n > 0 ? '#8ff5ae' : '#ff8f88';
    host.style.left = (U.$('hud-chips').offsetWidth + 12) + 'px';
    host.classList.remove('fly');
    void host.offsetWidth;
    host.classList.add('fly');
  },

  /* ---------- Pit Boss ---------- */
  updatePitBoss() {
    const r = State.run;
    const pb = U.$('pitboss');
    if (!r || !pb) return;
    const sus = r.sus;
    let tx = '-52%', sc = 1;
    if (sus > 66) { tx = '2%'; sc = 1.14; }
    else if (sus > 33) { tx = '-24%'; sc = 1.06; }
    pb.style.transform = 'translateX(' + tx + ') scale(' + sc + ')';
    document.documentElement.style.setProperty('--eye', (0.15 + sus / 100 * 0.85).toFixed(2));
    // frases umbral
    const bub = U.$('pb-bubble');
    if (!r._pbSaid) r._pbSaid = 0;
    if (sus >= 90 && r._pbSaid < 4) { r._pbSaid = 4; this.pbSay('Está a un pelo de actuar. Deja de hacer trampas… o no.'); }
    else if (sus >= 70 && r._pbSaid < 3) { r._pbSaid = 3; this.pbSay('El Pit Boss se acerca a tu mesa. Huele el whisky y las mentiras.'); }
    else if (sus >= 45 && r._pbSaid < 2) { r._pbSaid = 2; this.pbSay('El jefe de sala te observa con desconfianza…'); }
    else if (sus >= 20 && r._pbSaid < 1) { r._pbSaid = 1; this.pbSay('Un matón de traje a rayas te echa el ojo desde la esquina.'); }
    if (sus < 10) { r._pbSaid = 0; if (bub) bub.hidden = true; }
  },
  pbSay(txt) {
    const bub = U.$('pb-bubble');
    if (!bub) return;
    bub.textContent = txt;
    bub.hidden = false;
    clearTimeout(this._pbT);
    this._pbT = setTimeout(() => { bub.hidden = true; }, 6500);
  },

  /* ---------- Inventario de efectos ---------- */
  renderInventory() {
    const box = U.$('inv');
    const r = State.run;
    if (!box || !r) return;
    box.innerHTML = '';
    const add = (cls, label, tip) => {
      const p = U.el('span', 'pill ' + cls, '<i></i>' + label);
      p.setAttribute('data-tip', tip);
      box.appendChild(p);
    };
    for (const d of r.drinks) {
      const def = DATA.DRINKS.find((x) => x.id === d.id);
      add('p-drink', def.name.toUpperCase() + ' <b>' + d.roundsLeft + '</b>', def.desc);
    }
    for (const t of r.tricks) {
      if (t.charges <= 0) continue;
      const def = DATA.TRICKS.find((x) => x.id === t.id);
      add('p-trick', def.name.toUpperCase() + ' <b>×' + t.charges + '</b>', def.desc);
    }
    for (const a of r.amulets) {
      const def = DATA.AMULETS.find((x) => x.id === a);
      add('p-amulet', def.name.toUpperCase(), def.desc);
    }
    for (const s of DATA.SYNERGIES) {
      if (State.synActive(s.id)) add('p-syn', '✦ ' + s.name, s.desc);
    }
    if (r.insurance) add('p-drink', 'CORPSE REVIVER', 'Si quiebras, conservas 500 fichas (una vez).');
  },

  /* ---------- Confirmación ---------- */
  confirm(title, text, okLabel) {
    return new Promise((res) => {
      const m = U.$('modal-confirm');
      U.$('cf-title').textContent = title;
      U.$('cf-text').innerHTML = text;
      U.$('cf-ok').textContent = okLabel || 'ACEPTAR';
      m.classList.add('open');
      const done = (v) => { m.classList.remove('open'); U.$('cf-ok').onclick = U.$('cf-cancel').onclick = null; res(v); };
      U.$('cf-ok').onclick = () => done(true);
      U.$('cf-cancel').onclick = () => done(false);
    });
  },

  /* ---------- Selector de fichas reutilizable ---------- */
  chipRow(container, onPick, selected) {
    container.innerHTML = '';
    const vals = [10, 25, 50, 100, 250, 500, 1000, 5000];
    let sel = selected || 10;
    const cap = State.tierCap();
    const chips = vals.map((v) => {
      const b = U.el('button', 'chip' + (v === sel ? ' sel' : ''), U.fmt(v));
      b.dataset.v = v;
      b.type = 'button';
      if (v > cap) b.disabled = true;
      b.onclick = () => {
        chips.forEach((c) => c.classList.remove('sel'));
        b.classList.add('sel');
        sel = v;
        Sound.sfx.chips();
        if (typeof onPick === 'function') onPick(v);
      };
      container.appendChild(b);
      return b;
    });
    return { get value() { return sel; }, refresh() { chips.forEach((c) => { c.disabled = +c.dataset.v > State.tierCap(); }); } };
  },

  /* ---------- badge de multiplicador por juego ---------- */
  renderMult(game, elId) {
    const el = U.$(elId);
    if (el) el.textContent = '×' + State.payoutMult(game).toFixed(2);
  }
};
