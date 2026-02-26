import { drawRoundRect } from './utils';
import type { ParticleSystem } from './ParticleSystem';

type BossType = 'cactus' | 'pterodactyl';

interface BossState {
  type: BossType;
  x: number;
  y: number;
  w: number;
  h: number;
  entryPhase: boolean;
  bossFrame: number;
  framesRemaining: number;
  defeated: boolean;
  exitPhase: boolean;
}

export class BossManager {
  private boss: BossState | null = null;
  private canvas: HTMLCanvasElement;
  private particles: ParticleSystem;
  private nextBossType: BossType = 'cactus';

  onBossDefeat?: (bonusPoints: number) => void;
  onBossArrive?: () => void;

  private readonly BOSS_SURVIVE_FRAMES = 480; // 8s at 60fps

  constructor(canvas: HTMLCanvasElement, particles: ParticleSystem) {
    this.canvas = canvas;
    this.particles = particles;
  }

  private get groundY(): number {
    return this.canvas.height - 40;
  }

  startBoss(): void {
    const type = this.nextBossType;
    this.nextBossType = type === 'cactus' ? 'pterodactyl' : 'cactus';
    const w = type === 'cactus' ? 90 : 120;
    const h = type === 'cactus' ? 110 : 80;
    this.boss = {
      type,
      x: this.canvas.width + 10,
      y: this.groundY - h,
      w,
      h,
      entryPhase: true,
      bossFrame: 0,
      framesRemaining: this.BOSS_SURVIVE_FRAMES,
      defeated: false,
      exitPhase: false,
    };
    this.onBossArrive?.();
  }

  get isActive(): boolean {
    return this.boss !== null;
  }

  get currentBoss(): BossState | null {
    return this.boss;
  }

  getBounds(): { x: number; y: number; w: number; h: number } | null {
    if (!this.boss) return null;
    return { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h };
  }

  update(speed: number): void {
    if (!this.boss) return;
    const b = this.boss;
    b.bossFrame++;

    if (b.entryPhase) {
      // Slide in from right
      b.x -= speed * 1.5;
      const targetX = this.canvas.width - b.w - 60;
      if (b.x <= targetX) {
        b.x = targetX;
        b.entryPhase = false;
      }
      return;
    }

    if (b.exitPhase) {
      // Slide out to right after defeat
      b.x += speed * 3;
      if (b.x > this.canvas.width + 20) {
        this.boss = null;
      }
      return;
    }

    // Sine-wave Y movement
    const amplitude = this.canvas.height * 0.2;
    const centerY = this.groundY - b.h - amplitude * 0.5;
    const freq = b.type === 'cactus' ? 0.025 : 0.04;
    b.y = centerY + amplitude * Math.sin(b.bossFrame * freq);

    // Countdown
    b.framesRemaining--;
    if (b.framesRemaining <= 0) {
      // Boss defeated!
      this.particles.bossBurst(b.x + b.w / 2, b.y + b.h / 2);
      b.exitPhase = true;
      b.defeated = true;
      this.onBossDefeat?.(200);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.boss) return;
    const b = this.boss;

    // Flash when about to be defeated
    const flashPhase = b.framesRemaining < 60 && Math.floor(b.bossFrame / 5) % 2 === 0;
    if (flashPhase) {
      ctx.globalAlpha = 0.6;
    }

    if (b.type === 'cactus') {
      this.drawGiantCactus(ctx, b);
    } else {
      this.drawMegaPterodactyl(ctx, b);
    }

    ctx.globalAlpha = 1;

    // Health bar (progress bar showing time left)
    const progress = b.framesRemaining / this.BOSS_SURVIVE_FRAMES;
    const barW = b.w;
    const barX = b.x;
    const barY = b.y - 18;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    drawRoundRect(ctx, barX, barY, barW, 10, 3);
    ctx.fill();
    ctx.fillStyle = progress > 0.5 ? '#88d8a0' : progress > 0.25 ? '#f7e07a' : '#f4a0a0';
    drawRoundRect(ctx, barX, barY, barW * progress, 10, 3);
    ctx.fill();
  }

