export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterVolume = 0.5;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.4;
  }

  init() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  ensureContext() {
    if (!this.audioCtx) this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(frequency, duration = 0.15, type = 'square', volume = 0.3) {
    this.ensureContext();
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume * this.sfxVolume * this.masterVolume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playSfx(name) {
    const sfxMap = {
      click: () => this.playTone(800, 0.08, 'square', 0.2),
      hover: () => this.playTone(600, 0.05, 'sine', 0.1),
      coin: () => {
        this.playTone(987, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(1318, 0.15, 'square', 0.2), 80);
      },
      star: () => {
        [523, 659, 784, 1047].forEach((f, i) =>
          setTimeout(() => this.playTone(f, 0.2, 'square', 0.25), i * 100));
      },
      dice: () => this.playTone(300 + Math.random() * 200, 0.06, 'square', 0.15),
      move: () => this.playTone(440, 0.08, 'sine', 0.15),
      negative: () => {
        this.playTone(300, 0.2, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.15), 150);
      },
      win: () => {
        [523, 659, 784, 1047, 1318].forEach((f, i) =>
          setTimeout(() => this.playTone(f, 0.25, 'square', 0.2), i * 120));
      },
      lose: () => {
        [400, 350, 300, 250].forEach((f, i) =>
          setTimeout(() => this.playTone(f, 0.2, 'sawtooth', 0.15), i * 150));
      },
      minigameStart: () => {
        [440, 554, 659, 880].forEach((f, i) =>
          setTimeout(() => this.playTone(f, 0.15, 'square', 0.2), i * 80));
      },
      select: () => this.playTone(660, 0.1, 'square', 0.2),
    };

    if (sfxMap[name]) sfxMap[name]();
  }
}
