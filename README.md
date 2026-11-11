# FlowerX 🌸 — A Canvas and Flow Image Creation Workspace

**FlowerX** brings digital drawing, image editing, and Flow image generation into one workspace. Start with a blank canvas, import an image to refine, or use your canvas and reference images to explore new results with Flow.

### [🌸 Open FlowerX in Flow](https://flow.google.com/shared/tool/1d4e1d2c-f048-42d9-b8de-9c897cf1bf6a)

## ✨ Core Features

### 🎨 Digital Canvas Toolkit

- **Drawing brushes:** Create strokes and textures with the pencil and Advanced Spray Brush, including multiple spray modes.
- **Lines, shapes, and text:** Add straight lines, Bézier curves, rectangles, ellipses, and editable text.
- **Selection and color:** Work on specific areas with rectangular selection, the eyedropper, and flood fill.
- **Editing history:** Undo and redo changes, clear the canvas, flip content horizontally or vertically, and zoom in for detail work.
- **Multiple windows and cross-image clipboard:** Open several images at once. Copy a selected region or canvas object from one FlowerX editor window and paste it into another for further editing.
- **Image output:** Download the finished canvas as a PNG or save it through Flow.

### 🤖 Creating with Flow

The PromptBox lets you choose a model, aspect ratio, and output mode, and add reference images. You can sketch or arrange a composition on the canvas, then use that work as input for Flow image generation.

## 🧪 Experimental Feature: Tiled Upscale

**Tiled Upscale / Tile Refine** prepares an image in overlapping sections so Flow can generate detail for each section before FlowerX combines the results.

1. **Split the image:** The 2K, 4K, and 8K modes divide the canvas into overlapping tiles.
2. **Create two references per tile:** FlowerX prepares a local image of the tile and an overview image marking its position in the full composition.
3. **Upload to Flow Assets:** Both reference images are uploaded to the user's Flow Assets library for use during generation.
4. **Combine the results:** FlowerX processes the generated tiles and blends their overlapping edges into a complete image.

| Mode | Tiles | Reference images uploaded to Assets |
| --- | ---: | ---: |
| 2K | 4 | 8 |
| 4K | 16 | 32 |
| 8K | 64 | 128 |

`Default` uses the standard image generation flow without tiling.

> **Experimental feature:** Because tiles are generated separately, results may show color shifts, visible seams, inconsistent textures, or changes to local details. Review the completed image and use the canvas tools to make any needed corrections.

## ⚡ Modular Architecture

- **React** provides the interface and connects the editor to its Flow host.
- **Fabric.js** handles canvas objects and drawing interactions.
- **OpenCV.js** assists with image analysis during tiled generation. Overlapping tiles are blended using Canvas.
- **`Function.extend.js`** provides the project's class and inheritance structure.
- **`Module.js` and `Bundle.js`** load the editor's tools and view templates at runtime.
