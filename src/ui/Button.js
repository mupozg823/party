import { hexToRgba, lightenColor } from '../utils/helpers.js';

export class Button {
  constructor(x, y, width, height, text, {
    color = '#6C5CE7',
    hoverColor = null,
    textColor = '#FFFFFF',
    fontSize = 20,
    radius = 12,
    onClick = null,
    disabled = false,
    icon = ''
  } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.color = color;
    this.hoverColor = hoverColor || lightenColor(color, 0.2);
    this.textColor = textColor;
    this.fontSize = fontSize;
    this.radius = radius;
    this.onClick = onClick;
    this.disabled = disabled;
    this.icon = icon;
    this.hovered = false;
    this.scale = 1;
    this.targetScale = 1;
  }

  update(input, audio) {
    this.hovered = !this.disabled && input.isHoverInRect(this.x, this.y, this.width, this.height);
    this.targetScale = this.hovered ? 1.05 : 1;
    this.scale += (this.targetScale - this.scale) * 0.2;

    if (this.hovered && input.isClicked()) {
      if (audio) audio.playSfx('click');
      if (this.onClick) this.onClick();
      return true;
    }
    return false;
  }

  render(canvas) {
    const ctx = canvas.ctx;
    ctx.save();

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-cx, -cy);

    const fillColor = this.disabled ? '#555' : (this.hovered ? this.hoverColor : this.color);

    if (!this.disabled) {
      canvas.drawRect(this.x + 2, this.y + 3, this.width, this.height,
        hexToRgba('#000000', 0.3), this.radius);
    }

    canvas.drawRect(this.x, this.y, this.width, this.height, fillColor, this.radius);

    if (!this.disabled && this.hovered) {
      canvas.drawRectStroke(this.x, this.y, this.width, this.height, '#fff', 2, this.radius);
    }

    const displayText = this.icon ? `${this.icon} ${this.text}` : this.text;
    canvas.drawText(displayText, cx, cy, {
      color: this.disabled ? '#888' : this.textColor,
      font: `bold ${this.fontSize}px 'Segoe UI', sans-serif`,
      align: 'center',
      baseline: 'middle'
    });

    ctx.restore();
  }
}
