const CARD_EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🫐', '🍌', '🥭', '🍍'];

export class MemoryGame {
  constructor(players, container) {
    this.players = players;
    this.container = container;
    this.scores = players.map(() => 0);
    this.currentPlayer = 0;
    this.cards = [];
    this.flipped = [];
    this.matched = new Set();
    this.canFlip = true;
    this.running = false;
    this.onComplete = null;
    this.pairCount = Math.min(8, 4 + players.length);
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.running = true;
    this.createCards();
    this.render();
  }

  createCards() {
    const selected = CARD_EMOJIS.slice(0, this.pairCount);
    const pairs = [...selected, ...selected];

    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    this.cards = pairs.map((emoji, i) => ({
      id: i,
      emoji,
      flipped: false,
      matched: false,
    }));
  }

  handleCardClick(cardId) {
    if (!this.canFlip || !this.running) return;
    const card = this.cards[cardId];
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    this.flipped.push(cardId);
    this.render();

    if (this.flipped.length === 2) {
      this.canFlip = false;
      const [a, b] = this.flipped;
      const cardA = this.cards[a];
      const cardB = this.cards[b];

      if (cardA.emoji === cardB.emoji) {
        cardA.matched = true;
        cardB.matched = true;
        this.matched.add(a);
        this.matched.add(b);
        this.scores[this.currentPlayer]++;
        this.flipped = [];
        this.canFlip = true;
        this.render();

        if (this.matched.size === this.cards.length) {
          setTimeout(() => this.finish(), 800);
        }
      } else {
        setTimeout(() => {
          cardA.flipped = false;
          cardB.flipped = false;
          this.flipped = [];
          this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
          this.canFlip = true;
          this.render();
        }, 1000);
      }
    }
  }

  finish() {
    this.running = false;
    const rankings = this.players
      .map((p, i) => ({ playerIndex: i, score: this.scores[i] }))
      .sort((a, b) => b.score - a.score)
      .map((r) => r.playerIndex);

    if (this.onComplete) this.onComplete(rankings);
  }

  render() {
    const cols = Math.ceil(Math.sqrt(this.cards.length));
    const p = this.players[this.currentPlayer];

    this.container.innerHTML = `
      <div class="memory-game">
        <h2 style="color: var(--color-accent); font-size: 28px;">🧠 Memory Match!</h2>
        <div class="memory-current-player" style="color: ${p.color};">
          ${p.emoji} ${p.name}'s turn
        </div>
        <div class="memory-grid" style="grid-template-columns: repeat(${cols}, 80px);">
          ${this.cards
            .map(
              (card) => `
            <div class="memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}"
                 data-card-id="${card.id}">
              <div class="front"></div>
              <div class="back">${card.emoji}</div>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="memory-scores">
          ${this.players
            .map(
              (pl, i) => `
            <div class="memory-player-score ${i === this.currentPlayer ? 'active' : ''}">
              <span style="color: ${pl.color}">${pl.emoji} ${pl.name}</span>: ${this.scores[i]} pairs
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    const cardEls = this.container.querySelectorAll('.memory-card');
    cardEls.forEach((el) => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.cardId, 10);
        this.handleCardClick(id);
      });
    });
  }

  destroy() {
    this.running = false;
    this.container.innerHTML = '';
  }
}
