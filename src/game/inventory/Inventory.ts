import type { BlockId } from "../../types/block";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";

export interface InventorySlot {
  id: BlockId | null;
  count: number;
}

const SORT_ORDER: BlockId[] = [
  "stone",
  "dirt",
  "grass",
  "wood",
  "plank",
  "crafting_table",
  "leaf"
];

export class Inventory {
  static readonly HOTBAR_SIZE = 9;
  static readonly TOTAL_SIZE = 36;

  readonly slots: InventorySlot[] = Array.from(
    { length: Inventory.TOTAL_SIZE },
    () => ({
      id: null,
      count: 0
    })
  );

  selectedIndex = 0;

  addBlock(id: BlockId, amount = 1): boolean {
    let remaining = amount;
    remaining = this.insertIntoRange(id, remaining, 0, Inventory.TOTAL_SIZE);
    return remaining <= 0;
  }

  quickMove(index: number): boolean {
    if (!this.isValidIndex(index)) return false;

    const slot = this.slots[index];
    if (this.isSlotEmpty(slot) || !slot.id) return false;

    const originalCount = slot.count;

    const targetStart =
      index < Inventory.HOTBAR_SIZE ? Inventory.HOTBAR_SIZE : 0;

    const targetEnd =
      index < Inventory.HOTBAR_SIZE
        ? Inventory.TOTAL_SIZE
        : Inventory.HOTBAR_SIZE;

    const remaining = this.insertIntoRange(
      slot.id,
      slot.count,
      targetStart,
      targetEnd
    );

    slot.count = remaining;

    if (slot.count <= 0) {
      this.clearSlot(index);
    }

    return remaining < originalCount;
  }

  getSelectedBlock(): BlockId | null {
    return this.slots[this.selectedIndex]?.id ?? null;
  }

  removeOneSelectedBlock(): BlockId | null {
    const slot = this.slots[this.selectedIndex];

    if (!slot || slot.id === null || slot.count <= 0) {
      return null;
    }

    const id = slot.id;
    slot.count -= 1;

    if (slot.count <= 0) {
      this.clearSlot(this.selectedIndex);
    }

    return id;
  }

  moveSlot(fromIndex: number, toIndex: number): boolean {
    if (!this.isValidIndex(fromIndex) || !this.isValidIndex(toIndex)) {
      return false;
    }

    if (fromIndex === toIndex) return false;

    const from = this.slots[fromIndex];
    const to = this.slots[toIndex];

    if (this.isSlotEmpty(from)) return false;

    if (this.isSlotEmpty(to)) {
      to.id = from.id;
      to.count = from.count;
      this.clearSlot(fromIndex);
      return true;
    }

    if (from.id === to.id && from.id !== null) {
      const maxStack = BLOCK_DEFINITIONS[from.id].maxStack;
      const canMove = Math.min(from.count, maxStack - to.count);

      if (canMove <= 0) return false;

      to.count += canMove;
      from.count -= canMove;

      if (from.count <= 0) {
        this.clearSlot(fromIndex);
      }

      return true;
    }

    const temp: InventorySlot = {
      id: to.id,
      count: to.count
    };

    to.id = from.id;
    to.count = from.count;

    from.id = temp.id;
    from.count = temp.count;

    return true;
  }

  clearSlot(index: number): void {
    if (!this.isValidIndex(index)) return;

    this.slots[index].id = null;
    this.slots[index].count = 0;
  }

  setSlot(index: number, id: BlockId, count: number): void {
    if (!this.isValidIndex(index)) return;

    this.slots[index].id = id;
    this.slots[index].count = count;
  }

  compactAndSort(): void {
    const totals = new Map<BlockId, number>();

    for (const slot of this.slots) {
      if (!slot.id || slot.count <= 0) continue;
      totals.set(slot.id, (totals.get(slot.id) ?? 0) + slot.count);
    }

    for (let i = 0; i < this.slots.length; i++) {
      this.clearSlot(i);
    }

    let writeIndex = 0;

    for (const id of SORT_ORDER) {
      let remaining = totals.get(id) ?? 0;
      const maxStack = BLOCK_DEFINITIONS[id].maxStack;

      while (remaining > 0 && writeIndex < this.slots.length) {
        const count = Math.min(remaining, maxStack);
        this.setSlot(writeIndex, id, count);

        remaining -= count;
        writeIndex += 1;
      }
    }
  }

  selectSlot(index: number): void {
    if (index < 0 || index >= Inventory.HOTBAR_SIZE) return;
    this.selectedIndex = index;
  }

  selectRelative(offset: number): void {
    const length = Inventory.HOTBAR_SIZE;
    this.selectedIndex = (this.selectedIndex + offset + length) % length;
  }

  isSlotEmpty(slot: InventorySlot): boolean {
    return slot.id === null || slot.count <= 0;
  }

  private insertIntoRange(
    id: BlockId,
    amount: number,
    start: number,
    end: number
  ): number {
    let remaining = amount;
    const maxStack = BLOCK_DEFINITIONS[id].maxStack;

    for (let i = start; i < end; i++) {
      const slot = this.slots[i];

      if (slot.id !== id) continue;
      if (slot.count >= maxStack) continue;

      const canAdd = Math.min(remaining, maxStack - slot.count);
      slot.count += canAdd;
      remaining -= canAdd;

      if (remaining <= 0) return 0;
    }

    for (let i = start; i < end; i++) {
      const slot = this.slots[i];

      if (slot.id !== null) continue;

      const canAdd = Math.min(remaining, maxStack);
      slot.id = id;
      slot.count = canAdd;
      remaining -= canAdd;

      if (remaining <= 0) return 0;
    }

    return remaining;
  }

  private isValidIndex(index: number): boolean {
    return index >= 0 && index < Inventory.TOTAL_SIZE;
  }
}