interface Props {
  score: number;
  highScore: number;
  starActive?: boolean;
}

export function ScoreDisplay({ score, highScore, starActive }: Props) {
  return (
    <div className="absolute top-2 right-3 flex flex-col items-end gap-0.5 pointer-events-none select-none">
      <div
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold shadow-sm transition-all ${
          starActive
            ? 'bg-yellow-200/90 text-yellow-800 ring-2 ring-yellow-400'
            : 'bg-white/70 text-purple-800'
        }`}
      >
        {starActive && <span className="text-sm">⭐</span>}
        <span>{String(score).padStart(5, '0')}</span>
      </div>
      <div className="bg-white/50 px-2 py-0.5 rounded-full text-xs text-purple-500 font-medium">
        Best: {String(highScore).padStart(5, '0')}
      </div>
    </div>
  );
}
