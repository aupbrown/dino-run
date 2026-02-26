export type ObstacleTheme = 'classic' | 'birds' | 'mixed' | 'urban';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export interface GameConfig {
  dinoColor: string;
  obstacleTheme: ObstacleTheme;
  difficulty: Difficulty;
  customSpeed: number;
  customFrequency: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  dinoColor: '#535353',
  obstacleTheme: 'classic',
  difficulty: 'medium',
  customSpeed: 6,
  customFrequency: 5,
};

export const DIFFICULTY_PRESETS = {
  easy: {
    baseSpeed: 4,
    speedIncrement: 0.0005,
    minSpawn: 90,
    maxSpawn: 150,
    jumpVel: -17,
    gravity: 0.7,
  },
  medium: {
    baseSpeed: 6,
    speedIncrement: 0.001,
    minSpawn: 60,
    maxSpawn: 120,
    jumpVel: -15,
    gravity: 0.8,
  },
  hard: {
    baseSpeed: 10,
    speedIncrement: 0.002,
    minSpawn: 40,
    maxSpawn: 80,
    jumpVel: -14,
    gravity: 0.9,
  },
};
