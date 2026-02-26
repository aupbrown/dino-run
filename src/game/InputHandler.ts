export class InputHandler {
  private onAction: () => void;

  constructor(onAction: () => void) {
    this.onAction = onAction;
    this.handleKey = this.handleKey.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    document.addEventListener('keydown', this.handleKey);
    document.addEventListener('touchstart', this.handleTouch, { passive: false });
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.onAction();
    }
  }

  private handleTouch(e: TouchEvent): void {
    e.preventDefault();
    this.onAction();
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKey);
    document.removeEventListener('touchstart', this.handleTouch);
  }
}
