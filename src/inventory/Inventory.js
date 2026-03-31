import { BLOCK_DEFS, HOTBAR_SIZE, INVENTORY_SLOTS } from '../engine/BlockRegistry.js';
import { consumeCraftingGrid, findMatchingRecipe } from './CraftingRecipes.js';

/** @typedef {{ id: number, count: number }} ItemStack */

function emptyStack() {
  return { id: 0, count: 0 };
}

export class Inventory {
  constructor() {
    /** @type {ItemStack[]} */
    this.slots = Array.from({ length: INVENTORY_SLOTS }, () => emptyStack());
    /** @type {ItemStack[]} 2×2 crafting input */
    this.craftingSlots = [
      emptyStack(),
      emptyStack(),
      emptyStack(),
      emptyStack(),
    ];
    this.selectedHotbarIndex = 0;
  }

  /** @param {number} index 0..35 */
  getSlot(index) {
    return this.slots[index] ?? emptyStack();
  }

  /** @param {ItemStack[]} data */
  loadSlots(data) {
    if (!Array.isArray(data)) return;
    for (let i = 0; i < INVENTORY_SLOTS; i++) {
      const s = data[i];
      if (s && typeof s.id === 'number' && s.id > 0 && typeof s.count === 'number') {
        const max = BLOCK_DEFS[s.id]?.stack ?? 64;
        this.slots[i] = { id: s.id, count: Math.min(max, Math.max(0, s.count)) };
      } else {
        this.slots[i] = emptyStack();
      }
    }
  }

  /** @returns {ItemStack[]} */
  serializeSlots() {
    return this.slots.map((s) =>
      s.id > 0 ? { id: s.id, count: s.count } : { id: 0, count: 0 }
    );
  }

  /** @returns {ItemStack[]} */
  serializeCrafting() {
    return this.craftingSlots.map((s) =>
      s.id > 0 ? { id: s.id, count: s.count } : { id: 0, count: 0 }
    );
  }

  /** @param {ItemStack[] | null | undefined} data */
  loadCrafting(data) {
    if (!Array.isArray(data)) return;
    for (let i = 0; i < 4; i++) {
      const s = data[i];
      if (s && typeof s.id === 'number' && s.id > 0 && typeof s.count === 'number') {
        const max = BLOCK_DEFS[s.id]?.stack ?? 64;
        this.craftingSlots[i] = {
          id: s.id,
          count: Math.min(max, Math.max(0, s.count)),
        };
      } else {
        this.craftingSlots[i] = emptyStack();
      }
    }
  }

  /**
   * Add items; returns overflow count not fitted.
   * @param {number} id
   * @param {number} count
   */
  add(id, count) {
    if (!id || count <= 0) return 0;
    const max = BLOCK_DEFS[id]?.stack ?? 64;
    let left = count;

    for (let i = 0; i < INVENTORY_SLOTS && left > 0; i++) {
      const s = this.slots[i];
      if (s.id === id && s.count < max) {
        const room = max - s.count;
        const add = Math.min(room, left);
        s.count += add;
        left -= add;
      }
    }
    for (let i = 0; i < INVENTORY_SLOTS && left > 0; i++) {
      const s = this.slots[i];
      if (s.id === 0) {
        const add = Math.min(max, left);
        this.slots[i] = { id, count: add };
        left -= add;
      }
    }
    return left;
  }

  /**
   * Remove from hotbar selected slot (for placing blocks).
   * @returns {boolean} true if removed one
   */
  consumeSelectedForPlace() {
    const i = this.selectedHotbarIndex;
    const s = this.slots[i];
    if (!s.id || s.count <= 0) return false;
    s.count--;
    if (s.count <= 0) {
      s.id = 0;
      s.count = 0;
    }
    return true;
  }

  /** Hotbar slot 0..8 */
  setSelectedHotbarIndex(i) {
    const n = HOTBAR_SIZE;
    this.selectedHotbarIndex = ((i % n) + n) % n;
  }

  getSelectedBlockType() {
    const s = this.slots[this.selectedHotbarIndex];
    return s?.id ?? 0;
  }

  /**
   * Survival starter kit: a bit of each common block.
   */
  fillStarterSurvival() {
    const starter = [
      [8, 32],
      [9, 32],
      [1, 24],
      [2, 16],
      [3, 24],
      [10, 16],
      [11, 32],
      [12, 16],
      [13, 16],
    ];
    let slot = 0;
    for (const [id, n] of starter) {
      if (slot >= HOTBAR_SIZE) break;
      this.slots[slot++] = { id, count: n };
    }
  }

  fillCreativeHotbar() {
    const types = [8, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    for (let i = 0; i < Math.min(HOTBAR_SIZE, types.length); i++) {
      const id = types[i];
      const max = BLOCK_DEFS[id]?.stack ?? 64;
      this.slots[i] = { id, count: max };
    }
  }

  /**
   * If the crafting grid matches a recipe and the result fits in main inventory, consume inputs and add output.
   * @returns {boolean}
   */
  tryCraftOutput() {
    const recipe = findMatchingRecipe(this.craftingSlots);
    if (!recipe) return false;
    const snap = this.serializeSlots();
    const left = this.add(recipe.out.id, recipe.out.count);
    if (left > 0) {
      this.loadSlots(snap);
      return false;
    }
    consumeCraftingGrid(this.craftingSlots, recipe);
    return true;
  }
}
