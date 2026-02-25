export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const PLAYER_COLORS = ['#ff6b9d', '#4ecdc4', '#ffd93d', '#c44dff'];
export const PLAYER_EMOJIS = ['🦊', '🐸', '🐱', '🐙'];
export const PLAYER_DEFAULT_NAMES = ['Fox', 'Frog', 'Cat', 'Octo'];

export const TILE_TYPES = {
  BLUE: 'blue',
  RED: 'red',
  STAR: 'star',
  EVENT: 'event',
  SHOP: 'shop',
  START: 'start',
};

export const TILE_COLORS = {
  blue: '#4ecdc4',
  red: '#ff6b6b',
  star: '#ffd700',
  event: '#c44dff',
  shop: '#51cf66',
  start: '#ff9f43',
};

export const TILE_EMOJIS = {
  blue: '🔵',
  red: '🔴',
  star: '⭐',
  event: '❓',
  shop: '🛒',
  start: '🏠',
};

export const COIN_REWARDS = {
  blue: 3,
  red: -3,
  event: 0,
  shop: 0,
  start: 0,
  star: 0,
};

export const STAR_COST = 20;

export const MINIGAME_TYPES = ['buttonmash', 'timing', 'memory'];

export const MINIGAME_INFO = {
  buttonmash: {
    name: '🔨 Button Mash!',
    description: 'Tap your key as fast as possible! The fastest masher wins!',
    controls: 'Each player uses their assigned key to mash',
    duration: 8000,
  },
  timing: {
    name: '🎯 Perfect Timing!',
    description: 'Stop the moving needle in the target zone! Closer to center = better score!',
    controls: 'Press your key when the needle is in the green zone',
    duration: 0,
  },
  memory: {
    name: '🧠 Memory Match!',
    description: 'Take turns flipping cards to find matching pairs. Most pairs wins!',
    controls: 'Click cards to flip them',
    duration: 0,
  },
};

export const MINIGAME_REWARDS = [10, 6, 3, 1];

export const PLAYER_KEYS = ['q', 'p', 'z', 'm'];

export const BOARD_CENTER_X = 640;
export const BOARD_CENTER_Y = 380;
export const BOARD_RADIUS_X = 380;
export const BOARD_RADIUS_Y = 240;
export const TILE_SIZE = 40;
