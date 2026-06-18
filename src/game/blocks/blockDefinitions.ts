import type { BlockDefinition, BlockId } from "../../types/block";

export const BLOCK_DEFINITIONS: Record<BlockId, BlockDefinition> = {
  grass: {
    id: "grass",
    name: "Grass",
    color: 0x4f9d44,
    solid: true,
    maxStack: 64,
    hardness: 0.55
  },
  dirt: {
    id: "dirt",
    name: "Dirt",
    color: 0x8b5a2b,
    solid: true,
    maxStack: 64,
    hardness: 0.65
  },
  stone: {
    id: "stone",
    name: "Stone",
    color: 0x777777,
    solid: true,
    maxStack: 64,
    hardness: 1.65
  },
  wood: {
    id: "wood",
    name: "Wood",
    color: 0x6b4423,
    solid: true,
    maxStack: 64,
    hardness: 1.25
  },
  plank: {
    id: "plank",
    name: "Plank",
    color: 0xc9934a,
    solid: true,
    maxStack: 64,
    hardness: 0.85
  },
  crafting_table: {
    id: "crafting_table",
    name: "Crafting Table",
    color: 0xb87935,
    solid: true,
    maxStack: 64,
    hardness: 1.1
  },
  leaf: {
    id: "leaf",
    name: "Leaf",
    color: 0x2f7d32,
    solid: true,
    maxStack: 64,
    hardness: 0.35
  }
};