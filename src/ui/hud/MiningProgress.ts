import type { MiningUiState } from "../../game/player/MiningState";
import { BLOCK_DEFINITIONS } from "../../game/blocks/blockDefinitions";

export class MiningProgress {
  private readonly element = document.createElement("div");
  private readonly label = document.createElement("div");
  private readonly bar = document.createElement("div");
  private readonly fill = document.createElement("div");

  private constructor() {
    this.element.className = "mining-progress";
    this.label.className = "mining-label";
    this.bar.className = "mining-bar";
    this.fill.className = "mining-fill";

    this.bar.appendChild(this.fill);
    this.element.appendChild(this.label);
    this.element.appendChild(this.bar);

    this.element.style.display = "none";
  }

  static mount(root: HTMLElement): MiningProgress {
    const view = new MiningProgress();
    root.appendChild(view.element);
    return view;
  }

  update(state: MiningUiState): void {
    if (!state.active || !state.blockId) {
      this.element.style.display = "none";
      return;
    }

    const block = BLOCK_DEFINITIONS[state.blockId];
    const percent = Math.floor(state.progress * 100);

    this.element.style.display = "block";
    this.label.textContent = `Mining ${block.name} ${percent}%`;
    this.fill.style.width = `${percent}%`;
  }
}