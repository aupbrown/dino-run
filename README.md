# 🦕 Dino Run!

A **kawaii pastel** endless runner game built with React, TypeScript, and the Canvas 2D API — inspired by the Chrome dinosaur game.

## ✨ Features

- **Endless runner gameplay** — jump to avoid obstacles, score rises as you survive
- **Progressive difficulty** — game speed increases over time
- **Kawaii art style** — soft pastel palette, cute faces on every character and obstacle
- **4 obstacle themes** — Classic (cacti), Birds (pterodactyls), Mixed, Urban (cars & signs)
- **3 difficulty presets** — Easy, Medium, Hard, plus a Custom mode with speed/frequency sliders
- **Power-ups** — Shield (absorbs one hit), Slow-Mo (halves speed for 5s), Star (2× score for 10s)
- **Boss fights** — every 500 points a giant boss appears; survive 8 seconds for +200 bonus points
- **Particle effects** — dust puffs on jump/land, sparkles on milestones, debris on collision, boss explosions
- **Synthesized sound** — all sound effects generated via the Web Audio API (no audio files required)
- **Day/Night cycle** — sky gradient, twinkling stars, moon & sun, transitions every ~700 frames
- **Full customization** — choose dino color, obstacle theme, and difficulty before each run
- **High score** — persisted in `localStorage`
- **Mobile friendly** — tap to jump, no page scroll on touch
- **Responsive canvas** — 4:1 aspect ratio, adapts to any window size

