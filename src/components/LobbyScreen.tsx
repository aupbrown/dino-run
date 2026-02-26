import { useEffect, useRef } from 'react';
import type { GameConfig } from '../game/config';
import { ColorPicker } from './ColorPicker';
import { ThemeSelector } from './ThemeSelector';
import { DifficultySelector } from './DifficultySelector';

interface Props {
  config: GameConfig;
  onChange: (partial: Partial<GameConfig>) => void;
  onPlay: () => void;
  highScore: number;
}

export function LobbyScreen({ config, onChange, onPlay, highScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Animated idle dino on lobby
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      frameRef.current++;
      const f = frameRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bobY = Math.sin(f * 0.08) * 6;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + bobY;

      // Simple kawaii dino
      ctx.fillStyle = config.dinoColor;

      // Body
      ctx.beginPath();
      ctx.roundRect(cx - 18, cy - 10, 36, 32, 8);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.roundRect(cx - 12, cy - 36, 32, 30, 10);
      ctx.fill();
      // Neck
      ctx.fillRect(cx - 8, cy - 18, 22, 14);

      // Belly
      ctx.fillStyle = '#fff8';
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy + 6, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.fillStyle = config.dinoColor;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy + 12);
      ctx.quadraticCurveTo(cx - 38, cy + 18, cx - 30, cy - 2);
      ctx.quadraticCurveTo(cx - 24, cy + 4, cx - 18, cy + 6);
      ctx.fill();

      // Legs (animated)
      const legToggle = Math.floor(f / 8) % 2 === 0;
      const l1 = legToggle ? 14 : 16;
      const l2 = legToggle ? 16 : 14;
      ctx.fillRect(cx - 10, cy + 20, 10, l1);
      ctx.fillRect(cx + 4, cy + 20, 10, l2);

      // Eyes (happy)
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 12, cy - 24, 3, 0, Math.PI * 2);
      ctx.fill();
      // Eye shines
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx + 1, cy - 25, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 13, cy - 25, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Blush
      ctx.fillStyle = 'rgba(255,150,170,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 4, cy - 19, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 16, cy - 19, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 14, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [config.dinoColor]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-lavender-100 z-50">
      <div className="w-full max-w-lg mx-4 flex flex-col items-center gap-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-purple-700 drop-shadow-sm tracking-tight">
            Dino Run! ✨
          </h1>
          <p className="text-purple-400 text-sm mt-1">A kawaii endless runner</p>
        </div>

        {/* High score */}
        {highScore > 0 && (
          <div className="bg-white/50 px-5 py-2 rounded-full border border-purple-200 text-purple-700 font-bold text-sm shadow-sm">
            🏆 Best: {highScore}
          </div>
        )}

        {/* Dino preview */}
        <canvas
          ref={canvasRef}
          width={120}
          height={100}
          className="rounded-2xl bg-white/20 shadow-inner"
        />

        {/* Config panel */}
        <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/80 flex flex-col gap-4">
          <ColorPicker value={config.dinoColor} onChange={(c) => onChange({ dinoColor: c })} />
          <hr className="border-purple-100" />
          <ThemeSelector value={config.obstacleTheme} onChange={(t) => onChange({ obstacleTheme: t })} />
          <hr className="border-purple-100" />
          <DifficultySelector config={config} onChange={onChange} />
        </div>

        {/* Play button */}
        <button
          onClick={onPlay}
          className="w-full max-w-xs py-4 bg-green-400 hover:bg-green-500 active:bg-green-600 text-white font-black text-xl rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border-2 border-green-300"
        >
          Play! 🎮
        </button>
      </div>
    </div>
  );
}
