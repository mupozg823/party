import { Button } from '../ui/Button.js';
import { hexToRgba } from '../utils/helpers.js';

export class HowToPlayScene {
  constructor(game) {
    this.game = game;
    this.backBtn = null;
    this.scrollY = 0;
  }

  enter() {
    this.scrollY = 0;
    this.backBtn = new Button(540, 620, 200, 50, '돌아가기', {
      color: '#6C5CE7',
      fontSize: 20,
      onClick: () => this.game.scenes.switchTo('menu')
    });
  }

  update(dt) {
    this.backBtn.update(this.game.input, this.game.audio);
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#1a1a2e', '#16213e']);

    canvas.drawText('📖 게임 방법', 640, 40, {
      color: '#FFD93D',
      font: 'bold 36px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    const sections = [
      { title: '🎲 기본 규칙', text: '주사위를 굴려 보드 위를 이동하세요. 스타를 가장 많이 모은 플레이어가 승리!' },
      { title: '🔵 칸 효과', text: 'Blue(+3 코인) / Red(-3 코인) / Star(★ 구매) / Event(랜덤 이벤트) / Shop(아이템 구매)' },
      { title: '⭐ 스타 획득', text: 'Star 칸에 도착하면 20 코인으로 스타를 구매할 수 있습니다.' },
      { title: '🎮 미니게임', text: '매 라운드 종료 후 미니게임이 시작됩니다. 승리하면 코인을 획득!' },
      { title: '🏆 승리 조건', text: '모든 라운드 종료 후 스타 수 → 코인 수 순으로 순위를 결정합니다.' },
    ];

    sections.forEach((s, i) => {
      const y = 100 + i * 100;
      canvas.drawRect(200, y, 880, 80, hexToRgba('#ffffff', 0.05), 10);
      canvas.drawText(s.title, 230, y + 18, {
        color: '#FFD93D',
        font: 'bold 18px sans-serif'
      });
      canvas.drawText(s.text, 230, y + 48, {
        color: '#ccc',
        font: '15px sans-serif',
        maxWidth: 840
      });
    });

    this.backBtn.render(canvas);
  }

  exit() {}
}
