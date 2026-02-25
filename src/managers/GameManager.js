export const GAME_PHASE = {
  MENU: 'menu',
  CHARACTER_SELECT: 'character_select',
  BOARD_PLAY: 'board_play',
  DICE_ROLL: 'dice_roll',
  PLAYER_MOVING: 'player_moving',
  SPACE_EVENT: 'space_event',
  MINIGAME_SELECT: 'minigame_select',
  MINIGAME_PLAY: 'minigame_play',
  MINIGAME_RESULT: 'minigame_result',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over'
};

export class GameManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.currentRound = 1;
    this.totalRounds = 10;
    this.phase = GAME_PHASE.MENU;
    this.turnOrder = [];
    this.roundPlayersCompleted = 0;
    this.starCost = 20;
    this.activeStarNodes = [];
  }

  initGame(playerConfigs, totalRounds = 10) {
    this.totalRounds = totalRounds;
    this.currentRound = 1;
    this.currentPlayerIndex = 0;
    this.roundPlayersCompleted = 0;
    this.players = playerConfigs.map((config, i) => ({
      id: i,
      name: config.name,
      character: config.character,
      color: config.character.color,
      coins: 10,
      stars: 0,
      position: 0,
      items: [],
      minigameWins: 0,
      totalCoinsEarned: 0,
      eventsTriggered: 0,
      isHuman: config.isHuman !== false
    }));
    this.turnOrder = this.players.map((_, i) => i);
  }

  getCurrentPlayer() {
    return this.players[this.turnOrder[this.currentPlayerIndex]];
  }

  nextPlayerTurn() {
    this.roundPlayersCompleted++;
    this.currentPlayerIndex++;

    if (this.currentPlayerIndex >= this.players.length) {
      return false;
    }
    return true;
  }

  startMinigamePhase() {
    this.phase = GAME_PHASE.MINIGAME_SELECT;
  }

  endRound() {
    this.currentRound++;
    this.currentPlayerIndex = 0;
    this.roundPlayersCompleted = 0;

    if (this.currentRound > this.totalRounds) {
      this.phase = GAME_PHASE.GAME_OVER;
      return false;
    }
    return true;
  }

  addCoins(playerIndex, amount) {
    const p = this.players[playerIndex];
    p.coins = Math.max(0, p.coins + amount);
    if (amount > 0) p.totalCoinsEarned += amount;
  }

  addStar(playerIndex) {
    const p = this.players[playerIndex];
    if (p.coins >= this.starCost) {
      p.coins -= this.starCost;
      p.stars++;
      return true;
    }
    return false;
  }

  getStandings() {
    return [...this.players].sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return b.coins - a.coins;
    });
  }

  getBonusStars() {
    const bonuses = [];

    const minigameKing = [...this.players].sort((a, b) => b.minigameWins - a.minigameWins)[0];
    if (minigameKing.minigameWins > 0) {
      bonuses.push({ title: '미니게임 왕', player: minigameKing });
    }

    const coinKing = [...this.players].sort((a, b) => b.totalCoinsEarned - a.totalCoinsEarned)[0];
    if (coinKing.totalCoinsEarned > 0) {
      bonuses.push({ title: '코인 부자', player: coinKing });
    }

    const eventKing = [...this.players].sort((a, b) => b.eventsTriggered - a.eventsTriggered)[0];
    if (eventKing.eventsTriggered > 0) {
      bonuses.push({ title: '이벤트 왕', player: eventKing });
    }

    return bonuses;
  }

  isGameOver() {
    return this.currentRound > this.totalRounds;
  }
}
