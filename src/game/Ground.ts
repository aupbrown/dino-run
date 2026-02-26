interface Flower {
  x: number;
  relX: number; // position relative to ground start for looping
  y: number;
  color: string;
  size: number;
}

export class Ground {
  private canvas: HTMLCanvasElement;
  private offset = 0;
  private flowers: Flower[] = [];
  private readonly FLOWER_COLORS = ['#f9a8c9', '#f7e07a', '#b8f0a0', '#a0d4f8', '#e8b0f8'];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.generateFlowers();
  }

  private generateFlowers(): void {
    this.flowers = [];
    const count = Math.floor(this.canvas.width / 60) + 4;
    for (let i = 0; i < count; i++) {
      this.flowers.push({
        x: i * (this.canvas.width / count) + Math.random() * 30,
        relX: i * (this.canvas.width / count) + Math.random() * 30,
        y: this.groundY + 8 + Math.random() * 10,
        color: this.FLOWER_COLORS[Math.floor(Math.random() * this.FLOWER_COLORS.length)],
        size: 3 + Math.random() * 3,
      });
    }
  }

  get groundY(): number {
    return this.canvas.height - 40;
  }

  update(speed: number): void {
    this.offset = (this.offset + speed) % this.canvas.width;
    this.flowers.forEach((f) => {
      f.x = f.relX - this.offset;
      if (f.x < -20) f.x += this.canvas.width + 40;
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { canvas } = this;
    const gy = this.groundY;

    // Ground fill
    ctx.fillStyle = '#e8d5c0';
    ctx.fillRect(0, gy, canvas.width, canvas.height - gy);

    // Ground line
    ctx.strokeStyle = '#c4a882';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(canvas.width, gy);
    ctx.stroke();

    // Dashed line (running track feel)
    ctx.strokeStyle = 'rgba(180, 150, 110, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(0, gy + 8);
    ctx.lineTo(canvas.width, gy + 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // Flowers
    this.flowers.forEach((f) => {
      this.drawFlower(ctx, f.x, f.y, f.size, f.color);
    });
  }

  private drawFlower(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ): void {
    // Petals
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(angle) * size,
        y + Math.sin(angle) * size,
        size * 0.9,
        size * 0.6,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Center
    ctx.fillStyle = '#fff9a0';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  resize(): void {
    this.generateFlowers();
  }
}
