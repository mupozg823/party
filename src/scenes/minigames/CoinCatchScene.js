import { Button } from '../../ui/Button.js';
import { hexToRgba, randomInt, clamp } from '../../utils/helpers.js';

export class CoinCatchScene {
  constructor(game) {
    this.game = game;
    this.players = [];
    this.boardSceneRef = null;
    this.gameManagerRef = null;

    this.gameTime = 15;
    this.timer = 0;
    this.started = false;
    this.finished = false;
    this.countdown = 3;

    this.catchers = [];
    this.coins = [];
    this.scores = [];
    this.spawnTimer = 0;

    this.continueBtn = null;
  }

  enter(data) {
    this.players = data.players;
    this.boardSceneRef = data.boardScene;
    this.gameManagerRef = data.gameManager;

    this.timer = this.gameTime;
    this.started = false;
    this.finished = false;
    this.countdown = 3;
    this.coins = [];
    this.spawnTimer = 0;

    const areaWidth = 1280;
    const lanes = this.players.length;
    const laneWidth = areaWidth / lanes;

    this.catchers = this.players.map((p, i) => ({
      x: laneWidth * i + laneWidth / 2,
      y: 620,
      width: 60,
      height: 20,
      speed: 400,
      color: p.color,
      laneLeft: laneWidth * i + 30,
      laneRight: laneWidth * (i + 1) - 30,
      name: p.name,
      playerIndex: i
    }));

    this.scores = this.players.map(() => 0);

    this.continueBtn = new Button(540, 500, 200, 50, '계속하기', {
      color: '#6C5CE7',
      fontSize: 20,
      onClick: () => this.endMinigame()
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
      this.game.audio.playSfx('minigameStart');
    }

    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0;
      this.finished = true;
      this.game.audio.playSfx('win');
      return;
    }

    this.updateCatchers(dt);
    this.updateCoins(dt);
    this.spawnCoins(dt);
    this.checkCollisions();
  }

  updateCatchers(dt) {
    this.catchers.forEach((c, i) => {
      const keys = this.getPlayerKeys(i);
      if (this.game.input.isKeyDown(keys.left)) {
        c.x -= c.speed * dt;
      }
      if (this.game.input.isKeyDown(keys.right)) {
        c.x += c.speed * dt;
      }
      c.x = clamp(c.x, c.laneLeft, c.laneRight);
    });
  }

  getPlayerKeys(playerIndex) {
    const keyMaps = [
      { left: 'a', right: 'd' },
      { left: 'ArrowLeft', right: 'ArrowRight' },
      { left: 'j', right: 'l' },
      { left: '4', right: '6' },
    ];
    return keyMaps[playerIndex] || keyMaps[0];
  }

  spawnCoins(dt) {
    this.spawnTimer += dt;
    const spawnRate = 0.3;
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;
      this.catchers.forEach(c => {
        if (Math.random() < 0.6) {
          const isBomb = Math.random() < 0.15;
          this.coins.push({
            x: randomInt(c.laneLeft, c.laneRight),
            y: -20,
            size: isBomb ? 12 : 10,
            speed: 150 + Math.random() * 100,
            type: isBomb ? 'bomb' : (Math.random() < 0.1 ? 'gold' : 'normal'),
            lane: this.catchers.indexOf(c)
          });
        }
      });
    }
  }

  updateCoins(dt) {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      this.coins[i].y += this.coins[i].speed * dt;
      if (this.coins[i].y > 720) {
        this.coins.splice(i, 1);
      }
    }
  }

  checkCollisions() {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      const catcher = this.catchers[coin.lane];
      if (!catcher) continue;

      if (coin.y + coin.size >= catcher.y &&
          coin.x >= catcher.x - catcher.width / 2 &&
          coin.x <= catcher.x + catcher.width / 2) {
        if (coin.type === 'bomb') {
          this.scores[coin.lane] = Math.max(0, this.scores[coin.lane] - 3);
          this.game.audio.playSfx('negative');
        } else {
          const value = coin.type === 'gold' ? 3 : 1;
          this.scores[coin.lane] += value;
          this.game.audio.playSfx('coin');
        }
        this.coins.splice(i, 1);
      }
    }
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#2d1b69', '#1a1a2e']);

    canvas.drawText('🪙 코인 캐치!', 640, 25, {
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
      this.renderKeyGuide(canvas);
      return;
    }

    const laneWidth = 1280 / this.catchers.length;
    for (let i = 1; i < this.catchers.length; i++) {
      canvas.drawLine(laneWidth * i, 60, laneWidth * i, 680,
        hexToRgba('#fff', 0.1), 1);
    }

    this.catchers.forEach((c, i) => {
      canvas.drawText(`${c.name}: ${this.scores[i]}`, c.laneLeft + (c.laneRight - c.laneLeft) / 2, 55, {
        color: c.color,
        font: 'bold 16px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    });

    this.coins.forEach(coin => {
      if (coin.type === 'bomb') {
        canvas.drawCircle(coin.x, coin.y, coin.size, '#333');
        canvas.drawText('💣', coin.x, coin.y, {
          font: '16px sans-serif',
          align: 'center',
          baseline: 'middle'
        });
      } else {
        const color = coin.type === 'gold' ? '#FFD93D' : '#FFA502';
        canvas.drawCircle(coin.x, coin.y, coin.size, color);
        canvas.drawCircleStroke(coin.x, coin.y, coin.size, '#fff', 1);
      }
    });

    this.catchers.forEach(c => {
      canvas.drawRect(c.x - c.width / 2, c.y, c.width, c.height, c.color, 6);
      canvas.drawRectStroke(c.x - c.width / 2, c.y, c.width, c.height, '#fff', 2, 6);
    });

    canvas.drawRect(540, 680, 200, 30, hexToRgba('#000', 0.5), 6);
    canvas.drawRect(540, 680, 200 * (this.timer / this.gameTime), 30, '#4ECDC4', 6);
    canvas.drawText(`${Math.ceil(this.timer)}s`, 640, 695, {
      color: '#fff',
      font: 'bold 14px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    if (this.finished) {
      this.renderResults(canvas);
    }
  }

  renderKeyGuide(canvas) {
    const keys = [
      { label: 'P1: A / D', y: 500 },
      { label: 'P2: ← / →', y: 530 },
      { label: 'P3: J / L', y: 560 },
      { label: 'P4: 4 / 6', y: 590 },
    ];
    keys.slice(0, this.players.length).forEach(k => {
      canvas.drawText(k.label, 640, k.y, {
        color: '#aaa',
        font: '16px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    });
  }

  renderResults(canvas) {
    canvas.setAlpha(0.7);
    canvas.drawRect(0, 0, 1280, 720, '#000');
    canvas.resetAlpha();

    canvas.drawText('🏆 결과!', 640, 200, {
      color: '#FFD93D',
      font: 'bold 40px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    const sorted = this.scores
      .map((s, i) => ({ score: s, index: i, name: this.players[i].name, color: this.players[i].color }))
      .sort((a, b) => b.score - a.score);

    sorted.forEach((s, i) => {
      const y = 280 + i * 50;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      canvas.drawText(`${medal} ${s.name}: ${s.score}점 → +${this.getReward(i)} 코인`, 640, y, {
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
