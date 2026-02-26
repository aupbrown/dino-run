export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.3,
    delay = 0
  ): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      const t = ctx.currentTime + delay;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(endFreq, t + duration);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.linearRampToValueAtTime(0, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch {
      // Audio unavailable
    }
  }

  jump(): void {
    this.playTone(300, 600, 0.12, 'sine', 0.2);
  }

  land(): void {
    this.playTone(150, 80, 0.08, 'triangle', 0.25);
  }

  gameOver(): void {
    this.playTone(500, 150, 0.18, 'sawtooth', 0.3);
    this.playTone(300, 80, 0.25, 'sawtooth', 0.25, 0.15);
    this.playTone(180, 60, 0.3, 'sawtooth', 0.2, 0.35);
  }

  milestone(): void {
    [0, 0.08, 0.16].forEach((delay, i) => {
      this.playTone(
        [523, 659, 784][i],
        [659, 784, 1047][i],
        0.12,
        'sine',
        0.2,
        delay
      );
    });
  }

  powerUp(): void {
    this.playTone(600, 1200, 0.15, 'sine', 0.25);
    this.playTone(800, 1400, 0.12, 'sine', 0.15, 0.05);
  }

  bossArrive(): void {
    this.playTone(60, 40, 0.5, 'sawtooth', 0.35);
    this.playTone(100, 200, 0.8, 'triangle', 0.25, 0.3);
    this.playTone(200, 400, 0.5, 'sine', 0.2, 0.8);
  }

  bossDefeat(): void {
    [0, 0.1, 0.2, 0.35].forEach((delay, i) => {
      this.playTone(
        [523, 659, 784, 1047][i],
        [659, 784, 1047, 1319][i],
        0.15,
        'sine',
        0.25,
        delay
      );
    });
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
  }
}
