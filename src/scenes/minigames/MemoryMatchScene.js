import { Button } from '../../ui/Button.js';
import { hexToRgba, shuffle } from '../../utils/helpers.js';

const CARD_SYMBOLS = ['🌟', '🎈', '🎀', '🍎', '🌈', '⚡', '🔥', '💎'];

export class MemoryMatchScene {
  constructor(game) {
    this.game = game;
    this.players = [];
    this.boardSceneRef = null;
    this.gameManagerRef = null;

    this.cards = [];
    this.flipped = [];
    this.matched = [];
    this.currentPlayer = 0;
    this.scores = [];
    this.canFlip = true;
    this.finished = false;
    this.countdown = 3;
    this.started = false;
    this.flipBackTimer = 0;
    this.peekTimer = 2;
    this.peeking = true;

    this.continueBtn = null;
  }

  enter(data) {
    this.players = data.players;
    this.boardSceneRef = data.boardScene;
    this.gameManagerRef = data.gameManager;

    this.scores = this.players.map(() => 0);
    this.currentPlayer = 0;
    this.finished = false;
    this.countdown = 3;
    this.started = false;
    this.flipped = [];
    this.matched = [];
    this.canFlip = true;
    this.flipBackTimer = 0;
    this.peeking = true;
    this.peekTimer = 2;

    this.initCards();

    this.continueBtn = new Button(540, 550, 200, 50, '계속하기', {
      color: '#6C5CE7',
      fontSize: 20,
      onClick: () => this.endMinigame()
    });
  }

  initCards() {
    const pairs = 8;
    const symbols = CARD_SYMBOLS.slice(0, pairs);
    const deck = shuffle([...symbols, ...symbols]);

    this.cards = deck.map((symbol, i) => ({
      id: i,
      symbol,
      x: 0,
      y: 0,
      width: 90,
      height: 110,
      faceUp: false
    }));

    const cols = 4;
    const rows = 4;
    const startX = 640 - (cols * 100) / 2;
    const startY = 200;

    this.cards.forEach((card, i) => {
      card.x = startX + (i % cols) * 100 + 5;
      card.y = startY + Math.floor(i / cols) * 120 + 5;
    });
  }

  update(dt) {
    if (this.finished) {
      this.continueBtn.update(this.game.input, this.game.audio);
      return;
    }

    if (this.countdown > 0) {
      this.countdown -= dt;
      return;
    }

    if (!this.started) {
      this.started = true;
    }

    if (this.peeking) {
      this.peekTimer -= dt;
      if (this.peekTimer <= 0) {
        this.peeking = false;
      }
      return;
    }

    if (this.flipBackTimer > 0) {
      this.flipBackTimer -= dt;
      if (this.flipBackTimer <= 0) {
        this.flipped.forEach(id => {
          const card = this.cards.find(c => c.id === id);
          if (card) card.faceUp = false;
        });
        this.flipped = [];
        this.canFlip = true;
        this.nextPlayer();
      }
      return;
    }

    if (this.canFlip && this.game.input.isClicked()) {
      const { x: mx, y: my } = this.game.input.mouse;
      for (const card of this.cards) {
        if (this.matched.includes(card.id)) continue;
        if (this.flipped.includes(card.id)) continue;

        if (mx >= card.x && mx <= card.x + card.width &&
            my >= card.y && my <= card.y + card.height) {
          this.flipCard(card);
          break;
        }
      }
    }
  }

  flipCard(card) {
    card.faceUp = true;
    this.flipped.push(card.id);
    this.game.audio.playSfx('click');

    if (this.flipped.length === 2) {
      this.canFlip = false;
      const card1 = this.cards.find(c => c.id === this.flipped[0]);
      const card2 = this.cards.find(c => c.id === this.flipped[1]);

      if (card1.symbol === card2.symbol) {
        this.matched.push(card1.id, card2.id);
        this.scores[this.currentPlayer]++;
        this.game.audio.playSfx('coin');
        this.flipped = [];
        this.canFlip = true;

        if (this.matched.length === this.cards.length) {
          this.finished = true;
          this.game.audio.playSfx('win');
        }
      } else {
        this.flipBackTimer = 1;
      }
    }
  }

  nextPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#1a3a2e', '#1a1a2e']);

    canvas.drawText('🃏 메모리 매치!', 640, 30, {
      color: '#FFD93D',
      font: 'bold 28px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    if (this.countdown > 0) {
      canvas.drawText(Math.ceil(this.countdown).toString(), 640, 360, {
        color: '#FFD93D',
        font: 'bold 120px sans-serif',
        align: 'center',
        baseline: 'middle',
        shadow: true
      });
      return;
    }

    this.players.forEach((p, i) => {
      const x = 100 + i * 100;
      const isActive = i === this.currentPlayer && !this.finished;
      canvas.drawRect(x - 40, 65, 80, 70, hexToRgba(p.color, isActive ? 0.4 : 0.15), 8);
      if (isActive) {
        canvas.drawRectStroke(x - 40, 65, 80, 70, p.color, 2, 8);
      }
      canvas.drawText(p.name, x, 82, {
        color: p.color,
        font: `${isActive ? 'bold ' : ''}14px sans-serif`,
        align: 'center',
        baseline: 'middle'
      });
      canvas.drawText(`${this.scores[i]} 쌍`, x, 112, {
        color: '#fff',
        font: 'bold 18px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    });

    if (!this.finished && !this.peeking) {
      canvas.drawText(`${this.players[this.currentPlayer].name}의 차례!`, 640, 160, {
        color: this.players[this.currentPlayer].color,
        font: 'bold 18px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    if (this.peeking) {
      canvas.drawText('카드를 외우세요!', 640, 160, {
        color: '#FFD93D',
        font: 'bold 20px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    this.cards.forEach(card => {
      const isMatched = this.matched.includes(card.id);
      const showFace = card.faceUp || this.peeking || isMatched;

      if (isMatched) {
        canvas.setAlpha(0.4);
      }

      canvas.drawRect(card.x, card.y, card.width, card.height,
        showFace ? '#fff' : '#6C5CE7', 10);
      canvas.drawRectStroke(card.x, card.y, card.width, card.height,
        showFace ? '#ddd' : '#8B7FE8', 2, 10);

      if (showFace) {
        canvas.drawText(card.symbol, card.x + card.width / 2, card.y + card.height / 2, {
          font: '36px sans-serif',
          align: 'center',
          baseline: 'middle'
        });
      } else {
        canvas.drawText('?', card.x + card.width / 2, card.y + card.height / 2, {
          color: '#fff',
          font: 'bold 28px sans-serif',
          align: 'center',
          baseline: 'middle'
        });
      }

      if (isMatched) {
        canvas.resetAlpha();
      }
    });

    if (this.finished) {
      this.renderResults(canvas);
    }
  }

  renderResults(canvas) {
    canvas.setAlpha(0.7);
    canvas.drawRect(0, 0, 1280, 720, '#000');
    canvas.resetAlpha();

    canvas.drawText('🏆 결과!', 640, 250, {
      color: '#FFD93D',
      font: 'bold 40px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    const sorted = this.scores
      .map((s, i) => ({ score: s, index: i, name: this.players[i].name, color: this.players[i].color }))
      .sort((a, b) => b.score - a.score);

    sorted.forEach((s, i) => {
      const y = 320 + i * 45;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      canvas.drawText(`${medal} ${s.name}: ${s.score}쌍 → +${this.getReward(i)} 코인`, 640, y, {
        color: s.color,
        font: `${i === 0 ? 'bold ' : ''}20px sans-serif`,
        align: 'center',
        baseline: 'middle'
      });
    });

    this.continueBtn.render(canvas);
  }

  getReward(rank) {
    return [10, 5, 3, 1][rank] || 1;
  }

  endMinigame() {
    const sorted = this.scores
      .map((s, i) => ({ score: s, index: i }))
      .sort((a, b) => b.score - a.score);

    const results = sorted.map((s, rank) => ({
      playerIndex: s.index,
      coins: this.getReward(rank),
      winner: rank === 0
    }));

    this.game.scenes.switchTo('board');
    setTimeout(() => {
      this.boardSceneRef.onMinigameComplete(results);
    }, 100);
  }

  exit() {}
}
