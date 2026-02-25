import { Button } from '../ui/Button.js';
import { hexToRgba } from '../utils/helpers.js';

export class ResultsScene {
  constructor(game) {
    this.game = game;
    this.gm = null;
    this.standings = [];
    this.bonusStars = [];
    this.showBonus = false;
    this.showFinal = false;
    this.revealTimer = 0;
    this.time = 0;
    this.particles = [];
    this.menuBtn = null;
  }

  enter(data) {
    this.gm = data.gameManager;
    this.standings = [];
    this.bonusStars = this.gm.getBonusStars();
    this.showBonus = false;
    this.showFinal = false;
    this.revealTimer = 0;
    this.time = 0;
    this.particles = [];

    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 3,
        size: 3 + Math.random() * 5,
        color: ['#FFD93D', '#FF6B6B', '#4ECDC4', '#6C5CE7', '#FFA502'][Math.floor(Math.random() * 5)],
        life: 1
      });
    }

    this.menuBtn = new Button(540, 620, 200, 50, '메인 메뉴로', {
      color: '#6C5CE7',
      fontSize: 20,
      icon: '🏠',
      onClick: () => this.game.scenes.switchTo('menu')
    });

    this.game.audio.playSfx('win');
  }

  update(dt) {
    this.time += dt;
    this.revealTimer += dt;

    if (this.revealTimer > 2 && !this.showBonus) {
      this.showBonus = true;
      this.bonusStars.forEach(b => {
        b.player.stars++;
      });
    }

    if (this.revealTimer > 4 && !this.showFinal) {
      this.showFinal = true;
      this.standings = this.gm.getStandings();
    }

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -20) {
        p.y = 740;
        p.x = Math.random() * 1280;
      }
    });

    if (this.showFinal) {
      this.menuBtn.update(this.game.input, this.game.audio);
    }
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#1a1a2e', '#0f3460']);

    this.particles.forEach(p => {
      canvas.setAlpha(0.6);
      canvas.drawCircle(p.x, p.y, p.size, p.color);
    });
    canvas.resetAlpha();

    canvas.drawText('🏆 게임 종료!', 640, 50, {
      color: '#FFD93D',
      font: 'bold 44px sans-serif',
      align: 'center',
      baseline: 'middle',
      shadow: true,
      shadowBlur: 10
    });

    if (this.showBonus && !this.showFinal) {
      canvas.drawText('보너스 스타 발표!', 640, 130, {
        color: '#FFD93D',
        font: 'bold 24px sans-serif',
        align: 'center',
        baseline: 'middle'
      });

      this.bonusStars.forEach((b, i) => {
        const y = 200 + i * 60;
        canvas.drawRect(340, y - 20, 600, 50, hexToRgba('#ffffff', 0.08), 10);
        canvas.drawText(`⭐ ${b.title}: ${b.player.name}`, 640, y + 5, {
          color: b.player.color,
          font: 'bold 20px sans-serif',
          align: 'center',
          baseline: 'middle'
        });
      });
    }

    if (this.showFinal) {
      canvas.drawText('최종 순위', 640, 120, {
        color: '#fff',
        font: 'bold 28px sans-serif',
        align: 'center',
        baseline: 'middle'
      });

      this.standings.forEach((player, i) => {
        const y = 200 + i * 90;
        const medals = ['🥇', '🥈', '🥉', '4️⃣'];
        const isWinner = i === 0;

        canvas.drawRect(340, y - 10, 600, 75,
          hexToRgba(player.color, isWinner ? 0.3 : 0.1), 12);

        if (isWinner) {
          canvas.drawRectStroke(340, y - 10, 600, 75, '#FFD93D', 3, 12);
        }

        canvas.drawText(medals[i], 380, y + 28, {
          font: '36px sans-serif',
          align: 'center',
          baseline: 'middle'
        });

        canvas.drawCircle(440, y + 28, 24, player.color);
        canvas.drawText(player.name[0], 440, y + 28, {
          color: '#fff',
          font: 'bold 18px sans-serif',
          align: 'center',
          baseline: 'middle'
        });

        canvas.drawText(player.name, 490, y + 12, {
          color: '#fff',
          font: `bold ${isWinner ? 22 : 18}px sans-serif`
        });

        canvas.drawText(`⭐ ${player.stars}  🪙 ${player.coins}`, 490, y + 40, {
          color: '#ccc',
          font: '16px sans-serif'
        });

        if (isWinner) {
          canvas.drawText('👑 WINNER!', 860, y + 28, {
            color: '#FFD93D',
            font: 'bold 22px sans-serif',
            align: 'center',
            baseline: 'middle'
          });
        }
      });

      this.menuBtn.render(canvas);
    }
  }

  exit() {}
}
