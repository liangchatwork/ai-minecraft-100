import * as THREE from "three";
import { InputManager } from "../../input/InputManager";
import { World } from "../../game/world/World";
import { Inventory } from "../../game/inventory/Inventory";
import { BLOCK_DEFINITIONS } from "../../game/blocks/blockDefinitions";
import { MiningState, type MiningUiState } from "../../game/player/MiningState";

export class CameraController {
  private yaw = 0;
  private pitch = 0;

  private readonly walkSpeed = 4.3;
  private readonly sprintSpeed = 6.2;
  private readonly jumpVelocity = 8.2;
  private readonly gravity = -24;
  private readonly terminalVelocity = -36;
  private readonly lookSensitivity = 0.0025;

  private readonly playerHeight = 1.8;
  private readonly eyeHeight = 1.62;
  private readonly playerRadius = 0.32;

  private isGrounded = false;

  private readonly velocity = new THREE.Vector3();
  private readonly moveDirection = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly lookDirection = new THREE.Vector3();
  private readonly mining = new MiningState();

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly input: InputManager,
    private readonly world: World,
    private readonly inventory: Inventory
  ) {
    this.camera.rotation.order = "YXZ";
    this.camera.position.copy(this.world.getSpawnPoint());
  }

  update(deltaTime: number): void {
    this.updateLook();
    this.updateHotbarSelection();
    this.updateBlockInteraction(deltaTime);
    this.updateSurvivalMovement(deltaTime);
  }

  getMiningUiState(): MiningUiState {
    return this.mining.getUiState();
  }

  cancelCurrentAction(): void {
    this.mining.reset();
  }

  private updateLook(): void {
    const mouse = this.input.consumeMouseDelta();

    this.yaw -= mouse.x * this.lookSensitivity;
    this.pitch -= mouse.y * this.lookSensitivity;

    const maxPitch = Math.PI / 2 - 0.01;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -maxPitch, maxPitch);

    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }

  private updateHotbarSelection(): void {
    for (let i = 0; i < 9; i++) {
      if (this.input.consumeKeyPress(`Digit${i + 1}`)) {
        this.inventory.selectSlot(i);
      }
    }

    const wheelDirection = this.input.consumeWheelDirection();

    if (wheelDirection !== 0) {
      this.inventory.selectRelative(wheelDirection);
    }
  }

  private updateBlockInteraction(deltaTime: number): void {
    this.camera.getWorldDirection(this.lookDirection);

    const hit = this.world.raycastBlock(
      this.camera.position,
      this.lookDirection,
      5
    );

    if (!this.input.isMousePressed(0)) {
      this.mining.reset();
    }

    if (this.input.isMousePressed(0)) {
      if (!hit) {
        this.mining.reset();
      } else {
        const hardness = BLOCK_DEFINITIONS[hit.id].hardness;
        const finished = this.mining.beginOrContinue(
          hit.block,
          hit.normal,
          hit.id,
          deltaTime,
          hardness
        );

        if (finished) {
          const removedId = this.world.removeBlock(
            hit.block.x,
            hit.block.y,
            hit.block.z
          );

          if (removedId) {
            this.inventory.addBlock(removedId, 1);
          }

          this.mining.reset();
        }
      }
    }

    if (this.input.consumeMouseButtonPress(2)) {
      this.mining.reset();

      if (!hit) return;

      const selectedBlock = this.inventory.getSelectedBlock();
      if (!selectedBlock) return;

      const place = hit.place;

      if (this.wouldBlockOverlapPlayer(place.x, place.y, place.z)) {
        return;
      }

      const placed = this.world.addBlock(
        place.x,
        place.y,
        place.z,
        selectedBlock
      );

      if (placed) {
        this.inventory.removeOneSelectedBlock();
      }
    }
  }

  private updateSurvivalMovement(deltaTime: number): void {
    this.moveDirection.set(0, 0, 0);

    this.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    if (this.input.isPressed("KeyW")) this.moveDirection.add(this.forward);
    if (this.input.isPressed("KeyS")) this.moveDirection.sub(this.forward);
    if (this.input.isPressed("KeyD")) this.moveDirection.add(this.right);
    if (this.input.isPressed("KeyA")) this.moveDirection.sub(this.right);

    if (this.moveDirection.lengthSq() > 0) {
      this.moveDirection.normalize();
    }

    const speed = this.input.isPressed("ControlLeft")
      ? this.sprintSpeed
      : this.walkSpeed;

    const horizontalMove = this.moveDirection
      .clone()
      .multiplyScalar(speed * deltaTime);

    this.moveWithCollision(horizontalMove.x, 0, 0);
    this.moveWithCollision(0, 0, horizontalMove.z);

    if (this.isGrounded && this.input.isPressed("Space")) {
      this.velocity.y = this.jumpVelocity;
      this.isGrounded = false;
    }

    this.velocity.y += this.gravity * deltaTime;
    this.velocity.y = Math.max(this.velocity.y, this.terminalVelocity);

    this.isGrounded = false;
    this.moveWithCollision(0, this.velocity.y * deltaTime, 0);
  }

  private moveWithCollision(dx: number, dy: number, dz: number): void {
    if (dx === 0 && dy === 0 && dz === 0) return;

    this.camera.position.x += dx;
    this.camera.position.y += dy;
    this.camera.position.z += dz;

    if (!this.isColliding()) return;

    this.camera.position.x -= dx;
    this.camera.position.y -= dy;
    this.camera.position.z -= dz;

    if (dy < 0) {
      this.isGrounded = true;
      this.velocity.y = 0;
    }

    if (dy > 0) {
      this.velocity.y = 0;
    }
  }

  private isColliding(): boolean {
    const eye = this.camera.position;

    const minX = eye.x - this.playerRadius;
    const maxX = eye.x + this.playerRadius;
    const minZ = eye.z - this.playerRadius;
    const maxZ = eye.z + this.playerRadius;

    const feetY = eye.y - this.eyeHeight;
    const headY = feetY + this.playerHeight;

    const startX = Math.floor(minX);
    const endX = Math.floor(maxX);
    const startY = Math.floor(feetY);
    const endY = Math.floor(headY - 0.001);
    const startZ = Math.floor(minZ);
    const endZ = Math.floor(maxZ);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        for (let z = startZ; z <= endZ; z++) {
          if (this.world.isSolidBlock(x, y, z)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private wouldBlockOverlapPlayer(
    blockX: number,
    blockY: number,
    blockZ: number
  ): boolean {
    const eye = this.camera.position;

    const playerMinX = eye.x - this.playerRadius;
    const playerMaxX = eye.x + this.playerRadius;
    const playerMinZ = eye.z - this.playerRadius;
    const playerMaxZ = eye.z + this.playerRadius;
    const playerMinY = eye.y - this.eyeHeight;
    const playerMaxY = playerMinY + this.playerHeight;

    const blockMinX = blockX;
    const blockMaxX = blockX + 1;
    const blockMinY = blockY;
    const blockMaxY = blockY + 1;
    const blockMinZ = blockZ;
    const blockMaxZ = blockZ + 1;

    const overlapX = playerMinX < blockMaxX && playerMaxX > blockMinX;
    const overlapY = playerMinY < blockMaxY && playerMaxY > blockMinY;
    const overlapZ = playerMinZ < blockMaxZ && playerMaxZ > blockMinZ;

    return overlapX && overlapY && overlapZ;
  }
}