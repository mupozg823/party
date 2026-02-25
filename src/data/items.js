export const ITEMS = {
  DOUBLE_DICE: {
    id: 'double_dice',
    name: '더블 다이스',
    description: '주사위 2개를 굴립니다',
    cost: 5,
    emoji: '🎲'
  },
  SHIELD: {
    id: 'shield',
    name: '실드',
    description: 'Red Space 효과를 방어합니다',
    cost: 3,
    emoji: '🛡️'
  },
  COIN_THIEF: {
    id: 'coin_thief',
    name: '코인 도둑',
    description: '상대의 코인 5개를 훔칩니다',
    cost: 8,
    emoji: '🧲'
  },
  WARP: {
    id: 'warp',
    name: '워프',
    description: '스타 칸으로 즉시 이동합니다',
    cost: 10,
    emoji: '🌀'
  }
};

export const SHOP_ITEMS = [ITEMS.DOUBLE_DICE, ITEMS.SHIELD, ITEMS.COIN_THIEF, ITEMS.WARP];
