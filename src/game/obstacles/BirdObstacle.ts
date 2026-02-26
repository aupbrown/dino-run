import { Obstacle } from './Obstacle';
import { randomInRange } from '../utils';

type BirdHeight = 'low' | 'mid' | 'high';

export class BirdObstacle extends Obstacle {
  private frame = 0;
  private wingUp = true;

  constructor(x: number, groundY: number) {
    const heights: BirdHeight[] = ['low', 'mid', 'high'];
    const height = heights[Math.floor(randomInRange(0, 3))];
    const yOffset = height === 'low' ? groundY - 40 : height === 'mid' ? groundY - 90 : groundY - 140;
    super(x, yOffset, 52, 28);
  }

  update(speed: number): void {
    super.update(speed);
    this.frame++;
    if (this.frame % 12 === 0) this.wingUp = !this.wingUp;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w } = this;
    const cx = x + w / 2;
    const cy = y + 14;

    // Body
    ctx.fillStyle = '#9b7fd4';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#b89ee0';
    if (this.wingUp) {
      // Up position
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy);
      ctx.quadraticCurveTo(cx - 16, cy - 18, cx - 26, cy - 8);
      ctx.quadraticCurveTo(cx - 16, cy - 4, cx - 2, cy + 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy);
      ctx.quadraticCurveTo(cx + 16, cy - 18, cx + 26, cy - 8);
      ctx.quadraticCurveTo(cx + 16, cy - 4, cx + 2, cy + 2);
      ctx.fill();
    } else {
      // Down position
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy + 2);
      ctx.quadraticCurveTo(cx - 16, cy + 14, cx - 26, cy + 6);
      ctx.quadraticCurveTo(cx - 16, cy + 2, cx - 2, cy);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy + 2);
      ctx.quadraticCurveTo(cx + 16, cy + 14, cx + 26, cy + 6);
      ctx.quadraticCurveTo(cx + 16, cy + 2, cx + 2, cy);
      ctx.fill();
    }

    // Head
    ctx.fillStyle = '#9b7fd4';
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f7c840';
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 3);
    ctx.lineTo(cx + 28, cy - 1);
    ctx.lineTo(cx + 18, cy + 2);
    ctx.fill();

    // Kawaii eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx + 15, cy - 4, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Blush
    ctx.fillStyle = 'rgba(255, 150, 180, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy + 1, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

  }
}
