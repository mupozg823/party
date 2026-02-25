import { generateBoard, placeStarTile, getStarTileId } from './board.js';
import {
  TILE_TYPES,
  COIN_REWARDS,
  STAR_COST,
  MINIGAME_TYPES,
  MINIGAME_REWARDS,
  PLAYER_COLORS,
  PLAYER_EMOJIS,
  PLAYER_DEFAULT_NAMES,
} from './constants.js';

export function createGameState(playerCount, maxTurns, playerNames) {
  const board = generateBoard(24);
  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: i,
      name: playerNames?.[i] || PLAYER_DEFAULT_NAMES[i],
      color: PLAYER_COLORS[i],
      emoji: PLAYER_EMOJIS[i],
      coins: 10,
      stars: 0,
      tileIndex: 0,
      items: [],
    });
  }

  return {
    phase: 'title',
    currentPlayerIndex: 0,
    turnNumber: 1,
    maxTurns,
    players,
    board,
    starTileId: getStarTileId(board),
    diceValue: null,
    movesLeft: 0,
    currentMinigame: null,
    minigameResults: null,
    tileEffectMessage: null,
    pendingStarPurchase: false,
    pendingDirectionChoice: false,
    directionOptions: [],
    animationQueue: [],
    eventLog: [],
  };
}

export function rollDice() {
  return Math.floor(Math.random() * 10) + 1;
}

export function getCurrentPlayer(state) {
  return state.players[state.currentPlayerIndex];
}

export function movePlayer(state, tileId) {
  const player = getCurrentPlayer(state);
  player.tileIndex = tileId;
  state.movesLeft--;
}

export function resolveTileEffect(state) {
  const player = getCurrentPlayer(state);
  const tile = state.board[player.tileIndex];

  if (!tile) return null;

  let message = null;

  switch (tile.type) {
    case TILE_TYPES.BLUE: {
      const reward = COIN_REWARDS.blue;
      player.coins += reward;
      message = { emoji: '🔵', text: `+${reward} Coins!`, detail: `${player.name} landed on a Blue Space` };
      break;
    }
    case TILE_TYPES.RED: {
      const penalty = COIN_REWARDS.red;
      player.coins = Math.max(0, player.coins + penalty);
      message = { emoji: '🔴', text: `${penalty} Coins!`, detail: `${player.name} landed on a Red Space` };
      break;
    }
    case TILE_TYPES.EVENT: {
      const event = resolveRandomEvent(state, player);
      message = event;
      break;
    }
    case TILE_TYPES.SHOP: {
      message = { emoji: '🛒', text: 'Shop!', detail: 'Items coming soon...' };
      break;
    }
    case TILE_TYPES.STAR: {
      if (player.coins >= STAR_COST) {
        state.pendingStarPurchase = true;
        message = { emoji: '⭐', text: 'Star Space!', detail: `Buy a Star for ${STAR_COST} coins?`, isStarOffer: true };
      } else {
        message = { emoji: '⭐', text: 'Not enough coins!', detail: `Need ${STAR_COST} coins (have ${player.coins})` };
      }
      break;
    }
    default:
      break;
  }

  return message;
}

function resolveRandomEvent(state, player) {
  const events = [
    () => {
      const bonus = Math.floor(Math.random() * 6) + 5;
      player.coins += bonus;
      return { emoji: '🎁', text: `+${bonus} Coins!`, detail: 'Lucky find!' };
    },
    () => {
      const loss = Math.floor(Math.random() * 5) + 1;
      player.coins = Math.max(0, player.coins - loss);
      return { emoji: '💀', text: `-${loss} Coins!`, detail: 'Oops!' };
    },
    () => {
      const others = state.players.filter((p) => p.id !== player.id);
      if (others.length === 0) return { emoji: '💫', text: 'Nothing happened', detail: '' };
      const target = others[Math.floor(Math.random() * others.length)];
      const stolen = Math.min(5, target.coins);
      target.coins -= stolen;
      player.coins += stolen;
      return { emoji: '🦹', text: `Stole ${stolen} coins!`, detail: `from ${target.name}` };
    },
    () => {
      for (const p of state.players) {
        p.coins += 3;
      }
      return { emoji: '🎉', text: 'Everyone +3 Coins!', detail: 'Party time!' };
    },
    () => {
      const swap = state.players.filter((p) => p.id !== player.id);
      if (swap.length === 0) return { emoji: '💫', text: 'Nothing happened', detail: '' };
      const target = swap[Math.floor(Math.random() * swap.length)];
      const tmpCoins = player.coins;
      player.coins = target.coins;
      target.coins = tmpCoins;
      return { emoji: '🔄', text: 'Coin Swap!', detail: `Swapped coins with ${target.name}` };
    },
  ];

  return events[Math.floor(Math.random() * events.length)]();
}

export function buyStar(state) {
  const player = getCurrentPlayer(state);
  if (player.coins >= STAR_COST) {
    player.coins -= STAR_COST;
    player.stars++;
    state.pendingStarPurchase = false;
    state.starTileId = placeStarTile(state.board);
    return true;
  }
  return false;
}

export function declineStar(state) {
  state.pendingStarPurchase = false;
}

export function advanceToNextPlayer(state) {
  state.currentPlayerIndex++;
  if (state.currentPlayerIndex >= state.players.length) {
    state.currentPlayerIndex = 0;
    return true;
  }
  return false;
}

export function pickRandomMinigame() {
  return MINIGAME_TYPES[Math.floor(Math.random() * MINIGAME_TYPES.length)];
}

export function calculateMinigameRewards(rankings, players) {
  return rankings.map((playerIndex, rank) => ({
    player: players[playerIndex],
    rank: rank + 1,
    reward: MINIGAME_REWARDS[rank] || 1,
  }));
}

export function applyMinigameRewards(state, rewards) {
  for (const r of rewards) {
    const player = state.players.find((p) => p.id === r.player.id);
    if (player) player.coins += r.reward;
  }
}

export function advanceTurn(state) {
  state.turnNumber++;
  state.currentPlayerIndex = 0;
  return state.turnNumber > state.maxTurns;
}

export function getWinner(state) {
  const sorted = [...state.players].sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars;
    return b.coins - a.coins;
  });
  return sorted;
}

export function getNextTiles(state, tileId) {
  const tile = state.board[tileId];
  if (!tile) return [];
  return tile.next;
}
