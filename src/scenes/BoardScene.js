import { BOARD_1, SPACE_COLORS, SPACE_LABELS, SPACE_TYPES } from '../data/boards.js';
import { SHOP_ITEMS } from '../data/items.js';
import { GameManager, GAME_PHASE } from '../managers/GameManager.js';
import { PlayerHUD } from '../ui/PlayerHUD.js';
import { Dialog } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { hexToRgba, randomInt, randomChoice } from '../utils/helpers.js';

const BOARD_STATE = {
  WAITING: 'waiting',
  ROLLING: 'rolling',
  MOVING: 'moving',
  SPACE_EVENT: 'space_event',
  DIALOG: 'dialog',
  MINIGAME_TRANSITION: 'minigame_transition',
  ROUND_SUMMARY: 'round_summary'
};

export class BoardScene {
  constructor(game) {
    this.game = game;
    this.gm = new GameManager();
    this.hud = new PlayerHUD();
    this.dialog = new Dialog();
    this.board = BOARD_1;
    this.state = BOARD_STATE.WAITING;
    this.time = 0;

    this.diceValue = 0;
    this.diceRolling = false;
    this.diceTimer = 0;
    this.diceDisplayValue = 1;

    this.movingPlayer = null;
    this.moveStepsRemaining = 0;
    this.moveTimer = 0;
    this.moveSpeed = 0.25;

    this.playerVisuals = [];
    this.rollBtn = null;
    this.messageText = '';
    this.messageTimer = 0;

    this.branchChoiceActive = false;
    this.branchOptions = [];
    this.branchButtons = [];
  }

  enter(data) {
    if (data && data.players) {
      this.gm.initGame(data.players, data.rounds);
      this.state = BOARD_STATE.WAITING;
      this.time = 0;
      this.messageText = '';

      this.gm.activeStarNodes = [...this.board.starPositions];

      this.playerVisuals = this.gm.players.map((p, i) => {
        const node = this.board.nodes[p.position];
        return {
          x: node.x + (i % 2) * 16 - 8,
          y: node.y + Math.floor(i / 2) * 16 - 8,
          targetX: node.x,
          targetY: node.y,
          bounceOffset: 0
        };
      });

      this.rollBtn = new Button(1050, 600, 180, 55, '🎲 주사위!', {
        color: '#FF6B6B',
        fontSize: 22,
        onClick: () => this.rollDice()
      });

      this.showMessage(`라운드 ${this.gm.currentRound} 시작!`);
    }
  }

  showMessage(text, duration = 2) {
    this.messageText = text;
    this.messageTimer = duration;
  }

  rollDice() {
    if (this.state !== BOARD_STATE.WAITING || this.diceRolling) return;

    this.game.audio.playSfx('dice');
    this.diceRolling = true;
    this.diceTimer = 0;
    this.state = BOARD_STATE.ROLLING;

    this.diceValue = randomInt(1, 10);
  }

  update(dt) {
    this.time += dt;

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }

    this.dialog.update(this.game.input, this.game.audio);
    if (this.dialog.isActive) return;

    this.playerVisuals.forEach((pv, i) => {
      pv.x += (pv.targetX + (i % 2) * 16 - 8 - pv.x) * 0.15;
      pv.y += (pv.targetY + Math.floor(i / 2) * 16 - 8 - pv.y) * 0.15;
      pv.bounceOffset = Math.sin(this.time * 3 + i) * 3;
    });

    switch (this.state) {
      case BOARD_STATE.WAITING:
        this.updateWaiting(dt);
        break;
      case BOARD_STATE.ROLLING:
        this.updateRolling(dt);
        break;
      case BOARD_STATE.MOVING:
        this.updateMoving(dt);
        break;
    }

