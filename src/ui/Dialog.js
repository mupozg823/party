import { hexToRgba } from '../utils/helpers.js';
import { Button } from './Button.js';

export class Dialog {
  constructor() {
    this.active = false;
    this.title = '';
    this.message = '';
    this.buttons = [];
    this.alpha = 0;
    this.onClose = null;
  }

  show(title, message, buttonConfigs = [{ text: '확인', onClick: null }]) {
    this.active = true;
    this.title = title;
    this.message = message;
    this.alpha = 0;

    const dialogW = 400;
    const dialogH = 250;
    const dialogX = 640 - dialogW / 2;
    const dialogY = 360 - dialogH / 2;
    const btnWidth = 120;
    const btnGap = 20;
    const totalBtnWidth = buttonConfigs.length * btnWidth + (buttonConfigs.length - 1) * btnGap;
    const btnStartX = dialogX + (dialogW - totalBtnWidth) / 2;

    this.buttons = buttonConfigs.map((cfg, i) => new Button(
      btnStartX + i * (btnWidth + btnGap),
      dialogY + dialogH - 70,
      btnWidth, 44,
      cfg.text,
      {
        color: cfg.color || '#6C5CE7',
        onClick: () => {
          this.active = false;
          if (cfg.onClick) cfg.onClick();
          if (this.onClose) this.onClose();
        }
      }
    ));
  }

  update(input, audio) {
    if (!this.active) return;
    this.alpha = Math.min(1, this.alpha + 0.08);
    this.buttons.forEach(b => b.update(input, audio));
  }

  render(canvas) {
    if (!this.active) return;

    canvas.setAlpha(this.alpha * 0.6);
    canvas.drawRect(0, 0, canvas.width, canvas.height, '#000');
    canvas.resetAlpha();

    canvas.setAlpha(this.alpha);
    const w = 400, h = 250;
    const x = 640 - w / 2, y = 360 - h / 2;

    canvas.drawRect(x, y, w, h, hexToRgba('#2d2d44', 0.95), 16);
    canvas.drawRectStroke(x, y, w, h, '#6C5CE7', 2, 16);

    canvas.drawText(this.title, 640, y + 35, {
      color: '#FFD93D',
      font: 'bold 24px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    const lines = this.message.split('\n');
    lines.forEach((line, i) => {
      canvas.drawText(line, 640, y + 80 + i * 28, {
        color: '#ddd',
        font: '16px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    });

    this.buttons.forEach(b => b.render(canvas));
    canvas.resetAlpha();
  }

  get isActive() {
    return this.active;
  }
}
