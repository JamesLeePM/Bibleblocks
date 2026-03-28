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

/**
 * @returns {THREE.CanvasTexture}
 */
export function getAtlasTexture() {
  if (cachedAtlasTexture) return cachedAtlasTexture;
  const canvas = getAtlasCanvas();
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cachedAtlasTexture = tex;
  return cachedAtlasTexture;
}
