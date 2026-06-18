import { Inventory } from "../../game/inventory/Inventory";
import { BLOCK_DEFINITIONS } from "../../game/blocks/blockDefinitions";

export class Hotbar {
  private readonly element = document.createElement("div");
  private readonly slots: HTMLDivElement[] = [];

  private constructor(private readonly inventory: Inventory) {
    this.element.className = "hotbar";

    for (let i = 0; i < Inventory.HOTBAR_SIZE; i++) {
      const slot = document.createElement("div");
      slot.className = "hotbar-slot";
      this.element.appendChild(slot);
      this.slots.push(slot);
    }
  }

  static mount(root: HTMLElement, inventory: Inventory): Hotbar {
    const hotbar = new Hotbar(inventory);
    root.appendChild(hotbar.element);
    hotbar.update();
    return hotbar;
  }

  update(): void {
    for (let index = 0; index < Inventory.HOTBAR_SIZE; index++) {
      const slot = this.inventory.slots[index];
      const element = this.slots[index];

      element.classList.toggle(
        "hotbar-slot-selected",
        index === this.inventory.selectedIndex
      );

      if (!slot.id) {
        element.innerHTML = `<span class="hotbar-key">${index + 1}</span>`;
        element.style.setProperty("--block-color", "transparent");
        continue;
      }

      const block = BLOCK_DEFINITIONS[slot.id];

      element.style.setProperty(
        "--block-color",
        `#${block.color.toString(16).padStart(6, "0")}`
      );

      element.innerHTML = `
        <span class="hotbar-key">${index + 1}</span>
        <span class="hotbar-block"></span>
        <span class="hotbar-count">${slot.count}</span>
      `;
    }
  }
}