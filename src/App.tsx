import { useState, useRef, useEffect, useCallback } from 'react';
import type { GameConfig } from './game/config';
import { DEFAULT_CONFIG } from './game/config';
import type { GameState } from './game/Game';
import type { Game } from './game/Game';
import { LobbyScreen } from './components/LobbyScreen';
import { GameCanvas } from './components/GameCanvas';
import { MiniSidebar } from './components/MiniSidebar';
import { SettingsModal } from './components/SettingsModal';
import { ScoreDisplay } from './components/ScoreDisplay';

type AppScreen = 'lobby' | 'game';

function App() {
  const [screen, setScreen] = useState<AppScreen>('lobby');
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('dinoHighScore') ?? '0')
  );
  const [gameState, setGameState] = useState<GameState>('idle');
  const [showSettings, setShowSettings] = useState(false);

  const configRef = useRef<GameConfig>(config);
  const gameRef = useRef<Game | null>(null);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const handleConfigChange = useCallback((partial: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleScoreChange = useCallback(
    (newScore: number) => {
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
    },
    [highScore]
  );

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  const handlePlay = useCallback(() => {
    setScreen('game');
  }, []);

  const handlePause = useCallback(() => {
    gameRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    gameRef.current?.resume();
    setShowSettings(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    gameRef.current?.pause();
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    gameRef.current?.resume();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100">
      {/* Lobby Screen */}
      {screen === 'lobby' && (
        <LobbyScreen
          config={config}
          onChange={handleConfigChange}
          onPlay={handlePlay}
          highScore={highScore}
        />
      )}

      {/* Game Screen */}
      {screen === 'game' && (
        <div className="w-full max-w-4xl flex flex-col gap-3">
          {/* Back to lobby */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen('lobby')}
              className="text-sm text-purple-500 hover:text-purple-700 flex items-center gap-1 transition-colors"
            >
              ← Lobby
            </button>
            <h2 className="text-purple-600 font-bold text-sm">Dino Run! ✨</h2>
            <div className="w-16" />
          </div>

          {/* Canvas + Sidebar */}
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <GameCanvas
                configRef={configRef}
                onScoreChange={handleScoreChange}
                onStateChange={handleStateChange}
                gameRef={gameRef}
              />
              <ScoreDisplay score={score} highScore={highScore} />
            </div>
            <MiniSidebar
              dinoColor={config.dinoColor}
              gameState={gameState}
              onPause={handlePause}
              onResume={handleResume}
              onSettings={handleOpenSettings}
            />
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between text-xs text-purple-400 px-1">
            <span>Space / Tap to jump</span>
            {gameState === 'boss' && (
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
                ⚠ BOSS FIGHT! Survive 8s!
              </span>
            )}
            <span>High Score: {highScore}</span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          config={config}
          onChange={handleConfigChange}
          onClose={handleCloseSettings}
          score={score}
        />
      )}
    </div>
  );
}

export default App;
