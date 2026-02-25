import { BoardRenderer } from './game/renderer.js';
import {
  createGameState,
  rollDice,
  getCurrentPlayer,
  movePlayer,
  resolveTileEffect,
  buyStar,
  declineStar,
  advanceToNextPlayer,
  pickRandomMinigame,
  calculateMinigameRewards,
  applyMinigameRewards,
  advanceTurn,
  getWinner,
  getNextTiles,
} from './game/engine.js';
import {
  renderTitleScreen,
  renderSetupScreen,
  renderHUD,
  renderDiceRoll,
  removeDiceOverlay,
  renderTileEffect,
  renderStarPurchase,
  renderDirectionChoice,
  renderMinigameIntro,
  renderMinigameResult,
  renderGameOver,
} from './ui/screens.js';
import { ButtonMashGame } from './minigames/buttonmash.js';
import { TimingGame } from './minigames/timing.js';
import { MemoryGame } from './minigames/memory.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.overlay = document.getElementById('ui-overlay');
    this.renderer = new BoardRenderer(this.canvas);
    this.state = null;
    this.currentMinigameInstance = null;
    this.animating = false;
    this.showTitle();
  }

  showTitle() {
    this.state = { phase: 'title' };
    this.overlay.style.pointerEvents = 'auto';
    renderTitleScreen(this.overlay, () => this.showSetup());
    this.startRenderLoop();
  }

  showSetup() {
    this.state = { phase: 'setup' };
    renderSetupScreen(this.overlay, (playerCount, turnCount, names) => {
      this.startGame(playerCount, turnCount, names);
    });
  }

  startGame(playerCount, turnCount, names) {
    this.state = createGameState(playerCount, turnCount, names);
    this.state.phase = 'board';
    this.overlay.innerHTML = '';
    this.overlay.style.pointerEvents = 'none';
    renderHUD(this.overlay, this.state);
    this.startPlayerTurn();
  }

  startPlayerTurn() {
    this.state.phase = 'dice';
    this.state.diceValue = null;
    const player = getCurrentPlayer(this.state);
    renderHUD(this.overlay, this.state);
    renderDiceRoll(this.overlay, player, false, null, () => this.handleRollDice());
  }

  handleRollDice() {
    const player = getCurrentPlayer(this.state);
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const tempValue = Math.floor(Math.random() * 10) + 1;
      renderDiceRoll(this.overlay, player, true, tempValue, null);
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(rollInterval);
        const finalValue = rollDice();
        this.state.diceValue = finalValue;
        this.state.movesLeft = finalValue;
        renderDiceRoll(this.overlay, player, false, finalValue, null);

        setTimeout(() => {
          removeDiceOverlay(this.overlay);
          this.animateMovement();
        }, 1000);
      }
    }, 80);
  }

  animateMovement() {
    if (this.state.movesLeft <= 0) {
      this.onMovementComplete();
      return;
    }

    const player = getCurrentPlayer(this.state);
    const currentTile = this.state.board[player.tileIndex];
    const nextTiles = currentTile.next;

    if (nextTiles.length > 1 && this.state.movesLeft > 0) {
      renderDirectionChoice(this.overlay, nextTiles, this.state.board, (chosenTileId) => {
        this.moveToTile(chosenTileId);
      });
      return;
    }

    if (nextTiles.length === 1) {
      this.moveToTile(nextTiles[0]);
    }
  }

  moveToTile(tileId) {
    movePlayer(this.state, tileId);
    const player = getCurrentPlayer(this.state);
    const tile = this.state.board[tileId];

    if (tile) {
      this.renderer.addParticle(tile.x, tile.y, player.color);
    }

    renderHUD(this.overlay, this.state);

    if (this.state.movesLeft > 0) {
      setTimeout(() => this.animateMovement(), 250);
    } else {
      setTimeout(() => this.onMovementComplete(), 400);
    }
  }

  onMovementComplete() {
    this.state.phase = 'tile-effect';
    const message = resolveTileEffect(this.state);

    if (message && message.isStarOffer && this.state.pendingStarPurchase) {
      const player = getCurrentPlayer(this.state);
      renderStarPurchase(
        this.overlay,
        player,
        () => {
          buyStar(this.state);
          renderHUD(this.overlay, this.state);
          this.renderer.addParticle(
            this.state.board[player.tileIndex]?.x || 640,
            this.state.board[player.tileIndex]?.y || 360,
            '#ffd700'
          );
          this.afterTileEffect();
        },
        () => {
          declineStar(this.state);
          this.afterTileEffect();
        }
      );
    } else if (message) {
      renderHUD(this.overlay, this.state);
      renderTileEffect(this.overlay, message, () => this.afterTileEffect());
    } else {
      this.afterTileEffect();
    }
  }

  afterTileEffect() {
    const roundComplete = advanceToNextPlayer(this.state);

    if (roundComplete) {
      this.startMinigamePhase();
    } else {
      this.startPlayerTurn();
    }
  }

  startMinigamePhase() {
    const type = pickRandomMinigame();
    this.state.currentMinigame = type;
    this.state.phase = 'minigame-intro';
    this.overlay.style.pointerEvents = 'auto';

    renderMinigameIntro(this.overlay, type, () => {
      this.startMinigame(type);
    });
  }

  startMinigame(type) {
    this.state.phase = 'minigame';
    this.overlay.innerHTML = '<div class="minigame-container"></div>';
    const container = this.overlay.querySelector('.minigame-container');

    const onComplete = (rankings) => {
      this.onMinigameComplete(rankings);
    };

    switch (type) {
      case 'buttonmash':
        this.currentMinigameInstance = new ButtonMashGame(this.state.players, container);
        break;
      case 'timing':
        this.currentMinigameInstance = new TimingGame(this.state.players, container);
        break;
      case 'memory':
        this.currentMinigameInstance = new MemoryGame(this.state.players, container);
        break;
    }

    if (this.currentMinigameInstance) {
      this.currentMinigameInstance.start(onComplete);
    }
  }

  onMinigameComplete(rankings) {
    if (this.currentMinigameInstance) {
      this.currentMinigameInstance.destroy();
      this.currentMinigameInstance = null;
    }

    this.state.phase = 'minigame-result';
    const rewards = calculateMinigameRewards(rankings, this.state.players);
    applyMinigameRewards(this.state, rewards);

    renderMinigameResult(this.overlay, rewards, () => {
      this.afterMinigame();
    });
  }

  afterMinigame() {
    const gameOver = advanceTurn(this.state);

    if (gameOver) {
      this.showGameOver();
    } else {
      this.overlay.innerHTML = '';
      this.overlay.style.pointerEvents = 'none';
      this.state.phase = 'board';
      renderHUD(this.overlay, this.state);
      this.startPlayerTurn();
    }
  }

  showGameOver() {
    this.state.phase = 'game-over';
    const rankings = getWinner(this.state);
    this.overlay.style.pointerEvents = 'auto';
    renderGameOver(this.overlay, rankings, () => {
      this.showTitle();
    });
  }

  startRenderLoop() {
    const loop = () => {
      if (this.state && this.state.board) {
        this.renderer.render(this.state);
      } else {
        this.renderer.clear();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
