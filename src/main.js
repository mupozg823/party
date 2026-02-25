import { Game } from './engine/Game.js';
import { MenuScene } from './scenes/MenuScene.js';
import { HowToPlayScene } from './scenes/HowToPlayScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { BoardScene } from './scenes/BoardScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { CoinCatchScene } from './scenes/minigames/CoinCatchScene.js';
import { MemoryMatchScene } from './scenes/minigames/MemoryMatchScene.js';
import { LuckyRouletteScene } from './scenes/minigames/LuckyRouletteScene.js';

const game = new Game('game-canvas', 1280, 720);

game.scenes.add('menu', new MenuScene(game));
game.scenes.add('howToPlay', new HowToPlayScene(game));
game.scenes.add('characterSelect', new CharacterSelectScene(game));
game.scenes.add('board', new BoardScene(game));
game.scenes.add('results', new ResultsScene(game));
game.scenes.add('coinCatch', new CoinCatchScene(game));
game.scenes.add('memoryMatch', new MemoryMatchScene(game));
game.scenes.add('luckyRoulette', new LuckyRouletteScene(game));

game.canvas.canvas.addEventListener('click', () => {
  game.audio.ensureContext();
}, { once: true });

game.start('menu');