## 🛠 Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [React](https://react.dev) | 19 | UI shell & state management |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety throughout |
| [Vite](https://vite.dev) | 7 | Build tooling & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [pnpm](https://pnpm.io) | 10 | Fast, disk-efficient package manager |
| [ESLint](https://eslint.org) | 9 | Linting (flat config) |
| [Prettier](https://prettier.io) | 3 | Code formatting |

The game engine (`src/game/`) is **pure TypeScript with zero React dependencies** — it communicates with React only through callbacks and a shared config ref.

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** — install with `npm install -g pnpm`

### Install & Run

```bash
git clone https://github.com/aupbrown/dino-run.git
cd dino-run
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Press **Space** or tap to jump.

### Other Commands

```bash
pnpm build      # TypeScript compile + production Vite bundle → dist/
pnpm preview    # Serve the production build locally
pnpm lint       # Run ESLint (zero errors expected)
```

## 🗂 Project Structure

```
dino_game/
├── index.html
├── vite.config.ts          # Vite + @tailwindcss/vite + @vitejs/plugin-react
├── tsconfig.app.json       # Strict TS (verbatimModuleSyntax, noUnusedLocals…)
├── eslint.config.js        # Flat ESLint with TS, React Hooks, Prettier
├── .prettierrc
└── src/
    ├── main.tsx            # React root mount
    ├── App.tsx             # Root — owns config state, screen routing (lobby/game)
    ├── index.css           # Tailwind @import + CSS custom properties
    ├── components/
    │   ├── LobbyScreen.tsx        # Pre-game customization screen + animated dino
    │   ├── GameCanvas.tsx         # Canvas mount, game lifecycle (useRef/useEffect)
    │   ├── MiniSidebar.tsx        # In-game color swatch + pause/settings button
    │   ├── SettingsModal.tsx      # Pause overlay — mirrors LobbyScreen controls
    │   ├── ColorPicker.tsx        # Dino color picker (presets + <input type="color">)
    │   ├── ThemeSelector.tsx      # Obstacle theme button group
    │   ├── DifficultySelector.tsx # Difficulty buttons + custom speed/frequency sliders
    │   └── ScoreDisplay.tsx       # Score + high score overlay
    └── game/                      # Pure TypeScript — zero React imports
        ├── config.ts              # GameConfig type + DIFFICULTY_PRESETS
        ├── utils.ts               # checkAABB, lerpColor, randomInRange, drawRoundRect
        ├── Game.ts                # Orchestrator — RAF loop, state machine, score, collisions
        ├── Dino.ts                # Player physics, kawaii face states, shield flash
        ├── Ground.ts              # Scrolling ground + animated flower doodles
        ├── InputHandler.ts        # Keyboard + touch → onAction callback
        ├── ObstacleManager.ts     # Spawn timer, pool, culling, factory map
        ├── PowerUpManager.ts      # Spawns/collects/applies power-ups
        ├── BossManager.ts         # Boss wave trigger, sine-wave movement, defeat logic
        ├── ParticleSystem.ts      # Dust, sparkles, debris, boss burst emitters
        ├── SoundManager.ts        # Web Audio API synthesized sounds (no files)
        ├── DayNightCycle.ts       # Sky gradient lerp, stars, moon/sun
        └── obstacles/
            ├── Obstacle.ts        # Abstract base — getBounds(), draw(), kawaii face helpers
            ├── CactusObstacle.ts  # Small + large cactus with googly eyes
            ├── BirdObstacle.ts    # Three height levels, animated wing flap, beak
            └── UrbanObstacle.ts   # Car (spinning wheels) + road sign variants
```

## 🏗 Architecture Overview

### Config Sharing (React ↔ Game Engine)

React owns config state; the game engine reads it every frame without triggering re-renders:

```ts
// App.tsx
const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
const configRef = useRef(config);
useEffect(() => { configRef.current = config; }, [config]);

// configRef is passed into Game — reads configRef.current each frame (O(1), no re-render)
```

### Game Loop

`Game.ts` owns a single `requestAnimationFrame` loop. Each tick:

1. Skip frames where `dt > 100ms` (tab was hidden)
2. Increment score & speed
3. Check milestone / boss triggers
4. Update all entities — ground, dino, obstacles, boss, power-ups, particles
5. Run AABB collision detection with configurable per-side inset for fairness
6. Draw everything to the canvas

### State Machine

```
idle ──[space/tap]──▶ running ──[collision]──▶ gameover ──[space/tap]──▶ running
                          │                                                   ▲
                     [500 pts]──▶ boss ──[8s survived]──────────────────────┘
                          │
                     [pause btn]──▶ paused ──[resume]──▶ running
```

## 🤝 Contributing

Contributions are very welcome! Here are some good places to start:

### Good First Issues

- [ ] Add ducking mechanic — hold ↓ / swipe down to crouch under birds
- [ ] Local leaderboard — top 10 scores with initials, stored in `localStorage`
- [ ] More dino color presets in `ColorPicker.tsx`
- [ ] Animate the score counter (tick up visually instead of jumping)
- [ ] Add a mute button to `MiniSidebar`

### Bigger Features

- [ ] New obstacle theme — **Space** (asteroids, UFOs, satellite dishes)
- [ ] New power-up — **Magnet** (auto-collects nearby power-ups)
- [ ] Unlockable dino skins after reaching score milestones
- [ ] Achievements panel (e.g. "Survive first boss", "Score 1000")
- [ ] Accessibility — ARIA live region for score, keyboard-navigable lobby

### How to Contribute

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Follow the code style** — run `pnpm lint` before committing; zero warnings allowed:
   ```bash
   pnpm lint
   pnpm build   # also confirms TypeScript compiles cleanly
   ```

3. **Keep the game engine pure** — `src/game/` must not import from React.
   Communicate with the React layer only via callbacks passed into `Game`'s constructor.

4. **No audio files** — all sounds must be synthesized in `SoundManager.ts` using the Web Audio API.

5. **Test manually**:
   - All 4 obstacle themes
   - All 3 difficulty presets + custom mode
   - Mobile touch (use DevTools device simulation)
   - Window resize (canvas should reflow correctly)
   - High score persistence (check DevTools → Application → Local Storage)

6. **Open a pull request** with a clear title and description of what changed and why.

### Local Dev Tips

- Hot Module Replacement is active — save a file and the game updates in the browser instantly
- Boss fights spawn at 500, 1000, 1500… points — lower `BOSS_SURVIVE_FRAMES` in `BossManager.ts` while developing
- All difficulty values (speed, spawn rate, jump velocity, gravity) live in `DIFFICULTY_PRESETS` in `config.ts`
- The `HITBOX_SHRINK` constant in `utils.ts` controls collision fairness — increase it to make the game more forgiving

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
