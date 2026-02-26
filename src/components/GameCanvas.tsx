import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { GameConfig } from '../game/config';
import { Game } from '../game/Game';
import type { GameState } from '../game/Game';

interface Props {
  configRef: RefObject<GameConfig>;
  onScoreChange: (score: number) => void;
  onStateChange: (state: GameState) => void;
  gameRef: RefObject<Game | null>;
}

export function GameCanvas({ configRef, onScoreChange, onStateChange, gameRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const game = new Game(canvas, configRef, onScoreChange, onStateChange);
    (gameRef as React.MutableRefObject<Game | null>).current = game;
    game.start();
    return () => {
      game.destroy();
      (gameRef as React.MutableRefObject<Game | null>).current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-2xl shadow-xl"
      style={{ touchAction: 'none' }}
    />
  );
}
