import type { ObstacleTheme } from '../game/config';

interface Props {
  value: ObstacleTheme;
  onChange: (theme: ObstacleTheme) => void;
}

const THEMES: { id: ObstacleTheme; label: string; emoji: string }[] = [
  { id: 'classic', label: 'Classic', emoji: '🌵' },
  { id: 'birds', label: 'Birds', emoji: '🐦' },
  { id: 'mixed', label: 'Mixed', emoji: '🎲' },
  { id: 'urban', label: 'Urban', emoji: '🚗' },
];

export function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-purple-700">Obstacle Theme</label>
      <div className="flex gap-2 flex-wrap">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
              value === t.id
                ? 'bg-purple-200 border-purple-400 text-purple-800 shadow-sm'
                : 'bg-white/60 border-purple-100 text-purple-600 hover:bg-purple-50'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
