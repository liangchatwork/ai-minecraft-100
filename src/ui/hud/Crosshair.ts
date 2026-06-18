export class Crosshair {
  static mount(root: HTMLElement): void {
    const crosshair = document.createElement("div");
    crosshair.className = "crosshair";

    const hint = document.createElement("div");
    hint.className = "control-hint";
    hint.innerHTML = `
      <b>AI Minecraft 100</b><br />
      Survival Block Prototype<br />
      Left Click break · Right Click place<br />
      E inventory · 1-9 / Wheel select<br />
      WASD move · Space jump · Ctrl sprint
    `;

    root.appendChild(crosshair);
    root.appendChild(hint);
  }
}