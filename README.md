# Party Stars 🎉

마리오 파티 스타일의 웹 기반 보드게임입니다. 2~4명의 플레이어가 보드맵 위를 이동하며
코인과 스타를 모으고, 매 라운드 미니게임을 통해 경쟁합니다.

## 실행 방법

```bash
# 방법 1: Python 내장 서버
python3 -m http.server 8080 -d public

# 방법 2: Node.js 서버
node server.js
```

브라우저에서 `http://localhost:8080` 접속

## 게임 특징

- **보드게임**: 주사위를 굴려 노드 기반 맵을 이동
- **6가지 칸 유형**: Blue(+코인), Red(-코인), Star(★구매), Event(랜덤), Shop(아이템), Chance(찬스)
- **아이템 시스템**: 더블 다이스, 실드, 코인 도둑, 워프
- **미니게임 3종**: 코인 캐치(액션), 메모리 매치(퍼즐), 럭키 룰렛(운)
- **보너스 스타**: 미니게임왕, 코인부자, 이벤트왕

## 조작법

### 보드게임
- 마우스 클릭으로 주사위, 메뉴, 대화 조작

### 미니게임 - 코인 캐치
| 플레이어 | 좌 | 우 |
|----------|-----|-----|
| P1 | A | D |
| P2 | ← | → |
| P3 | J | L |
| P4 | 4 | 6 |

### 미니게임 - 메모리 매치 / 럭키 룰렛
- 마우스 클릭

## 기술 스택

- 순수 HTML5 Canvas (외부 라이브러리 없음)
- ES Modules
- Web Audio API (프로그래매틱 사운드)

## 프로젝트 구조

```
src/
├── main.js              # 엔트리포인트
├── engine/              # 게임 엔진 코어
│   ├── Game.js          # 메인 게임 루프
│   ├── Canvas.js        # 캔버스 렌더링
│   ├── Input.js         # 입력 처리
│   ├── SceneManager.js  # 씬 관리
│   ├── Tween.js         # 애니메이션
│   └── Audio.js         # 사운드
├── scenes/              # 게임 씬
│   ├── MenuScene.js
│   ├── CharacterSelectScene.js
│   ├── BoardScene.js
│   ├── ResultsScene.js
│   └── minigames/
│       ├── CoinCatchScene.js
│       ├── MemoryMatchScene.js
│       └── LuckyRouletteScene.js
├── managers/            # 게임 로직 관리
├── data/                # 게임 데이터
├── ui/                  # UI 컴포넌트
└── utils/               # 유틸리티
```
