import * as THREE from 'three';

/**
 * 256×256 atlas, 16×16 tiles → each tile is 16×16 screen pixels (classic Minecraft-style).
 */
export const ATLAS_TILES = 16;

/** UV width/height of one tile in normalized [0,1] space. */
export const ATLAS_TILE_UV = 1 / ATLAS_TILES;

/**
 * Block type → atlas column, row (Prompt 2 types 1–8 + 9 = dirt).
 * Slot layout matches Prompt 3.
 */
const BLOCK_TO_TILE = {
  1: [1, 0],
  2: [2, 0],
  3: [3, 0],
  4: [4, 0],
  5: [5, 0],
  6: [6, 0],
  7: [7, 0],
  8: [0, 0],
  9: [8, 0],
  10: [0, 1],
  11: [1, 1],
  12: [2, 1],
  13: [3, 1],
  14: [4, 1],
  15: [5, 1],
  16: [6, 1],
  17: [7, 1],
  18: [8, 1],
  19: [9, 1],
  20: [10, 1],
  21: [11, 1],
  22: [12, 1],
};

/** Cached atlas canvas to reuse for UI icons and texture creation. */
let cachedAtlasCanvas = null;
let cachedAtlasTexture = null;

/**
 * @param {number} blockType
 * @returns {{ tx: number, ty: number }} tile coordinate (0..15)
 */
export function getAtlasTileXY(blockType) {
  const tile = BLOCK_TO_TILE[blockType] ?? [0, 0];
  return { tx: tile[0], ty: tile[1] };
}

/**
 * @returns {HTMLCanvasElement}
 */
export function getAtlasCanvas() {
  if (cachedAtlasCanvas) return cachedAtlasCanvas;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unsupported');

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#2c2418';
  ctx.fillRect(0, 0, 256, 256);

  drawTile(ctx, 0, 0, (c) => drawGrass(c));
  drawTile(ctx, 1, 0, (c) => drawSand(c));
  drawTile(ctx, 2, 0, (c) => drawStone(c));
  drawTile(ctx, 3, 0, (c) => drawWood(c));
  drawTile(ctx, 4, 0, (c) => drawLeaf(c));
  drawTile(ctx, 5, 0, (c) => drawWater(c));
  drawTile(ctx, 6, 0, (c) => drawGold(c));
  drawTile(ctx, 7, 0, (c) => drawBread(c));
  drawTile(ctx, 8, 0, (c) => drawDirt(c));

  drawTile(ctx, 0, 1, (c) => drawCobble(c));
  drawTile(ctx, 1, 1, (c) => drawPlanks(c));
  drawTile(ctx, 2, 1, (c) => drawBrick(c));
  drawTile(ctx, 3, 1, (c) => drawGlass(c));
  drawTile(ctx, 4, 1, (c) => drawSandstone(c));
  drawTile(ctx, 5, 1, (c) => drawMarble(c));
  drawTile(ctx, 6, 1, (c) => drawClayBlock(c));
  drawTile(ctx, 7, 1, (c) => drawBookshelf(c));
  drawTile(ctx, 8, 1, (c) => drawMossyStone(c));
  drawTile(ctx, 9, 1, (c) => drawPolishedStone(c));
  drawTile(ctx, 10, 1, (c) => drawPackedEarth(c));
  drawTile(ctx, 11, 1, (c) => drawReed(c));
  drawTile(ctx, 12, 1, (c) => drawOilLamp(c));

  cachedAtlasCanvas = canvas;
  return cachedAtlasCanvas;
}

/**
 * Bottom-left UV of the tile in Three.js space (v increases upward).
 * @param {number} blockType
 * @returns {{ u: number, v: number }}
 */
export function getUVsForBlock(blockType) {
  const tile = BLOCK_TO_TILE[blockType];
  const tx = tile ? tile[0] : 0;
  const ty = tile ? tile[1] : 0;
  const s = ATLAS_TILE_UV;
  return {
    u: tx * s,
    v: 1 - (ty + 1) * s,
  };
}

/**
 * Full UV rectangle for one tile (meshing / hotbar previews).
 * @param {number} blockType
 * @returns {{ u0: number, v0: number, u1: number, v1: number }}
 */
export function getUVRectForBlock(blockType) {
  const { u, v } = getUVsForBlock(blockType);
  const s = ATLAS_TILE_UV;
  return { u0: u, v0: v, u1: u + s, v1: v + s };
}

/**
 * @param {CanvasRenderingContext2D} c
 * @param {number} x 0–15
 * @param {number} y 0–15
 * @param {string} color
 */
