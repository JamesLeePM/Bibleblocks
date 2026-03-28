export class SoundManager {
  constructor() {
    this._ctx = null;
    this._master = null;
    this._enabled = true;
  }

  enable(enabled) {
    this._enabled = !!enabled;
  }

  _ensure() {
    if (!this._enabled) return null;
    if (this._ctx) return this._ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this._ctx = new Ctx();
    this._master = this._ctx.createGain();
    this._master.gain.value = 0.35;
    this._master.connect(this._ctx.destination);
    return this._ctx;
  }

  _tone({ freq, duration = 0.08, type = 'square', gain = 0.2, startAt = 0, rampTo = null }) {
    const ctx = this._ensure();
    if (!ctx || !this._master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startAt;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.01);
    if (rampTo != null) {
      osc.frequency.exponentialRampToValueAtTime(rampTo, t0 + duration);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(this._master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  playBlockPlace() {
    this._tone({ freq: 1100, duration: 0.04, type: 'square', gain: 0.12, rampTo: 980 });
  }

  playBlockBreak() {
    this._tone({ freq: 140, duration: 0.13, type: 'sawtooth', gain: 0.14, rampTo: 60 });
    this._tone({ freq: 90, duration: 0.09, type: 'triangle', gain: 0.08, startAt: 0.02 });
  }

  playJump() {
    this._tone({ freq: 330, duration: 0.12, type: 'square', gain: 0.16, rampTo: 880 });
  }

  playWalkTick() {
    this._tone({ freq: 520, duration: 0.03, type: 'triangle', gain: 0.08, rampTo: 420 });
  }

  playMenuOpen() {
    // Harp-like chord.
    this._tone({ freq: 392, duration: 0.18, type: 'triangle', gain: 0.09, startAt: 0.0, rampTo: 523 });
    this._tone({ freq: 494, duration: 0.18, type: 'triangle', gain: 0.07, startAt: 0.0, rampTo: 659 });
    this._tone({ freq: 587, duration: 0.18, type: 'triangle', gain: 0.06, startAt: 0.0, rampTo: 784 });
  }

  playCharacterSelect() {
    // Triumphant 3-note fanfare.
    this._tone({ freq: 523, duration: 0.08, type: 'square', gain: 0.12, startAt: 0.0, rampTo: 659 });
    this._tone({ freq: 659, duration: 0.10, type: 'square', gain: 0.10, startAt: 0.06, rampTo: 784 });
    this._tone({ freq: 784, duration: 0.14, type: 'triangle', gain: 0.09, startAt: 0.12, rampTo: 1046 });
  }

  playChallengeComplete() {
    this._tone({ freq: 392, duration: 0.1, type: 'square', gain: 0.11, startAt: 0.0, rampTo: 523 });
    this._tone({ freq: 523, duration: 0.12, type: 'square', gain: 0.1, startAt: 0.08, rampTo: 659 });
    this._tone({ freq: 659, duration: 0.16, type: 'triangle', gain: 0.1, startAt: 0.16, rampTo: 784 });
    this._tone({ freq: 784, duration: 0.2, type: 'triangle', gain: 0.08, startAt: 0.28, rampTo: 988 });
  }
}

