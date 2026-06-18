export class GameLoop {
    private animationId = 0;
    private lastTime = 0;
    private readonly update: (deltaTime: number) => void;
  
    constructor(update: (deltaTime: number) => void) {
      this.update = update;
    }
  
    start(): void {
      this.lastTime = performance.now();
  
      const tick = (now: number) => {
        const deltaTime = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
  
        this.update(deltaTime);
        this.animationId = requestAnimationFrame(tick);
      };
  
      this.animationId = requestAnimationFrame(tick);
    }
  
    stop(): void {
      cancelAnimationFrame(this.animationId);
    }
  }