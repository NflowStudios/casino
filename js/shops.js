/* NOIR GOLD — shops.js: La Barra (tragos), Mercado Negro (trucos/amuletos), Habitación Trasera */
'use strict';

/* ============ FÁBRICA DE TARJETAS (carta de menú de speakeasy) ============
   Estados explícitos: is-buyable · is-broke · is-locked · badge de propiedad */
const ShopUI = {
  card(o) {
    const state = o.locked ? 'is-locked' : (o.canBuy ? 'is-buyable' : 'is-broke');
    const el = U.el('article', 'item-card ' + state + (o.accent ? ' ' + o.accent : ''));
    let btn;
    if (o.locked) btn = { t: 'BLOQUEADO', on: false };
    else if (o.owned) btn = { t: 'TUYO', on: false };
    else if (!o.canBuy) btn = { t: 'SIN FONDOS', on: false };
    else btn = { t: o.cta || 'COMPRAR', on: true };

    el.innerHTML =
      '<div class="ic-loz">' + Icon.svg(o.icon) +
        (o.locked ? '<span class="ic-lockov">' + Icon.svg('lock') + '</span>' : '') + '</div>' +
      '<div class="ic-body">' +
        '<div class="ic-head"><h4 class="ic-name">' + o.name + '</h4>' +
        (o.meta ? '<span class="ic-meta">' + o.meta + '</span>' : '') +
        (o.badge ? '<span class="ic-badge ' + o.badge.cls + '">' + o.badge.txt + '</span>' : '') +
        '</div>' +
        '<div class="ic-rule" aria-hidden="true"><i></i></div>' +
        '<p class="ic-desc">' + (o.locked ? o.hint : o.desc) + '</p>' +
        (!o.locked && !o.owned && !o.canBuy
          ? '<p class="ic-miss">Te faltan <b>' + U.fmt(Math.max(1, o.missing)) + '</b> fichas</p>' : '') +
        '<footer class="ic-foot">' +
        '<span class="ic-price">' + Icon.svg('chip') + U.fmt(o.price) + '</span>' +
        '<button type="button" class="ic-buy"' + (btn.on ? '' : ' disabled') + '>' + btn.t + '</button>' +
        '</footer>' +
      '</div>';

    if (o.onBuy && btn.on) {
      el.addEventListener('click', () => o.onBuy());
    }
    return el;
  }
};

/* ================= LA BARRA ================= */
const Bar = {
  open() {
    Sound.sfx.drink();
    this.render();
    U.$('modal-bar').classList.add('open');
  },
  close() { U.$('modal-bar').classList.remove('open'); },
  render() {
    const list = U.$('bar-list');
    list.innerHTML = '';
    for (const d of DATA.DRINKS) {
      const locked = !!(d.unlock && !State.isUnlocked(d.unlock));
      const active = State.activeDrink(d.id);
      const insurance = d.effect.type === 'insurance';
      const insured = insurance && State.run.insurance;
      const canBuy = !locked && !insured && State.canAfford(d.price);
      const meta = d.effect.type === 'instant' ? 'AL INSTANTE'
        : insurance ? 'UNA VEZ POR PARTIDA'
        : d.effect.rounds + ' RONDAS';
      list.appendChild(ShopUI.card({
        icon: d.icon, name: d.name, meta, price: d.price,
        locked, canBuy, cta: 'PEDIR',
        desc: d.desc,
        hint: locked && DATA.UNLOCKS[d.unlock] ? DATA.UNLOCKS[d.unlock].hint : '',
        missing: d.price - (State.run ? State.run.chips : 0),
        badge: active ? { cls: 'b-active', txt: 'ACTIVO · ' + active.roundsLeft + ' RONDAS' } : null,
        onBuy: () => this.buy(d)
      }));
    }
  },
  buy(d) {
    if (!State.canAfford(d.price)) return;
    State.addChips(-d.price);
    State.applyDrink(d);
    Sound.sfx.drink();
    U.toast('Sam sirve un ' + d.name + '. «Salud, forastero.»', 'success');
    this.render();
    UI.renderHUD();
    State.saveRun();
  }
};

