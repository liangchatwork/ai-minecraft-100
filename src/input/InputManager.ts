export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private readonly justPressedKeys = new Set<string>();

  private readonly pressedMouseButtons = new Set<number>();
  private readonly justPressedMouseButtons = new Set<number>();

  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private wheelDelta = 0;

  constructor(private readonly target: HTMLElement) {
    window.addEventListener("keydown", (event) => {
      if (!this.pressedKeys.has(event.code)) {
        this.justPressedKeys.add(event.code);
      }

      this.pressedKeys.add(event.code);

      if (event.code === "Space") {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.pressedKeys.delete(event.code);
    });

    this.target.addEventListener("click", () => {
      this.target.requestPointerLock();
    });

    this.target.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    this.target.addEventListener("mousedown", (event) => {
      if (document.pointerLockElement !== this.target) return;

      if (!this.pressedMouseButtons.has(event.button)) {
        this.justPressedMouseButtons.add(event.button);
      }

      this.pressedMouseButtons.add(event.button);
    });

    window.addEventListener("mouseup", (event) => {
      this.pressedMouseButtons.delete(event.button);
    });

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.target) return;

      this.pressedMouseButtons.clear();
      this.justPressedMouseButtons.clear();
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
      this.wheelDelta = 0;
    });

    document.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement !== this.target) return;

      this.mouseDeltaX += event.movementX;
      this.mouseDeltaY += event.movementY;
    });

    this.target.addEventListener("wheel", (event) => {
      if (document.pointerLockElement !== this.target) return;

      event.preventDefault();
      this.wheelDelta += event.deltaY;
    });
  }

  isPressed(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  isMousePressed(button: number): boolean {
    return this.pressedMouseButtons.has(button);
  }

  consumeKeyPress(code: string): boolean {
    const pressed = this.justPressedKeys.has(code);
    this.justPressedKeys.delete(code);
    return pressed;
  }

  consumeMouseButtonPress(button: number): boolean {
    const pressed = this.justPressedMouseButtons.has(button);
    this.justPressedMouseButtons.delete(button);
    return pressed;
  }

  consumeWheelDirection(): number {
    if (this.wheelDelta === 0) return 0;

    const direction = this.wheelDelta > 0 ? 1 : -1;
    this.wheelDelta = 0;

    return direction;
  }

  consumeMouseDelta(): { x: number; y: number } {
    const delta = {
      x: this.mouseDeltaX,
      y: this.mouseDeltaY
    };

    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    return delta;
  }
}