interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  private emit(
    x: number,
    y: number,
    count: number,
    colors: string[],
    velScale: number,
    sizeRange: [number, number],
    lifeRange: [number, number],
    spreadAngle: { minA: number; maxA: number },
    gravity = 0.1
  ): void {
    for (let i = 0; i < count; i++) {
      const angle =
        spreadAngle.minA + Math.random() * (spreadAngle.maxA - spreadAngle.minA);
      const speed = (0.5 + Math.random()) * velScale;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0]),
        maxLife: lifeRange[1],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        gravity,
      });
    }
  }

  dustPuff(x: number, y: number): void {
    this.emit(
      x, y, 8,
      ['#d4b8a0', '#e8c8b0', '#c0a080', '#f0d8c0'],
      2.5, [2, 5], [15, 25],
      { minA: Math.PI * 0.9, maxA: Math.PI * 2.1 },
      0.05
    );
  }

  landThud(x: number, y: number): void {
    this.emit(
      x, y, 12,
      ['#c8a880', '#d4b890', '#b09070'],
      3.5, [2, 6], [10, 20],
      { minA: Math.PI * 0.7, maxA: Math.PI * 2.3 },
      0.08
    );
  }

  scoreSparkle(x: number, y: number): void {
    this.emit(
      x, y, 16,
      ['#f7e07a', '#f7c0d0', '#b8f0a0', '#a0d4f8', '#e8b0f8', '#fff'],
      4, [3, 7], [25, 40],
      { minA: 0, maxA: Math.PI * 2 },
      0.06
    );
  }

  hitDebris(x: number, y: number): void {
    this.emit(
      x, y, 20,
      ['#f4a0a0', '#f7c0d0', '#f7e07a', '#b8f0a0', '#a0d4f8', '#555'],
      5, [2, 8], [20, 35],
      { minA: 0, maxA: Math.PI * 2 },
      0.15
    );
  }

  bossBurst(x: number, y: number): void {
    this.emit(
      x, y, 60,
      ['#f7e07a', '#f7c0d0', '#b8f0a0', '#a0d4f8', '#e8b0f8', '#f4a0a0', '#fff', '#ffb347'],
      8, [4, 14], [30, 60],
      { minA: 0, maxA: Math.PI * 2 },
      0.12
    );
  }

  powerUpCollect(x: number, y: number): void {
    this.emit(
      x, y, 12,
      ['#f7e07a', '#fff', '#e8b0f8', '#a0d4f8'],
      3, [2, 6], [20, 30],
      { minA: 0, maxA: Math.PI * 2 },
      0.04
    );
  }

  update(): void {
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.96;
      p.life--;
    });
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  get count(): number {
    return this.particles.length;
  }
}
