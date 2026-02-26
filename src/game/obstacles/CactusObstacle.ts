import { Obstacle } from './Obstacle';
import { drawRoundRect } from '../utils';

export class SmallCactus extends Obstacle {
  constructor(x: number, groundY: number) {
    super(x, groundY - 48, 28, 48);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w, h } = this;
    const cx = x + w / 2;

    // Body
    ctx.fillStyle = '#5a9e6f';
    drawRoundRect(ctx, x + 8, y + 12, w - 16, h - 12, 4);
    ctx.fill();

    // Left arm
    ctx.fillStyle = '#5a9e6f';
    drawRoundRect(ctx, x, y + 18, 10, 14, 3);
    ctx.fill();
    drawRoundRect(ctx, x, y + 12, 10, 8, 3);
    ctx.fill();

    // Right arm
    drawRoundRect(ctx, x + w - 10, y + 22, 10, 14, 3);
    ctx.fill();
    drawRoundRect(ctx, x + w - 10, y + 16, 10, 8, 3);
    ctx.fill();

    // Kawaii eyes
    this.drawKawaiiEyes(ctx, cx, y + 24, 5, 3);

    // Blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - 8, y + 29, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 8, y + 29, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class LargeCactus extends Obstacle {
  constructor(x: number, groundY: number) {
    super(x, groundY - 72, 36, 72);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w, h } = this;
    const cx = x + w / 2;

    // Body
    ctx.fillStyle = '#4d8c60';
    drawRoundRect(ctx, x + 10, y + 8, w - 20, h - 8, 5);
    ctx.fill();

    // Left arm (tall)
    ctx.fillStyle = '#4d8c60';
    drawRoundRect(ctx, x, y + 20, 12, 22, 4);
    ctx.fill();
    drawRoundRect(ctx, x, y + 14, 12, 10, 4);
    ctx.fill();

    // Right arm
    drawRoundRect(ctx, x + w - 12, y + 28, 12, 22, 4);
    ctx.fill();
    drawRoundRect(ctx, x + w - 12, y + 22, 12, 10, 4);
    ctx.fill();

    // Face area (lighter)
    ctx.fillStyle = '#5fb875';
    drawRoundRect(ctx, cx - 10, y + 12, 20, 28, 4);
    ctx.fill();

    // Kawaii eyes
    this.drawKawaiiEyes(ctx, cx, y + 26, 6, 4);

    // Big smile
    this.drawKawaiiMouth(ctx, cx, y + 34, 6);

    // Blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - 10, y + 32, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 10, y + 32, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
