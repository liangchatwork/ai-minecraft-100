# ChatGPT Minecraft

## Intro

**ChatGPT Minecraft** 是一個以「挑戰與 AI 對話 100 次還原 Minecraft」為核心概念的 Web 3D Sandbox Survival Game Prototype。

本專案使用 **TypeScript / Vite / Three.js** 從零開始建立一個類 Minecraft 的方塊世界，目標不是複製原版遊戲資產，而是透過每一次與 AI 的對話逐步還原出原版 Minecraft 的核心遊戲機制。

本專案是一個實驗性作品，也是一個用來測試「在有限對話規則下，AI 能否逐步協助還原複雜遊戲系統」的開發紀錄。

![Demo](./public/demo.gif)

---

## Version Status

### 20260618_v1 — 20 / 100 Conversations

#### 已完成

* [x] 建立 TypeScript / Vite / Three.js 專案架構
* [x] 建立 3D 場景、相機、光源與渲染流程
* [x] 建立方塊世界與初始地形
* [x] 加入草地、泥土、石頭、木頭與樹葉方塊
* [x] 加入第一人稱視角與滑鼠鎖定控制
* [x] 加入 WASD 移動、跳躍與衝刺
* [x] 從自由飛行模式改為生存模式雛形
* [x] 加入玩家高度、地面判定、重力與基礎碰撞
* [x] 加入左鍵挖掘方塊
* [x] 加入右鍵放置方塊
* [x] 加入方塊蒐集到物品欄
* [x] 加入 9 格快捷欄與數字鍵 / 滾輪切換
* [x] 使用 CanvasTexture 產生像素風方塊材質
* [x] 加入挖掘硬度與按住挖掘機制
* [x] 將挖掘進度條改為方塊表面裂痕動畫
* [x] 加入按 `E` 開啟 / 關閉背包
* [x] 將背包擴充為 36 格，包含 27 格主背包與 9 格快捷欄
* [x] 加入物品堆疊、拆分、合併、交換、整理排序
* [x] 加入 Shift + Left Click 快速搬移
* [x] 加入 Q / Shift + Q 丟棄物品
* [x] 加入左鍵拖曳平均分配物品
* [x] 加入右鍵拖曳每格放 1 個物品
* [x] 加入數字鍵 1–9 與快捷欄交換
* [x] 加入雙擊收集同類物品
* [x] 建立更接近原版 Minecraft 的背包視窗
* [x] 加入角色預覽區、裝備欄視覺與 2x2 合成區
* [x] 加入 Recipe Book 輔助合成
* [x] 加入 `Wood -> Plank`
* [x] 加入 `Plank -> Crafting Table`
* [x] 修正 Wood 放在 2x2 任一格都能產生 Plank
* [x] 修正左鍵按下即可一口氣拿取整疊物品
* [x] 修正合成結果格無法左鍵一口氣拿取的問題

#### 本版對話開發紀錄

| Conversation | Summary                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------ |
| 第 1 次        | 建立專案檔案樹與模組分層，包含 `app`、`game`、`world`、`rendering`、`input`、`ui`、`inventory`、`crafting` 等資料夾。 |
| 第 2–3 次      | 建立最小可執行 3D 版本，完成 Three.js 場景、第一人稱相機、基本地形、樹木、十字準星，並從自由飛行改為生存模式雛形。                           |
| 第 4 次        | 加入核心方塊互動，支援挖掘、放置、蒐集方塊、快捷欄切換與基本物品欄。                                                         |
| 第 5–8 次      | 優化方塊與挖掘體驗，加入像素風材質、不同方塊硬度、按住挖掘，以及貼在方塊表面的裂痕動畫。                                               |
| 第 9–11 次     | 建立背包系統，支援 36 格背包、快捷欄、物品堆疊、拆分、交換、整理、Shift 快速搬移、丟棄物品與初版 2x2 合成。                              |
| 第 12–13 次    | 優化合成體驗，加入 Recipe Book、放入材料、製作一次、全部製作，降低對拖曳操作的依賴。                                           |
| 第 14–16 次    | 將背包視覺與互動改得更接近原版 Minecraft，加入角色預覽、裝備欄視覺、左鍵拖曳平均分配、右鍵拖曳單格分配、數字鍵交換快捷欄與雙擊收集同類物品。                |
| 第 17–20 次    | 修正背包與合成的細節問題，包括合成判定錯誤、Wood 任意格合成 Plank、左鍵立即拿取整疊，以及合成結果格左鍵拿取問題。                             |

