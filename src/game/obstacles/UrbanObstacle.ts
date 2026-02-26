import { Obstacle } from './Obstacle';
import { drawRoundRect } from '../utils';

export class CarObstacle extends Obstacle {
  private wheelFrame = 0;

  constructor(x: number, groundY: number) {
    super(x, groundY - 44, 68, 44);
  }

  update(speed: number): void {
    super.update(speed);
    this.wheelFrame++;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w, h } = this;

    // Car body (lower)
    ctx.fillStyle = '#f4a0c0';
    drawRoundRect(ctx, x, y + 18, w, h - 18, 6);
    ctx.fill();

    // Car roof
    ctx.fillStyle = '#f7c0d0';
    drawRoundRect(ctx, x + 10, y, w - 20, 28, 8);
    ctx.fill();

    // Windows
    ctx.fillStyle = 'rgba(180, 220, 255, 0.7)';
    drawRoundRect(ctx, x + 14, y + 4, 16, 16, 3);
    ctx.fill();
    drawRoundRect(ctx, x + 34, y + 4, 16, 16, 3);
    ctx.fill();

    // Wheels
    const wr = 10;
    const spin = (this.wheelFrame * 0.25) % (Math.PI * 2);
    [x + 14, x + w - 14].forEach((wx) => {
      const wy = y + h - wr;
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(wx, wy, wr * 0.55, 0, Math.PI * 2);
      ctx.fill();
      // Spoke
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(spin) * wr * 0.5, wy + Math.sin(spin) * wr * 0.5);
      ctx.lineTo(wx - Math.cos(spin) * wr * 0.5, wy - Math.sin(spin) * wr * 0.5);
      ctx.stroke();
    });

    // Kawaii headlights / face on hood
    const cx = x + w / 2;
    const fy = y + 30;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 8, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx - 7, fy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + 8, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 9, fy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - 12, fy + 5, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 12, fy + 5, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class RoadSignObstacle extends Obstacle {
  private text: string;
  private signColor: string;

  constructor(x: number, groundY: number) {
    super(x, groundY - 70, 44, 70);
    const signs = ['STOP', 'GO!', '⚠', 'NO!'];
    const colors = ['#f4a0a0', '#a0e4a0', '#f7e07a', '#f7c0d0'];
    const idx = Math.floor(Math.random() * signs.length);
    this.text = signs[idx];
    this.signColor = colors[idx];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w } = this;
    const cx = x + w / 2;

    // Pole
    ctx.fillStyle = '#aaa';
    ctx.fillRect(cx - 3, y + 36, 6, 34);

    // Sign board
    ctx.fillStyle = this.signColor;
    drawRoundRect(ctx, x + 2, y, w - 4, 40, 6);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, x + 2, y, w - 4, 40, 6);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, cx, y + 20);

    // Kawaii eyes on sign
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 6, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx - 5.5, y + 10, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + 6, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 6.5, y + 10, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
