import type { GameState } from '../game/Game';

interface Props {
  dinoColor: string;
  gameState: GameState;
  onPause: () => void;
  onResume: () => void;
  onSettings: () => void;
}

export function MiniSidebar({ dinoColor, gameState, onPause, onResume, onSettings }: Props) {
  const isRunning = gameState === 'running' || gameState === 'boss';
  const isPaused = gameState === 'paused';

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* Dino color swatch */}
      <div
        className="w-8 h-8 rounded-full border-2 border-purple-300 shadow-sm"
        style={{ backgroundColor: dinoColor }}
        title={`Dino color: ${dinoColor}`}
      />

      {/* Pause / Resume */}
      {isRunning && (
        <button
          onClick={onPause}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 border border-purple-200 text-purple-700 text-sm transition-all shadow-sm"
          title="Pause"
        >
          ⏸
        </button>
      )}
      {isPaused && (
        <button
          onClick={onResume}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-200/80 hover:bg-green-200 border border-green-300 text-green-700 text-sm transition-all shadow-sm"
          title="Resume"
        >
          ▶
        </button>
      )}

      {/* Settings */}
      {(isRunning || isPaused) && (
        <button
          onClick={onSettings}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 border border-purple-200 text-purple-700 text-sm transition-all shadow-sm"
          title="Settings"
        >
          ⚙
        </button>
      )}
    </div>
  );
}
