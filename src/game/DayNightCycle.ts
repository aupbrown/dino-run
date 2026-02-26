import { lerpColor } from './utils';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkle: number;
  twinkleSpeed: number;
}

export class DayNightCycle {
  private frame = 0;
  private isNight = false;
  private transitionT = 0; // 0=day, 1=night
  private stars: Star[] = [];
  private canvas: HTMLCanvasElement;

  private readonly CYCLE_LENGTH = 700;
  private readonly TRANSITION_FRAMES = 80;

  // Day colors
  private readonly DAY_TOP = '#c8b4e8';
  private readonly DAY_BOTTOM = '#f7c5d0';
  // Night colors
  private readonly NIGHT_TOP = '#1a0a3c';
  private readonly NIGHT_BOTTOM = '#3c1a5c';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.generateStars();
  }

  private generateStars(): void {
    this.stars = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height * 0.65,
        size: 0.5 + Math.random() * 2,
        alpha: 0.5 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
      });
    }
  }

  update(): void {
    this.frame++;

    // Toggle day/night every CYCLE_LENGTH frames (skip frame 0)
    if (this.frame > 0 && this.frame % this.CYCLE_LENGTH === 0) {
      this.isNight = !this.isNight;
    }

    // Smooth transition
    const phaseFrame = this.frame % this.CYCLE_LENGTH;
    if (phaseFrame < this.TRANSITION_FRAMES) {
      this.transitionT = this.isNight
        ? phaseFrame / this.TRANSITION_FRAMES
        : 1 - phaseFrame / this.TRANSITION_FRAMES;
    } else {
      this.transitionT = this.isNight ? 1 : 0;
    }

    // Twinkle stars
    this.stars.forEach((s) => {
      s.twinkle += s.twinkleSpeed;
    });
  }

  drawBackground(ctx: CanvasRenderingContext2D): void {
    const { canvas } = this;
    const t = this.transitionT;

    const topColor = lerpColor(this.DAY_TOP, this.NIGHT_TOP, t);
    const bottomColor = lerpColor(this.DAY_BOTTOM, this.NIGHT_BOTTOM, t);

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.85);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars (only at night)
    if (t > 0.05) {
      this.stars.forEach((s) => {
        const starAlpha = t * s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Moon
      const moonAlpha = Math.min(1, t * 2);
      ctx.fillStyle = `rgba(255, 255, 220, ${moonAlpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.85, canvas.height * 0.15, 18, 0, Math.PI * 2);
      ctx.fill();
      // Moon shadow
      ctx.fillStyle = lerpColor(this.NIGHT_TOP, '#000', 0.15);
      ctx.globalAlpha = moonAlpha * 0.85;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.85 - 6, canvas.height * 0.15, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Sun (only during day)
    if (t < 0.95) {
      const sunAlpha = 1 - t;
      ctx.fillStyle = `rgba(255, 230, 100, ${sunAlpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.88, canvas.height * 0.12, 22, 0, Math.PI * 2);
      ctx.fill();
      // Sun rays
      ctx.strokeStyle = `rgba(255, 220, 80, ${sunAlpha * 0.5})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const sx = canvas.width * 0.88 + Math.cos(angle) * 28;
        const sy = canvas.height * 0.12 + Math.sin(angle) * 28;
        const ex = canvas.width * 0.88 + Math.cos(angle) * 36;
        const ey = canvas.height * 0.12 + Math.sin(angle) * 36;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }
  }

  get nightAmount(): number {
    return this.transitionT;
  }

  resize(): void {
    this.generateStars();
  }
}
