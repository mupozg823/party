import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_COLORS,
  TILE_EMOJIS,
  TILE_SIZE,
  TILE_TYPES,
} from './constants.js';

export class BoardRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.particles = [];
    this.starGlow = 0;
    this.starGlowDir = 1;
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.drawStars(ctx);
  }

  drawStars(ctx) {
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const x = (Math.sin(i * 127.1 + i) * 0.5 + 0.5) * CANVAS_WIDTH;
      const y = (Math.cos(i * 311.7 + i) * 0.5 + 0.5) * CANVAS_HEIGHT;
      const size = ((Math.sin(i * 73.3) * 0.5 + 0.5) * 2 + 0.5);
      const alpha = (Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.5);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBoard(tiles, starTileId) {
    const ctx = this.ctx;
    this.starGlow += this.starGlowDir * 0.02;
    if (this.starGlow > 1 || this.starGlow < 0) this.starGlowDir *= -1;

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      for (const nextId of tile.next) {
        const next = tiles[nextId];
        if (next) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(tile.x, tile.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    for (const tile of tiles) {
      this.drawTile(ctx, tile, tile.id === starTileId);
    }
  }

  drawTile(ctx, tile, isStar) {
    const { x, y, type } = tile;
    const color = TILE_COLORS[type] || '#666';
    const size = TILE_SIZE;

    ctx.save();

    if (isStar || type === TILE_TYPES.STAR) {
      const glowSize = 15 + this.starGlow * 10;
      const glow = ctx.createRadialGradient(x, y, size * 0.5, x, y, size + glowSize);
      glow.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
      glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size + glowSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();

    const emoji = TILE_EMOJIS[type] || '?';
    ctx.font = `${size * 0.8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y + 2);

    ctx.restore();
  }

  drawPlayers(players, tiles) {
    const ctx = this.ctx;
    const playerPositions = {};

    for (const player of players) {
      const tileId = player.tileIndex;
      if (!playerPositions[tileId]) playerPositions[tileId] = [];
      playerPositions[tileId].push(player);
    }

    for (const tileId in playerPositions) {
      const group = playerPositions[tileId];
      const tile = tiles[tileId];
      if (!tile) continue;

      group.forEach((player, idx) => {
        const offsetAngle = (idx / group.length) * Math.PI * 2;
        const offsetR = group.length > 1 ? 22 : 0;
        const px = tile.x + Math.cos(offsetAngle) * offsetR;
        const py = tile.y + Math.sin(offsetAngle) * offsetR - 30;

        ctx.save();

        ctx.shadowColor = player.color;
        ctx.shadowBlur = 10;

        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.emoji, px, py + 1);

        ctx.restore();
      });
    }
  }

  drawMovementHighlight(tiles, possibleTileIds) {
    const ctx = this.ctx;
    const time = Date.now() * 0.005;

    for (const id of possibleTileIds) {
      const tile = tiles[id];
      if (!tile) continue;

      ctx.save();
      ctx.globalAlpha = 0.4 + Math.sin(time) * 0.2;
      ctx.strokeStyle = '#ffd93d';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(tile.x, tile.y, TILE_SIZE + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  addParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 1,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  }

  updateAndDrawParticles() {
    const ctx = this.ctx;
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= 0.02;
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  render(state) {
    this.clear();
    if (state.board) {
      this.drawBoard(state.board, state.starTileId);
      this.drawPlayers(state.players, state.board);
    }
    this.updateAndDrawParticles();
  }
}
