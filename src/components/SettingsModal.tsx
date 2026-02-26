import type { GameConfig } from '../game/config';
import { ColorPicker } from './ColorPicker';
import { ThemeSelector } from './ThemeSelector';
import { DifficultySelector } from './DifficultySelector';

interface Props {
  config: GameConfig;
  onChange: (partial: Partial<GameConfig>) => void;
  onClose: () => void;
  score: number;
}

export function SettingsModal({ config, onChange, onClose, score }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-white/80 backdrop-blur rounded-2xl shadow-2xl border border-white p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-purple-700">⏸ Paused</h2>
          <span className="text-sm text-purple-400">Score: {score}</span>
        </div>

        <ColorPicker value={config.dinoColor} onChange={(c) => onChange({ dinoColor: c })} />
        <hr className="border-purple-100" />
        <ThemeSelector value={config.obstacleTheme} onChange={(t) => onChange({ obstacleTheme: t })} />
        <hr className="border-purple-100" />
        <DifficultySelector config={config} onChange={onChange} showResetBadge />

        <button
          onClick={onClose}
          className="w-full py-3 bg-green-400 hover:bg-green-500 text-white font-black text-base rounded-xl shadow-md transition-all border-2 border-green-300"
        >
          Resume ▶
        </button>
      </div>
    </div>
  );
}
