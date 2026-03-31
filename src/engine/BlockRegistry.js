/**
 * Minecraft-style block metadata: hardness, drops, transparency, stack size.
 * Block type ids match VoxelWorld / TextureAtlas (0 = air).
 */

/** @typedef {{ id: number, count: number }} Stack */

/** @type {Record<number, { name: string, hardness: number, stack: number, transparent?: boolean, luminous?: boolean, drop?: Stack | 'self' | null }>} */
export const BLOCK_DEFS = {
  1: { name: 'Sand', hardness: 0.55, stack: 64, drop: 'self' },
  2: { name: 'Stone', hardness: 1.45, stack: 64, drop: { id: 10, count: 1 } },
  3: { name: 'Wood', hardness: 0.75, stack: 64, drop: 'self' },
  4: { name: 'Leaves', hardness: 0.25, stack: 64, transparent: true, drop: { id: 4, count: 1 } },
  5: { name: 'Water', hardness: 999, stack: 1, transparent: true, drop: null },
  6: { name: 'Gold', hardness: 2.2, stack: 64, drop: 'self' },
  7: { name: 'Bread', hardness: 0.35, stack: 64, drop: 'self' },
  8: { name: 'Grass', hardness: 0.55, stack: 64, drop: { id: 9, count: 1 } },
  9: { name: 'Dirt', hardness: 0.55, stack: 64, drop: 'self' },
  10: { name: 'Cobblestone', hardness: 1.35, stack: 64, drop: 'self' },
  11: { name: 'Planks', hardness: 0.65, stack: 64, drop: 'self' },
  12: { name: 'Bricks', hardness: 1.6, stack: 64, drop: 'self' },
  13: { name: 'Glass', hardness: 0.35, stack: 64, transparent: true, drop: 'self' },
  14: { name: 'Sandstone', hardness: 1.0, stack: 64, drop: 'self' },
  15: { name: 'Marble', hardness: 1.25, stack: 64, drop: 'self' },
  16: { name: 'Clay', hardness: 0.85, stack: 64, drop: 'self' },
  17: { name: 'Bookshelf', hardness: 0.9, stack: 64, drop: 'self' },
  18: { name: 'Mossy Stone', hardness: 1.4, stack: 64, drop: 'self' },
  19: { name: 'Polished Stone', hardness: 1.35, stack: 64, drop: 'self' },
  20: { name: 'Packed Earth', hardness: 0.7, stack: 64, drop: 'self' },
  21: { name: 'Papyrus Reed', hardness: 0.2, stack: 64, transparent: true, drop: 'self' },
  22: { name: 'Oil Lamp', hardness: 0.45, stack: 64, luminous: true, drop: 'self' },
};

export const INVENTORY_SLOTS = 36;
export const HOTBAR_SIZE = 9;

/** @param {number} type */
export function getBlockDef(type) {
  return BLOCK_DEFS[type] ?? {
    name: 'Unknown',
    hardness: 1,
    stack: 64,
    drop: 'self',
  };
}

/** @param {number} type */
export function isBlockTransparent(type) {
  return !!getBlockDef(type).transparent;
}

/** Seconds to mine by hand (scaled like Minecraft; lower = faster). */
export function getBaseBreakSeconds(type) {
  const h = getBlockDef(type).hardness;
  if (h >= 500) return 999;
  return Math.max(0.08, h * 0.55);
}

/**
 * Resolve drop stack for a broken block.
 * @param {number} blockType
 * @returns {Stack | null}
 */
export function getDropForBlock(blockType) {
  const d = BLOCK_DEFS[blockType];
  if (!d || d.drop === null) return null;
  if (d.drop === 'self') return { id: blockType, count: 1 };
  return { id: d.drop.id, count: d.drop.count };
}
