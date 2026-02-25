import {
  TILE_TYPES,
  BOARD_CENTER_X,
  BOARD_CENTER_Y,
  BOARD_RADIUS_X,
  BOARD_RADIUS_Y,
} from './constants.js';

export function generateBoard(tileCount = 24) {
  const tiles = [];
  const typeWeights = [
    { type: TILE_TYPES.BLUE, weight: 40 },
    { type: TILE_TYPES.RED, weight: 20 },
    { type: TILE_TYPES.EVENT, weight: 20 },
    { type: TILE_TYPES.SHOP, weight: 10 },
  ];

  for (let i = 0; i < tileCount; i++) {
    const angle = (i / tileCount) * Math.PI * 2 - Math.PI / 2;
    const x = BOARD_CENTER_X + Math.cos(angle) * BOARD_RADIUS_X;
    const y = BOARD_CENTER_Y + Math.sin(angle) * BOARD_RADIUS_Y;

    let type;
    if (i === 0) {
      type = TILE_TYPES.START;
    } else {
      type = pickWeightedType(typeWeights);
    }

    tiles.push({
      id: i,
      type,
      x,
      y,
      angle,
      next: [(i + 1) % tileCount],
    });
  }

  placeStarTile(tiles);
  addBranchPath(tiles);

  return tiles;
}

function pickWeightedType(weights) {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.type;
  }
  return weights[0].type;
}

export function placeStarTile(tiles) {
  const candidates = tiles.filter(
    (t) => t.type !== TILE_TYPES.START && t.type !== TILE_TYPES.STAR
  );
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  for (const t of tiles) {
    if (t.type === TILE_TYPES.STAR) t.type = TILE_TYPES.BLUE;
  }
  chosen.type = TILE_TYPES.STAR;
  return chosen.id;
}

function addBranchPath(tiles) {
  const branchStart = 6;
  const branchEnd = 12;
  const mainCount = tiles.length;

  const sx = tiles[branchStart].x;
  const sy = tiles[branchStart].y;
  const ex = tiles[branchEnd].x;
  const ey = tiles[branchEnd].y;
  const midX = (sx + ex) / 2;
  const midY = (sy + ey) / 2 - 80;

  const shortcutTiles = [
    {
      id: mainCount,
      type: TILE_TYPES.EVENT,
      x: (sx + midX) / 2,
      y: (sy + midY) / 2 - 20,
      angle: 0,
      next: [mainCount + 1],
    },
    {
      id: mainCount + 1,
      type: TILE_TYPES.RED,
      x: midX,
      y: midY,
      angle: 0,
      next: [mainCount + 2],
    },
    {
      id: mainCount + 2,
      type: TILE_TYPES.BLUE,
      x: (midX + ex) / 2,
      y: (midY + ey) / 2 - 20,
      angle: 0,
      next: [branchEnd],
    },
  ];

  tiles[branchStart].next.push(mainCount);
  tiles.push(...shortcutTiles);
}

export function getStarTileId(tiles) {
  const star = tiles.find((t) => t.type === TILE_TYPES.STAR);
  return star ? star.id : -1;
}
