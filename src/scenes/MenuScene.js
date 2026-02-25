import { Button } from '../ui/Button.js';
import { hexToRgba } from '../utils/helpers.js';

export class MenuScene {
  constructor(game) {
    this.game = game;
    this.buttons = [];
    this.titleY = -100;
    this.particles = [];
    this.time = 0;
  }

  enter() {
    this.titleY = -100;
    this.time = 0;
    this.particles = [];

    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        size: 2 + Math.random() * 4,
        speed: 0.3 + Math.random() * 0.8,
        color: ['#FFD93D', '#FF6B6B', '#4ECDC4', '#6C5CE7', '#FFA502'][Math.floor(Math.random() * 5)],
        angle: Math.random() * Math.PI * 2,
        wobble: Math.random() * 3
      });
    }

    this.buttons = [
      new Button(490, 380, 300, 60, '게임 시작', {
        color: '#FF6B6B',
        fontSize: 24,
        icon: '🎮',
        onClick: () => this.game.scenes.switchTo('characterSelect')
      }),
      new Button(490, 460, 300, 60, '게임 방법', {
        color: '#4ECDC4',
        fontSize: 24,
        icon: '📖',
        onClick: () => this.game.scenes.switchTo('howToPlay')
      }),
    ];

    this.game.tweens.add(this, { titleY: 150 }, 1.2, { easing: 'bounce' });
  }

  update(dt) {
    this.time += dt;
    this.buttons.forEach(b => b.update(this.game.input, this.game.audio));

    this.particles.forEach(p => {
      p.y -= p.speed;
      p.x += Math.sin(p.angle + this.time * p.wobble) * 0.5;
      if (p.y < -10) {
        p.y = 730;
        p.x = Math.random() * 1280;
      }
    });
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#1a1a2e', '#16213e', '#0f3460']);

    this.particles.forEach(p => {
      canvas.setAlpha(0.4 + Math.sin(this.time * 2 + p.angle) * 0.3);
      canvas.drawCircle(p.x, p.y, p.size, p.color);
    });
    canvas.resetAlpha();

    canvas.drawText('🎉 PARTY STARS 🎉', 640, this.titleY, {
      color: '#FFD93D',
      font: 'bold 64px sans-serif',
      align: 'center',
      baseline: 'middle',
      shadow: true,
      shadowBlur: 10
    });

    canvas.drawText('마리오 파티 스타일 보드게임', 640, this.titleY + 60, {
      color: hexToRgba('#ffffff', 0.7),
      font: '20px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    this.buttons.forEach(b => b.render(canvas));

    canvas.drawText('2-4 Players  •  Local Multiplayer', 640, 680, {
      color: hexToRgba('#ffffff', 0.3),
      font: '14px sans-serif',
      align: 'center',
      baseline: 'middle'
    });
  }

  exit() {
    this.game.tweens.clear();
  }
}
