import {
    Inventory,
    type InventorySlot
  } from "../../game/inventory/Inventory";
  import { BLOCK_DEFINITIONS } from "../../game/blocks/blockDefinitions";
  import {
    CraftingSystem,
    CRAFTING_RECIPES,
    type CraftingRecipe
  } from "../../game/crafting/CraftingSystem";
  import type { BlockId } from "../../types/block";
  
  type SlotKind = "inventory" | "craft";
  type SlotKey = `${SlotKind}:${number}`;
  
  export class InventoryScreen {
    private readonly overlay = document.createElement("div");
    private readonly panel = document.createElement("div");
    private readonly inventorySlotElements: HTMLDivElement[] = [];
    private readonly craftingSlotElements: HTMLDivElement[] = [];
    private readonly resultElement = document.createElement("div");
    private readonly cursorElement = document.createElement("div");
    private readonly recipeList = document.createElement("div");
  
    private open = false;
  
    private hoveredInventoryIndex: number | null = null;
    private hoveredCraftIndex: number | null = null;
  
    private draggingButton: 0 | 2 | null = null;
    private suppressNextClick = false;
    private readonly dragTargets = new Set<SlotKey>();
  
    private readonly craftingSlots: InventorySlot[] = Array.from(
      { length: 4 },
      () => ({
        id: null,
        count: 0
      })
    );
  
    private cursor: InventorySlot = {
      id: null,
      count: 0
    };
  
    private constructor(private readonly inventory: Inventory) {
      this.overlay.className = "inventory-overlay";
      this.panel.className = "inventory-panel inventory-panel-classic";
      this.cursorElement.className = "inventory-cursor";
  
      this.overlay.style.display = "none";
      this.cursorElement.style.display = "none";
  
      this.overlay.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });
  
      this.overlay.addEventListener("click", (event) => {
        if (event.target === this.overlay && this.isCursorEmpty()) {
          this.close();
        }
      });
  
      window.addEventListener("mousemove", (event) => {
        this.cursorElement.style.left = `${event.clientX}px`;
        this.cursorElement.style.top = `${event.clientY}px`;
      });
  
      window.addEventListener("mouseup", () => {
        this.finishDragDistribution();
      });
  
      window.addEventListener("keydown", (event) => {
        if (!this.open) return;
  
        if (event.code === "Escape") {
          event.preventDefault();
          this.close();
          return;
        }
  
        if (event.code === "KeyQ") {
          event.preventDefault();
          event.shiftKey ? this.dropAll() : this.dropOne();
          this.update();
          return;
        }
  
        if (event.code.startsWith("Digit")) {
          const digit = Number(event.code.replace("Digit", ""));
  
          if (digit >= 1 && digit <= 9) {
            this.swapHoveredWithHotbar(digit - 1);
            this.update();
          }
        }
      });
  
      this.panel.appendChild(this.createTopSection());
      this.panel.appendChild(this.createMainInventorySection());
  
      const hint = document.createElement("div");
      hint.className = "inventory-hint";
      hint.textContent =
        "Left click pick/place · Right click split/place one · Left-drag split evenly · Right-drag place one · Shift+Click quick move · 1-9 swap hotbar · Q drop";
  
      this.panel.appendChild(hint);
  
      this.overlay.appendChild(this.panel);
      this.overlay.appendChild(this.cursorElement);
    }
  
    static mount(root: HTMLElement, inventory: Inventory): InventoryScreen {
      const screen = new InventoryScreen(inventory);
      root.appendChild(screen.overlay);
      screen.update();
      return screen;
    }
  
    toggle(): void {
      this.open ? this.close() : this.openInventory();
    }
  
    isOpen(): boolean {
      return this.open;
    }
  
    close(): void {
      this.returnCursorToInventory();
      this.returnCraftingSlotsToInventory();
      this.clearDragState();
  
      this.open = false;
      this.overlay.style.display = "none";
      this.update();
    }
  
    update(): void {
      for (let i = 0; i < Inventory.TOTAL_SIZE; i++) {
        this.renderInventorySlot(i);
      }
  
      for (let i = 0; i < this.craftingSlots.length; i++) {
        this.renderCraftingSlot(i);
      }
  
      this.renderCraftingResult();
      this.renderRecipeBook();
      this.renderCursor();
      this.renderDragHighlights();
    }
  
    private createTopSection(): HTMLDivElement {
      const top = document.createElement("div");
      top.className = "inventory-top";
  
      top.appendChild(this.createRecipeBook());
      top.appendChild(this.createPlayerArea());
      top.appendChild(this.createCraftingArea());
  
      return top;
    }
  
    private createRecipeBook(): HTMLDivElement {
      const wrapper = document.createElement("div");
      wrapper.className = "classic-recipe-book";
  
      const title = document.createElement("div");
      title.className = "classic-section-title";
      title.textContent = "Recipe Book";
  
      this.recipeList.className = "classic-recipe-list";
  
      wrapper.appendChild(title);
      wrapper.appendChild(this.recipeList);
  
      return wrapper;
    }
  
    private createPlayerArea(): HTMLDivElement {
      const wrapper = document.createElement("div");
      wrapper.className = "classic-player-area";
  
      const armor = document.createElement("div");
      armor.className = "classic-armor-column";
  
      for (const label of ["Helmet", "Chest", "Legs", "Boots"]) {
        const slot = document.createElement("div");
        slot.className = "classic-ghost-slot";
        slot.textContent = label.slice(0, 1);
        armor.appendChild(slot);
      }
  
      const preview = document.createElement("div");
      preview.className = "classic-player-preview";
      preview.innerHTML = `
        <div class="classic-player-head"></div>
        <div class="classic-player-body"></div>
        <div class="classic-player-arm left"></div>
        <div class="classic-player-arm right"></div>
        <div class="classic-player-leg left"></div>
        <div class="classic-player-leg right"></div>
      `;
  
      const offhand = document.createElement("div");
      offhand.className = "classic-ghost-slot classic-offhand";
      offhand.textContent = "O";
  
      wrapper.appendChild(armor);
      wrapper.appendChild(preview);
      wrapper.appendChild(offhand);
  
      return wrapper;
    }
  
    private createCraftingArea(): HTMLDivElement {
      const wrapper = document.createElement("div");
      wrapper.className = "classic-crafting-area";
  
      const title = document.createElement("div");
      title.className = "classic-section-title";
      title.textContent = "Crafting";
  
      const row = document.createElement("div");
      row.className = "classic-crafting-row";
  
      const grid = document.createElement("div");
      grid.className = "classic-crafting-grid";
  
      for (let i = 0; i < 4; i++) {
        const slot = this.createSlotElement("craft", i);
        slot.classList.add("crafting-slot");
        this.craftingSlotElements[i] = slot;
        grid.appendChild(slot);
      }
  
      const arrow = document.createElement("div");
      arrow.className = "classic-crafting-arrow";
      arrow.textContent = "➜";
  
      this.resultElement.className = "classic-slot classic-result-slot";

      this.resultElement.addEventListener("mousedown", (event) => {
        this.handleResultMouseDown(event);
      });
  
      this.resultElement.addEventListener("click", (event) => {
        if (this.suppressNextClick) {
          this.suppressNextClick = false;
          return;
        }
  
        this.handleResultClick(event);
      });
  
      this.resultElement.addEventListener("dblclick", (event) => {
        event.preventDefault();
      });
  
      row.appendChild(grid);
      row.appendChild(arrow);
      row.appendChild(this.resultElement);
  
      wrapper.appendChild(title);
      wrapper.appendChild(row);
  
      return wrapper;
    }
  
    private createMainInventorySection(): HTMLDivElement {
      const wrapper = document.createElement("div");
      wrapper.className = "classic-main-inventory";
  
      const backpackGrid = document.createElement("div");
      backpackGrid.className = "classic-grid classic-backpack-grid";
  
      for (let i = Inventory.HOTBAR_SIZE; i < Inventory.TOTAL_SIZE; i++) {
        const slot = this.createSlotElement("inventory", i);
        this.inventorySlotElements[i] = slot;
        backpackGrid.appendChild(slot);
      }
  
      const hotbarGrid = document.createElement("div");
      hotbarGrid.className = "classic-grid classic-hotbar-grid";
  
      for (let i = 0; i < Inventory.HOTBAR_SIZE; i++) {
        const slot = this.createSlotElement("inventory", i);
        this.inventorySlotElements[i] = slot;
        hotbarGrid.appendChild(slot);
      }
  
      wrapper.appendChild(backpackGrid);
      wrapper.appendChild(hotbarGrid);
  
      return wrapper;
    }
  
    private createSlotElement(kind: SlotKind, index: number): HTMLDivElement {
      const slot = document.createElement("div");
      slot.className = "classic-slot";
  
      slot.addEventListener("click", (event) => {
        if (this.suppressNextClick) {
          this.suppressNextClick = false;
          return;
        }
  
        if (kind === "inventory") {
          this.handleInventoryLeftClick(event, index);
        } else {
          this.handleCraftLeftClick(event, index);
        }
      });
  
      slot.addEventListener("contextmenu", (event) => {
        event.preventDefault();
  
        if (this.suppressNextClick) {
          this.suppressNextClick = false;
          return;
        }
  
        this.handleRightClickSlot(this.getSlot(kind, index));
        this.update();
      });
  
      slot.addEventListener("dblclick", (event) => {
        event.preventDefault();
        this.collectSameKind(kind, index);
        this.update();
      });
  
      slot.addEventListener("mousedown", (event) => {
        this.handleSlotMouseDown(event, kind, index);
      });
  
      slot.addEventListener("mouseenter", () => {
        if (kind === "inventory") {
          this.hoveredInventoryIndex = index;
        } else {
          this.hoveredCraftIndex = index;
        }
  
        this.addDragTarget(kind, index);
      });
  
      slot.addEventListener("mouseleave", () => {
        if (kind === "inventory") {
          this.hoveredInventoryIndex = null;
        } else {
          this.hoveredCraftIndex = null;
        }
      });
  
      return slot;
    }
  
    private handleSlotMouseDown(
      event: MouseEvent,
      kind: SlotKind,
      index: number
    ): void {
      if (event.button !== 0 && event.button !== 2) return;
  
      const slot = this.getSlot(kind, index);
  
      if (event.button === 0 && this.isCursorEmpty() && !event.shiftKey) {
        if (this.isSlotEmpty(slot)) return;
  
        event.preventDefault();
  
        this.cursor = {
          id: slot.id,
          count: slot.count
        };
  
        this.clearSlotObject(slot);
  
        this.suppressNextClick = true;
        this.update();
        return;
      }
  
      this.beginDragDistribution(event, kind, index);
    }
  
    private handleInventoryLeftClick(event: MouseEvent, index: number): void {
      if (event.shiftKey && this.isCursorEmpty()) {
        this.inventory.quickMove(index);
        this.update();
        return;
      }
  
      this.handleLeftClickSlot(this.inventory.slots[index]);
      this.update();
    }
  
    private handleCraftLeftClick(event: MouseEvent, index: number): void {
      if (event.shiftKey && this.isCursorEmpty()) {
        const slot = this.craftingSlots[index];
  
        if (slot.id && slot.count > 0) {
          this.inventory.addBlock(slot.id, slot.count);
          this.clearSlotObject(slot);
        }
  
        this.update();
        return;
      }
  
      this.handleLeftClickSlot(this.craftingSlots[index]);
      this.update();
    }
  
    private handleLeftClickSlot(slot: InventorySlot): void {
      if (this.isCursorEmpty()) {
        if (this.isSlotEmpty(slot)) return;
  
        this.cursor = {
          id: slot.id,
          count: slot.count
        };
  
        this.clearSlotObject(slot);
        return;
      }
  
      if (!this.cursor.id) return;
  
      if (this.isSlotEmpty(slot)) {
        slot.id = this.cursor.id;
        slot.count = this.cursor.count;
        this.clearCursor();
        return;
      }
  
      if (slot.id === this.cursor.id) {
        const maxStack = BLOCK_DEFINITIONS[slot.id].maxStack;
        const canMove = Math.min(this.cursor.count, maxStack - slot.count);
  
        slot.count += canMove;
        this.cursor.count -= canMove;
  
        if (this.cursor.count <= 0) {
          this.clearCursor();
        }
  
        return;
      }
  
      const temp = {
        id: slot.id,
        count: slot.count
      };
  
      slot.id = this.cursor.id;
      slot.count = this.cursor.count;
      this.cursor = temp;
    }
  
    private handleRightClickSlot(slot: InventorySlot): void {
      if (this.isCursorEmpty()) {
        if (this.isSlotEmpty(slot) || !slot.id) return;
  
        const takeCount = Math.ceil(slot.count / 2);
  
        this.cursor = {
          id: slot.id,
          count: takeCount
        };
  
        slot.count -= takeCount;
  
        if (slot.count <= 0) {
          this.clearSlotObject(slot);
        }
  
        return;
      }
  
      this.placeOneIntoSlot(slot);
    }

    private handleResultMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return;
    
        const result = CraftingSystem.getResult(this.craftingSlots);
    
        if (!result.id || result.count <= 0) return;
    
        event.preventDefault();
    
        if (event.shiftKey) {
          this.craftAllToInventory();
          this.suppressNextClick = true;
          this.update();
          return;
        }
    
        if (this.isCursorEmpty()) {
          this.cursor = {
            id: result.id,
            count: result.count
          };
    
          CraftingSystem.consumeIngredients(this.craftingSlots);
    
          this.suppressNextClick = true;
          this.update();
          return;
        }
    
        if (this.cursor.id !== result.id) return;
    
        const maxStack = BLOCK_DEFINITIONS[this.cursor.id].maxStack;
    
        if (this.cursor.count + result.count > maxStack) return;
    
        this.cursor.count += result.count;
        CraftingSystem.consumeIngredients(this.craftingSlots);
    
        this.suppressNextClick = true;
        this.update();
      }
  
    private handleResultClick(event: MouseEvent): void {
      const result = CraftingSystem.getResult(this.craftingSlots);
  
      if (!result.id || result.count <= 0) return;
  
      if (event.shiftKey) {
        this.craftAllToInventory();
        this.update();
        return;
      }
  
      if (this.isCursorEmpty()) {
        this.cursor = {
          id: result.id,
          count: result.count
        };
  
        CraftingSystem.consumeIngredients(this.craftingSlots);
        this.update();
        return;
      }
  
      if (this.cursor.id !== result.id) return;
  
      const maxStack = BLOCK_DEFINITIONS[this.cursor.id].maxStack;
  
      if (this.cursor.count + result.count > maxStack) return;
  
      this.cursor.count += result.count;
      CraftingSystem.consumeIngredients(this.craftingSlots);
      this.update();
    }
  
    private beginDragDistribution(
      event: MouseEvent,
      kind: SlotKind,
      index: number
    ): void {
      if (event.button !== 0 && event.button !== 2) return;
      if (this.isCursorEmpty()) return;
  
      const slot = this.getSlot(kind, index);
  
      if (!this.canReceiveFromCursor(slot)) {
        return;
      }
  
      event.preventDefault();
  
      this.draggingButton = event.button as 0 | 2;
      this.dragTargets.clear();
      this.addDragTarget(kind, index);
  
      this.suppressNextClick = true;
    }
  
    private addDragTarget(kind: SlotKind, index: number): void {
      if (this.draggingButton === null) return;
      if (this.isCursorEmpty()) return;
  
      const slot = this.getSlot(kind, index);
  
      if (!this.canReceiveFromCursor(slot)) return;
  
      this.dragTargets.add(`${kind}:${index}`);
      this.renderDragHighlights();
    }
  
    private finishDragDistribution(): void {
      if (this.draggingButton === null) return;
  
      if (this.dragTargets.size > 0) {
        if (this.draggingButton === 0) {
          this.distributeCursorEvenly();
        } else {
          this.distributeCursorOneEach();
        }
  
        this.suppressNextClick = true;
        this.update();
      }
  
      this.clearDragState();
    }
  
    private distributeCursorEvenly(): void {
      if (!this.cursor.id) return;
  
      const targets = this.getValidDragTargetSlots();
  
      if (targets.length === 0) return;
  
      let moved = true;
  
      while (this.cursor.count > 0 && moved) {
        moved = false;
  
        for (const slot of targets) {
          if (this.cursor.count <= 0) break;
  
          const placed = this.placeOneIntoSlot(slot);
  
          if (placed) {
            moved = true;
          }
        }
      }
    }
  
    private distributeCursorOneEach(): void {
      const targets = this.getValidDragTargetSlots();
  
      for (const slot of targets) {
        if (this.cursor.count <= 0) break;
        this.placeOneIntoSlot(slot);
      }
    }
  
    private getValidDragTargetSlots(): InventorySlot[] {
      const result: InventorySlot[] = [];
  
      for (const key of this.dragTargets) {
        const [kind, rawIndex] = key.split(":") as [SlotKind, string];
        const index = Number(rawIndex);
        const slot = this.getSlot(kind, index);
  
        if (this.canReceiveFromCursor(slot)) {
          result.push(slot);
        }
      }
  
      return result;
    }
  
    private canReceiveFromCursor(slot: InventorySlot): boolean {
      if (!this.cursor.id || this.cursor.count <= 0) return false;
  
      if (this.isSlotEmpty(slot)) return true;
  
      if (slot.id !== this.cursor.id) return false;
  
      return slot.count < BLOCK_DEFINITIONS[slot.id].maxStack;
    }
  
    private placeOneIntoSlot(slot: InventorySlot): boolean {
      if (!this.cursor.id || this.cursor.count <= 0) return false;
  
      if (this.isSlotEmpty(slot)) {
        slot.id = this.cursor.id;
        slot.count = 1;
        this.cursor.count -= 1;
      } else if (slot.id === this.cursor.id) {
        const maxStack = BLOCK_DEFINITIONS[slot.id].maxStack;
  
        if (slot.count >= maxStack) return false;
  
        slot.count += 1;
        this.cursor.count -= 1;
      } else {
        return false;
      }
  
      if (this.cursor.count <= 0) {
        this.clearCursor();
      }
  
      return true;
    }
  
    private collectSameKind(kind: SlotKind, index: number): void {
      const source = this.getSlot(kind, index);
      const targetId = this.cursor.id ?? source.id;
  
      if (!targetId) return;
  
      if (this.isCursorEmpty()) {
        if (!source.id || source.count <= 0) return;
  
        this.cursor = {
          id: source.id,
          count: 0
        };
      }
  
      if (this.cursor.id !== targetId) return;
  
      const maxStack = BLOCK_DEFINITIONS[targetId].maxStack;
  
      const collectFrom = (slot: InventorySlot) => {
        if (this.cursor.count >= maxStack) return;
        if (slot.id !== targetId || slot.count <= 0) return;
  
        const take = Math.min(slot.count, maxStack - this.cursor.count);
  
        this.cursor.count += take;
        slot.count -= take;
  
        if (slot.count <= 0) {
          this.clearSlotObject(slot);
        }
      };
  
      for (const slot of this.inventory.slots) {
        collectFrom(slot);
      }
  
      for (const slot of this.craftingSlots) {
        collectFrom(slot);
      }
    }
  
    private swapHoveredWithHotbar(hotbarIndex: number): void {
      if (!this.isCursorEmpty()) return;
  
      if (this.hoveredInventoryIndex !== null) {
        if (this.hoveredInventoryIndex === hotbarIndex) {
          this.inventory.selectSlot(hotbarIndex);
          return;
        }
  
        this.swapSlotObjects(
          this.inventory.slots[this.hoveredInventoryIndex],
          this.inventory.slots[hotbarIndex]
        );
  
        return;
      }
  
      if (this.hoveredCraftIndex !== null) {
        this.swapSlotObjects(
          this.craftingSlots[this.hoveredCraftIndex],
          this.inventory.slots[hotbarIndex]
        );
      }
    }
  
    private dropOne(): void {
      if (!this.isCursorEmpty()) {
        this.cursor.count -= 1;
  
        if (this.cursor.count <= 0) {
          this.clearCursor();
        }
  
        return;
      }
  
      const hovered = this.getHoveredSlot();
  
      if (!hovered || this.isSlotEmpty(hovered)) return;
  
      hovered.count -= 1;
  
      if (hovered.count <= 0) {
        this.clearSlotObject(hovered);
      }
    }
  
    private dropAll(): void {
      if (!this.isCursorEmpty()) {
        this.clearCursor();
        return;
      }
  
      const hovered = this.getHoveredSlot();
  
      if (!hovered) return;
  
      this.clearSlotObject(hovered);
    }
  
    private craftAllToInventory(): void {
      for (let i = 0; i < 128; i++) {
        const before = this.countCraftingItems();
        const result = CraftingSystem.getResult(this.craftingSlots);
  
        if (!result.id || result.count <= 0) return;
  
        const added = this.inventory.addBlock(result.id, result.count);
  
        if (!added) return;
  
        CraftingSystem.consumeIngredients(this.craftingSlots);
  
        const after = this.countCraftingItems();
        if (after >= before) return;
      }
    }
  
    private autoFillRecipe(recipe: CraftingRecipe): void {
      if (!this.isCursorEmpty()) return;
  
      this.returnCraftingSlotsToInventory();
  
      const required = CraftingSystem.getRequiredItems(recipe);
  
      for (const [id, amount] of required.entries()) {
        if (this.countInventoryItem(id) < amount) return;
      }
  
      for (let i = 0; i < recipe.pattern.length; i++) {
        const id = recipe.pattern[i];
  
        if (!id) {
          this.clearSlotObject(this.craftingSlots[i]);
          continue;
        }
  
        if (!this.removeFromInventory(id, 1)) {
          this.returnCraftingSlotsToInventory();
          return;
        }
  
        this.craftingSlots[i].id = id;
        this.craftingSlots[i].count = 1;
      }
    }
  
    private renderInventorySlot(index: number): void {
      const slot = this.inventory.slots[index];
      const element = this.inventorySlotElements[index];
  
      element.classList.toggle(
        "classic-slot-selected",
        index === this.inventory.selectedIndex
      );
  
      element.classList.toggle(
        "classic-hotbar-slot",
        index < Inventory.HOTBAR_SIZE
      );
  
      this.renderSlotContent(element, slot);
    }
  
    private renderCraftingSlot(index: number): void {
      this.renderSlotContent(
        this.craftingSlotElements[index],
        this.craftingSlots[index]
      );
    }
  
    private renderCraftingResult(): void {
      const result = CraftingSystem.getResult(this.craftingSlots);
  
      this.resultElement.classList.toggle("classic-result-ready", !!result.id);
      this.renderSlotContent(this.resultElement, result);
    }
  
    private renderRecipeBook(): void {
      this.recipeList.innerHTML = "";
  
      for (const recipe of CRAFTING_RECIPES) {
        const item = document.createElement("button");
        item.className = "classic-recipe-button";
  
        const canFill = this.canAutoFillRecipe(recipe);
  
        item.disabled = !canFill || !this.isCursorEmpty();
  
        item.innerHTML = `
          <span>${recipe.name}</span>
          <small>${canFill ? recipe.description : "材料不足"}</small>
        `;
  
        item.addEventListener("click", () => {
          this.autoFillRecipe(recipe);
          this.update();
        });
  
        this.recipeList.appendChild(item);
      }
    }
  
    private renderSlotContent(
      element: HTMLDivElement,
      slot: InventorySlot
    ): void {
      if (this.isSlotEmpty(slot) || !slot.id) {
        element.innerHTML = "";
        element.style.setProperty("--block-color", "transparent");
        element.title = "";
        return;
      }
  
      const block = BLOCK_DEFINITIONS[slot.id];
  
      element.style.setProperty(
        "--block-color",
        `#${block.color.toString(16).padStart(6, "0")}`
      );
  
      element.title = `${block.name} x${slot.count}`;
  
      element.innerHTML = `
        <span class="classic-item-icon"></span>
        <span class="classic-item-count">${slot.count}</span>
      `;
    }
  
    private renderCursor(): void {
      if (this.isCursorEmpty() || !this.cursor.id) {
        this.cursorElement.style.display = "none";
        this.cursorElement.innerHTML = "";
        return;
      }
  
      const block = BLOCK_DEFINITIONS[this.cursor.id];
  
      this.cursorElement.style.display = "block";
  
      this.cursorElement.style.setProperty(
        "--block-color",
        `#${block.color.toString(16).padStart(6, "0")}`
      );
  
      this.cursorElement.innerHTML = `
        <span class="classic-item-icon"></span>
        <span class="classic-item-count">${this.cursor.count}</span>
      `;
    }
  
    private renderDragHighlights(): void {
      for (let i = 0; i < Inventory.TOTAL_SIZE; i++) {
        this.inventorySlotElements[i]?.classList.toggle(
          "classic-drag-target",
          this.dragTargets.has(`inventory:${i}`)
        );
      }
  
      for (let i = 0; i < this.craftingSlots.length; i++) {
        this.craftingSlotElements[i]?.classList.toggle(
          "classic-drag-target",
          this.dragTargets.has(`craft:${i}`)
        );
      }
    }
  
    private getSlot(kind: SlotKind, index: number): InventorySlot {
      return kind === "inventory"
        ? this.inventory.slots[index]
        : this.craftingSlots[index];
    }
  
    private getHoveredSlot(): InventorySlot | null {
      if (this.hoveredInventoryIndex !== null) {
        return this.inventory.slots[this.hoveredInventoryIndex];
      }
  
      if (this.hoveredCraftIndex !== null) {
        return this.craftingSlots[this.hoveredCraftIndex];
      }
  
      return null;
    }
  
    private returnCursorToInventory(): void {
      if (!this.cursor.id || this.cursor.count <= 0) {
        this.clearCursor();
        return;
      }
  
      const added = this.inventory.addBlock(this.cursor.id, this.cursor.count);
  
      if (added) {
        this.clearCursor();
      }
    }
  
    private returnCraftingSlotsToInventory(): void {
      for (const slot of this.craftingSlots) {
        if (!slot.id || slot.count <= 0) continue;
  
        this.inventory.addBlock(slot.id, slot.count);
        this.clearSlotObject(slot);
      }
    }
  
    private canAutoFillRecipe(recipe: CraftingRecipe): boolean {
      const required = CraftingSystem.getRequiredItems(recipe);
  
      for (const [id, amount] of required.entries()) {
        if (this.countInventoryItem(id) < amount) {
          return false;
        }
      }
  
      return true;
    }
  
    private countInventoryItem(id: BlockId): number {
      let total = 0;
  
      for (const slot of this.inventory.slots) {
        if (slot.id === id) {
          total += slot.count;
        }
      }
  
      return total;
    }
  
    private removeFromInventory(id: BlockId, amount: number): boolean {
      if (this.countInventoryItem(id) < amount) return false;
  
      let remaining = amount;
  
      for (const slot of this.inventory.slots) {
        if (slot.id !== id) continue;
  
        const take = Math.min(slot.count, remaining);
        slot.count -= take;
        remaining -= take;
  
        if (slot.count <= 0) {
          this.clearSlotObject(slot);
        }
  
        if (remaining <= 0) return true;
      }
  
      return false;
    }
  
    private countCraftingItems(): number {
      return this.craftingSlots.reduce((sum, slot) => sum + slot.count, 0);
    }
  
    private openInventory(): void {
      this.open = true;
      this.overlay.style.display = "flex";
      this.update();
  
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  
    private clearDragState(): void {
      this.draggingButton = null;
      this.dragTargets.clear();
      this.renderDragHighlights();
    }
  
    private isCursorEmpty(): boolean {
      return this.cursor.id === null || this.cursor.count <= 0;
    }
  
    private isSlotEmpty(slot: InventorySlot): boolean {
      return slot.id === null || slot.count <= 0;
    }
  
    private clearCursor(): void {
      this.cursor = {
        id: null,
        count: 0
      };
    }
  
    private clearSlotObject(slot: InventorySlot): void {
      slot.id = null;
      slot.count = 0;
    }
  
    private swapSlotObjects(a: InventorySlot, b: InventorySlot): void {
      const temp = {
        id: a.id,
        count: a.count
      };
  
      a.id = b.id;
      a.count = b.count;
  
      b.id = temp.id;
      b.count = temp.count;
    }
  }