#### 待更新

* [ ] 將世界生成改為 Chunk-based terrain
* [ ] 將多個方塊合併成 Chunk Mesh，降低 draw calls
* [ ] 只渲染外露方塊面，改善效能
* [ ] 加入 Texture Atlas，而不是每個材質獨立 CanvasTexture
* [ ] 加入更多方塊類型，例如 Sand、Coal Ore、Iron Ore、Glass
* [ ] 加入工具系統，例如 Wooden Pickaxe、Stone Pickaxe、Axe、Shovel
* [ ] 工具影響挖掘速度
* [ ] 加入工具耐久度
* [ ] 加入 3x3 Crafting Table 合成介面
* [ ] 加入更多合成配方
* [ ] 加入物品掉落實體，而不是直接進入背包
* [ ] 加入生命值、飢餓值與受傷系統
* [ ] 加入日夜循環
* [ ] 加入音效
* [ ] 加入存檔與讀檔
* [ ] 加入更完整的 UI，例如血量、飢餓值、方塊名稱提示
* [ ] 加入敵對生物或簡單生物
* [ ] 部署線上展示版本

---

## Repository

### File Structure

```text
ChatGPT-Minecraft/
├── public/
│   ├── textures/
│   ├── models/
│   └── sounds/
│
├── src/
│   ├── app/
│   │   ├── App.ts
│   │   ├── GameLoop.ts
│   │   ├── GameState.ts
│   │   └── styles.css
│   │
│   ├── core/
│   │   ├── EventBus.ts
│   │   ├── Registry.ts
│   │   └── Time.ts
│   │
│   ├── game/
│   │   ├── blocks/
│   │   │   ├── BlockRegistry.ts
│   │   │   └── blockDefinitions.ts
│   │   │
│   │   ├── crafting/
│   │   │   └── CraftingSystem.ts
│   │   │
│   │   ├── entities/
│   │   │   ├── Entity.ts
│   │   │   └── EntityManager.ts
│   │   │
│   │   ├── inventory/
│   │   │   └── Inventory.ts
│   │   │
│   │   ├── items/
│   │   │   ├── ItemRegistry.ts
│   │   │   └── itemDefinitions.ts
│   │   │
│   │   ├── player/
│   │   │   ├── MiningState.ts
│   │   │   ├── Player.ts
│   │   │   ├── PlayerController.ts
│   │   │   └── PlayerPhysics.ts
│   │   │
│   │   └── world/
│   │       ├── World.ts
│   │       ├── WorldManager.ts
│   │       ├── chunks/
│   │       │   ├── Chunk.ts
│   │       │   ├── ChunkManager.ts
│   │       │   └── ChunkStorage.ts
│   │       └── generation/
│   │           ├── BiomeGenerator.ts
│   │           ├── Noise.ts
│   │           └── TerrainGenerator.ts
│   │
│   ├── input/
│   │   ├── InputManager.ts
│   │   └── PointerLock.ts
│   │
│   ├── physics/
│   │   ├── AABB.ts
│   │   └── CollisionSystem.ts
│   │
│   ├── rendering/
│   │   ├── Renderer.ts
│   │   ├── SceneManager.ts
│   │   ├── camera/
│   │   │   └── CameraController.ts
│   │   ├── effects/
│   │   │   └── BlockBreakingOverlay.ts
│   │   ├── materials/
│   │   │   └── MaterialFactory.ts
│   │   ├── meshing/
│   │   │   ├── BlockFaceBuilder.ts
│   │   │   └── ChunkMesher.ts
│   │   └── shaders/
│   │       ├── chunk.frag
│   │       └── chunk.vert
│   │
│   ├── save/
│   │   ├── LocalWorldStorage.ts
│   │   └── SaveManager.ts
│   │
│   ├── types/
│   │   ├── block.ts
│   │   ├── chunk.ts
│   │   ├── item.ts
│   │   ├── player.ts
│   │   └── world.ts
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── Button.ts
│   │   │   └── Panel.ts
│   │   └── hud/
│   │       ├── Crosshair.ts
│   │       ├── DebugPanel.ts
│   │       ├── Hotbar.ts
│   │       └── InventoryScreen.ts
│   │
│   ├── utils/
│   │   ├── math.ts
│   │   ├── random.ts
│   │   └── vector.ts
│   │
│   └── main.ts
│
├── docs/
│   ├── roadmap.md
│   └── turn-log.md
│
├── scripts/
│   └── dev.sh
│
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

### File Description

| Path                                            | Description                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/main.ts`                                   | 專案進入點，建立 App 並啟動遊戲。                                                                   |
| `src/app/App.ts`                                | 遊戲主流程整合，負責建立 Renderer、World、Input、CameraController、Hotbar、InventoryScreen 與 GameLoop。 |
| `src/app/GameLoop.ts`                           | requestAnimationFrame 遊戲迴圈，計算 delta time 並更新遊戲狀態。                                     |
| `src/app/styles.css`                            | 全域樣式、十字準星、快捷欄、背包視窗與經典 Minecraft-like UI 樣式。                                           |
| `src/rendering/Renderer.ts`                     | Three.js renderer、scene、camera 與光源設定。                                                 |
| `src/rendering/camera/CameraController.ts`      | 第一人稱視角、玩家移動、跳躍、碰撞、方塊互動與挖掘邏輯。                                                          |
| `src/rendering/effects/BlockBreakingOverlay.ts` | 方塊挖掘裂痕動畫，將裂痕貼圖顯示在被挖掘方塊表面。                                                             |
| `src/rendering/materials/MaterialFactory.ts`    | 使用 CanvasTexture 生成像素風方塊材質。                                                           |
| `src/game/world/World.ts`                       | 方塊世界資料、地形生成、方塊新增 / 移除、raycast 方塊偵測。                                                   |
| `src/game/blocks/blockDefinitions.ts`           | 方塊定義，包含名稱、顏色、硬度、是否可碰撞與最大堆疊數。                                                          |
| `src/types/block.ts`                            | 方塊 ID、方塊座標、raycast hit 結果與方塊定義型別。                                                     |
| `src/game/inventory/Inventory.ts`               | 背包資料結構，支援加入方塊、堆疊、快捷搬移、整理排序與快捷欄選取。                                                     |
| `src/ui/hud/Hotbar.ts`                          | 下方 9 格快捷欄 UI。                                                                         |
| `src/ui/hud/InventoryScreen.ts`                 | 背包視窗、物品拖曳、堆疊、拆分、交換、合成區、Recipe Book 與快捷鍵操作。                                            |
| `src/game/crafting/CraftingSystem.ts`           | 2x2 合成邏輯，目前支援 Wood -> Plank、Plank -> Crafting Table。                                  |
| `src/game/player/MiningState.ts`                | 挖掘狀態，記錄目前挖掘目標、進度、方塊面與 UI 狀態。                                                          |
| `src/input/InputManager.ts`                     | 鍵盤、滑鼠、滾輪與 Pointer Lock 輸入管理。                                                          |
| `src/ui/hud/Crosshair.ts`                       | 畫面中央十字準星與基本操作提示。                                                                      |

