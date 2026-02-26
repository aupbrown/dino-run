import type { Difficulty, GameConfig } from '../game/config';

interface Props {
  config: GameConfig;
  onChange: (partial: Partial<GameConfig>) => void;
  showResetBadge?: boolean;
}

const DIFFICULTIES: { id: Difficulty; label: string; emoji: string; color: string }[] = [
  { id: 'easy', label: 'Easy', emoji: '🌸', color: 'green' },
  { id: 'medium', label: 'Medium', emoji: '⭐', color: 'yellow' },
  { id: 'hard', label: 'Hard', emoji: '🔥', color: 'red' },
  { id: 'custom', label: 'Custom', emoji: '⚙', color: 'blue' },
];

const COLOR_MAP: Record<string, { active: string; inactive: string }> = {
  green: { active: 'bg-green-200 border-green-400 text-green-800', inactive: 'bg-white/60 border-green-100 text-green-700 hover:bg-green-50' },
  yellow: { active: 'bg-yellow-200 border-yellow-400 text-yellow-800', inactive: 'bg-white/60 border-yellow-100 text-yellow-700 hover:bg-yellow-50' },
  red: { active: 'bg-red-200 border-red-400 text-red-800', inactive: 'bg-white/60 border-red-100 text-red-700 hover:bg-red-50' },
  blue: { active: 'bg-blue-200 border-blue-400 text-blue-800', inactive: 'bg-white/60 border-blue-100 text-blue-700 hover:bg-blue-50' },
};

export function DifficultySelector({ config, onChange, showResetBadge }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-purple-700">Difficulty</label>
        {showResetBadge && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
            applies next game
          </span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {DIFFICULTIES.map((d) => {
          const colors = COLOR_MAP[d.color];
          return (
            <button
              key={d.id}
              onClick={() => onChange({ difficulty: d.id })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                config.difficulty === d.id ? colors.active : colors.inactive
              }`}
            >
              {d.emoji} {d.label}
            </button>
          );
        })}
      </div>

      {config.difficulty === 'custom' && (
        <div className="flex flex-col gap-2 mt-1 p-3 bg-white/40 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-700 w-20">Speed: {config.customSpeed}</span>
            <input
              type="range"
              min={1}
              max={20}
              value={config.customSpeed}
              onChange={(e) => onChange({ customSpeed: Number(e.target.value) })}
              className="flex-1 accent-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-700 w-20">Freq: {config.customFrequency}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={config.customFrequency}
              onChange={(e) => onChange({ customFrequency: Number(e.target.value) })}
              className="flex-1 accent-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
