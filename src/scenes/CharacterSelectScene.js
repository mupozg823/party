import { CHARACTERS } from '../data/characters.js';
import { Button } from '../ui/Button.js';
import { hexToRgba } from '../utils/helpers.js';

export class CharacterSelectScene {
  constructor(game) {
    this.game = game;
    this.playerCount = 2;
    this.selectedCharacters = [];
    this.currentSelector = 0;
    this.roundCount = 10;
    this.startBtn = null;
    this.backBtn = null;
    this.playerCountBtns = [];
    this.roundBtns = [];
    this.time = 0;
  }

  enter() {
    this.playerCount = 2;
    this.selectedCharacters = [];
    this.currentSelector = 0;
    this.roundCount = 10;
    this.time = 0;
    this.buildUI();
  }

  buildUI() {
    this.backBtn = new Button(30, 660, 120, 40, '← 뒤로', {
      color: '#555',
      fontSize: 16,
      onClick: () => this.game.scenes.switchTo('menu')
    });

    this.startBtn = new Button(540, 640, 200, 50, '게임 시작!', {
      color: '#FF6B6B',
      fontSize: 22,
      icon: '🚀',
      disabled: true,
      onClick: () => this.startGame()
    });

    this.playerCountBtns = [2, 3, 4].map((count, i) =>
      new Button(440 + i * 140, 70, 120, 44, `${count}명`, {
        color: this.playerCount === count ? '#6C5CE7' : '#444',
        fontSize: 18,
        onClick: () => {
          this.playerCount = count;
          this.selectedCharacters = [];
          this.currentSelector = 0;
          this.buildUI();
        }
      })
    );

    this.roundBtns = [10, 15, 20].map((r, i) =>
      new Button(440 + i * 140, 560, 120, 40, `${r}라운드`, {
        color: this.roundCount === r ? '#4ECDC4' : '#444',
        fontSize: 16,
        onClick: () => {
          this.roundCount = r;
          this.buildUI();
        }
      })
    );
  }

  update(dt) {
    this.time += dt;
    this.backBtn.update(this.game.input, this.game.audio);
    this.startBtn.update(this.game.input, this.game.audio);
    this.playerCountBtns.forEach(b => b.update(this.game.input, this.game.audio));
    this.roundBtns.forEach(b => b.update(this.game.input, this.game.audio));

    CHARACTERS.forEach((char, i) => {
      const x = 200 + i * 230;
      const y = 200;
      const w = 200;
      const h = 280;

      const alreadySelected = this.selectedCharacters.includes(char.id);
      if (!alreadySelected && this.currentSelector < this.playerCount) {
        if (this.game.input.isClickInRect(x, y, w, h)) {
          this.game.audio.playSfx('select');
          this.selectedCharacters.push(char.id);
          this.currentSelector++;
          this.startBtn.disabled = this.currentSelector < this.playerCount;
        }
      }
    });
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#1a1a2e', '#16213e', '#0f3460']);

    canvas.drawText('캐릭터 선택', 640, 30, {
      color: '#FFD93D',
      font: 'bold 32px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    canvas.drawText('인원수:', 370, 92, {
      color: '#aaa',
      font: '16px sans-serif',
      align: 'right',
      baseline: 'middle'
    });
    this.playerCountBtns.forEach(b => b.render(canvas));

    if (this.currentSelector < this.playerCount) {
      canvas.drawText(`플레이어 ${this.currentSelector + 1}, 캐릭터를 선택하세요!`, 640, 160, {
        color: '#fff',
        font: 'bold 20px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    } else {
      canvas.drawText('모든 플레이어가 선택 완료!', 640, 160, {
        color: '#2ED573',
        font: 'bold 20px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    CHARACTERS.forEach((char, i) => {
      const x = 200 + i * 230;
      const y = 200;
      const w = 200;
      const h = 280;

      const selectedIndex = this.selectedCharacters.indexOf(char.id);
      const isSelected = selectedIndex !== -1;
      const isHovered = this.game.input.isHoverInRect(x, y, w, h);

      canvas.drawRect(x, y, w, h,
        isSelected ? hexToRgba(char.color, 0.3) : hexToRgba('#ffffff', isHovered ? 0.1 : 0.05),
        16);

      if (isSelected) {
        canvas.drawRectStroke(x, y, w, h, char.color, 3, 16);
      }

      const bobY = Math.sin(this.time * 2 + i) * 5;
      canvas.drawCircle(x + w / 2, y + 80 + bobY, 45, char.color);
      canvas.drawCircle(x + w / 2, y + 80 + bobY, 38, char.secondaryColor);
      canvas.drawText(char.name[0], x + w / 2, y + 80 + bobY, {
        color: '#fff',
        font: 'bold 32px sans-serif',
        align: 'center',
        baseline: 'middle'
      });

      canvas.drawText(char.name, x + w / 2, y + 150, {
        color: '#fff',
        font: 'bold 20px sans-serif',
        align: 'center',
        baseline: 'middle'
      });

      canvas.drawText(char.description, x + w / 2, y + 180, {
        color: '#aaa',
        font: '14px sans-serif',
        align: 'center',
        baseline: 'middle'
      });

      if (isSelected) {
        canvas.drawRect(x + w / 2 - 40, y + h - 50, 80, 30,
          hexToRgba(char.color, 0.8), 8);
        canvas.drawText(`P${selectedIndex + 1}`, x + w / 2, y + h - 35, {
          color: '#fff',
          font: 'bold 16px sans-serif',
          align: 'center',
          baseline: 'middle'
        });
      }
    });

    canvas.drawText('라운드:', 370, 580, {
      color: '#aaa',
      font: '16px sans-serif',
      align: 'right',
      baseline: 'middle'
    });
    this.roundBtns.forEach(b => b.render(canvas));

    this.startBtn.render(canvas);
    this.backBtn.render(canvas);
  }

  startGame() {
    const playerConfigs = this.selectedCharacters.map((charId, i) => {
      const character = CHARACTERS.find(c => c.id === charId);
      return {
        name: `Player ${i + 1}`,
        character,
        isHuman: true
      };
    });

    this.game.scenes.switchTo('board', {
      players: playerConfigs,
      rounds: this.roundCount
    });
  }

  exit() {}
}