function px(c, x, y, color) {
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} tx tile column 0–15
 * @param {number} ty tile row 0–15
 * @param {(c: CanvasRenderingContext2D, p: number) => void} draw local 0–15 space
 */
function drawTile(ctx, tx, ty, draw) {
  const p = 16;
  const x0 = tx * p;
  const y0 = ty * p;
  ctx.save();
  ctx.translate(x0, y0);
  draw(ctx, p);
  ctx.restore();
}

function drawGrass(c) {
  const top = '#5cb85c';
  const topHi = '#6fcf7a';
  const side = '#4a7c3f';
  const dirt = '#6d4c41';
  const dirtHi = '#8d6e63';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      if (y < 9) {
        const stripe = (x + y) % 3 === 0 ? topHi : top;
        px(c, x, y, (x ^ y) & 1 ? stripe : top);
      } else if (y < 12) {
        px(c, x, y, (x + y) % 2 ? side : '#3d6b35');
      } else {
        px(c, x, y, (x * y) % 5 === 0 ? dirtHi : dirt);
      }
    }
  }
  px(c, 3, 4, topHi);
  px(c, 11, 5, topHi);
  px(c, 7, 2, '#8bc34a');
}

function drawSand(c) {
  const base = '#e8d5a8';
  const grain = '#c4a574';
  const deep = '#b8956a';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = base;
      if ((x * 7 + y * 11) % 13 < 2) col = grain;
      if ((x * 3 + y * 5) % 11 === 0) col = deep;
      px(c, x, y, col);
    }
  }
}

function drawStone(c) {
  const base = '#9e9e9e';
  const dark = '#6d6d6d';
  const light = '#bdbdbd';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = base;
      if (((x + y) & 3) === 0) col = light;
      if (((x * y) & 7) === 1) col = dark;
      px(c, x, y, col);
    }
  }
  for (let i = 0; i < 16; i++) {
    px(c, i, (i * 3) % 16, dark);
    px(c, (i + 5) % 16, i, dark);
  }
  px(c, 2, 3, dark);
  px(c, 10, 11, dark);
  px(c, 6, 7, dark);
}

function drawWood(c) {
  const plank = '#7a5545';
  const grain = '#5d4037';
  const edge = '#4e342e';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = plank;
      if (x % 4 === 0 || x % 4 === 3) col = grain;
      if (y % 4 === 0) col = edge;
      px(c, x, y, col);
    }
  }
}

function drawLeaf(c) {
  const a = '#66bb6a';
  const b = '#43a047';
  const cHi = '#81c784';
  const d = '#2e7d32';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = a;
      const n = (x * 5 + y * 7) % 11;
      if (n < 2) col = b;
      else if (n < 4) col = cHi;
      else if (n === 7) col = d;
      px(c, x, y, col);
    }
  }
}

function drawWater(c) {
  const deep = '#1565c0';
  const mid = '#1e88e5';
  const foam = '#e3f2fd';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = (x + y) % 2 ? mid : deep;
      if (((x + y * 2) % 7) === 0) col = '#42a5f5';
      px(c, x, y, col);
    }
  }
  for (let x = 0; x < 16; x++) {
    const wy = 5 + ((x * 2) % 5);
    px(c, x, wy, foam);
    px(c, x, (wy + 4) % 16, foam);
  }
}

function drawGold(c) {
  const base = '#ffca28';
  const hi = '#fff9c4';
  const sh = '#f9a825';
  const glow = '#ffe082';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = base;
      if (x > 4 && x < 11 && y > 4 && y < 11) col = glow;
      if ((x + y) % 3 === 0) col = hi;
      if (x < 2 || y < 2 || x > 13 || y > 13) col = sh;
      px(c, x, y, col);
    }
  }
  px(c, 5, 5, hi);
  px(c, 10, 6, hi);
  px(c, 7, 9, hi);
}

function drawBread(c) {
  const crust = '#6d4c41';
  const crumb = '#d7ccc8';
  const toast = '#bcaaa4';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      px(c, x, y, '#a1887f');
    }
  }
  for (let x = 3; x < 13; x++) {
    for (let y = 5; y < 12; y++) {
      const edge =
        x === 3 || x === 12 || y === 5 || y === 11 ? crust : crumb;
      px(c, x, y, edge);
    }
  }
  px(c, 6, 7, toast);
  px(c, 9, 8, toast);
  px(c, 7, 9, crust);
}

