export type BlockId =
  | "grass"
  | "dirt"
  | "stone"
  | "wood"
  | "plank"
  | "crafting_table"
  | "leaf";

export interface BlockDefinition {
  id: BlockId;
  name: string;
  color: number;
  solid: boolean;
  maxStack: number;
  hardness: number;
}

export interface BlockPosition {
  x: number;
  y: number;
  z: number;
}

export interface BlockHit {
  block: BlockPosition;
  normal: BlockPosition;
  place: BlockPosition;
  id: BlockId;
  distance: number;
}