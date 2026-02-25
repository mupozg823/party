export const SPACE_TYPES = {
  BLUE: 'blue',
  RED: 'red',
  STAR: 'star',
  EVENT: 'event',
  SHOP: 'shop',
  CHANCE: 'chance',
  START: 'start'
};

export const SPACE_COLORS = {
  [SPACE_TYPES.BLUE]: '#4ECDC4',
  [SPACE_TYPES.RED]: '#FF6B6B',
  [SPACE_TYPES.STAR]: '#FFD93D',
  [SPACE_TYPES.EVENT]: '#6C5CE7',
  [SPACE_TYPES.SHOP]: '#A8E6CF',
  [SPACE_TYPES.CHANCE]: '#FDA7DF',
  [SPACE_TYPES.START]: '#FFFFFF'
};

export const SPACE_LABELS = {
  [SPACE_TYPES.BLUE]: '+3',
  [SPACE_TYPES.RED]: '-3',
  [SPACE_TYPES.STAR]: '★',
  [SPACE_TYPES.EVENT]: '!',
  [SPACE_TYPES.SHOP]: '$',
  [SPACE_TYPES.CHANCE]: '?',
  [SPACE_TYPES.START]: 'S'
};

export const BOARD_1 = {
  name: 'Starlight Island',
  nodes: [
    { id: 0, x: 200, y: 500, type: SPACE_TYPES.START, next: [1] },
    { id: 1, x: 280, y: 440, type: SPACE_TYPES.BLUE, next: [2] },
    { id: 2, x: 370, y: 400, type: SPACE_TYPES.BLUE, next: [3] },
    { id: 3, x: 460, y: 370, type: SPACE_TYPES.RED, next: [4] },
    { id: 4, x: 550, y: 340, type: SPACE_TYPES.EVENT, next: [5] },
    { id: 5, x: 640, y: 310, type: SPACE_TYPES.BLUE, next: [6] },
    { id: 6, x: 730, y: 280, type: SPACE_TYPES.CHANCE, next: [7, 14] },
    { id: 7, x: 820, y: 240, type: SPACE_TYPES.BLUE, next: [8] },
    { id: 8, x: 900, y: 200, type: SPACE_TYPES.SHOP, next: [9] },
    { id: 9, x: 960, y: 280, type: SPACE_TYPES.BLUE, next: [10] },
    { id: 10, x: 1000, y: 370, type: SPACE_TYPES.STAR, next: [11] },
    { id: 11, x: 960, y: 460, type: SPACE_TYPES.RED, next: [12] },
    { id: 12, x: 890, y: 520, type: SPACE_TYPES.BLUE, next: [13] },
    { id: 13, x: 800, y: 560, type: SPACE_TYPES.EVENT, next: [20] },

    { id: 14, x: 730, y: 370, type: SPACE_TYPES.BLUE, next: [15] },
    { id: 15, x: 720, y: 460, type: SPACE_TYPES.RED, next: [16] },
    { id: 16, x: 680, y: 540, type: SPACE_TYPES.CHANCE, next: [17] },
    { id: 17, x: 610, y: 590, type: SPACE_TYPES.BLUE, next: [18] },
    { id: 18, x: 520, y: 600, type: SPACE_TYPES.STAR, next: [19] },
    { id: 19, x: 430, y: 580, type: SPACE_TYPES.BLUE, next: [20] },

    { id: 20, x: 700, y: 620, type: SPACE_TYPES.SHOP, next: [21] },
    { id: 21, x: 600, y: 660, type: SPACE_TYPES.BLUE, next: [22] },
    { id: 22, x: 490, y: 670, type: SPACE_TYPES.RED, next: [23] },
    { id: 23, x: 380, y: 660, type: SPACE_TYPES.EVENT, next: [24] },
    { id: 24, x: 280, y: 620, type: SPACE_TYPES.BLUE, next: [25] },
    { id: 25, x: 210, y: 560, type: SPACE_TYPES.CHANCE, next: [0] },
  ],
  starPositions: [10, 18],
  startNode: 0
};