/* ================= MERCADO NEGRO ================= */
const Market = {
  tab: 'tricks',
  open() {
    Sound.noise(0.35, 400, 0.06);
    this.render();
    U.$('modal-market').classList.add('open');
  },
  close() { U.$('modal-market').classList.remove('open'); },
  setTab(t) {
    this.tab = t;
    U.$$('.mkt-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
    this.render();
  },
  render() {
    const list = U.$('mkt-list');
    list.innerHTML = '';
    const items = this.tab === 'tricks' ? DATA.TRICKS : DATA.AMULETS;
    for (const it of items) {
      const locked = !!(it.unlock && !State.isUnlocked(it.unlock));
      const owned = this.tab === 'amulets' && State.hasAmulet(it.id);
      const tk = State.trick(it.id);
      const canBuy = !locked && !owned && State.canAfford(it.price);
      list.appendChild(ShopUI.card({
        icon: it.icon, name: it.name, price: it.price,
        meta: this.tab === 'tricks' ? it.charges + ' CARGAS' : 'PASIVO',
        accent: this.tab === 'tricks' ? 'ac-trick' : 'ac-amulet',
        locked, canBuy, owned, cta: 'COMPRAR',
        desc: it.desc,
        hint: locked && DATA.UNLOCKS[it.unlock] ? DATA.UNLOCKS[it.unlock].hint : '',
        missing: it.price - (State.run ? State.run.chips : 0),
        badge: tk ? { cls: 'b-charge', txt: 'EN TU PODER ×' + tk.charges }
          : (owned ? { cls: 'b-active', txt: 'EN POSESIÓN' } : null),
        onBuy: () => this.buy(it)
      }));
    }
  },
  buy(it) {
    if (!State.canAfford(it.price)) return;
    const r = State.run;
    State.addChips(-it.price);
    if (this.tab === 'tricks') {
      const ex = r.tricks.find((t) => t.id === it.id);
      if (ex) ex.charges += it.charges;
      else r.tricks.push({ id: it.id, charges: it.charges });
      U.toast('«Mercancía fina, sin preguntas.» ' + it.name + ' ×' + it.charges, 'sus');
    } else {
      r.amulets.push(it.id);
      U.toast('El amuleto de ' + it.name + ' vibra en tu bolsillo.', 'success');
    }
    Sound.sfx.chips();
    State.checkSynergies();
    this.render();
    UI.renderHUD();
    State.saveRun();
  }
};

/* ================= HABITACIÓN TRASERA ================= */
const Backroom = {
  trigger() {
    Sound.sfx.door();
    FX.shake();
    UI.show('backroom');
    const r = State.run;
    r._pbSaid = 0;
    UI.updatePitBoss();
    const choices = U.$('br-choices');
    choices.innerHTML = '';
    const bribe = Math.max(1, Math.round(r.chips * DATA.BRIBE_PCT));
    const hasTricks = r.tricks.some((t) => t.charges > 0);

    const mk = (cls, title, sub, cost, fn, dis) => {
      const b = U.el('button', 'br-choice ' + cls,
        '<h4>' + title + '</h4><p>' + sub + '</p>' + (cost ? '<span class="br-cost">' + cost + '</span>' : ''));
      b.type = 'button';
      b.disabled = !!dis;
      b.onclick = () => { choices.innerHTML = ''; fn(); };
      choices.appendChild(b);
    };

    if (State.hasAmulet('favor') && !r.favorUsed) {
      mk('bc-favor', 'FAVOR DE LA MAFIA', 'El don levanta la mano: «Este caballero paga sus deudas. Suéltalo.» El amuleto se consume.', 'GRATIS',
        () => { r.favorUsed = true; r.amulets.splice(r.amulets.indexOf('favor'), 1); this.resolve('favor'); });
    }
    mk('bc-bribe', 'SOBNORNAR A LA CASA', 'Una palmada en la espalda, un fajo que desaparece bajo la mesa. El Pit Boss sonríe… esta vez.', '-' + U.fmt(bribe) + ' FICHAS',
      () => this.resolve('bribe', bribe), r.chips < bribe);
    mk('bc-give', 'ENTREGAR LOS TRUCOS', 'Vacías los bolsillos sobre la mesa. El jefe se queda los juguetes y la lección.', hasTricks ? 'TODOS TUS TRUCOS' : 'NADA QUE ENTREGAR',
      () => this.resolve('give'), !hasTricks);
    mk('bc-luck', 'PRUEBA DE SUERTE', 'Un volado con la moneda de la casa. Cara: sales cojeando pero entero. Cruz: la casa cobra caro.', '50 / 50',
      () => this.resolve('luck'));
  },

  async resolve(choice, bribe) {
    const r = State.run;
    const flavor = U.$('br-flavor');
    if (choice === 'bribe') {
      State.addChips(-bribe);
      FX.flyChip(U.$('hud-chips'), U.$('br-choices'));
      flavor.innerHTML = 'Las fichas cambian de manos bajo la mesa.<br>«No he visto nada. Largo de aquí.»';
      r.sus = 0;
      await U.sleep(1400);
    } else if (choice === 'give') {
      r.tricks = [];
      flavor.innerHTML = 'El Pit Boss se queda hasta el último as marcado.<br>«Aprendamos a jugar limpio, ¿sí?»';
      r.sus = 0;
      Sound.sfx.card();
      await U.sleep(1400);
    } else if (choice === 'favor') {
      flavor.innerHTML = 'La sombra del don pesa más que cualquier sospecha.<br>«Este caballero paga sus deudas. Suéltalo.»';
      r.sus = 0;
      await U.sleep(1500);
    } else if (choice === 'luck') {
      const coin = U.$('br-coin');
      flavor.textContent = 'La moneda gira bajo la bombilla que oscila…';
      coin.hidden = false;
      Sound.sfx.coinFlip();
      setTimeout(() => Sound.sfx.coinFlip(), 700);
      setTimeout(() => Sound.sfx.coinFlip(), 1400);
      await U.sleep(2400);
      let p = 0.5 + State.luckBonus();
      p = U.clamp(p, 0.05, 0.95);
      const win = U.chance(p);
      coin.hidden = true;
      if (win) {
        State.meta.stats.luckWins++;
        r.sus = 25;
        FX.goldRain(900);
        Sound.sfx.win();
        flavor.innerHTML = '<b class="gold">CARA.</b> Sales cojeando, pero entero.<br>«Vete. Y no me hagas volver a mirarte.»';
      } else {
        const lost = Math.round(r.chips * DATA.LUCK_FAIL_PENALTY);
        State.addChips(-lost);
        r.tricks = [];
        r.sus = 50;
        Sound.sfx.lose();
        FX.shake();
        flavor.innerHTML = '<b style="color:#e04a44">CRUZ.</b> Te vacían los bolsillos: -' + U.fmt(lost) + ' fichas y todos tus trucos.<br>«La casa siempre gana.»';
      }
      State.saveMeta();
      await U.sleep(1800);
    }
    State.meta.stats.backrooms++;
    State.saveMeta();
    State.checkUnlocks();
    State.saveRun();
    UI.renderHUD();
    Hub.enter();
  }
};