---

## Tech Stack

### Frontend

<p>
  <img src="https://img.shields.io/badge/TypeScript-1F3B57?style=for-the-badge&logo=typescript&logoColor=3178C6" />
  <img src="https://img.shields.io/badge/Vite-2C2541?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img src="https://img.shields.io/badge/HTML5-3A241C?style=for-the-badge&logo=html5&logoColor=E34F26" />
  <img src="https://img.shields.io/badge/CSS3-1D2F45?style=for-the-badge&logo=css3&logoColor=1572B6" />
</p>

### Core

<p>
  <img src="https://img.shields.io/badge/Three.js-111111?style=for-the-badge&logo=three.js&logoColor=white" />
  <img src="https://img.shields.io/badge/WebGL-3A1F1F?style=for-the-badge&logo=webgl&logoColor=white" />
  <img src="https://img.shields.io/badge/Canvas_Texture-5A4B2B?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Pointer_Lock_API-2E4057?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Voxel_World-355E3B?style=for-the-badge" />
</p>

#### Three.js

Three.js 用於建立 3D 場景、相機、光源、方塊 Mesh、材質與 WebGL 渲染流程。

#### WebGL

WebGL 是瀏覽器中的 3D 圖形 API，Three.js 透過 WebGL 將方塊世界渲染到畫面上。

