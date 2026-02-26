import type { RefObject } from 'react';
import type { GameConfig } from './config';
import { DIFFICULTY_PRESETS } from './config';
import { Obstacle } from './obstacles/Obstacle';
import { SmallCactus, LargeCactus } from './obstacles/CactusObstacle';
import { BirdObstacle } from './obstacles/BirdObstacle';
import { CarObstacle, RoadSignObstacle } from './obstacles/UrbanObstacle';
import { randomIntInRange } from './utils';

type ObstacleFactory = (x: number, groundY: number) => Obstacle;

export class ObstacleManager {
  obstacles: Obstacle[] = [];
  private spawnTimer = 0;
  private spawnInterval = 80;
  private configRef: RefObject<GameConfig>;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, configRef: RefObject<GameConfig>) {
    this.canvas = canvas;
    this.configRef = configRef;
    this.resetSpawnTimer();
  }

  private get groundY(): number {
    return this.canvas.height - 40;
  }

  private resetSpawnTimer(): void {
    const cfg = this.configRef.current!;
    let minSpawn: number, maxSpawn: number;
    if (cfg.difficulty === 'custom') {
      const freq = cfg.customFrequency; // 1–10
      minSpawn = Math.floor(110 - freq * 8);
      maxSpawn = Math.floor(160 - freq * 5);
    } else {
      const preset = DIFFICULTY_PRESETS[cfg.difficulty];
      minSpawn = preset.minSpawn;
      maxSpawn = preset.maxSpawn;
    }
    this.spawnInterval = randomIntInRange(minSpawn, maxSpawn);
    this.spawnTimer = 0;
  }

  private OBSTACLE_FACTORIES: Record<string, ObstacleFactory> = {
    classic: (x, gy) =>
      Math.random() < 0.4 ? new SmallCactus(x, gy) : new LargeCactus(x, gy),
    birds: (x, gy) => new BirdObstacle(x, gy),
    mixed: (x, gy) =>
      Math.random() < 0.5
        ? this.OBSTACLE_FACTORIES.classic(x, gy)
        : this.OBSTACLE_FACTORIES.birds(x, gy),
    urban: (x, gy) =>
      Math.random() < 0.5 ? new CarObstacle(x, gy) : new RoadSignObstacle(x, gy),
  };

  update(speed: number, paused = false): void {
    if (paused) return;
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnObstacle();
      this.resetSpawnTimer();
    }
    this.obstacles.forEach((o) => o.update(speed));
    this.obstacles = this.obstacles.filter((o) => o.active);
  }

  private spawnObstacle(): void {
    const cfg = this.configRef.current!;
    const theme = cfg.obstacleTheme;
    const factory = this.OBSTACLE_FACTORIES[theme] ?? this.OBSTACLE_FACTORIES.classic;
    const obs = factory(this.canvas.width + 20, this.groundY);
    this.obstacles.push(obs);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.obstacles.forEach((o) => o.draw(ctx));
  }

  reset(): void {
    this.obstacles = [];
    this.resetSpawnTimer();
  }
}
