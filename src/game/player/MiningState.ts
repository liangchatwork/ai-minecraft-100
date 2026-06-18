import type { BlockId, BlockPosition } from "../../types/block";

export interface MiningUiState {
  active: boolean;
  blockId: BlockId | null;
  progress: number;
  target: BlockPosition | null;
  normal: BlockPosition | null;
}

export class MiningState {
  private targetKey: string | null = null;
  private targetPosition: BlockPosition | null = null;
  private targetNormal: BlockPosition | null = null;
  private blockId: BlockId | null = null;
  private progress = 0;

  beginOrContinue(
    target: BlockPosition,
    normal: BlockPosition,
    blockId: BlockId,
    deltaTime: number,
    hardness: number
  ): boolean {
    const key = this.key(target);

    if (this.targetKey !== key) {
      this.targetKey = key;
      this.targetPosition = { ...target };
      this.targetNormal = { ...normal };
      this.blockId = blockId;
      this.progress = 0;
    }

    this.progress += deltaTime / hardness;

    return this.progress >= 1;
  }

  reset(): void {
    this.targetKey = null;
    this.targetPosition = null;
    this.targetNormal = null;
    this.blockId = null;
    this.progress = 0;
  }

  getUiState(): MiningUiState {
    return {
      active: this.targetKey !== null,
      blockId: this.blockId,
      progress: Math.min(this.progress, 1),
      target: this.targetPosition,
      normal: this.targetNormal
    };
  }

  private key(position: BlockPosition): string {
    return `${position.x},${position.y},${position.z}`;
  }
}