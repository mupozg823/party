# AGENTS.md

## Project: Party Stars

마리오 파티 스타일의 웹 기반 보드게임입니다.

### Tech Stack

- **Language**: JavaScript (ES Modules)
- **Rendering**: HTML5 Canvas API
- **Audio**: Web Audio API (programmatic sounds)
- **Server**: Node.js built-in `http` module (development)
- **External Dependencies**: None (zero-dependency)

### Running the Project

```bash
# Start development server
node server.js
# Then open http://localhost:8080
```

Or with Python:
```bash
python3 -m http.server 8080 -d public
```

### Project Structure

- `public/` - Static HTML entry point
- `src/engine/` - Custom game engine (Canvas, Input, SceneManager, Tween, Audio)
- `src/scenes/` - Game scenes (Menu, CharacterSelect, Board, Results)
- `src/scenes/minigames/` - Mini-game implementations
- `src/managers/` - Game state management
- `src/data/` - Game data (boards, characters, items)
- `src/ui/` - Reusable UI components (Button, Dialog, HUD)
- `src/utils/` - Helper functions
- `docs/` - Game design documentation

### Build/Test/Lint

- **No build step required** - ES Modules run directly in the browser
- **No test framework** - Manual testing via browser
- **No linter configured** - Standard JavaScript

### Development Notes

- All rendering uses programmatic graphics (Canvas shapes/text), no image assets required
- Audio uses Web Audio API oscillators for SFX, no audio files needed
- Scene transitions use a fade-to-black system
- Board maps are defined as node graphs in `src/data/boards.js`
