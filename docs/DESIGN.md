# Party Game - 설계 문서

## 1. 개요

마리오 파티 스타일의 웹 기반 보드게임 파티 게임.
2~4명의 플레이어가 보드 위를 이동하며 코인과 스타를 모으고, 턴마다 미니게임을 통해 경쟁한다.

## 2. 기술 스택

| 기술 | 선택 | 이유 |
|------|------|------|
| 빌드 도구 | Vite | 빠른 HMR, TypeScript 기본 지원 |
| UI 프레임워크 | React 18 | 컴포넌트 기반 UI, 상태 관리 용이 |
| 언어 | TypeScript | 타입 안정성, 게임 로직 복잡도 관리 |
| 스타일링 | CSS Modules | 컴포넌트 스코프 스타일 |
| 보드 렌더링 | SVG + React | 벡터 기반, 이벤트 처리 용이 |
| 멀티플레이어 | 로컬 (Hot-Seat) | 초기 버전: 같은 디바이스에서 턴제 |

## 3. 게임 메커닉

### 3.1 보드 게임
- **보드**: 원형/사각형 경로 기반 타일맵 (20~30칸)
- **타일 종류**:
  - 🔵 파란칸 (Blue): +3 코인
  - 🔴 빨간칸 (Red): -3 코인
  - ⭐ 스타칸 (Star): 스타 구매 가능 (20코인)
  - ❓ 이벤트칸 (Event): 랜덤 이벤트
  - 🛒 상점칸 (Shop): 아이템 구매
- **이동**: 주사위 (1~10) 굴려서 이동
- **방향**: 분기점에서 플레이어가 방향 선택

### 3.2 경제 시스템
- **코인**: 미니게임 승리, 파란칸 등으로 획득
- **스타**: 스타칸에서 20코인으로 구매 (승리 조건)
- **아이템**: 
  - 🍄 버섯 (주사위 2개)
  - 🔧 렌치 (다른 플레이어 코인 절반 훔치기)
  - ⭐ 스타 훔치기 파이프

### 3.3 턴 구조
```
1. 현재 플레이어 주사위 굴리기
2. 보드 위 이동 → 칸 효과 발동
3. 모든 플레이어 턴 완료 후 → 미니게임
4. 미니게임 결과에 따른 보상
5. 설정 턴 수 완료 시 → 결과 화면
```

### 3.4 미니게임
- **버튼 매시 (Button Mash)**: 제한 시간 내 가장 많이 클릭
- **타이밍 게임 (Timing)**: 정확한 타이밍에 스톱
- **메모리 게임 (Memory)**: 카드 매칭
- **리듬 게임 (Rhythm)**: 떨어지는 노트를 타이밍에 맞춰 입력

## 4. 게임 상태 구조

```typescript
interface GameState {
  phase: 'title' | 'setup' | 'board' | 'dice' | 'moving' | 'tile-effect' | 
         'minigame-intro' | 'minigame' | 'minigame-result' | 'game-over';
  currentPlayerIndex: number;
  turnNumber: number;
  maxTurns: number;
  players: Player[];
  board: BoardTile[];
  starPosition: number;
  minigame: MiniGameState | null;
}
```

## 5. 프로젝트 구조

```
src/
├── main.tsx
├── App.tsx
├── game/
│   ├── types.ts           # 모든 타입 정의
│   ├── constants.ts       # 게임 상수
│   ├── engine.ts          # 게임 엔진 (상태 머신)
│   ├── board.ts           # 보드 생성/관리
│   └── utils.ts           # 유틸리티 함수
├── components/
│   ├── TitleScreen.tsx     # 타이틀 화면
│   ├── GameSetup.tsx       # 게임 설정 (인원 수, 턴 수)
│   ├── GameBoard.tsx       # 보드 렌더링
│   ├── PlayerHUD.tsx       # 플레이어 정보 표시
│   ├── DiceRoll.tsx        # 주사위 UI
│   ├── TileEffect.tsx      # 타일 효과 표시
│   ├── MiniGameIntro.tsx   # 미니게임 소개
│   ├── MiniGameResult.tsx  # 미니게임 결과
│   ├── GameOver.tsx        # 게임 종료/결과
│   └── minigames/
│       ├── ButtonMash.tsx
│       ├── TimingGame.tsx
│       ├── MemoryGame.tsx
│       └── RhythmGame.tsx
└── styles/
    ├── global.css
    ├── board.module.css
    └── minigames.module.css
```

## 6. 승리 조건
- 설정된 턴 수 종료 후 **가장 많은 스타**를 가진 플레이어 승리
- 스타 동률 시 **코인이 많은** 플레이어 승리
