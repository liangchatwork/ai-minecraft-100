import * as THREE from "three";
import type { BlockHit, BlockId } from "../../types/block";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";
import { MaterialFactory } from "../../rendering/materials/MaterialFactory";

interface StoredBlock {
  id: BlockId;
  mesh: THREE.Mesh;
}

export class World {
  readonly group = new THREE.Group();

  private readonly blocks = new Map<string, StoredBlock>();
  private readonly cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly materialFactory = new MaterialFactory();

  constructor() {
    this.buildStarterWorld();
  }

  getSpawnPoint(): THREE.Vector3 {
    const x = 0;
    const z = 0;
    const groundY = this.getHeight(x, z);

    return new THREE.Vector3(x + 0.5, groundY + 1 + 1.62, z + 0.5);
  }

  isSolidBlock(x: number, y: number, z: number): boolean {
    const block = this.blocks.get(this.key(x, y, z));
    if (!block) return false;

    return BLOCK_DEFINITIONS[block.id].solid;
  }

  getBlockId(x: number, y: number, z: number): BlockId | null {
    return this.blocks.get(this.key(x, y, z))?.id ?? null;
  }

  addBlock(x: number, y: number, z: number, id: BlockId): boolean {
    const key = this.key(x, y, z);

    if (this.blocks.has(key)) {
      return false;
    }

    const mesh = new THREE.Mesh(
      this.cubeGeometry,
      this.materialFactory.createBlockMaterial(id)
    );

    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);

    this.blocks.set(key, { id, mesh });
    this.group.add(mesh);

    return true;
  }

  removeBlock(x: number, y: number, z: number): BlockId | null {
    const key = this.key(x, y, z);
    const block = this.blocks.get(key);

    if (!block) {
      return null;
    }

    this.group.remove(block.mesh);

    // 注意：
    // cubeGeometry 和材質是共用資源。
    // 這裡不能 dispose，否則之後其他方塊可能會渲染異常。
    this.blocks.delete(key);

    return block.id;
  }

  raycastBlock(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance = 5
  ): BlockHit | null {
    const rayDirection = direction.clone().normalize();

    let previousX = Math.floor(origin.x);
    let previousY = Math.floor(origin.y);
    let previousZ = Math.floor(origin.z);

    for (let distance = 0; distance <= maxDistance; distance += 0.05) {
      const point = origin.clone().addScaledVector(rayDirection, distance);

      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      const z = Math.floor(point.z);

      const id = this.getBlockId(x, y, z);

      if (id) {
        let normalX = previousX - x;
        let normalY = previousY - y;
        let normalZ = previousZ - z;

        if (normalX === 0 && normalY === 0 && normalZ === 0) {
          const absX = Math.abs(rayDirection.x);
          const absY = Math.abs(rayDirection.y);
          const absZ = Math.abs(rayDirection.z);

          if (absX >= absY && absX >= absZ) {
            normalX = rayDirection.x > 0 ? -1 : 1;
          } else if (absY >= absX && absY >= absZ) {
            normalY = rayDirection.y > 0 ? -1 : 1;
          } else {
            normalZ = rayDirection.z > 0 ? -1 : 1;
          }
        }

        return {
          block: { x, y, z },
          normal: { x: normalX, y: normalY, z: normalZ },
          place: {
            x: x + normalX,
            y: y + normalY,
            z: z + normalZ
          },
          id,
          distance
        };
      }

      previousX = x;
      previousY = y;
      previousZ = z;
    }

    return null;
  }

  private buildStarterWorld(): void {
    for (let x = -16; x <= 16; x++) {
      for (let z = -16; z <= 16; z++) {
        const height = this.getHeight(x, z);

        for (let y = -4; y <= height; y++) {
          const id: BlockId =
            y === height
              ? "grass"
              : y <= -2
                ? "stone"
                : "dirt";

          this.addBlock(x, y, z, id);
        }
      }
    }

    this.addTreeAtGround(4, 4);
    this.addTreeAtGround(-6, -3);
    this.addTreeAtGround(7, -5);
    this.addStonePile(-4, 5);
  }

  private getHeight(x: number, z: number): number {
    const wave =
      Math.sin(x * 0.35) +
      Math.cos(z * 0.4) +
      Math.sin((x + z) * 0.18);

    return Math.floor(wave * 0.75);
  }

  private addTreeAtGround(x: number, z: number): void {
    const groundY = this.getHeight(x, z);
    const baseY = groundY + 1;

    this.addBlock(x, baseY, z, "wood");
    this.addBlock(x, baseY + 1, z, "wood");
    this.addBlock(x, baseY + 2, z, "wood");

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        this.addBlock(x + dx, baseY + 3, z + dz, "leaf");
      }
    }

    this.addBlock(x, baseY + 4, z, "leaf");
  }

  private addStonePile(x: number, z: number): void {
    const groundY = this.getHeight(x, z);
    const y = groundY + 1;

    this.addBlock(x, y, z, "stone");
    this.addBlock(x + 1, y, z, "stone");
    this.addBlock(x, y, z + 1, "stone");
    this.addBlock(x, y + 1, z, "stone");
  }

  private key(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }
}