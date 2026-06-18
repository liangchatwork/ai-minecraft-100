import { Renderer } from "../rendering/Renderer";
import { GameLoop } from "./GameLoop";
import { InputManager } from "../input/InputManager";
import { CameraController } from "../rendering/camera/CameraController";
import { World } from "../game/world/World";
import { Crosshair } from "../ui/hud/Crosshair";
import { Inventory } from "../game/inventory/Inventory";
import { Hotbar } from "../ui/hud/Hotbar";
import { BlockBreakingOverlay } from "../rendering/effects/BlockBreakingOverlay";
import { InventoryScreen } from "../ui/hud/InventoryScreen";

export class App {
  private readonly root: HTMLElement;
  private renderer!: Renderer;
  private input!: InputManager;
  private cameraController!: CameraController;
  private world!: World;
  private inventory!: Inventory;
  private hotbar!: Hotbar;
  private inventoryScreen!: InventoryScreen;
  private breakingOverlay!: BlockBreakingOverlay;
  private loop!: GameLoop;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  start(): void {
    this.root.innerHTML = "";

    this.renderer = new Renderer(this.root);
    this.input = new InputManager(this.renderer.canvas);

    this.world = new World();
    this.inventory = new Inventory();

    this.renderer.scene.add(this.world.group);

    this.cameraController = new CameraController(
      this.renderer.camera,
      this.input,
      this.world,
      this.inventory
    );

    this.breakingOverlay = new BlockBreakingOverlay(this.renderer.scene);

    Crosshair.mount(this.root);
    this.hotbar = Hotbar.mount(this.root, this.inventory);
    this.inventoryScreen = InventoryScreen.mount(this.root, this.inventory);

    this.loop = new GameLoop((deltaTime) => {
      if (this.input.consumeKeyPress("KeyE")) {
        this.cameraController.cancelCurrentAction();
        this.inventoryScreen.toggle();
      }

      if (!this.inventoryScreen.isOpen()) {
        this.cameraController.update(deltaTime);
      }

      this.hotbar.update();
      this.inventoryScreen.update();
      this.breakingOverlay.update(this.cameraController.getMiningUiState());
      this.renderer.render();
    });

    this.loop.start();
  }
}