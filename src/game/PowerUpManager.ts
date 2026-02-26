import { drawRoundRect, randomIntInRange } from './utils';

export type PowerUpType = 'shield' | 'slowmo' | 'star';

interface PowerUpItem {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
  bobFrame: number;
}

interface ActiveEffect {
  type: PowerUpType;
  framesLeft: number;
  totalFrames: number;
}

export class PowerUpManager {
  private items: PowerUpItem[] = [];
  private spawnTimer = 0;
  private spawnInterval: number;
  private canvas: HTMLCanvasElement;
  activeEffect: ActiveEffect | null = null;

  // Callbacks
  onShield?: () => void;
  onSlowMo?: (active: boolean) => void;
  onStar?: (active: boolean) => void;

  private readonly CONFIGS: Record<PowerUpType, { color: string; icon: string; label: string }> = {
    shield: { color: '#93c4f5', icon: '🛡', label: 'SHIELD' },
    slowmo: { color: '#c4a0e8', icon: '⏳', label: 'SLOW' },
    star:   { color: '#f7e07a', icon: '⭐', label: 'x2' },
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.spawnInterval = randomIntInRange(800, 1500);
  }

  private get groundY(): number {
    return this.canvas.height - 40;
  }

  update(speed: number, paused = false): void {
    if (paused) return;
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnPowerUp();
      this.spawnTimer = 0;
      this.spawnInterval = randomIntInRange(800, 1500);
    }

    this.items.forEach((item) => {
      item.x -= speed;
      item.bobFrame++;
      if (item.x + 40 < 0) item.active = false;
    });
    this.items = this.items.filter((i) => i.active);

    // Tick active effect
    if (this.activeEffect) {
      this.activeEffect.framesLeft--;
      if (this.activeEffect.framesLeft <= 0) {
        const type = this.activeEffect.type;
        this.activeEffect = null;
        if (type === 'slowmo') this.onSlowMo?.(false);
        if (type === 'star') this.onStar?.(false);
      }
    }
  }

  private spawnPowerUp(): void {
    const types: PowerUpType[] = ['shield', 'slowmo', 'star'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.items.push({
      x: this.canvas.width + 20,
      y: this.groundY - 80 - Math.random() * 40,
      type,
      active: true,
      bobFrame: 0,
    });
  }

  checkCollision(dinoBounds: { x: number; y: number; w: number; h: number }): PowerUpType | null {
    for (const item of this.items) {
      const itemBounds = { x: item.x, y: item.y, w: 36, h: 36 };
      if (
        dinoBounds.x < itemBounds.x + itemBounds.w &&
        dinoBounds.x + dinoBounds.w > itemBounds.x &&
        dinoBounds.y < itemBounds.y + itemBounds.h &&
        dinoBounds.y + dinoBounds.h > itemBounds.y
      ) {
        item.active = false;
        this.applyEffect(item.type);
        return item.type;
      }
    }
    return null;
  }

  private applyEffect(type: PowerUpType): void {
    if (type === 'shield') {
      this.onShield?.();
    } else if (type === 'slowmo') {
      this.activeEffect = { type, framesLeft: 300, totalFrames: 300 }; // 5s
      this.onSlowMo?.(true);
    } else if (type === 'star') {
      this.activeEffect = { type, framesLeft: 600, totalFrames: 600 }; // 10s
      this.onStar?.(true);
    }
  }

  get scoreMultiplier(): number {
    return this.activeEffect?.type === 'star' ? 2 : 1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.items.forEach((item) => {
      const bob = Math.sin(item.bobFrame * 0.08) * 4;
      const x = item.x;
      const y = item.y + bob;
      const cfg = this.CONFIGS[item.type];

      // Badge
      ctx.fillStyle = cfg.color;
      drawRoundRect(ctx, x, y, 36, 36, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, x, y, 36, 36, 8);
      ctx.stroke();

      // Icon
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cfg.icon, x + 18, y + 18);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Glow
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(x + 18, y + 36 + 6, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Active effect indicator
    if (this.activeEffect) {
      const ae = this.activeEffect;
      const cfg = this.CONFIGS[ae.type];
      const progress = ae.framesLeft / ae.totalFrames;
      const barW = 80;
      const bx = 10;
      const by = 10;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      drawRoundRect(ctx, bx, by, barW, 14, 4);
      ctx.fill();
      ctx.fillStyle = cfg.color;
      drawRoundRect(ctx, bx, by, barW * progress, 14, 4);
      ctx.fill();
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(cfg.label, bx + barW / 2, by + 7);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }

  reset(): void {
    this.items = [];
    this.activeEffect = null;
    this.spawnTimer = 0;
    this.spawnInterval = randomIntInRange(800, 1500);
  }
}
