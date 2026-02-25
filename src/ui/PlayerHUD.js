import { hexToRgba } from '../utils/helpers.js';

export class PlayerHUD {
  constructor() {
    this.panelWidth = 280;
    this.panelHeight = 80;
    this.padding = 10;
  }

  render(canvas, players, currentPlayerIndex, round, totalRounds) {
    this.renderRoundInfo(canvas, round, totalRounds);
    players.forEach((player, i) => {
      this.renderPlayerPanel(canvas, player, i, i === currentPlayerIndex);
    });
  }

  renderRoundInfo(canvas, round, totalRounds) {
    canvas.drawRect(10, 10, 200, 40, hexToRgba('#000000', 0.6), 8);
    canvas.drawText(`라운드 ${round} / ${totalRounds}`, 110, 30, {
      color: '#FFD93D',
      font: 'bold 18px sans-serif',
      align: 'center',
      baseline: 'middle'
    });
  }

  renderPlayerPanel(canvas, player, index, isActive) {
    const x = 10;
    const y = 60 + index * (this.panelHeight + 8);
    const w = this.panelWidth;
    const h = this.panelHeight;

    canvas.drawRect(x, y, w, h, hexToRgba('#000000', 0.5), 10);
    if (isActive) {
      canvas.drawRectStroke(x, y, w, h, '#FFD93D', 3, 10);
    }

    canvas.drawCircle(x + 35, y + h / 2, 22, player.color);
    canvas.drawText(player.name[0], x + 35, y + h / 2, {
      color: '#fff',
      font: 'bold 18px sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    canvas.drawText(player.name, x + 65, y + 14, {
      color: '#fff',
      font: 'bold 14px sans-serif'
    });

    canvas.drawText(`⭐ ${player.stars}`, x + 65, y + 35, {
      color: '#FFD93D',
      font: 'bold 16px sans-serif'
    });

    canvas.drawText(`🪙 ${player.coins}`, x + 130, y + 35, {
      color: '#FFA502',
      font: 'bold 16px sans-serif'
    });

    if (player.items.length > 0) {
      canvas.drawText(`📦 ${player.items.length}`, x + 200, y + 35, {
        color: '#A8E6CF',
        font: '14px sans-serif'
      });
    }

    if (isActive) {
      canvas.drawText('▶', x + w - 25, y + h / 2, {
        color: '#FFD93D',
        font: 'bold 18px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }
  }
}