  private drawGiantCactus(ctx: CanvasRenderingContext2D, b: BossState): void {
    const { x, y, w, h } = b;
    const cx = x + w / 2;
    const armBob = Math.sin(b.bossFrame * 0.06) * 8;

    // Body
    ctx.fillStyle = '#3d7a50';
    drawRoundRect(ctx, x + 20, y + 20, w - 40, h - 20, 10);
    ctx.fill();

    // Left arm
    ctx.fillStyle = '#4d8c60';
    drawRoundRect(ctx, x, y + 30 + armBob, 22, 38, 8);
    ctx.fill();
    drawRoundRect(ctx, x, y + 22 + armBob, 22, 18, 8);
    ctx.fill();

    // Right arm
    drawRoundRect(ctx, x + w - 22, y + 38 - armBob, 22, 38, 8);
    ctx.fill();
    drawRoundRect(ctx, x + w - 22, y + 30 - armBob, 22, 18, 8);
    ctx.fill();

    // Face
    ctx.fillStyle = '#5fb875';
    drawRoundRect(ctx, cx - 22, y + 14, 44, 52, 10);
    ctx.fill();

    // Angry eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 10, y + 34, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 10, y + 34, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(cx - 9, y + 35, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 11, y + 35, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyebrows
    ctx.strokeStyle = '#1a4a28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 18, y + 24);
    ctx.lineTo(cx - 4, y + 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 4, y + 28);
    ctx.lineTo(cx + 18, y + 24);
    ctx.stroke();

    // Angry mouth (growl)
    ctx.strokeStyle = '#1a4a28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 12, y + 52);
    ctx.lineTo(cx - 6, y + 58);
    ctx.lineTo(cx, y + 52);
    ctx.lineTo(cx + 6, y + 58);
    ctx.lineTo(cx + 12, y + 52);
    ctx.stroke();
  }

  private drawMegaPterodactyl(ctx: CanvasRenderingContext2D, b: BossState): void {
    const { x, y, w, h } = b;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const wingFlap = Math.sin(b.bossFrame * 0.15) * 20;

    // Wings
    ctx.fillStyle = '#6a4fa8';
    // Left wing
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.quadraticCurveTo(cx - 40, cy - 30 + wingFlap, cx - w * 0.5 + 5, cy - 10 + wingFlap);
    ctx.quadraticCurveTo(cx - 30, cy + 5, cx - 10, cy + 8);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy);
    ctx.quadraticCurveTo(cx + 40, cy - 30 + wingFlap, cx + w * 0.5 - 5, cy - 10 + wingFlap);
    ctx.quadraticCurveTo(cx + 30, cy + 5, cx + 10, cy + 8);
    ctx.fill();

    // Body
    ctx.fillStyle = '#7a5cc0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#7a5cc0';
    ctx.beginPath();
    ctx.arc(cx + 22, cy - 5, 16, 0, Math.PI * 2);
    ctx.fill();

    // Crest
    ctx.fillStyle = '#9b7fd4';
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 18);
    ctx.lineTo(cx + 20, cy - 35);
    ctx.lineTo(cx + 32, cy - 18);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f0c030';
    ctx.beginPath();
    ctx.moveTo(cx + 35, cy - 6);
    ctx.lineTo(cx + 58, cy - 2);
    ctx.lineTo(cx + 35, cy + 4);
    ctx.fill();

    // Angry eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + 24, cy - 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(cx + 25, cy - 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyebrow
    ctx.strokeStyle = '#2a1a5a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 17, cy - 16);
    ctx.lineTo(cx + 30, cy - 12);
    ctx.stroke();
  }

  reset(): void {
    this.boss = null;
  }
}
