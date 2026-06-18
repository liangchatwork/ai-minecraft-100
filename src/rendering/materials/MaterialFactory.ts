import * as THREE from "three";
import type { BlockId } from "../../types/block";

type DrawTexture = (ctx: CanvasRenderingContext2D, size: number) => void;

export class MaterialFactory {
  private readonly textureSize = 16;
  private readonly cache = new Map<string, THREE.MeshLambertMaterial>();

  createBlockMaterial(id: BlockId): THREE.Material | THREE.Material[] {
    if (id === "grass") {
      const side = this.createMaterial("grass-side", (ctx, size) => {
        this.drawDirt(ctx, size);
        this.drawGrassBladeLayer(ctx, size);
      });

      const top = this.createMaterial("grass-top", (ctx, size) => {
        this.fill(ctx, size, 0x4f9d44);
        this.drawNoise(ctx, size, 0x6fbd5c, 0.28);
        this.drawNoise(ctx, size, 0x2f7d32, 0.22);
      });

      const bottom = this.createMaterial("dirt", (ctx, size) => {
        this.drawDirt(ctx, size);
      });

      return [side, side, top, bottom, side, side];
    }

    if (id === "dirt") {
      return this.createMaterial("dirt", (ctx, size) => {
        this.drawDirt(ctx, size);
      });
    }

    if (id === "stone") {
      return this.createMaterial("stone", (ctx, size) => {
        this.fill(ctx, size, 0x777777);
        this.drawNoise(ctx, size, 0x999999, 0.22);
        this.drawNoise(ctx, size, 0x555555, 0.3);
        this.drawCracks(ctx, size);
      });
    }

    if (id === "wood") {
      const side = this.createMaterial("wood-side", (ctx, size) => {
        this.fill(ctx, size, 0x6b4423);

        for (let x = 0; x < size; x += 3) {
          ctx.fillStyle = this.hex(x % 2 === 0 ? 0x8a5a2f : 0x4a2d18);
          ctx.fillRect(x, 0, 1, size);
        }

        this.drawNoise(ctx, size, 0x9a6b3d, 0.16);
        this.drawNoise(ctx, size, 0x3a2112, 0.12);

        ctx.fillStyle = this.hex(0x2b160b);
        ctx.fillRect(5, 5, 3, 2);
        ctx.fillRect(6, 6, 2, 1);
      });

      const top = this.createMaterial("wood-top", (ctx, size) => {
        this.fill(ctx, size, 0x9b6a37);

        ctx.strokeStyle = this.hex(0x5a3518);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(8, 8, 3, 0, Math.PI * 2);
        ctx.stroke();

        this.drawNoise(ctx, size, 0xc08a4a, 0.12);
      });

      return [side, side, top, top, side, side];
    }

    if (id === "plank") {
        return this.createMaterial("plank", (ctx, size) => {
          this.fill(ctx, size, 0xc9934a);
  
          for (let y = 3; y < size; y += 5) {
            ctx.fillStyle = this.hex(0x8b5a2b);
            ctx.fillRect(0, y, size, 1);
          }
  
          for (let x = 5; x < size; x += 6) {
            ctx.fillStyle = this.hex(0xe0aa5d);
            ctx.fillRect(x, 0, 1, size);
          }
  
          this.drawNoise(ctx, size, 0xe4b76b, 0.18);
          this.drawNoise(ctx, size, 0x8a5a2f, 0.12);
  
          ctx.fillStyle = this.hex(0x6b4423);
          ctx.fillRect(2, 4, 4, 1);
          ctx.fillRect(9, 11, 5, 1);
        });
      }

      if (id === "crafting_table") {
        const side = this.createMaterial("crafting-table-side", (ctx, size) => {
          this.fill(ctx, size, 0xb87935);
  
          ctx.fillStyle = this.hex(0x6b4423);
          ctx.fillRect(0, 0, size, 2);
          ctx.fillRect(0, size - 2, size, 2);
          ctx.fillRect(0, 0, 2, size);
          ctx.fillRect(size - 2, 0, 2, size);
  
          ctx.fillStyle = this.hex(0x3d2412);
          ctx.fillRect(4, 5, 3, 3);
          ctx.fillRect(9, 8, 4, 2);
  
          this.drawNoise(ctx, size, 0xd19a52, 0.18);
          this.drawNoise(ctx, size, 0x7a4b25, 0.14);
        });
  
        const top = this.createMaterial("crafting-table-top", (ctx, size) => {
          this.fill(ctx, size, 0xc9934a);
  
          ctx.fillStyle = this.hex(0x5a3518);
          ctx.fillRect(0, 7, size, 2);
          ctx.fillRect(7, 0, 2, size);
  
          ctx.fillStyle = this.hex(0xe0aa5d);
          ctx.fillRect(2, 2, 4, 4);
          ctx.fillRect(10, 2, 4, 4);
          ctx.fillRect(2, 10, 4, 4);
          ctx.fillRect(10, 10, 4, 4);
  
          ctx.fillStyle = this.hex(0x3d2412);
          ctx.fillRect(1, 1, 2, 1);
          ctx.fillRect(12, 13, 2, 1);
        });
  
        return [side, side, top, side, side, side];
      }

    return this.createMaterial("leaf", (ctx, size) => {
      this.fill(ctx, size, 0x2f7d32);
      this.drawNoise(ctx, size, 0x4caf50, 0.32);
      this.drawNoise(ctx, size, 0x1b5e20, 0.24);

      for (let i = 0; i < 14; i++) {
        const x = this.randInt(i, 0, size);
        const y = this.randInt(i, 11, size);

        ctx.fillStyle = this.hex(0x1f6f25);
        ctx.fillRect(x, y, 2, 1);
      }
    });
  }

