import { PLAYER_KEYS } from '../game/constants.js';

export class TimingGame {
  constructor(players, container) {
    this.players = players;
    this.container = container;
    this.results = players.map(() => null);
    this.currentPlayer = 0;
    this.needlePos = 0;
    this.needleSpeed = 3;
    this.needleDir = 1;
    this.targetStart = 240;
    this.targetWidth = 80;
    this.trackWidth = 600;
    this.running = false;
    this.onComplete = null;
    this.keyHandler = null;
    this.animFrame = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.running = true;
    this.targetStart = 200 + Math.random() * 200;
    this.targetWidth = 60 + Math.random() * 40;
    this.render();
    this.startPlayerTurn();
  }

  startPlayerTurn() {
    this.needlePos = 0;
    this.needleDir = 1;
    this.needleSpeed = 3 + this.currentPlayer * 0.5;
    this.render();

    this.keyHandler = (e) => {
      const key = e.key.toLowerCase();
      if (key === PLAYER_KEYS[this.currentPlayer] || key === ' ') {
        this.stopNeedle();
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    this.animateNeedle();
  }

  animateNeedle() {
    if (!this.running) return;

    this.needlePos += this.needleSpeed * this.needleDir;
    if (this.needlePos >= this.trackWidth || this.needlePos <= 0) {
      this.needleDir *= -1;
    }
    this.needlePos = Math.max(0, Math.min(this.trackWidth, this.needlePos));

    this.updateNeedle();
    this.animFrame = requestAnimationFrame(() => this.animateNeedle());
  }

  updateNeedle() {
    const needle = this.container.querySelector('.timing-needle');
    if (needle) {
      needle.style.left = this.needlePos + 'px';
    }
  }

  stopNeedle() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    document.removeEventListener('keydown', this.keyHandler);

    const targetCenter = this.targetStart + this.targetWidth / 2;
    const distance = Math.abs(this.needlePos - targetCenter);
    const maxDist = this.trackWidth / 2;
    const accuracy = Math.max(0, 1 - distance / maxDist);

    this.results[this.currentPlayer] = {
      position: this.needlePos,
      accuracy,
      distance,
    };

    this.render();

    this.currentPlayer++;
    if (this.currentPlayer >= this.players.length) {
      setTimeout(() => this.finish(), 1500);
    } else {
      setTimeout(() => {
        this.targetStart = 200 + Math.random() * 200;
        this.targetWidth = 60 + Math.random() * 40;
        this.startPlayerTurn();
      }, 1200);
    }
  }

  finish() {
    this.running = false;
    const rankings = this.players
      .map((p, i) => ({
        playerIndex: i,
        accuracy: this.results[i]?.accuracy || 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .map((r) => r.playerIndex);

    if (this.onComplete) this.onComplete(rankings);
  }

  getGrade(accuracy) {
    if (accuracy > 0.95) return '⭐ PERFECT!';
    if (accuracy > 0.8) return '🎯 Great!';
    if (accuracy > 0.6) return '👍 Good';
    if (accuracy > 0.3) return '😅 OK';
    return '💀 Miss';
  }

  render() {
    const p = this.players[this.currentPlayer] || this.players[this.players.length - 1];
    const isFinished = this.currentPlayer >= this.players.length;

    this.container.innerHTML = `
      <div class="timing-game">
        <h2 style="color: var(--color-accent); font-size: 28px;">🎯 Perfect Timing!</h2>
        ${
          !isFinished
            ? `
          <div style="font-size: 20px; color: ${p.color};">${p.emoji} ${p.name}'s turn - Press <strong>${PLAYER_KEYS[this.currentPlayer].toUpperCase()}</strong></div>
          <div class="timing-track">
            <div class="timing-target" style="left: ${this.targetStart}px; width: ${this.targetWidth}px;"></div>
            <div class="timing-needle" style="left: ${this.needlePos}px;"></div>
          </div>
        `
            : `
          <div style="font-size: 18px; color: var(--color-text-dim);">Results:</div>
        `
        }
        <div class="timing-results">
          ${this.players
            .map(
              (pl, i) => `
            <div class="timing-result-card" style="border: 1px solid ${this.results[i] ? pl.color : 'transparent'};">
              <div style="color: ${pl.color}">${pl.emoji} ${pl.name}</div>
              <div class="grade">${this.results[i] ? this.getGrade(this.results[i].accuracy) : '...'}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  destroy() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    this.container.innerHTML = '';
  }
}
