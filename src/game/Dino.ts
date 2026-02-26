import type { RefObject } from 'react';
import type { GameConfig } from './config';
import { DIFFICULTY_PRESETS } from './config';
import type { Bounds } from './utils';
import { drawRoundRect } from './utils';

export type DinoState = 'happy' | 'jumping' | 'sad' | 'shielded' | 'ducking';

export class Dino {
  x: number;
  y: number;
  w = 44;
  h = 52;
  vy = 0;
  grounded = true;
  state: DinoState = 'happy';
  shieldActive = false;
  shieldFrames = 0;

  private groundY: number;
  private legFrame = 0;
  private legToggle = false;
  private configRef: RefObject<GameConfig>;
  private jumpVel = -15;
  private gravity = 0.8;

  constructor(groundY: number, configRef: RefObject<GameConfig>) {
    this.groundY = groundY;
    this.configRef = configRef;
    this.x = 60;
    this.y = groundY - this.h;
    this.updatePhysicsFromConfig();
  }

  private updatePhysicsFromConfig(): void {
    const cfg = this.configRef.current!;
    if (cfg.difficulty === 'custom') {
      this.jumpVel = -15;
      this.gravity = 0.8;
    } else {
      const preset = DIFFICULTY_PRESETS[cfg.difficulty];
      this.jumpVel = preset.jumpVel;
      this.gravity = preset.gravity;
    }
  }

  jump(): void {
    if (this.grounded) {
      this.vy = this.jumpVel;
      this.grounded = false;
      this.state = 'jumping';
    }
  }

  activateShield(): void {
    this.shieldActive = true;
    this.shieldFrames = 180; // 3s at 60fps
    this.state = 'shielded';
  }

  consumeShield(): boolean {
    if (this.shieldActive) {
      this.shieldActive = false;
      this.shieldFrames = 0;
      this.state = 'happy';
      return true;
    }
    return false;
  }

  update(): void {
    this.updatePhysicsFromConfig();

    if (!this.grounded) {
      this.vy += this.gravity;
      this.y += this.vy;
    }

    if (this.y >= this.groundY - this.h) {
      this.y = this.groundY - this.h;
      this.vy = 0;
      this.grounded = true;
      if (this.state === 'jumping') this.state = 'happy';
    }

    if (this.grounded && this.state !== 'sad' && this.state !== 'shielded') {
      this.state = 'happy';
    }

    if (this.shieldActive) {
      this.shieldFrames--;
      if (this.shieldFrames <= 0) {
        this.shieldActive = false;
        this.state = 'happy';
      }
    }

    this.legFrame++;
    if (this.legFrame % 8 === 0) this.legToggle = !this.legToggle;
  }

  getBounds(): Bounds {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  setGroundY(groundY: number): void {
    const wasOnGround = this.grounded;
    this.groundY = groundY;
    if (wasOnGround) this.y = groundY - this.h;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w, h } = this;
    const color = this.configRef.current!.dinoColor;

    // Shield flash effect
    if (this.shieldActive && Math.floor(this.shieldFrames / 6) % 2 === 0) {
      ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w * 0.8, h * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = color;
    drawRoundRect(ctx, x + 4, y + 8, w - 8, h - 16, 8);
    ctx.fill();

    // Head
    ctx.fillStyle = color;
    drawRoundRect(ctx, x + 10, y, w - 8, 32, 10);
    ctx.fill();

    // Neck connection
    ctx.fillRect(x + 10, y + 20, w - 16, 16);

    // Belly (lighter)
    ctx.fillStyle = this.lightenColor(color, 40);
    drawRoundRect(ctx, x + 8, y + 22, w - 20, h - 34, 6);
    ctx.fill();

    // Tail
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h - 20);
    ctx.quadraticCurveTo(x - 14, y + h - 12, x - 8, y + h - 28);
    ctx.quadraticCurveTo(x - 4, y + h - 16, x + 4, y + h - 18);
    ctx.fill();

    // Legs (animated)
    this.drawLegs(ctx, color);

    // Eye
    this.drawFace(ctx);
  }

  private drawLegs(ctx: CanvasRenderingContext2D, color: string): void {
    const { x, y, h } = this;
    ctx.fillStyle = color;
    if (this.grounded && this.state !== 'sad') {
      // Animate legs
      const leg1Y = this.legToggle ? h - 4 : h - 2;
      const leg2Y = this.legToggle ? h - 2 : h - 4;
      ctx.fillRect(x + 12, y + h - 16, 10, leg1Y - (h - 16));
      ctx.fillRect(x + 24, y + h - 16, 10, leg2Y - (h - 16));
    } else {
      // Static legs (jumping or sad)
      ctx.fillRect(x + 12, y + h - 16, 10, 16);
      ctx.fillRect(x + 24, y + h - 16, 10, 16);
    }
  }

  private drawFace(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this;
    const cx = x + 20;

    if (this.state === 'sad') {
      // X eyes
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 9, y + 8);
      ctx.lineTo(cx - 5, y + 12);
      ctx.moveTo(cx - 5, y + 8);
      ctx.lineTo(cx - 9, y + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, y + 8);
      ctx.lineTo(cx + 7, y + 12);
      ctx.moveTo(cx + 7, y + 8);
      ctx.lineTo(cx + 3, y + 12);
      ctx.stroke();
      // Sad mouth
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 1, y + 19, 5, Math.PI * 0.1, Math.PI * 0.9, true);
      ctx.stroke();
    } else if (this.state === 'jumping') {
      // Determined eyes (> <)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, y + 9);
      ctx.lineTo(cx - 5, y + 12);
      ctx.lineTo(cx - 10, y + 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 7, y + 9);
      ctx.lineTo(cx + 2, y + 12);
      ctx.lineTo(cx + 7, y + 15);
      ctx.stroke();
      // Small smile
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 1, y + 17, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else {
      // Happy dot eyes
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(cx - 7, y + 11, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, y + 11, 3, 0, Math.PI * 2);
      ctx.fill();
      // Eye shine
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx - 6, y + 10, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, y + 10, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 1, y + 17, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    // Blush (always)
    ctx.fillStyle = 'rgba(255, 150, 170, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx - 10, y + 16, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 8, y + 16, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostril
    ctx.fillStyle = this.lightenColor(this.configRef.current!.dinoColor, -20);
    ctx.beginPath();
    ctx.arc(cx + 11, y + 12, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private lightenColor(hex: string, amount: number): string {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
    const b = Math.min(255, Math.max(0, (num & 255) + amount));
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }
}
