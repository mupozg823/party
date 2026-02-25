import { PLAYER_KEYS } from '../game/constants.js';

export class ButtonMashGame {
  constructor(players, container) {
    this.players = players;
    this.container = container;
    this.scores = players.map(() => 0);
    this.duration = 8000;
    this.startTime = null;
    this.running = false;
    this.onComplete = null;
    this.keyHandler = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.running = true;
    this.startTime = Date.now();
    this.render();

    this.keyHandler = (e) => {
      if (!this.running) return;
      const key = e.key.toLowerCase();
      const idx = PLAYER_KEYS.indexOf(key);
      if (idx >= 0 && idx < this.players.length) {
        this.scores[idx]++;
        this.render();
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    this.update();
  }

  update() {
    if (!this.running) return;
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.duration - elapsed);

    this.renderTimer(remaining);

    if (remaining <= 0) {
      this.finish();
      return;
    }

    requestAnimationFrame(() => this.update());
  }

  finish() {
    this.running = false;
    document.removeEventListener('keydown', this.keyHandler);

    const rankings = this.players
      .map((p, i) => ({ playerIndex: i, score: this.scores[i] }))
      .sort((a, b) => b.score - a.score)
      .map((r) => r.playerIndex);

    if (this.onComplete) this.onComplete(rankings);
  }

  renderTimer(remaining) {
    const timerEl = this.container.querySelector('.minigame-timer');
    if (timerEl) {
      timerEl.textContent = (remaining / 1000).toFixed(1) + 's';
    }
  }

  render() {
    const maxScore = Math.max(...this.scores, 1);

    this.container.innerHTML = `
      <div class="minigame-timer">${(this.duration / 1000).toFixed(1)}s</div>
      <div class="buttonmash-game">
        <h2 style="color: var(--color-accent); font-size: 28px;">🔨 MASH IT!</h2>
        <div class="mash-scores">
          ${this.players
            .map(
              (p, i) => `
            <div class="mash-player-score">
              <div class="name" style="color: ${p.color}">${p.emoji} ${p.name}</div>
              <div class="score" style="color: ${p.color}">${this.scores[i]}</div>
              <div class="bar">
                <div class="bar-fill" style="height: ${(this.scores[i] / maxScore) * 100}%; background: ${p.color};"></div>
              </div>
              <div class="mash-key" style="border-color: ${p.color}; color: ${p.color}">
                ${PLAYER_KEYS[i].toUpperCase()}
              </div>
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
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    this.container.innerHTML = '';
  }
}