#### CanvasTexture

目前專案不使用 Minecraft 原版材質，而是使用 Canvas API 動態繪製像素風材質，再轉換成 Three.js CanvasTexture。

#### Pointer Lock API

Pointer Lock API 用於第一人稱視角控制，讓滑鼠移動可以控制視角旋轉，而不是移動游標。

#### DOM-based UI

十字準星、快捷欄、背包視窗、Recipe Book 與提示文字目前都使用 DOM / CSS 建立，方便快速迭代 UI 與互動邏輯。

---

## Usage

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd ChatGPT-Minecraft
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

預設開啟：

```text
http://127.0.0.1:5173/
```

### 4. Basic Controls

| Key / Mouse   | Function      |
| ------------- | ------------- |
| Mouse Click   | 鎖定滑鼠          |
| Mouse Move    | 移動視角          |
| W / A / S / D | 移動            |
| Space         | 跳躍            |
| Ctrl          | 衝刺            |
| Left Click    | 挖掘方塊          |
| Right Click   | 放置選取方塊        |
| 1–9           | 選擇快捷欄         |
| Mouse Wheel   | 切換快捷欄         |
| E             | 開啟 / 關閉背包     |
| Q             | 丟棄 1 個物品      |
| Shift + Q     | 丟棄整疊物品        |
| Esc           | 解除滑鼠鎖定 / 關閉背包 |

### 5. Inventory Controls

| Action                    | Function       |
| ------------------------- | -------------- |
| Left Click Item           | 拿起整疊物品         |
| Left Click Empty Slot     | 放下整疊物品         |
| Left Click Same Item      | 合併物品堆疊         |
| Left Click Different Item | 交換物品           |
| Right Click Item          | 拿起一半物品         |
| Right Click Empty Slot    | 放下 1 個物品       |
| Right Click Same Item     | 增加 1 個到該格      |
| Left Drag                 | 將手上物品平均分配到多格   |
| Right Drag                | 每格放下 1 個物品     |
| Shift + Left Click        | 快速搬移至快捷欄 / 背包  |
| Number Key 1–9            | 將滑鼠指到的格子與快捷欄交換 |
| Double Click              | 收集同類物品到滑鼠      |
| Q                         | 丟棄 1 個         |
| Shift + Q                 | 丟棄整疊           |

### 6. Crafting

目前支援：

| Input   | Output           |
| ------- | ---------------- |
| 1 Wood  | 4 Plank          |
| 4 Plank | 1 Crafting Table |

使用方式：

1. 挖樹取得 Wood。
2. 按 `E` 開啟背包。
3. 將 Wood 放進 2x2 Crafting 任一格。
4. 右側 Result Slot 會產生 Plank。
5. 左鍵 Result Slot 可以一口氣拿取合成結果。
6. 將 4 個 Plank 放滿 2x2 Crafting。
7. 右側 Result Slot 會產生 Crafting Table。
8. 選取 Crafting Table 後關閉背包，可以在世界中右鍵放置。

### 7. Build

```bash
npm run build
```

### 8. Preview Production Build

```bash
npm run preview
```

---

## Reference

[1] Mojang Studios. *Minecraft Official Website*. Available: https://www.minecraft.net/

[2] Minecraft Wiki Contributors. *Minecraft Wiki*. Available: https://minecraft.wiki/

[3] Three.js. *Three.js Documentation*. Available: https://threejs.org/docs/

[4] Vite. *Vite Documentation*. Available: https://vite.dev/

[5] Microsoft. *TypeScript Documentation*. Available: https://www.typescriptlang.org/docs/

[6] MDN Web Docs. *Pointer Lock API*. Available: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API

[7] MDN Web Docs. *Canvas API*. Available: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

[8] MDN Web Docs. *WebGL API*. Available: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API

[9] MDN Web Docs. *KeyboardEvent*. Available: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

[10] MDN Web Docs. *MouseEvent*. Available: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent


---

## License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026 Chen-Hsun Liang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
subject to the conditions of the MIT License.
```