    if (this.branchChoiceActive) {
      this.branchButtons.forEach(b => b.update(this.game.input, this.game.audio));
    }
  }

  updateWaiting(dt) {
    this.rollBtn.update(this.game.input, this.game.audio);
  }

  updateRolling(dt) {
    this.diceTimer += dt;
    if (this.diceTimer < 0.8) {
      this.diceDisplayValue = randomInt(1, 10);
      if (Math.random() < 0.3) this.game.audio.playSfx('dice');
    } else {
      this.diceDisplayValue = this.diceValue;
      this.diceRolling = false;
      this.showMessage(`${this.gm.getCurrentPlayer().name}: ${this.diceValue} 칸 이동!`);
      this.startMoving();
    }
  }

  startMoving() {
    const player = this.gm.getCurrentPlayer();
    this.movingPlayer = player;
    this.moveStepsRemaining = this.diceValue;
    this.moveTimer = 0;
    this.state = BOARD_STATE.MOVING;
  }

  updateMoving(dt) {
    this.moveTimer += dt;
    if (this.moveTimer >= this.moveSpeed) {
      this.moveTimer = 0;

      if (this.moveStepsRemaining <= 0) {
        this.onLandOnSpace();
        return;
      }

      const player = this.movingPlayer;
      const currentNode = this.board.nodes[player.position];
      const nextOptions = currentNode.next;

      if (nextOptions.length > 1 && this.moveStepsRemaining > 0) {
        if (!this.branchChoiceActive) {
          this.branchChoiceActive = true;
          this.branchOptions = nextOptions;
          this.branchButtons = nextOptions.map((nodeId, i) => {
            const targetNode = this.board.nodes[nodeId];
            return new Button(
              targetNode.x - 40, targetNode.y - 50,
              80, 35,
              `→ ${SPACE_LABELS[targetNode.type] || ''}`,
              {
                color: SPACE_COLORS[targetNode.type] || '#666',
                fontSize: 14,
                onClick: () => {
                  this.branchChoiceActive = false;
                  player.position = nodeId;
                  const node = this.board.nodes[nodeId];
                  this.playerVisuals[player.id].targetX = node.x;
                  this.playerVisuals[player.id].targetY = node.y;
                  this.moveStepsRemaining--;
                  this.game.audio.playSfx('move');
                }
              }
            );
          });
          return;
        }
        return;
      }

      const nextNodeId = nextOptions[0];
      player.position = nextNodeId;
      const node = this.board.nodes[nextNodeId];
      this.playerVisuals[player.id].targetX = node.x;
      this.playerVisuals[player.id].targetY = node.y;
      this.moveStepsRemaining--;
      this.game.audio.playSfx('move');

      if (this.gm.activeStarNodes.includes(nextNodeId) && this.moveStepsRemaining > 0) {
        // Pass through star space while moving - no purchase mid-move
      }
    }
  }

  onLandOnSpace() {
    const player = this.movingPlayer;
    const node = this.board.nodes[player.position];
    this.state = BOARD_STATE.SPACE_EVENT;

    switch (node.type) {
      case SPACE_TYPES.BLUE:
        this.gm.addCoins(player.id, 3);
        this.game.audio.playSfx('coin');
        this.showMessage(`${player.name} +3 코인! (${player.coins})`);
        this.scheduleNextTurn(1);
        break;

      case SPACE_TYPES.RED:
        this.gm.addCoins(player.id, -3);
        this.game.audio.playSfx('negative');
        this.showMessage(`${player.name} -3 코인... (${player.coins})`);
        this.scheduleNextTurn(1);
        break;

      case SPACE_TYPES.STAR:
        if (this.gm.activeStarNodes.includes(node.id)) {
          if (player.coins >= this.gm.starCost) {
            this.dialog.show('⭐ 스타 발견!', `20 코인으로 스타를 구매하시겠습니까?\n현재 코인: ${player.coins}`, [
              {
                text: '구매!', color: '#FFD93D', onClick: () => {
                  this.gm.addStar(player.id);
                  this.game.audio.playSfx('star');
                  this.showMessage(`${player.name} 스타 획득! ⭐`);
                  this.moveStarPosition(node.id);
                  this.advanceToNextTurn();
                }
              },
              {
                text: '안 살래요', color: '#666', onClick: () => {
                  this.advanceToNextTurn();
                }
              }
            ]);
          } else {
            this.showMessage(`코인이 부족합니다... (${player.coins}/20)`);
            this.scheduleNextTurn(1.5);
          }
        } else {
          this.scheduleNextTurn(0.5);
        }
        break;

      case SPACE_TYPES.EVENT:
        player.eventsTriggered++;
        this.triggerEvent(player);
        break;

      case SPACE_TYPES.SHOP:
        this.openShop(player);
        break;

      case SPACE_TYPES.CHANCE:
        this.triggerChance(player);
        break;

      default:
        this.scheduleNextTurn(0.5);
    }
  }

  moveStarPosition(currentStarNode) {
    const idx = this.gm.activeStarNodes.indexOf(currentStarNode);
    if (idx !== -1) {
      const possibleNodes = this.board.nodes
        .filter(n => n.type === SPACE_TYPES.BLUE && !this.gm.activeStarNodes.includes(n.id))
        .map(n => n.id);
      if (possibleNodes.length > 0) {
        this.gm.activeStarNodes[idx] = randomChoice(possibleNodes);
      }
    }
  }

  triggerEvent(player) {
    const events = [
      { text: '보물 발견! +10 코인', coins: 10 },
      { text: '함정에 빠졌다! -5 코인', coins: -5 },
      { text: '행운의 별! +5 코인', coins: 5 },
      { text: '세금 징수... -7 코인', coins: -7 },
      { text: '보너스 타임! +8 코인', coins: 8 },
    ];
    const event = randomChoice(events);
    this.gm.addCoins(player.id, event.coins);

    if (event.coins > 0) {
      this.game.audio.playSfx('coin');
    } else {
      this.game.audio.playSfx('negative');
    }

    this.dialog.show('🎪 이벤트!', `${event.text}\n현재 코인: ${player.coins}`, [
      { text: '확인', onClick: () => this.advanceToNextTurn() }
    ]);
  }

  openShop(player) {
    const availableItems = SHOP_ITEMS.filter(item => player.coins >= item.cost);
    if (availableItems.length === 0) {
      this.dialog.show('🏪 상점', '코인이 부족하여 구매할 수 있는 아이템이 없습니다.', [
        { text: '나가기', onClick: () => this.advanceToNextTurn() }
      ]);
      return;
    }

    const itemTexts = SHOP_ITEMS.map(item =>
      `${item.emoji} ${item.name} (${item.cost} 코인)${player.coins >= item.cost ? '' : ' [부족]'}`
    ).join('\n');

    this.dialog.show('🏪 상점', `아이템을 구매하세요!\n${itemTexts}`, [
      ...availableItems.slice(0, 2).map(item => ({
        text: `${item.emoji} ${item.cost}C`,
        color: '#4ECDC4',
        onClick: () => {
          this.gm.addCoins(player.id, -item.cost);
          player.items.push(item);
          this.game.audio.playSfx('coin');
          this.showMessage(`${item.name} 구매!`);
          this.advanceToNextTurn();
        }
      })),
      { text: '나가기', color: '#666', onClick: () => this.advanceToNextTurn() }
    ]);
  }

  triggerChance(player) {
    const value = randomInt(-10, 15);
    this.gm.addCoins(player.id, value);

    if (value > 0) {
      this.game.audio.playSfx('coin');
    } else {
      this.game.audio.playSfx('negative');
    }

    this.dialog.show('❓ 찬스!', `룰렛 결과: ${value > 0 ? '+' : ''}${value} 코인!\n현재 코인: ${player.coins}`, [
      { text: '확인', onClick: () => this.advanceToNextTurn() }
    ]);
  }

  scheduleNextTurn(delay) {
    setTimeout(() => this.advanceToNextTurn(), delay * 1000);
  }

  advanceToNextTurn() {
    if (this.gm.nextPlayerTurn()) {
      this.state = BOARD_STATE.WAITING;
      const nextPlayer = this.gm.getCurrentPlayer();
      this.showMessage(`${nextPlayer.name}의 차례!`);
    } else {
      this.startMinigamePhase();
    }
  }

  startMinigamePhase() {
    this.game.audio.playSfx('minigameStart');

    this.dialog.show('🎮 미니게임 타임!', '모든 플레이어의 이동이 끝났습니다.\n미니게임을 시작합니다!', [
      {
        text: '시작!', color: '#FF6B6B', onClick: () => {
          const minigames = ['coinCatch', 'memoryMatch', 'luckyRoulette'];
          const selected = randomChoice(minigames);
          this.game.scenes.switchTo(selected, {
            players: this.gm.players,
            boardScene: this,
            gameManager: this.gm
          });
        }
      }
    ]);
  }

  onMinigameComplete(results) {
    results.forEach(r => {
      this.gm.addCoins(r.playerIndex, r.coins);
      if (r.winner) {
        this.gm.players[r.playerIndex].minigameWins++;
      }
    });

    if (this.gm.endRound()) {
      this.state = BOARD_STATE.WAITING;
      this.gm.currentPlayerIndex = 0;
      this.gm.roundPlayersCompleted = 0;
      this.showMessage(`라운드 ${this.gm.currentRound} 시작!`);
    } else {
      this.game.scenes.switchTo('results', {
        gameManager: this.gm
      });
    }
  }

  render(canvas) {
    canvas.drawGradientRect(0, 0, 1280, 720, ['#0f3460', '#16213e', '#1a1a2e']);

    this.renderBoard(canvas);
    this.renderPlayers(canvas);
    this.hud.render(canvas, this.gm.players, this.gm.turnOrder[this.gm.currentPlayerIndex],
      this.gm.currentRound, this.gm.totalRounds);

    if (this.state === BOARD_STATE.WAITING && !this.dialog.isActive) {
      this.rollBtn.render(canvas);
    }

    if (this.state === BOARD_STATE.ROLLING || this.diceDisplayValue > 0) {
      this.renderDice(canvas);
    }

    if (this.branchChoiceActive) {
      canvas.drawText('경로를 선택하세요!', 640, 30, {
        color: '#FFD93D',
        font: 'bold 20px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
      this.branchButtons.forEach(b => b.render(canvas));
    }

    if (this.messageTimer > 0) {
      this.renderMessage(canvas);
    }

    this.dialog.render(canvas);
  }

  renderBoard(canvas) {
    this.board.nodes.forEach(node => {
      node.next.forEach(nextId => {
        const nextNode = this.board.nodes.find(n => n.id === nextId);
        if (nextNode) {
          canvas.drawLine(node.x, node.y, nextNode.x, nextNode.y,
            hexToRgba('#ffffff', 0.15), 3);
        }
      });
    });

    this.board.nodes.forEach(node => {
      const isStar = this.gm.activeStarNodes.includes(node.id);
      const radius = isStar ? 24 : 20;
      const color = isStar ? '#FFD93D' : (SPACE_COLORS[node.type] || '#666');

      const pulse = isStar ? Math.sin(this.time * 3) * 4 : 0;
      canvas.drawCircle(node.x, node.y, radius + pulse + 3,
        hexToRgba(color, 0.3));
      canvas.drawCircle(node.x, node.y, radius + pulse, color);

      const label = isStar ? '★' : (SPACE_LABELS[node.type] || '');
      canvas.drawText(label, node.x, node.y, {
        color: isStar ? '#000' : '#fff',
        font: `bold ${isStar ? 20 : 14}px sans-serif`,
        align: 'center',
        baseline: 'middle'
      });
    });
  }

  renderPlayers(canvas) {
    this.gm.players.forEach((player, i) => {
      const pv = this.playerVisuals[i];
      const x = pv.x;
      const y = pv.y + pv.bounceOffset;

      canvas.drawCircle(x, y + 2, 14, hexToRgba('#000', 0.3));
      canvas.drawCircle(x, y, 14, player.color);
      canvas.drawCircleStroke(x, y, 14, '#fff', 2);
      canvas.drawText(player.name[0], x, y, {
        color: '#fff',
        font: 'bold 12px sans-serif',
        align: 'center',
        baseline: 'middle'
      });

      canvas.drawText(`P${i + 1}`, x, y - 22, {
        color: player.color,
        font: 'bold 10px sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    });
  }

  renderDice(canvas) {
    const x = 1140;
    const y = 500;
    const size = 80;

    canvas.drawRect(x - size / 2, y - size / 2, size, size,
      this.diceRolling ? '#fff' : '#f0f0f0', 12);
    canvas.drawRectStroke(x - size / 2, y - size / 2, size, size, '#333', 3, 12);

    const shakeX = this.diceRolling ? (Math.random() - 0.5) * 6 : 0;
    const shakeY = this.diceRolling ? (Math.random() - 0.5) * 6 : 0;

    canvas.drawText(this.diceDisplayValue.toString(), x + shakeX, y + shakeY, {
      color: '#333',
      font: 'bold 36px sans-serif',
      align: 'center',
      baseline: 'middle'
    });
  }

  renderMessage(canvas) {
    const alpha = Math.min(1, this.messageTimer);
    canvas.setAlpha(alpha);
    canvas.drawRect(340, 680, 600, 36, hexToRgba('#000', 0.7), 8);
    canvas.drawText(this.messageText, 640, 698, {
      color: '#FFD93D',
      font: 'bold 16px sans-serif',
      align: 'center',
      baseline: 'middle'
    });
    canvas.resetAlpha();
  }

  exit() {}
}
