export class Canvas {
  constructor(canvasId, width = 1280, height = 720) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
  }

  clear(color = '#1a1a2e') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawRect(x, y, w, h, color, radius = 0) {
    this.ctx.fillStyle = color;
    if (radius > 0) {
      this.roundRect(x, y, w, h, radius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(x, y, w, h);
    }
  }

  drawRectStroke(x, y, w, h, color, lineWidth = 2, radius = 0) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    if (radius > 0) {
      this.roundRect(x, y, w, h, radius);
      this.ctx.stroke();
    } else {
      this.ctx.strokeRect(x, y, w, h);
    }
  }

  drawCircle(x, y, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawCircleStroke(x, y, r, color, lineWidth = 2) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawText(text, x, y, {
    color = '#ffffff',
    font = '16px sans-serif',
    align = 'left',
    baseline = 'top',
    maxWidth = undefined,
    shadow = false,
    shadowColor = 'rgba(0,0,0,0.5)',
    shadowBlur = 4
  } = {}) {
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    if (shadow) {
      this.ctx.shadowColor = shadowColor;
      this.ctx.shadowBlur = shadowBlur;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y, maxWidth);
    if (shadow) {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    }
  }

  drawLine(x1, y1, x2, y2, color, lineWidth = 2) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawPath(points, color, lineWidth = 2, closed = false) {
    if (points.length < 2) return;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    if (closed) this.ctx.closePath();
    this.ctx.stroke();
  }

  drawGradientRect(x, y, w, h, colors, vertical = true) {
    const gradient = vertical
      ? this.ctx.createLinearGradient(x, y, x, y + h)
      : this.ctx.createLinearGradient(x, y, x + w, y);
    colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);
  }

  drawImage(img, x, y, w, h) {
    this.ctx.drawImage(img, x, y, w, h);
  }

  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  save() { this.ctx.save(); }
  restore() { this.ctx.restore(); }

  setAlpha(alpha) { this.ctx.globalAlpha = alpha; }
  resetAlpha() { this.ctx.globalAlpha = 1; }
}
