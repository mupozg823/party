import assert from 'assert';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

console.log('\n🧪 Running tests...\n');

console.log('Board Generation:');

test('generateBoard creates correct number of tiles', async () => {
  const { generateBoard } = await import('../src/game/board.js');
  const board = generateBoard(24);
  assert.ok(board.length >= 24, `Expected >= 24 tiles, got ${board.length}`);
});

test('board has start tile at index 0', async () => {
  const { generateBoard } = await import('../src/game/board.js');
  const board = generateBoard(24);
  assert.strictEqual(board[0].type, 'start');
});

test('board has a star tile', async () => {
  const { generateBoard, getStarTileId } = await import('../src/game/board.js');
  const board = generateBoard(24);
  const starId = getStarTileId(board);
  assert.ok(starId >= 0, 'No star tile found');
});

test('tiles have valid positions', async () => {
  const { generateBoard } = await import('../src/game/board.js');
  const board = generateBoard(24);
  for (const tile of board) {
    assert.ok(typeof tile.x === 'number' && !isNaN(tile.x), `Tile ${tile.id} has invalid x`);
    assert.ok(typeof tile.y === 'number' && !isNaN(tile.y), `Tile ${tile.id} has invalid y`);
  }
});

test('tiles have next connections', async () => {
  const { generateBoard } = await import('../src/game/board.js');
  const board = generateBoard(24);
  for (const tile of board) {
    assert.ok(Array.isArray(tile.next), `Tile ${tile.id} has no next array`);
    assert.ok(tile.next.length > 0, `Tile ${tile.id} has no connections`);
  }
});

console.log('\nGame Engine:');

test('createGameState initializes correctly', async () => {
  const { createGameState } = await import('../src/game/engine.js');
  const state = createGameState(4, 10, ['A', 'B', 'C', 'D']);
  assert.strictEqual(state.players.length, 4);
  assert.strictEqual(state.maxTurns, 10);
  assert.strictEqual(state.turnNumber, 1);
  assert.strictEqual(state.currentPlayerIndex, 0);
});

test('players start with 10 coins and 0 stars', async () => {
  const { createGameState } = await import('../src/game/engine.js');
  const state = createGameState(2, 5, ['A', 'B']);
  for (const p of state.players) {
    assert.strictEqual(p.coins, 10);
    assert.strictEqual(p.stars, 0);
  }
});

test('rollDice returns 1-10', async () => {
  const { rollDice } = await import('../src/game/engine.js');
  for (let i = 0; i < 100; i++) {
    const val = rollDice();
    assert.ok(val >= 1 && val <= 10, `Dice ${val} out of range`);
  }
});

test('movePlayer updates player position', async () => {
  const { createGameState, movePlayer } = await import('../src/game/engine.js');
  const state = createGameState(2, 5, ['A', 'B']);
  state.movesLeft = 3;
  movePlayer(state, 5);
  assert.strictEqual(state.players[0].tileIndex, 5);
  assert.strictEqual(state.movesLeft, 2);
});

test('buyStar deducts coins and adds star', async () => {
  const { createGameState, buyStar } = await import('../src/game/engine.js');
  const state = createGameState(2, 5, ['A', 'B']);
  state.players[0].coins = 30;
  state.pendingStarPurchase = true;
  const result = buyStar(state);
  assert.ok(result);
  assert.strictEqual(state.players[0].coins, 10);
  assert.strictEqual(state.players[0].stars, 1);
});

test('buyStar fails with insufficient coins', async () => {
  const { createGameState, buyStar } = await import('../src/game/engine.js');
  const state = createGameState(2, 5, ['A', 'B']);
  state.players[0].coins = 5;
  const result = buyStar(state);
  assert.ok(!result);
  assert.strictEqual(state.players[0].stars, 0);
});

test('advanceToNextPlayer cycles through players', async () => {
  const { createGameState, advanceToNextPlayer } = await import('../src/game/engine.js');
  const state = createGameState(3, 5, ['A', 'B', 'C']);
  assert.strictEqual(state.currentPlayerIndex, 0);
  let roundDone = advanceToNextPlayer(state);
  assert.ok(!roundDone);
  assert.strictEqual(state.currentPlayerIndex, 1);
  roundDone = advanceToNextPlayer(state);
  assert.ok(!roundDone);
  assert.strictEqual(state.currentPlayerIndex, 2);
  roundDone = advanceToNextPlayer(state);
  assert.ok(roundDone);
  assert.strictEqual(state.currentPlayerIndex, 0);
});

test('getWinner sorts by stars then coins', async () => {
  const { createGameState, getWinner } = await import('../src/game/engine.js');
  const state = createGameState(3, 5, ['A', 'B', 'C']);
  state.players[0].stars = 1;
  state.players[0].coins = 5;
  state.players[1].stars = 2;
  state.players[1].coins = 3;
  state.players[2].stars = 1;
  state.players[2].coins = 10;
  const rankings = getWinner(state);
  assert.strictEqual(rankings[0].name, 'B');
  assert.strictEqual(rankings[1].name, 'C');
  assert.strictEqual(rankings[2].name, 'A');
});

test('pickRandomMinigame returns valid type', async () => {
  const { pickRandomMinigame } = await import('../src/game/engine.js');
  const { MINIGAME_TYPES } = await import('../src/game/constants.js');
  for (let i = 0; i < 50; i++) {
    const type = pickRandomMinigame();
    assert.ok(MINIGAME_TYPES.includes(type), `Invalid type: ${type}`);
  }
});

console.log('\nConstants:');

test('PLAYER_COLORS has 4 entries', async () => {
  const { PLAYER_COLORS } = await import('../src/game/constants.js');
  assert.strictEqual(PLAYER_COLORS.length, 4);
});

test('MINIGAME_REWARDS has 4 entries', async () => {
  const { MINIGAME_REWARDS } = await import('../src/game/constants.js');
  assert.strictEqual(MINIGAME_REWARDS.length, 4);
  assert.ok(MINIGAME_REWARDS[0] > MINIGAME_REWARDS[1]);
});

setTimeout(() => {
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}, 500);
