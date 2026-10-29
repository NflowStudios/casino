/* NOIR GOLD — audio.js: motor WebAudio sintetizado (jazz noir + SFX, cero assets) */
'use strict';
const Sound = {
  ctx: null, master: null, ambGain: null, muted: false,
  ambTimer: null, ambOn: false, crisisNodes: null, nextBar: 0, barIdx: 0,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
    } catch (e) { /* sin audio */ }
  },
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.55;
    const ico = U.$('sound-ico');
    if (ico) ico.textContent = m ? '×' : '♪';
    try { localStorage.setItem('noirgold.muted', m ? '1' : '0'); } catch (e) {}
  },
  toggle() { this.setMuted(!this.muted); },

  // ---- primitivas ----
  beep(freq, dur, type, vol, glideTo, when) {
    if (!this.ctx || this.muted) return;
    const t = when !== undefined ? when : this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol === undefined ? 0.12 : vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, freq, vol, when) {
    if (!this.ctx || this.muted) return;
    const t = when !== undefined ? when : this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = freq || 1500;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol === undefined ? 0.1 : vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur);
  },
  trumpet(freq, dur, vol, when) { // "trompeta con sordina" noir
    if (!this.ctx || this.muted) return;
    const t = when !== undefined ? when : this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1150; lp.Q.value = 2.5;
    const vib = this.ctx.createOscillator(); vib.frequency.value = 5.2;
    const vg = this.ctx.createGain(); vg.gain.value = freq * 0.012;
    vib.connect(vg); vg.connect(o.frequency);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol === undefined ? 0.05 : vol, t + dur * 0.25);
    g.gain.setValueAtTime(vol === undefined ? 0.05 : vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(this.master);
    o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  },

  // ---- SFX de juego ----
  sfx: {
    card() { Sound.noise(0.05, 2600, 0.12); Sound.beep(240, 0.05, 'triangle', 0.05); },
    chips() { Sound.beep(2300, 0.03, 'square', 0.05); setTimeout(() => Sound.beep(1900, 0.03, 'square', 0.045), 40); },
    deal() { Sound.sfx.card(); },
    win(small) {
      const seq = small ? [523, 659, 784] : [523, 659, 784, 1046, 1318];
      seq.forEach((f, i) => Sound.beep(f, 0.22, 'triangle', 0.1, null, Sound.ctx && Sound.ctx.currentTime + i * 0.09));
      if (!small) Sound.noise(0.5, 6000, 0.05);
    },
    jackpot() {
      [523, 659, 784, 1046, 784, 1046, 1318, 1568].forEach((f, i) =>
        Sound.beep(f, 0.3, 'triangle', 0.11, null, Sound.ctx && Sound.ctx.currentTime + i * 0.11));
      Sound.noise(0.8, 5500, 0.06);
    },
    lose() { Sound.beep(196, 0.4, 'sawtooth', 0.05, 82); Sound.noise(0.18, 300, 0.09); },
    push() { Sound.beep(392, 0.12, 'triangle', 0.06); setTimeout(() => Sound.beep(392, 0.12, 'triangle', 0.05), 140); },
    tick() { Sound.beep(1250, 0.02, 'square', 0.03); },
    reel() { Sound.beep(320, 0.03, 'square', 0.04); },
    reelStop() { Sound.beep(210, 0.07, 'square', 0.08); Sound.noise(0.05, 900, 0.08); },
    lever() { [880, 700, 520].forEach((f, i) => Sound.beep(f, 0.04, 'square', 0.06, null, Sound.ctx && Sound.ctx.currentTime + i * 0.07)); Sound.noise(0.09, 500, 0.12); },
    door() { Sound.noise(0.4, 120, 0.2); Sound.beep(70, 0.4, 'sine', 0.18, 45); },
    drink() { [300, 380, 460].forEach((f, i) => Sound.beep(f, 0.09, 'sine', 0.06, null, Sound.ctx && Sound.ctx.currentTime + i * 0.08)); Sound.beep(180, 0.16, 'sine', 0.08, 70, Sound.ctx && Sound.ctx.currentTime + 0.3); },
    coin() { Sound.beep(2093, 0.09, 'triangle', 0.07); Sound.beep(2637, 0.14, 'triangle', 0.05, null, Sound.ctx && Sound.ctx.currentTime + 0.05); },
    sting() { Sound.beep(440, 0.5, 'sawtooth', 0.045); Sound.beep(466, 0.5, 'sawtooth', 0.045); },
    unlock() { Sound.beep(660, 0.14, 'triangle', 0.08); Sound.beep(990, 0.2, 'triangle', 0.08, null, Sound.ctx && Sound.ctx.currentTime + 0.13); },
    ascend() { [392, 523, 659, 784, 1046].forEach((f, i) => Sound.beep(f, 0.35, 'triangle', 0.1, null, Sound.ctx && Sound.ctx.currentTime + i * 0.1)); },
    coinFlip() { Sound.beep(1600, 0.05, 'square', 0.06); },
    flash() { Sound.beep(1568, 0.4, 'sine', 0.05, 2093); }
  },

  // ---- jazz ambiental generativo (Am noir) ----
  startAmbient() {
    if (!this.ctx || this.ambOn) return;
    this.ambOn = true;
    this.ambGain = this.ctx.createGain();
    this.ambGain.gain.value = 0.5;
    this.ambGain.connect(this.master);
    this.nextBar = this.ctx.currentTime + 0.1;
    this.barIdx = 0;
    this.ambTimer = setInterval(() => this.scheduleAmbient(), 300);
  },
  stopAmbient() {
    this.ambOn = false;
    if (this.ambTimer) clearInterval(this.ambTimer);
    this.ambTimer = null;
  },
  scheduleAmbient() {
    if (!this.ctx || !this.ambOn) return;
    const BAR = (60 / 88) * 4; // 4/4 a 88 bpm
    while (this.nextBar < this.ctx.currentTime + 1.2) {
      this.playBar(this.nextBar, this.barIdx);
      this.nextBar += BAR;
      this.barIdx++;
    }
  },
  playBar(t0, bar) {
    const q = (60 / 88); // negra
    const prog = [ // Am7 | Dm7 | E7 | Am6 (ciclo noir)
      { root: 110, ch: [220, 261.6, 329.6, 392] },
      { root: 146.8, ch: [220, 293.7, 349.2, 440] },
      { root: 82.4, ch: [207.7, 246.9, 329.6, 392] },
      { root: 110, ch: [220, 277.2, 329.6, 415.3] }
    ];
    const c = prog[bar % 4];
    // bajo caminante
    const bassPat = [c.root, c.root * 1.5, c.root * 2, c.root * 1.335];
    bassPat.forEach((f, i) => this.beep(f, q * 0.92, 'sine', 0.075, null, t0 + i * q));
    // acordes con "rasgueo" en 2 y 4
    [1, 3].forEach((b) => c.ch.forEach((f, i) =>
      this.beep(f, 0.24, 'triangle', 0.028, null, t0 + b * q + i * 0.012)));
    // escobillas (ruido suave por beat)
    for (let b = 0; b < 4; b++) this.noise(0.1, 7000, b % 2 ? 0.012 : 0.02, t0 + b * q);
    // melodía dispersa de trompeta con sordina
    if (Math.random() < 0.55) {
      const scale = [440, 493.9, 523.3, 587.3, 659.3, 698.5, 784, 830.6];
      const n = 1 + Math.floor(Math.random() * 3);
      let mt = t0 + q * (Math.random() < 0.5 ? 0 : 2);
      for (let i = 0; i < n; i++) {
        this.trumpet(U.pick(scale) * (Math.random() < 0.2 ? 0.5 : 1), q * (0.7 + Math.random() * 0.9), 0.035, mt);
        mt += q * (0.8 + Math.random() * 0.6);
      }
    }
  },

  // ---- latido de crisis ----
  crisis(on) {
    if (!this.ctx) return;
    if (on && !this.crisisNodes) {
      const g = this.ctx.createGain(); g.gain.value = 0.001; g.connect(this.master);
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 55;
      const trem = this.ctx.createOscillator(); trem.frequency.value = 1.1;
      const tg = this.ctx.createGain(); tg.gain.value = 0.055;
      trem.connect(tg); tg.connect(g.gain);
      o.connect(g); o.start(); trem.start();
      this.crisisNodes = { o, trem, g };
    } else if (!on && this.crisisNodes) {
      try { this.crisisNodes.o.stop(); this.crisisNodes.trem.stop(); } catch (e) {}
      this.crisisNodes = null;
    }
  }
};