function drawDirt(c) {
  const a = '#6d4c41';
  const b = '#5d4037';
  const cHi = '#8d6e63';
  const d = '#4e342e';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = a;
      const n = (x * 11 + y * 13) % 17;
      if (n < 3) col = b;
      else if (n < 5) col = cHi;
      else if (n === 11) col = d;
      px(c, x, y, col);
    }
  }
}

function drawCobble(c) {
  const base = '#757575';
  const dark = '#424242';
  const light = '#9e9e9e';
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = base;
      if ((x + y * 3) % 5 === 0) col = dark;
      if ((x * y) % 7 === 2) col = light;
      px(c, x, y, col);
    }
  }
}

function drawPlanks(c) {
  for (let y = 0; y < 16; y++) {
    const row = Math.floor(y / 4);
    const shade = row % 2 ? '#8d6e63' : '#a1887f';
    for (let x = 0; x < 16; x++) {
      let col = shade;
      if (x % 4 === 0) col = '#5d4037';
      px(c, x, y, col);
    }
  }
}

function drawBrick(c) {
  for (let y = 0; y < 16; y++) {
    const row = Math.floor(y / 5);
    for (let x = 0; x < 16; x++) {
      const brick = (x + row) % 8 < 6 ? '#b71c1c' : '#8d1a1a';
      px(c, x, y, x % 8 === 7 ? '#3e2723' : brick);
    }
  }
}

function drawGlass(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const edge = x < 2 || y < 2 || x > 13 || y > 13;
      px(c, x, y, edge ? '#81d4fa' : '#b3e5fc');
    }
  }
}

function drawSandstone(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = '#d7ccc8';
      if ((x + y) % 4 === 0) col = '#bcaaa4';
      if (y % 6 === 0) col = '#a1887f';
      px(c, x, y, col);
    }
  }
}

function drawMarble(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = '#eceff1';
      if ((x * 3 + y * 5) % 11 < 2) col = '#cfd8dc';
      if ((x - y) % 9 === 0) col = '#b0bec5';
      px(c, x, y, col);
    }
  }
}

function drawClayBlock(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      px(c, x, y, (x + y) % 3 ? '#bcaaa4' : '#a1887f');
    }
  }
}

function drawBookshelf(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const shelf = y === 4 || y === 5 || y === 11 || y === 12;
      px(c, x, y, shelf ? '#5d4037' : '#795548');
    }
  }
  for (let x = 1; x < 15; x += 3) {
    px(c, x, 2, '#3e2723');
    px(c, x, 8, '#3e2723');
    px(c, x, 14, '#3e2723');
  }
}

function drawMossyStone(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      let col = '#78909c';
      if ((x * y + 3) % 7 < 2) col = '#558b2f';
      if ((x + y) % 5 === 0) col = '#546e7a';
      px(c, x, y, col);
    }
  }
}

function drawPolishedStone(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      px(c, x, y, (x + y) % 2 ? '#90a4ae' : '#78909c');
    }
  }
}

function drawPackedEarth(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      px(c, x, y, (x * 7 + y * 3) % 5 < 2 ? '#6d4c41' : '#5d4037');
    }
  }
}

function drawReed(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const stem = x === 7 || x === 8;
      px(c, x, y, stem ? '#689f38' : '#c5e1a5');
    }
  }
}

function drawOilLamp(c) {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const body = x > 4 && x < 12 && y > 6 && y < 14;
      const flame = x > 6 && x < 10 && y > 2 && y < 7;
      if (flame) px(c, x, y, '#ffca28');
      else if (body) px(c, x, y, '#795548');
      else px(c, x, y, '#5d4037');
    }
  }
}

/**
 * @param {import('three').CanvasTexture} tex
 */
function applySmoothAtlasSampling(tex) {
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
}

/**
 * @returns {THREE.CanvasTexture}
 */
export function getAtlasTexture() {
  if (cachedAtlasTexture) return cachedAtlasTexture;
  const canvas = getAtlasCanvas();
  const tex = new THREE.CanvasTexture(canvas);
  applySmoothAtlasSampling(tex);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  cachedAtlasTexture = tex;
  return cachedAtlasTexture;
}

/**
 * After the WebGL renderer exists, improves angled surfaces (reduces blur at a distance).
 * @param {import('three').WebGLRenderer} renderer
 */
export function applyAtlasAnisotropy(renderer) {
  const tex = getAtlasTexture();
  const max = renderer.capabilities.getMaxAnisotropy();
  tex.anisotropy = Math.min(8, max);
  tex.needsUpdate = true;
}
