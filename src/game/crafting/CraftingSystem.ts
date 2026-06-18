import type { BlockId } from "../../types/block";
import type { InventorySlot } from "../inventory/Inventory";

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  result: {
    id: BlockId;
    count: number;
  };
  pattern: Array<BlockId | null>;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: "wood_to_plank",
    name: "Planks",
    description: "1 Wood -> 4 Plank",
    result: {
      id: "plank",
      count: 4
    },
    pattern: ["wood", null, null, null]
  },
  {
    id: "plank_to_crafting_table",
    name: "Crafting Table",
    description: "4 Plank -> 1 Crafting Table",
    result: {
      id: "crafting_table",
      count: 1
    },
    pattern: ["plank", "plank", "plank", "plank"]
  }
];

export class CraftingSystem {
  static getResult(slots: InventorySlot[]): InventorySlot {
    const recipe = this.findMatchingRecipe(slots);

    if (!recipe) {
      return {
        id: null,
        count: 0
      };
    }

    return {
      id: recipe.result.id,
      count: recipe.result.count
    };
  }

  static findMatchingRecipe(slots: InventorySlot[]): CraftingRecipe | null {
    if (this.isOneWoodAnywhere(slots)) {
      return (
        CRAFTING_RECIPES.find((recipe) => recipe.id === "wood_to_plank") ??
        null
      );
    }

    if (this.isFullTwoByTwoPlanks(slots)) {
      return (
        CRAFTING_RECIPES.find(
          (recipe) => recipe.id === "plank_to_crafting_table"
        ) ?? null
      );
    }

    return null;
  }

  static consumeIngredients(slots: InventorySlot[]): void {
    const recipe = this.findMatchingRecipe(slots);

    if (!recipe) return;

    if (recipe.id === "wood_to_plank") {
      this.consumeOne(slots, "wood");
      return;
    }

    if (recipe.id === "plank_to_crafting_table") {
      for (let i = 0; i < 4; i++) {
        this.consumeOneFromSlot(slots[i]);
      }
    }
  }

  static getRequiredItems(recipe: CraftingRecipe): Map<BlockId, number> {
    const result = new Map<BlockId, number>();

    for (const id of recipe.pattern) {
      if (!id) continue;
      result.set(id, (result.get(id) ?? 0) + 1);
    }

    return result;
  }

  private static isOneWoodAnywhere(slots: InventorySlot[]): boolean {
    const filled = slots.filter((slot) => {
      return slot.id !== null && slot.count > 0;
    });

    return filled.length === 1 && filled[0].id === "wood";
  }

  private static isFullTwoByTwoPlanks(slots: InventorySlot[]): boolean {
    return slots.slice(0, 4).every((slot) => {
      return slot.id === "plank" && slot.count > 0;
    });
  }

  private static consumeOne(slots: InventorySlot[], id: BlockId): void {
    const slot = slots.find((candidate) => candidate.id === id);

    if (!slot) return;

    this.consumeOneFromSlot(slot);
  }

  private static consumeOneFromSlot(slot: InventorySlot): void {
    slot.count -= 1;

    if (slot.count <= 0) {
      slot.id = null;
      slot.count = 0;
    }
  }
}