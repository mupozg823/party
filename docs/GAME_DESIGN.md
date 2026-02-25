# Party Stars - Game Design Document

## 1. Overview

**Party Stars**는 마리오 파티 스타일의 웹 기반 보드게임입니다.
2~4명의 플레이어가 보드맵 위를 이동하며 코인과 스타를 모으고,
매 라운드 미니게임을 통해 경쟁합니다.

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Game Engine | **Phaser 3** | 2D 게임에 최적화, Canvas/WebGL 렌더링 |
| Language | **TypeScript** | 타입 안전성, IDE 지원 |
| Build Tool | **Vite** | 빠른 HMR, 간단한 설정 |
| Asset Pipeline | Phaser Loader | 스프라이트, 오디오 통합 관리 |
| Multiplayer | **Local (Pass & Play)** | 1단계: 로컬, 2단계: WebSocket |

## 3. Game Mechanics

### 3.1 Board System
- **노드 기반 맵**: 노드(칸)들이 경로로 연결된 그래프 구조
- **칸 유형**:
  - 🔵 **Blue Space** (+3 코인)
  - 🔴 **Red Space** (-3 코인)
  - ⭐ **Star Space** (스타 구매 가능, 20 코인)
  - 🟢 **Event Space** (랜덤 이벤트 발생)
  - 🟡 **Shop Space** (아이템 구매)
  - ❓ **Chance Space** (보너스/페널티 룰렛)

### 3.2 Turn Flow
```
라운드 시작
  ├─ 플레이어 1: 주사위 → 이동 → 칸 이벤트
  ├─ 플레이어 2: 주사위 → 이동 → 칸 이벤트
  ├─ 플레이어 3: 주사위 → 이동 → 칸 이벤트
  ├─ 플레이어 4: 주사위 → 이동 → 칸 이벤트
  └─ 미니게임 (전원 참여)
라운드 종료 → 다음 라운드
```

### 3.3 Economy
- **코인**: 미니게임 승리, Blue Space, 이벤트로 획득
- **스타**: Star Space에서 20 코인으로 구매 (승리 조건)
- **아이템**: Shop에서 코인으로 구매
  - 🎲 더블 다이스 (2개 주사위)
  - 🛡️ 실드 (Red Space 방어)
  - 🧲 코인 도둑 (상대 코인 훔치기)
  - 🌀 워프 (원하는 위치로 이동)

### 3.4 Mini-Games
- **Free-for-All (FFA)**: 4인 개별 경쟁
- **2v2 Team**: 2:2 팀 대결 (칸 색상 기반 팀 편성)
- **1v3**: 1명 vs 3명

#### 구현할 미니게임 목록

| # | 이름 | 유형 | 조작 | 설명 |
|---|------|------|------|------|
| 1 | **Coin Catch** | FFA/Action | 방향키 | 떨어지는 코인을 이동하며 수집 |
| 2 | **Memory Match** | FFA/Puzzle | 클릭 | 카드 짝 맞추기, 가장 빨리 완성 |
| 3 | **Lucky Roulette** | FFA/Luck | 타이밍 클릭 | 룰렛 돌려서 높은 점수 노리기 |

### 3.5 Victory Condition
- 설정된 라운드 수(10/15/20) 완료 시
- **스타** 수 → 동률 시 **코인** 수로 순위 결정
- 보너스 스타: 미니게임왕, 코인부자, 이벤트왕

## 4. Architecture

```
src/
├── main.ts                    # 엔트리포인트
├── config.ts                  # Phaser 게임 설정
├── scenes/
│   ├── BootScene.ts           # 에셋 로딩
│   ├── MenuScene.ts           # 메인 메뉴
│   ├── CharacterSelectScene.ts # 캐릭터 선택
│   ├── BoardScene.ts          # 보드 게임 메인
│   ├── DiceScene.ts           # 주사위 UI 오버레이
│   ├── MinigameSelectScene.ts # 미니게임 선택 연출
│   └── minigames/
│       ├── CoinCatchScene.ts  # 코인 캐치
│       ├── MemoryMatchScene.ts # 메모리 매치
│       └── LuckyRouletteScene.ts # 럭키 룰렛
├── objects/
│   ├── Player.ts              # 플레이어 엔티티
│   ├── BoardNode.ts           # 보드 노드
│   ├── Dice.ts                # 주사위
│   └── Item.ts                # 아이템
├── managers/
│   ├── GameManager.ts         # 전체 게임 흐름 관리
│   ├── TurnManager.ts         # 턴 순서 관리
│   ├── BoardManager.ts        # 보드 상태 관리
│   └── MinigameManager.ts     # 미니게임 선택/결과 관리
├── data/
│   ├── boards/
│   │   └── board1.json        # 보드 맵 데이터
│   └── characters.ts          # 캐릭터 정의
├── ui/
│   ├── HUD.ts                 # 인게임 HUD
│   ├── PlayerPanel.ts         # 플레이어 정보 패널
│   └── Dialog.ts              # 대화/알림 UI
├── utils/
│   └── helpers.ts             # 유틸리티 함수
└── types/
    └── index.ts               # 타입 정의
```

## 5. Rendering & Visual Style

- **해상도**: 1280 × 720 (16:9)
- **스타일**: 밝고 컬러풀한 카툰 스타일
- **프로그래매틱 아트**: 초기에는 Phaser Graphics API로 도형 기반 렌더링
- **애니메이션**: Tween 기반 부드러운 이동/전환

## 6. Phase Plan

### Phase 1 (MVP) ← 현재
- [x] 설계 문서
- [ ] 프로젝트 셋업
- [ ] 보드맵 (1개)
- [ ] 턴 시스템
- [ ] 주사위
- [ ] 미니게임 3종
- [ ] 기본 UI

### Phase 2
- [ ] 아이템 시스템
- [ ] 추가 보드맵
- [ ] 추가 미니게임 5종
- [ ] 사운드 & 음악
- [ ] 세이브/로드

### Phase 3
- [ ] 온라인 멀티플레이 (WebSocket)
- [ ] 매치메이킹
- [ ] 리더보드
- [ ] 커스텀 보드 에디터