  private createMaterial(
    key: string,
    draw: DrawTexture
  ): THREE.MeshLambertMaterial {
    const cached = this.cache.get(key);

    if (cached) {
      return cached;
    }

    const canvas = document.createElement("canvas");
    canvas.width = this.textureSize;
    canvas.height = this.textureSize;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Cannot create canvas texture context.");
    }

    ctx.imageSmoothingEnabled = false;
    draw(ctx, this.textureSize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshLambertMaterial({
      map: texture
    });

    this.cache.set(key, material);
    return material;
  }

  private drawDirt(ctx: CanvasRenderingContext2D, size: number): void {
    this.fill(ctx, size, 0x8b5a2b);
    this.drawNoise(ctx, size, 0xa46a35, 0.24);
    this.drawNoise(ctx, size, 0x5d361a, 0.22);

    ctx.fillStyle = this.hex(0x4b2b17);
    ctx.fillRect(2, 4, 3, 1);
    ctx.fillRect(9, 10, 4, 1);
    ctx.fillRect(6, 14, 2, 1);
  }

  private drawGrassBladeLayer(
    ctx: CanvasRenderingContext2D,
    size: number
  ): void {
    for (let x = 0; x < size; x++) {
      const height = 3 + this.randInt(x, 7, 3);

      ctx.fillStyle = this.hex(x % 2 === 0 ? 0x4f9d44 : 0x2f7d32);
      ctx.fillRect(x, 0, 1, height);
    }

    ctx.fillStyle = this.hex(0x6fbd5c);
    ctx.fillRect(1, 1, 2, 1);
    ctx.fillRect(9, 0, 3, 1);
  }

  private drawCracks(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.strokeStyle = this.hex(0x444444);
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(3, 4);
    ctx.lineTo(6, 6);
    ctx.lineTo(5, 9);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(11, 2);
    ctx.lineTo(9, 5);
    ctx.lineTo(12, 7);
    ctx.stroke();

    ctx.fillStyle = this.hex(0xb0b0b0);
    ctx.fillRect(size - 4, 3, 2, 1);
  }

  private drawNoise(
    ctx: CanvasRenderingContext2D,
    size: number,
    color: number,
    density: number
  ): void {
    ctx.fillStyle = this.hex(color);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (this.hash(x, y, color) < density) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private fill(
    ctx: CanvasRenderingContext2D,
    size: number,
    color: number
  ): void {
    ctx.fillStyle = this.hex(color);
    ctx.fillRect(0, 0, size, size);
  }

  private hex(color: number): string {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  private hash(x: number, y: number, seed: number): number {
    const value =
      Math.sin(x * 127.1 + y * 311.7 + seed * 0.0001) * 43758.5453;

    return value - Math.floor(value);
  }

  private randInt(index: number, seed: number, max: number): number {
    return Math.floor(this.hash(index, seed, max * 999) * max);
  }
}