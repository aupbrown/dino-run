import type { RefObject } from 'react';
import type { GameConfig } from './config';
import { DIFFICULTY_PRESETS } from './config';
import { Dino } from './Dino';
import { Ground } from './Ground';
import { InputHandler } from './InputHandler';
import { ObstacleManager } from './ObstacleManager';
import { PowerUpManager } from './PowerUpManager';
import { BossManager } from './BossManager';
import { ParticleSystem } from './ParticleSystem';
import { SoundManager } from './SoundManager';
import { DayNightCycle } from './DayNightCycle';
import { checkAABB } from './utils';

export type GameState = 'idle' | 'running' | 'gameover' | 'paused' | 'boss';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private configRef: RefObject<GameConfig>;
  private rafId: number | null = null;
  private lastTs = 0;

  // State
  state: GameState = 'idle';
  score = 0;
  highScore = 0;
  private frame = 0;
  private speed = 6;
  private slowMoActive = false;
  private starActive = false;
  private flashFrames = 0;
  private lastMilestone = 0;
  private lastBossScore = 0;

  // Entities
  private dino!: Dino;
  private ground!: Ground;
  private obstacleManager!: ObstacleManager;
  private powerUpManager!: PowerUpManager;
  private bossManager!: BossManager;
  private particles!: ParticleSystem;
  private sound: SoundManager;
  private dayNight!: DayNightCycle;
  private input!: InputHandler;

  // Callbacks
  private onScoreChange: (score: number) => void;
  private onStateChange: (state: GameState) => void;
  private resizeObserver: ResizeObserver;

  constructor(
    canvas: HTMLCanvasElement,
    configRef: RefObject<GameConfig>,
    onScoreChange: (score: number) => void,
    onStateChange: (state: GameState) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.configRef = configRef;
    this.onScoreChange = onScoreChange;
    this.onStateChange = onStateChange;
    this.sound = new SoundManager();

    this.highScore = parseInt(localStorage.getItem('dinoHighScore') ?? '0');

    this.resizeCanvas();
    this.initEntities();

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
      this.onResize();
    });
    this.resizeObserver.observe(canvas);

    this.input = new InputHandler(this.handleAction.bind(this));
    this.drawIdleScreen();
  }

  private get groundY(): number {
    return this.canvas.height - 40;
  }

  private resizeCanvas(): void {
    this.canvas.width = this.canvas.offsetWidth || 800;
    this.canvas.height = Math.floor(this.canvas.width * 0.25);
    if (this.canvas.height < 100) this.canvas.height = 100;
  }

  private onResize(): void {
    this.ground?.resize();
    this.dayNight?.resize();
    this.dino?.setGroundY(this.groundY);
  }

  private initEntities(): void {
    this.particles = new ParticleSystem();
    this.ground = new Ground(this.canvas);
    this.dayNight = new DayNightCycle(this.canvas);
    this.dino = new Dino(this.groundY, this.configRef);
    this.obstacleManager = new ObstacleManager(this.canvas, this.configRef);
    this.powerUpManager = new PowerUpManager(this.canvas);
    this.bossManager = new BossManager(this.canvas, this.particles);

    this.powerUpManager.onShield = () => {
      this.dino.activateShield();
      this.sound.powerUp();
      this.particles.powerUpCollect(this.dino.x + 22, this.dino.y);
    };
    this.powerUpManager.onSlowMo = (active) => {
      this.slowMoActive = active;
      if (active) this.sound.powerUp();
    };
    this.powerUpManager.onStar = (active) => {
      this.starActive = active;
      if (active) this.sound.powerUp();
    };

    this.bossManager.onBossArrive = () => {
      this.sound.bossArrive();
      this.state = 'boss';
      this.onStateChange(this.state);
    };
    this.bossManager.onBossDefeat = (bonus) => {
      this.score += bonus;
      this.sound.bossDefeat();
      this.state = 'running';
      this.onStateChange(this.state);
    };
  }

  start(): void {
    this.tick = this.tick.bind(this);
    this.rafId = requestAnimationFrame(this.tick);
  }

  private getBaseSpeed(): number {
    const cfg = this.configRef.current!;
    if (cfg.difficulty === 'custom') return cfg.customSpeed;
    return DIFFICULTY_PRESETS[cfg.difficulty].baseSpeed;
  }

  private getSpeedIncrement(): number {
    const cfg = this.configRef.current!;
    if (cfg.difficulty === 'custom') return 0.001;
    return DIFFICULTY_PRESETS[cfg.difficulty].speedIncrement;
  }

  private handleAction(): void {
    if (this.state === 'idle' || this.state === 'gameover') {
      this.startGame();
    } else if (this.state === 'running' || this.state === 'boss') {
      this.dino.jump();
      this.sound.jump();
      this.particles.dustPuff(this.dino.x + 10, this.dino.y + this.dino.h);
    }
  }

  private startGame(): void {
    this.score = 0;
    this.frame = 0;
    this.speed = this.getBaseSpeed();
    this.slowMoActive = false;
    this.starActive = false;
    this.flashFrames = 0;
    this.lastMilestone = 0;
    this.lastBossScore = 0;

    this.dino = new Dino(this.groundY, this.configRef);
    this.obstacleManager.reset();
    this.powerUpManager.reset();
    this.bossManager.reset();
    this.particles = new ParticleSystem();

    // Re-wire power-up callbacks after new powerup manager
    this.powerUpManager.onShield = () => {
      this.dino.activateShield();
      this.sound.powerUp();
      this.particles.powerUpCollect(this.dino.x + 22, this.dino.y);
    };
    this.powerUpManager.onSlowMo = (active) => {
      this.slowMoActive = active;
      if (active) this.sound.powerUp();
    };
    this.powerUpManager.onStar = (active) => {
      this.starActive = active;
      if (active) this.sound.powerUp();
    };

    // Re-wire boss callbacks after new BossManager
    this.bossManager.onBossArrive = () => {
      this.sound.bossArrive();
      this.state = 'boss';
      this.onStateChange(this.state);
    };
    this.bossManager.onBossDefeat = (bonus) => {
      this.score += bonus;
      this.onScoreChange(this.score);
      this.sound.bossDefeat();
      this.state = 'running';
      this.lastBossScore = this.score;
      this.onStateChange(this.state);
    };

    this.state = 'running';
    this.onStateChange(this.state);
  }

  pause(): void {
    if (this.state === 'running' || this.state === 'boss') {
      this.state = 'paused';
      this.onStateChange(this.state);
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
      this.onStateChange(this.state);
    }
  }

  private tick(timestamp: number): void {
    const dt = timestamp - this.lastTs;
    this.lastTs = timestamp;
    // Skip huge gaps (tab hidden)
    if (dt > 100) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    this.update();
    this.draw();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private update(): void {
    if (this.state !== 'running' && this.state !== 'boss') return;

    this.frame++;

    // Speed
    const baseSpeed = this.getBaseSpeed();
    const increment = this.getSpeedIncrement();
    this.speed = baseSpeed + this.frame * increment;
    const effectiveSpeed = this.slowMoActive ? this.speed * 0.5 : this.speed;

    // Score
    const multiplier = this.starActive ? 2 : 1;
    this.score += multiplier * 0.1;
    this.onScoreChange(Math.floor(this.score));

    // Milestone check
    const scoreInt = Math.floor(this.score);
    if (scoreInt > 0 && scoreInt % 100 === 0 && scoreInt !== this.lastMilestone) {
      this.lastMilestone = scoreInt;
      this.flashFrames = 10;
      this.sound.milestone();
      this.particles.scoreSparkle(this.canvas.width / 2, this.canvas.height / 2);
    }

    // Boss trigger every 500 points
    if (
      scoreInt > 0 &&
      scoreInt % 500 === 0 &&
      scoreInt !== this.lastBossScore &&
      !this.bossManager.isActive
    ) {
      this.lastBossScore = scoreInt;
      this.bossManager.startBoss();
      this.obstacleManager.reset(); // clear obstacles during boss
    }

    if (this.flashFrames > 0) this.flashFrames--;

    // Update entities
    this.dayNight.update();
    this.ground.update(effectiveSpeed);

    const prevGrounded = this.dino.grounded;
    this.dino.update();

    if (!prevGrounded && this.dino.grounded) {
      this.sound.land();
      this.particles.landThud(this.dino.x + 10, this.dino.y + this.dino.h);
    }

    if (!this.bossManager.isActive) {
      this.obstacleManager.update(effectiveSpeed);
    } else {
      this.bossManager.update(effectiveSpeed);
    }

    this.powerUpManager.update(effectiveSpeed);
    this.particles.update();

    // Collision detection
    this.checkCollisions();
  }

  private checkCollisions(): void {
    const dinoBounds = this.dino.getBounds();

    // Obstacles
    for (const obs of this.obstacleManager.obstacles) {
      if (checkAABB(dinoBounds, obs.getBounds())) {
        if (!this.dino.consumeShield()) {
          this.triggerGameOver();
          return;
        }
      }
    }

    // Boss
    const bossBounds = this.bossManager.getBounds();
    if (bossBounds && checkAABB(dinoBounds, bossBounds)) {
      if (!this.dino.consumeShield()) {
        this.triggerGameOver();
        return;
      }
    }

    // Power-ups
    this.powerUpManager.checkCollision(dinoBounds);
  }

  private triggerGameOver(): void {
    this.dino.state = 'sad';
    this.state = 'gameover';
    this.sound.gameOver();
    this.particles.hitDebris(this.dino.x + 22, this.dino.y + 26);

    const scoreInt = Math.floor(this.score);
    if (scoreInt > this.highScore) {
      this.highScore = scoreInt;
      localStorage.setItem('dinoHighScore', String(this.highScore));
    }
    this.onStateChange(this.state);
  }

  private draw(): void {
    const { ctx, canvas } = this;

    // Background
    this.dayNight.drawBackground(ctx);

    // Ground
    this.ground.draw(ctx);

    // Particles (behind dino)
    this.particles.draw(ctx);

    // Obstacles
    this.obstacleManager.draw(ctx);

    // Boss
    this.bossManager.draw(ctx);

    // Power-ups
    this.powerUpManager.draw(ctx);

    // Dino
    this.dino.draw(ctx);

    // Flash overlay
    if (this.flashFrames > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashFrames * 0.06})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // State overlays
    if (this.state === 'gameover') {
      this.drawGameOverOverlay();
    } else if (this.state === 'idle') {
      this.drawIdleOverlay();
    }
  }

  private drawIdleScreen(): void {
    this.dayNight.drawBackground(this.ctx);
    this.ground.draw(this.ctx);
    this.dino.draw(this.ctx);
    this.drawIdleOverlay();
  }

  private drawIdleOverlay(): void {
    const { ctx, canvas } = this;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    const bw = 200, bh = 44;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height / 2 - bh / 2 + 10;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Press Space / Tap to Start', canvas.width / 2, by + bh / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  private drawGameOverOverlay(): void {
    const { ctx, canvas } = this;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    const bw = 220, bh = 70;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height / 2 - bh / 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();

    ctx.fillStyle = '#c03050';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over!', canvas.width / 2, by + 22);

    ctx.fillStyle = '#555';
    ctx.font = '14px sans-serif';
    ctx.fillText('Press Space / Tap to Retry', canvas.width / 2, by + 52);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.resizeObserver.disconnect();
    this.input.destroy();
  }
}
