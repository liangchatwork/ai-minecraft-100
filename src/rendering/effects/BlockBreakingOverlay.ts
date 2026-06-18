import * as THREE from "three";
import type { MiningUiState } from "../../game/player/MiningState";
import type { BlockPosition } from "../../types/block";

export class BlockBreakingOverlay {
  private readonly geometry = new THREE.PlaneGeometry(1.01, 1.01);
  private readonly materials: THREE.MeshBasicMaterial[] = [];
  private readonly mesh: THREE.Mesh;

  constructor(private readonly scene: THREE.Scene) {
    this.materials = this.createCrackMaterials();

    this.mesh = new THREE.Mesh(this.geometry, this.materials[0]);
    this.mesh.visible = false;
    this.mesh.renderOrder = 999;

    this.scene.add(this.mesh);
  }

  update(state: MiningUiState): void {
    if (!state.active || !state.target || !state.normal) {
      this.mesh.visible = false;
      return;
    }

    const stage = Math.min(
      this.materials.length - 1,
      Math.floor(state.progress * this.materials.length)
    );

    this.mesh.material = this.materials[stage];
    this.mesh.visible = true;

    this.placeOnBlockFace(state.target, state.normal);
  }

  private placeOnBlockFace(
    block: BlockPosition,
    normal: BlockPosition
  ): void {
    const epsilon = 0.003;

    this.mesh.position.set(
      block.x + 0.5 + normal.x * (0.5 + epsilon),
      block.y + 0.5 + normal.y * (0.5 + epsilon),
      block.z + 0.5 + normal.z * (0.5 + epsilon)
    );

    this.mesh.rotation.set(0, 0, 0);

    if (normal.z === 1) {
      this.mesh.rotation.set(0, 0, 0);
    } else if (normal.z === -1) {
      this.mesh.rotation.set(0, Math.PI, 0);
    } else if (normal.x === 1) {
      this.mesh.rotation.set(0, Math.PI / 2, 0);
    } else if (normal.x === -1) {
      this.mesh.rotation.set(0, -Math.PI / 2, 0);
    } else if (normal.y === 1) {
      this.mesh.rotation.set(-Math.PI / 2, 0, 0);
    } else if (normal.y === -1) {
      this.mesh.rotation.set(Math.PI / 2, 0, 0);
    }
  }

  private createCrackMaterials(): THREE.MeshBasicMaterial[] {
    const result: THREE.MeshBasicMaterial[] = [];

    for (let stage = 0; stage < 10; stage++) {
      const texture = this.createCrackTexture(stage);

      result.push(
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -8,
          polygonOffsetUnits: -8
        })
      );
    }

    return result;
  }

  private createCrackTexture(stage: number): THREE.CanvasTexture {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Cannot create breaking texture canvas.");
    }

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;
    ctx.strokeStyle = "rgba(20, 20, 20, 0.82)";
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    const crackCount = 3 + stage * 3;
    const branchLength = 10 + stage * 3;

    for (let i = 0; i < crackCount; i++) {
      const seed = stage * 100 + i * 17;
      const startX = size / 2 + this.random(seed, -12, 12);
      const startY = size / 2 + this.random(seed + 1, -12, 12);

      let x = startX;
      let y = startY;

      const angle = this.random(seed + 2, 0, Math.PI * 2);
      const steps = 2 + Math.floor(stage / 2);

      ctx.lineWidth = stage < 5 ? 2 : 3;
      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let s = 0; s < steps; s++) {
        const bend = this.random(seed + s * 13, -0.9, 0.9);
        const length = branchLength * this.random(seed + s * 19, 0.45, 1);

        x += Math.cos(angle + bend) * length;
        y += Math.sin(angle + bend) * length;

        x = THREE.MathUtils.clamp(x, 3, size - 3);
        y = THREE.MathUtils.clamp(y, 3, size - 3);

        ctx.lineTo(x, y);
      }

      ctx.stroke();

      if (stage >= 4) {
        this.drawSmallBranch(ctx, x, y, angle + 1.7, stage, seed + 99);
      }

      if (stage >= 7) {
        this.drawSmallBranch(ctx, x, y, angle - 1.4, stage, seed + 199);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }

  private drawSmallBranch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    stage: number,
    seed: number
  ): void {
    const length = 6 + stage * 1.4;
    const endX = THREE.MathUtils.clamp(
      x + Math.cos(angle) * this.random(seed, length * 0.5, length),
      2,
      62
    );

    const endY = THREE.MathUtils.clamp(
      y + Math.sin(angle) * this.random(seed + 1, length * 0.5, length),
      2,
      62
    );

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  private random(seed: number, min: number, max: number): number {
    const value = Math.sin(seed * 999.91) * 43758.5453;
    const normalized = value - Math.floor(value);

    return min + normalized * (max - min);
  }
}