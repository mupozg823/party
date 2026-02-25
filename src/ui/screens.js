import { PLAYER_COLORS, PLAYER_EMOJIS, PLAYER_DEFAULT_NAMES, MINIGAME_INFO, STAR_COST } from '../game/constants.js';

export function renderTitleScreen(overlay, onStart) {
  overlay.innerHTML = `
    <div class="title-screen">
      <div class="title-stars">⭐</div>
      <h1>Party Stars!</h1>
      <div class="title-subtitle">Board Game Party</div>
      <button class="btn btn-primary" id="btn-start">START GAME</button>
    </div>
  `;
  overlay.querySelector('#btn-start').addEventListener('click', onStart);
}

export function renderSetupScreen(overlay, onBegin) {
  let playerCount = 2;
  let turnCount = 10;
  const names = [...PLAYER_DEFAULT_NAMES];

  function render() {
    overlay.innerHTML = `
      <div class="setup-screen">
        <h2>⚙️ Game Setup</h2>

        <div class="setup-group">
          <label>Number of Players</label>
          <div class="setup-row">
            ${[2, 3, 4]
              .map(
                (n) =>
                  `<button class="setup-option ${n === playerCount ? 'active' : ''}" data-player-count="${n}">${n}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="setup-group">
          <label>Number of Turns</label>
          <div class="setup-row">
            ${[5, 10, 15, 20]
              .map(
                (n) =>
                  `<button class="setup-option ${n === turnCount ? 'active' : ''}" data-turn-count="${n}">${n}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="setup-group">
          <label>Players</label>
          ${Array.from({ length: playerCount })
            .map(
              (_, i) => `
            <div class="player-setup-row">
              <div class="player-color-dot" style="background: ${PLAYER_COLORS[i]}"></div>
              <span style="font-size: 24px">${PLAYER_EMOJIS[i]}</span>
              <input class="player-name-input" type="text" value="${names[i]}"
                     data-player-index="${i}" maxlength="10" placeholder="Player ${i + 1}" />
            </div>
          `
            )
            .join('')}
        </div>

        <button class="btn btn-primary" id="btn-begin" style="margin-top: 16px;">LET'S GO! 🎉</button>
      </div>
    `;

    overlay.querySelectorAll('[data-player-count]').forEach((btn) => {
      btn.addEventListener('click', () => {
        playerCount = parseInt(btn.dataset.playerCount, 10);
        render();
      });
    });

    overlay.querySelectorAll('[data-turn-count]').forEach((btn) => {
      btn.addEventListener('click', () => {
        turnCount = parseInt(btn.dataset.turnCount, 10);
        render();
      });
    });

    overlay.querySelectorAll('.player-name-input').forEach((input) => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.playerIndex, 10);
        names[idx] = input.value || PLAYER_DEFAULT_NAMES[idx];
      });
    });

    overlay.querySelector('#btn-begin').addEventListener('click', () => {
      onBegin(playerCount, turnCount, names.slice(0, playerCount));
    });
  }

  render();
}

