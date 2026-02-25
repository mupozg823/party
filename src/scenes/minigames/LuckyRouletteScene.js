import { Button } from '../../ui/Button.js';
import { hexToRgba, randomInt } from '../../utils/helpers.js';

const ROULETTE_SEGMENTS = [
  { value: 1, label: '1', color: '#FF6B6B' },
  { value: 3, label: '3', color: '#4ECDC4' },
  { value: 5, label: '5', color: '#FFD93D' },
  { value: 2, label: '2', color: '#6C5CE7' },
  { value: 10, label: '10', color: '#FF6B6B' },
  { value: 1, label: '1', color: '#4ECDC4' },
  { value: 7, label: '7', color: '#FFD93D' },
  { value: 0, label: '0', color: '#333' },
  { value: 3, label: '3', color: '#6C5CE7' },
  { value: 15, label: '15', color: '#FF6B6B' },
  { value: 2, label: '2', color: '#4ECDC4' },
  { value: -5, label: '-5', color: '#222' },
];

export class LuckyRouletteScene {
  constructor(game) {
    this.game = game;
    this.players = [];
    this.boardSceneRef = null;
    this.gameManagerRef = null;

    this.currentPlayer = 0;
    this.angle = 0;
    this.spinSpeed = 0;
    this.spinning = false;
    this.results = [];
    this.allDone = false;
    this.finished = false;
    this.countdown = 3;

    this.spinBtn = null;
    this.continueBtn = null;
  }

  enter(data) {
    this.players = data.players;
    this.boardSceneRef = data.boardScene;
    this.gameManagerRef = data.gameManager;

    this.currentPlayer = 0;
    this.angle = 0;
    this.spinSpeed = 0;
    this.spinning = false;
    this.results = [];
    this.allDone = false;
    this.finished = false;
    this.countdown = 3;

    this.spinBtn = new Button(540, 620, 200, 50, '🎰 스핀!', {
      color: '#FF6B6B',
      fontSize: 22,
      onClick: () => this.spin()
    });

    this.continueBtn = new Button(540, 550, 200, 50, '계속하기', {
      color: '#6C5CE7',
      fontSize: 20,
      onClick: () => this.endMinigame()
    });
  }

  spin() {
    if (this.spinning || this.allDone) return;
    this.spinning = true;
    this.spinSpeed = 8 + Math.random() * 6;
    this.game.audio.playSfx('dice');
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

    if (this.spinning) {
      this.angle += this.spinSpeed * dt;
      this.spinSpeed *= 0.985;

      if (this.spinSpeed < 0.05) {
        this.spinning = false;
        this.spinSpeed = 0;

        const segmentAngle = (Math.PI * 2) / ROULETTE_SEGMENTS.length;
        const normalizedAngle = ((this.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const segmentIndex = Math.floor(normalizedAngle / segmentAngle) % ROULETTE_SEGMENTS.length;
        const segment = ROULETTE_SEGMENTS[segmentIndex];

        this.results.push({
          playerIndex: this.currentPlayer,
          value: segment.value,
          label: segment.label
        });

        if (segment.value > 0) {
          this.game.audio.playSfx('coin');
        } else if (segment.value < 0) {
          this.game.audio.playSfx('negative');
        }

        this.currentPlayer++;
        if (this.currentPlayer >= this.players.length) {
          this.allDone = true;
          setTimeout(() => {
            this.finished = true;
            this.game.audio.playSfx('win');
          }, 1500);
        }
      }
    }

    if (!this.spinning && !this.allDone) {
      this.spinBtn.update(this.game.input, this.game.audio);
    }
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#2d1b69', '#1a1a2e']);

    canvas.drawText('🎰 럭키 룰렛!', 640, 30, {
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

    this.renderRoulette(canvas);

    if (!this.allDone && !this.spinning) {
      const cp = this.players[this.currentPlayer];
      canvas.drawText(`${cp.name}의 차례! 스핀을 눌러주세요!`, 640, 80, {
        color: cp.color,
        font: 'bold 20px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
      this.spinBtn.render(canvas);
    }

    this.renderResultsList(canvas);

    if (this.finished) {
      this.renderFinalResults(canvas);
    }
  }

  renderRoulette(canvas) {
    const cx = 640;
    const cy = 370;
    const radius = 200;
    const segments = ROULETTE_SEGMENTS.length;
    const segAngle = (Math.PI * 2) / segments;

    const ctx = canvas.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.angle);

    ROULETTE_SEGMENTS.forEach((seg, i) => {
      const startAngle = i * segAngle;
      const endAngle = startAngle + segAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      const textAngle = startAngle + segAngle / 2;
      const textR = radius * 0.65;
      ctx.save();
      ctx.translate(Math.cos(textAngle) * textR, Math.sin(textAngle) * textR);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.label, 0, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx + radius + 15, cy);
    ctx.lineTo(cx + radius + 30, cy - 12);
    ctx.lineTo(cx + radius + 30, cy + 12);
    ctx.closePath();
    ctx.fillStyle = '#FFD93D';
    ctx.fill();
  }

  renderResultsList(canvas) {
    this.results.forEach((r, i) => {
      const x = 100;
      const y = 120 + i * 40;
      const player = this.players[r.playerIndex];
      canvas.drawText(
        `${player.name}: ${r.value > 0 ? '+' : ''}${r.value} 코인`,
        x, y,
        {
          color: player.color,
          font: '16px sans-serif',
          baseline: 'middle'
        }
      );
    });
  }

  renderFinalResults(canvas) {
    canvas.setAlpha(0.7);
    canvas.drawRect(0, 0, 1280, 720, '#000');
    canvas.resetAlpha();

    canvas.drawText('🏆 결과!', 640, 220, {
      color: '#FFD93D',
      font: 'bold 40px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    const sorted = this.results
      .map(r => ({
        ...r,
        name: this.players[r.playerIndex].name,
        color: this.players[r.playerIndex].color
      }))
      .sort((a, b) => b.value - a.value);

    sorted.forEach((r, i) => {
      const y = 290 + i * 50;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      const reward = this.getReward(i);
      canvas.drawText(
        `${medal} ${r.name}: ${r.value}점 → +${reward} 코인`,
        640, y,
        {
          color: r.color,
          font: `${i === 0 ? 'bold ' : ''}20px sans-serif`,
          align: 'center',
          baseline: 'middle'
        }
      );
    });

    this.continueBtn.render(canvas);
  }

  getReward(rank) {
    return [10, 5, 3, 1][rank] || 1;
  }

  endMinigame() {
    const sorted = this.results
      .sort((a, b) => b.value - a.value);

    const results = sorted.map((r, rank) => ({
      playerIndex: r.playerIndex,
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
