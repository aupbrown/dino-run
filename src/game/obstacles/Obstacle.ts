import type { Bounds } from '../utils';

export abstract class Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  active = true;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  getBounds(): Bounds {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(speed: number): void {
    this.x -= speed;
    if (this.x + this.w < -50) this.active = false;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  protected drawKawaiiEyes(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spread = 8,
    size = 4
  ): void {
    // Left eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - spread, cy, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx - spread + 1, cy, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + spread, cy, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx + spread + 1, cy, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  protected drawKawaiiMouth(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r = 5
  ): void {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}