export function renderHUD(overlay, state) {
  const existingHud = overlay.querySelector('.hud');
  const existingTurnInfo = overlay.querySelector('.turn-info');
  if (existingHud) existingHud.remove();
  if (existingTurnInfo) existingTurnInfo.remove();

  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = state.players
    .map(
      (p, i) => `
    <div class="hud-player ${i === state.currentPlayerIndex ? 'active' : ''}">
      <div class="hud-player-avatar" style="background: ${p.color};">${p.emoji}</div>
      <div class="hud-player-info">
        <div class="hud-player-name" style="color: ${p.color};">${p.name}</div>
        <div class="hud-player-stats">
          <span class="stat-coins">🪙 ${p.coins}</span>
          <span class="stat-stars">⭐ ${p.stars}</span>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  const turnInfo = document.createElement('div');
  turnInfo.className = 'turn-info';
  turnInfo.textContent = `Turn ${state.turnNumber} / ${state.maxTurns}`;

  overlay.appendChild(hud);
  overlay.appendChild(turnInfo);
}

export function renderDiceRoll(overlay, player, rolling, value, onRoll) {
  const existing = overlay.querySelector('.dice-overlay');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'dice-overlay';
  div.innerHTML = `
    <div class="dice-prompt">${player.emoji} ${player.name}'s Turn</div>
    <div class="dice-container">
      <div class="dice ${rolling ? 'rolling' : ''}">${value || '?'}</div>
    </div>
    ${!rolling && !value ? `<button class="btn btn-primary" id="btn-roll">🎲 ROLL DICE</button>` : ''}
    ${value && !rolling ? `<div style="font-size: 18px; color: var(--color-text-dim);">Rolled ${value}!</div>` : ''}
  `;

  overlay.appendChild(div);

  const rollBtn = div.querySelector('#btn-roll');
  if (rollBtn) {
    rollBtn.addEventListener('click', onRoll);
  }
}

export function removeDiceOverlay(overlay) {
  const el = overlay.querySelector('.dice-overlay');
  if (el) el.remove();
}

export function renderTileEffect(overlay, message, onDismiss) {
  const existing = overlay.querySelector('.tile-effect-popup');
  if (existing) existing.remove();

  if (!message) return;

  const div = document.createElement('div');
  div.className = 'tile-effect-popup';
  div.innerHTML = `
    <div class="emoji">${message.emoji}</div>
    <div class="text">${message.text}</div>
    <div class="detail">${message.detail}</div>
    ${!message.isStarOffer ? `<button class="btn btn-secondary" style="margin-top: 16px; font-size: 14px;" id="btn-dismiss-effect">OK</button>` : ''}
  `;

  overlay.appendChild(div);

  const dismissBtn = div.querySelector('#btn-dismiss-effect');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      div.remove();
      if (onDismiss) onDismiss();
    });
  }
}

export function renderStarPurchase(overlay, player, onBuy, onDecline) {
  const existing = overlay.querySelector('.star-dialog');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'star-dialog';
  div.innerHTML = `
    <div class="star-icon">⭐</div>
    <h3>Buy a Star?</h3>
    <p>${player.name}, spend ${STAR_COST} coins to get a Star?</p>
    <p style="color: var(--color-coin);">You have ${player.coins} coins</p>
    <div class="btn-row">
      <button class="btn btn-primary" id="btn-buy-star" style="font-size: 16px; padding: 10px 30px;">BUY ⭐</button>
      <button class="btn btn-secondary" id="btn-decline-star" style="font-size: 16px; padding: 10px 30px;">No Thanks</button>
    </div>
  `;

  overlay.appendChild(div);

  div.querySelector('#btn-buy-star').addEventListener('click', () => {
    div.remove();
    onBuy();
  });
  div.querySelector('#btn-decline-star').addEventListener('click', () => {
    div.remove();
    onDecline();
  });
}

export function renderDirectionChoice(overlay, options, tiles, onChoose) {
  const existing = overlay.querySelector('.direction-dialog');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'direction-dialog';
  div.innerHTML = `
    <h3>🔀 Choose Your Path!</h3>
    <div class="direction-choices">
      ${options
        .map(
          (tileId, i) => `
        <button class="btn btn-secondary" data-dir="${tileId}" style="font-size: 16px; padding: 10px 20px;">
          Path ${i + 1}
        </button>
      `
        )
        .join('')}
    </div>
  `;

  overlay.appendChild(div);

  div.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tileId = parseInt(btn.dataset.dir, 10);
      div.remove();
      onChoose(tileId);
    });
  });
}

export function renderMinigameIntro(overlay, type, onReady) {
  const info = MINIGAME_INFO[type];
  overlay.innerHTML = `
    <div class="minigame-intro">
      <h2>${info.name}</h2>
      <div class="description">${info.description}</div>
      <div class="controls">🎮 ${info.controls}</div>
      <button class="btn btn-primary" id="btn-minigame-start">READY!</button>
    </div>
  `;

  overlay.querySelector('#btn-minigame-start').addEventListener('click', onReady);
}

export function renderMinigameResult(overlay, rewards, onContinue) {
  overlay.innerHTML = `
    <div class="minigame-result">
      <h2>🏆 Results!</h2>
      <div class="result-rankings">
        ${rewards
          .map(
            (r) => `
          <div class="result-rank">
            <div class="rank-num">${r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</div>
            <div class="rank-name" style="color: ${r.player.color}">${r.player.emoji} ${r.player.name}</div>
            <div class="rank-reward">+${r.reward} 🪙</div>
          </div>
        `
          )
          .join('')}
      </div>
      <button class="btn btn-primary" id="btn-continue">CONTINUE</button>
    </div>
  `;

  overlay.querySelector('#btn-continue').addEventListener('click', onContinue);
}

export function renderGameOver(overlay, rankings, onRestart) {
  const winner = rankings[0];

  overlay.innerHTML = `
    <div class="gameover-screen">
      <h1>🎉 Game Over!</h1>
      <div class="winner-showcase">
        <div class="winner-avatar" style="background: ${winner.color};">${winner.emoji}</div>
        <div class="winner-name" style="color: ${winner.color};">${winner.name} Wins!</div>
        <div class="winner-stats">⭐ ${winner.stars} Stars · 🪙 ${winner.coins} Coins</div>
      </div>
      <div class="final-standings">
        ${rankings
          .map(
            (p, i) => `
          <div class="standing-row">
            <div class="pos">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
            <div class="name" style="color: ${p.color}">${p.emoji} ${p.name}</div>
            <div class="stats">⭐${p.stars} 🪙${p.coins}</div>
          </div>
        `
          )
          .join('')}
      </div>
      <button class="btn btn-primary" id="btn-restart">PLAY AGAIN</button>
    </div>
  `;

  overlay.querySelector('#btn-restart').addEventListener('click', onRestart);
}
