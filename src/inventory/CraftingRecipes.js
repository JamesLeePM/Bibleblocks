/** @typedef {{ id: number, count: number }} Stack */

/**
 * @typedef {{
 *   id: string,
 *   shapeless?: Record<number, number>,
 *   shaped?: [number, number, number, number],
 *   out: { id: number, count: number },
 * }} RecipeDef
 */

/** @type {RecipeDef[]} */
export const CRAFTING_RECIPES = [
  { id: 'planks', shapeless: { 3: 1 }, out: { id: 11, count: 4 } },
  { id: 'sandstone', shapeless: { 1: 4 }, out: { id: 14, count: 1 } },
  { id: 'glass', shapeless: { 1: 2, 6: 1 }, out: { id: 13, count: 2 } },
  { id: 'bricks', shapeless: { 10: 4 }, out: { id: 12, count: 4 } },
  { id: 'polished', shaped: [2, 2, 2, 2], out: { id: 19, count: 4 } },
  { id: 'packed_earth', shaped: [9, 9, 9, 9], out: { id: 20, count: 4 } },
  { id: 'bookshelf', shapeless: { 3: 3, 6: 1 }, out: { id: 17, count: 1 } },
  { id: 'mossy', shapeless: { 10: 2, 4: 2 }, out: { id: 18, count: 2 } },
  { id: 'reed_bundle', shapeless: { 21: 4 }, out: { id: 3, count: 1 } },
  { id: 'lamp', shapeless: { 6: 2, 3: 2 }, out: { id: 22, count: 1 } },
];

/**
 * @param {Stack[]} grid4
 * @returns {Record<number, number>}
 */
function countIngredients(grid4) {
  /** @type {Record<number, number>} */
  const m = {};
  for (const s of grid4) {
    if (s?.id > 0 && s.count > 0) {
      m[s.id] = (m[s.id] ?? 0) + s.count;
    }
  }
  return m;
}

/**
 * @param {number[]} g - 4 cell ids (0 = empty), one block per cell for shaped
 */
function gridIdsFromStacks(grid4) {
  return grid4.map((s) => (s?.id > 0 && s.count > 0 ? s.id : 0));
}

/**
 * @param {number[]} a
 * @param {number[]} b
 */
function patternMatch(a, b) {
  for (let i = 0; i < 4; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * @param {number[]} pattern
 */
function rotate4(pattern) {
  return [pattern[2], pattern[0], pattern[3], pattern[1]];
}

/**
 * @param {number[]} gridIds
 * @param {[number,number,number,number]} pattern
 */
function matchesShaped(gridIds, pattern) {
  let p = [...pattern];
  for (let r = 0; r < 4; r++) {
    if (patternMatch(gridIds, p)) return true;
    p = rotate4(p);
  }
  return false;
}

/**
 * @param {Stack[]} grid4
 * @param {RecipeDef} recipe
 */
function matchesShapeless(grid4, recipe) {
  if (!recipe.shapeless) return false;
  const have = countIngredients(grid4);
  const need = recipe.shapeless;
  const keys = new Set([
    ...Object.keys(need).map(Number),
    ...Object.keys(have).map(Number),
  ]);
  for (const k of keys) {
    if ((need[k] ?? 0) !== (have[k] ?? 0)) return false;
  }
  return true;
}

/**
 * @param {Stack[]} grid4
 * @param {RecipeDef} recipe
 */
function matchesShapedRecipe(grid4, recipe) {
  if (!recipe.shaped) return false;
  const ids = gridIdsFromStacks(grid4);
  return matchesShaped(ids, recipe.shaped);
}

/**
 * First matching recipe for the 2×2 grid.
 * @param {Stack[]} grid4
 * @returns {RecipeDef | null}
 */
export function findMatchingRecipe(grid4) {
  for (const r of CRAFTING_RECIPES) {
    if (r.shaped && matchesShapedRecipe(grid4, r)) return r;
  }
  for (const r of CRAFTING_RECIPES) {
    if (r.shapeless && matchesShapeless(grid4, r)) return r;
  }
  return null;
}

/**
 * Consume ingredients from crafting grid per recipe (shapeless uses counts).
 * @param {Stack[]} grid4
 * @param {RecipeDef} recipe
 */
export function consumeCraftingGrid(grid4, recipe) {
  if (recipe.shapeless) {
    const need = { ...recipe.shapeless };
    for (let i = 0; i < 4; i++) {
      const s = grid4[i];
      while (s.id > 0 && s.count > 0 && need[s.id] > 0) {
        const take = Math.min(s.count, need[s.id]);
        s.count -= take;
        need[s.id] -= take;
        if (s.count <= 0) {
          s.id = 0;
          s.count = 0;
        }
      }
    }
    return;
  }
  if (recipe.shaped) {
    const ids = gridIdsFromStacks(grid4);
    let p = [...recipe.shaped];
    let matched = false;
    for (let r = 0; r < 4; r++) {
      if (patternMatch(ids, p)) {
        matched = true;
        break;
      }
      p = rotate4(p);
    }
    if (!matched) return;
    for (let i = 0; i < 4; i++) {
      if (p[i] !== 0) {
        const s = grid4[i];
        if (s.id && s.count > 0) {
          s.count -= 1;
          if (s.count <= 0) {
            s.id = 0;
            s.count = 0;
          }
        }
      }
    }
  }
}
