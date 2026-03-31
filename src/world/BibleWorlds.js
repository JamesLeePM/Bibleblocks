import { VoxelWorld } from '../engine/VoxelWorld.js';

const GRASS = 8;
const SAND = 1;
const STONE = 2;
const WOOD = 3;
const LEAF = 4;
const WATER = 5;
const GOLD = 6;
const BREAD = 7;
const DIRT = 9;

const WORLD_SIZE = 160; // 10×10 chunks (16 blocks each)
const CX = WORLD_SIZE / 2;
const CZ = WORLD_SIZE / 2;

function inBoundsXY(x, z) {
  return x >= 0 && z >= 0 && x < WORLD_SIZE && z < WORLD_SIZE;
}

function set(world, x, y, z, type) {
  if (!inBoundsXY(x, z)) return;
  world.setBlock(x, y, z, type);
}

/** Highest solid block at column (x, z). */
function surfaceYAt(world, x, z) {
  for (let y = 40; y >= 0; y--) {
    if (world.getBlock(x, y, z) !== 0) return y;
  }
  return 0;
}

function fillColumn(world, x, z, y0, y1, type) {
  for (let y = y0; y <= y1; y++) set(world, x, y, z, type);
}

function placeTree(world, x, z, trunkH = 6, canopyR = 2) {
  const baseY = surfaceYAt(world, x, z);
  for (let y = 1; y <= trunkH; y++) set(world, x, baseY + y, z, WOOD);
  const topY = baseY + trunkH + 1;
  for (let dx = -canopyR; dx <= canopyR; dx++) {
    for (let dz = -canopyR; dz <= canopyR; dz++) {
      const dist = Math.abs(dx) + Math.abs(dz);
      if (dist > canopyR * 2) continue;
      const y = topY + (dist === canopyR * 2 ? -1 : 0);
      set(world, x + dx, y, z + dz, LEAF);
    }
  }
  set(world, x, topY, z, GOLD); // a little gold glow tip
}

function placeTreeOfKnowledge(world) {
  const x = CX;
  const z = CZ + 2;
  const baseY = surfaceYAt(world, x, z);
  // Trunk
  for (let y = 1; y <= 22; y++) set(world, x, baseY + y, z, WOOD);
  // Gold-tipped crown
  const topY = baseY + 23;
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      if (Math.abs(dx) + Math.abs(dz) > 3) continue;
      set(world, x + dx, topY, z + dz, GOLD);
    }
  }
}

function placeRiver(world) {
  // East-west river — follow rolling terrain (surface height varies after hills).
  const midZ = CZ - 18;
  for (let x = 8; x < WORLD_SIZE - 8; x++) {
    for (let dz = -2; dz <= 2; dz++) {
      const z = midZ + dz;
      if (!inBoundsXY(x, z)) continue;
      const sy = surfaceYAt(world, x, z);
      set(world, x, sy, z, WATER);
      set(world, x, sy + 1, z, 0);
      if (sy >= 1) set(world, x, sy - 1, z, DIRT);
      if (sy >= 2) set(world, x, sy - 2, z, DIRT);
    }
  }
}

function placeFlowers(world) {
  // Single block flowers on grass: approximate colors with existing block types.
  const areaX0 = 14;
  const areaX1 = WORLD_SIZE - 14;
  const areaZ0 = 14;
  const areaZ1 = WORLD_SIZE - 14;
  for (let i = 0; i < 140; i++) {
    const x = areaX0 + Math.floor(Math.random() * (areaX1 - areaX0));
    const z = areaZ0 + Math.floor(Math.random() * (areaZ1 - areaZ0));
    const r = Math.random();
    const flower =
      r < 0.25 ? GOLD : r < 0.45 ? BREAD : r < 0.65 ? LEAF : DIRT;
    // Avoid center tree area a bit.
    if (Math.abs(x - CX) + Math.abs(z - CZ) < 18) continue;
    const sy = surfaceYAt(world, x, z);
    if (world.getBlock(x, sy, z) === WATER) continue;
    set(world, x, sy + 1, z, flower);
  }
}

function createGardenOfEden() {
  const world = new VoxelWorld();
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const n =
        Math.sin(x / 21) * Math.cos(z / 25) + Math.sin((x + z * 0.7) / 17);
      const top = 3 + Math.floor((n + 1.15) * 0.55);
      const t = clampInt(top, 3, 5);
      fillColumn(world, x, z, 0, t - 1, DIRT);
      set(world, x, t, z, GRASS);
      set(world, x, t + 1, z, 0);
    }
  }
  placeRiver(world);
  const treeCount = 18;
  for (let i = 0; i < treeCount; i++) {
    const x = 10 + Math.floor(Math.random() * (WORLD_SIZE - 20));
    const z = 10 + Math.floor(Math.random() * (WORLD_SIZE - 20));
    if (Math.abs(x - CX) + Math.abs(z - CZ) < 24) continue;
    placeTree(world, x, z, 6 + (i % 3), 2);
  }
  placeTreeOfKnowledge(world);
  placeFlowers(world);

  const gx = CX - 6;
  const gz = CZ + 10;
  const spawn = { x: gx, y: surfaceYAt(world, gx, gz) + 1, z: gz };
  const spawnCharacterId = Math.random() < 0.5 ? 'mary' : 'noah';
  return { world, spawn, spawnCharacterId, worldName: 'Garden of Eden' };
}

function createRollingHeightSand(world) {
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const h =
        3 +
        Math.floor(
          (Math.sin(x / 10) + Math.cos(z / 12)) * 1.2 +
            (Math.sin((x + z) / 7) * 0.8 + 0.8)
        );
      const top = clampInt(h, 2, 6);
      for (let y = 0; y <= top; y++) set(world, x, y, z, SAND);
      // Fill below with slightly darker base.
      for (let y = 0; y <= top - 2; y++) set(world, x, y, z, DIRT);
      // Clear above top.
      set(world, x, top + 1, z, 0);
    }
  }
}

function clampInt(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function placeBurningBush(world) {
  // Stump with "burning" leaf glow approximated by GOLD/LEAF.
  const x = CX - 28;
  const z = CZ + 24;
  const baseY = surfaceYAt(world, x, z);
  for (let y = 1; y <= 3; y++) set(world, x, baseY + y, z, WOOD);
  const glow0 = baseY + 4;
  for (let y = 0; y <= 4; y++) {
    set(world, x, glow0 + y, z, GOLD);
    if (Math.random() < 0.7) set(world, x + 1, glow0 + y - 1, z, LEAF);
    if (Math.random() < 0.7) set(world, x - 1, glow0 + y - 1, z, LEAF);
  }
}

function placePartedSea(world) {
  // Two water walls with sand path in the middle (walls follow dune height).
  const seaZ0 = 30;
  const seaZ1 = WORLD_SIZE - 30;
  const midX = CX;
  const wallL = 22;
  const wallR = 22;
  const pathW = 6;

  for (let z = seaZ0; z <= seaZ1; z++) {
    for (let x = midX - pathW; x <= midX + pathW; x++) {
      for (let y = 0; y <= 5; y++) {
        if (x >= midX - pathW + 2 && x <= midX + pathW - 2) {
          set(world, x, y, z, SAND);
        } else {
          set(world, x, y, z, 0);
        }
      }
    }
    for (let x = midX - pathW - wallL; x < midX - pathW; x++) {
      const sy = surfaceYAt(world, x, z);
      const y0 = Math.max(1, sy - 1);
      set(world, x, y0, z, WATER);
      set(world, x, sy, z, WATER);
    }
    for (let x = midX + pathW + 1; x <= midX + pathW + wallR; x++) {
      const sy = surfaceYAt(world, x, z);
      const y0 = Math.max(1, sy - 1);
      set(world, x, y0, z, WATER);
      set(world, x, sy, z, WATER);
    }
  }
}

function createDesertOfExodus() {
  const world = new VoxelWorld();
  createRollingHeightSand(world);

  // Rock formations (use stone as approximation of red sandstone).
  const formations = 24;
  for (let i = 0; i < formations; i++) {
    const ox = Math.floor(8 + Math.random() * (WORLD_SIZE - 16));
    const oz = Math.floor(8 + Math.random() * (WORLD_SIZE - 16));
    const h = 2 + Math.floor(Math.random() * 5);
    const r = 2 + Math.floor(Math.random() * 3);
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        const md = Math.abs(dx) + Math.abs(dz);
        if (md > r + 1) continue;
        const sy = surfaceYAt(world, ox + dx, oz + dz);
        for (let dy = 0; dy < h; dy++) {
          if (Math.random() < 0.25) continue;
          set(world, ox + dx, sy + 1 + dy, oz + dz, STONE);
        }
      }
    }
  }

  placeBurningBush(world);
  placePartedSea(world);

  const mx = CX - 10;
  const mz = CZ - 10;
  const spawn = { x: mx, y: surfaceYAt(world, mx, mz) + 1, z: mz };
  return {
    world,
    spawn,
    spawnCharacterId: 'moses',
    worldName: 'Desert of Exodus',
  };
}

function placeArk(world) {
  // Centered at x=CX, z=CZ+10 — sit on island surface (varies with sea fill).
  const ox = CX - 14;
  const oz = CZ + 10;
  const baseY = surfaceYAt(world, ox + 6, oz + 9);
  const width = 12;
  const length = 18;
  const stories = 3;
  const storyH = 6;
  for (let s = 0; s < stories; s++) {
    const y0 = baseY + s * storyH;
    // Solid outer hull (older version only had top/bottom rings — looked like floating posts).
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < length; z++) {
        const isEdge = x === 0 || x === width - 1 || z === 0 || z === length - 1;
        if (!isEdge) continue;
        for (let dy = 0; dy < storyH; dy++) {
          const y = y0 + dy;
          const isDoor =
            z === 0 && (x === 5 || x === 6) && dy <= storyH - 2;
          if (isDoor) continue;
          set(world, ox + x, y, oz + z, WOOD);
        }
      }
    }
    // Floors
    for (let x = 2; x < width - 2; x++) {
      for (let z = 2; z < length - 2; z++) {
        set(world, ox + x, y0 + 1, oz + z, WOOD);
      }
    }
    // Entrance (front z): clear so terrain does not fill the doorway.
    for (let y = y0; y <= y0 + storyH - 2; y++) {
      set(world, ox + 5, y, oz + 0, 0);
      set(world, ox + 6, y, oz + 0, 0);
    }
  }
  const yRoof = baseY + (stories - 1) * storyH + storyH - 1;
  for (let x = 1; x < width - 1; x++) {
    for (let z = 1; z < length - 1; z++) {
      set(world, ox + x, yRoof, oz + z, WOOD);
    }
  }
  set(world, ox + Math.floor(width / 2), yRoof + 1, oz + Math.floor(length / 2), GOLD);
  // Ramp
  const rampX0 = ox + Math.floor(width / 2) - 2;
  const rampZ0 = oz - 8;
  for (let i = 0; i < 10; i++) {
    for (let x = -1; x <= 1; x++) {
      for (let z = 0; z <= 2; z++) {
        const y = baseY + Math.floor(i / 2);
        set(world, rampX0 + x + (i % 2 === 0 ? 0 : 1), y, rampZ0 + i + z, WOOD);
      }
    }
  }
}

function placeAnimals(world) {
  const ox = CX - 20;
  const oz = CZ + 18;

  // Elephant pair (grey-ish stone)
  const elephantX = [ox + 2, ox + 6];
  for (let i = 0; i < elephantX.length; i++) {
    const x = elephantX[i];
    const baseY = surfaceYAt(world, x, oz);
    for (let y = 1; y <= 3; y++) {
      set(world, x, baseY + y, oz, STONE);
      set(world, x + 1, baseY + y, oz, STONE);
    }
  }

  // Giraffe pair (leaf/gold mix)
  const giraffeZ = [oz + 8, oz + 12];
  for (let i = 0; i < giraffeZ.length; i++) {
    const z = giraffeZ[i];
    const x = ox + 10;
    const baseY = surfaceYAt(world, x, z);
    for (let y = 1; y <= 7; y++) set(world, x, baseY + y, z, LEAF);
    set(world, x, baseY + 8, z, GOLD);
  }

  // Dove pair (bread-ish)
  for (let i = 0; i < 2; i++) {
    const x = ox + 6 + i * 5;
    const baseY = surfaceYAt(world, x, oz + 4);
    set(world, x, baseY + 1, oz + 4, BREAD);
    set(world, x + 1, baseY + 1, oz + 4, BREAD);
    set(world, x, baseY + 2, oz + 4, BREAD);
  }
}

function placeStormClouds(world) {
  // Light blocks read as clouds; stone looked like floating rock islands.
  const cloudCount = 14;
  for (let i = 0; i < cloudCount; i++) {
    const ox = 20 + Math.floor(Math.random() * (WORLD_SIZE - 40));
    const oz = 20 + Math.floor(Math.random() * (WORLD_SIZE - 40));
    const baseY = 22 + Math.floor(Math.random() * 10);
    const r = 2 + Math.floor(Math.random() * 3);
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > r + 1) continue;
        const y = baseY + Math.floor(Math.random() * 3);
        const t = Math.random();
        set(world, ox + dx, y, oz + dz, t < 0.55 ? BREAD : t < 0.85 ? LEAF : STONE);
      }
    }
  }
}

/** Wooden pier off the island toward open water (so the world name reads true). */
/** Wooden pier with pilings through water (shared by Noah + Jonah). */
function placeWoodenPierAlongZ(world, pierX, startZ, len, halfW) {
  for (let dz = 0; dz < len; dz++) {
    const z = startZ + dz;
    for (let dx = -halfW; dx <= halfW; dx++) {
      const x = pierX + dx;
      if (!inBoundsXY(x, z)) continue;
      const sy = surfaceYAt(world, x, z);
      const topBlock = world.getBlock(x, sy, z);
      set(world, x, sy + 1, z, WOOD);
      if (topBlock === WATER) {
        for (let y = 1; y < sy; y++) set(world, x, y, z, WOOD);
      }
    }
  }
}

function placeWoodenPierAlongX(world, startX, fixedZ, len, halfW) {
  for (let di = 0; di < len; di++) {
    const x = startX + di;
    for (let dw = -halfW; dw <= halfW; dw++) {
      const z = fixedZ + dw;
      if (!inBoundsXY(x, z)) continue;
      const sy = surfaceYAt(world, x, z);
      const topBlock = world.getBlock(x, sy, z);
      set(world, x, sy + 1, z, WOOD);
      if (topBlock === WATER) {
        for (let y = 1; y < sy; y++) set(world, x, y, z, WOOD);
      }
    }
  }
}

function placeNoahDock(world) {
  placeWoodenPierAlongZ(world, CX - 5, CZ + 32, 18, 2);
}

/** Sand island under the ark + a few distant islets so the sea is not a flat plane. */
function buildNoahArkIsland(world) {
  const ox = CX - 14;
  const oz = CZ + 10;
  const arkW = 12;
  const arkL = 18;
  const pad = 10;
  for (let x = ox - pad; x < ox + arkW + pad; x++) {
    for (let z = oz - pad - 10; z < oz + arkL + pad; z++) {
      if (!inBoundsXY(x, z)) continue;
      const nx = (x - (ox + arkW * 0.5)) / (arkW * 0.5 + pad * 0.85);
      const nz = (z - (oz + arkL * 0.5)) / (arkL * 0.5 + pad * 0.85);
      if (nx * nx + nz * nz > 1.0) continue;
      for (let y = 1; y <= 4; y++) {
        set(world, x, y, z, y <= 2 ? DIRT : SAND);
      }
      set(world, x, 5, z, 0);
    }
  }
  const islets = [
    [CX + 48, CZ - 36],
    [CX - 42, CZ + 34],
    [CX + 28, CZ + 48],
    [CX - 36, CZ - 44],
  ];
  for (const [tx, tz] of islets) {
    for (let dx = -3; dx <= 3; dx++) {
      for (let dz = -3; dz <= 3; dz++) {
        if (dx * dx + dz * dz > 9) continue;
        const x = tx + dx;
        const z = tz + dz;
        if (!inBoundsXY(x, z)) continue;
        for (let y = 1; y <= 4; y++) set(world, x, y, z, SAND);
        set(world, x, 5, z, GRASS);
        set(world, x, 6, z, 0);
      }
    }
  }
}

function createNoahsArkDock() {
  const world = new VoxelWorld();
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const n =
        Math.sin(x / 24) * Math.cos(z / 28) + Math.sin((x + z * 0.7) / 20) * 0.45;
      const seaLevel = clampInt(3 + Math.floor((n + 1.15) * 0.35), 3, 4);
      set(world, x, 0, z, DIRT);
      for (let y = 1; y <= seaLevel; y++) set(world, x, y, z, WATER);
      set(world, x, seaLevel + 1, z, 0);
    }
  }
  buildNoahArkIsland(world);
  placeArk(world);
  placeNoahDock(world);
  placeAnimals(world);
  placeStormClouds(world);

  const sx = CX - 5;
  const sz = CZ + 26;
  const spawn = { x: sx, y: surfaceYAt(world, sx, sz) + 1, z: sz };
  return { world, spawn, spawnCharacterId: 'noah', worldName: "Noah's Ark Dock" };
}

function placeValley(world) {
  // Grass valley with hills
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const hill = Math.floor(
        (1 + Math.cos((x - CX) / 24) + Math.cos((z - CZ) / 30)) * 1.55
      );
      const base = 2 + (hill > 3 ? 1 : 0) + (hill > 5 ? 1 : 0);
      for (let y = 0; y <= base; y++) set(world, x, y, z, DIRT);
      set(world, x, base + 1, z, GRASS);
      set(world, x, base + 2, z, 0);
    }
  }
  const streamX = CX;
  for (let z = 20; z < WORLD_SIZE - 20; z++) {
    for (let dx = -1; dx <= 1; dx++) {
      const sx = streamX + dx;
      const sy = surfaceYAt(world, sx, z);
      set(world, sx, sy, z, WATER);
      set(world, sx, sy + 1, z, 0);
      if (sy >= 1) set(world, sx, sy - 1, z, DIRT);
    }
  }
  // Five stones (sphere-ish approximation)
  const stonesX = [CX - 16, CX - 8, CX, CX + 8, CX + 16];
  for (let i = 0; i < 5; i++) {
    const x = stonesX[i];
    const z = CZ + 14 + (i % 2) * 4;
    const sy = surfaceYAt(world, x, z);
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (dx * dx + dz * dz > 4) continue;
        set(world, x + dx, sy + 1, z + dz, STONE);
        set(world, x + dx, sy + 2, z + dz, STONE);
      }
    }
  }
}

function placeGoliath(world) {
  // Extra tall grey armor made from stacked stone blocks.
  const x = CX + 34;
  const z = CZ;
  const baseY = surfaceYAt(world, x, z);
  const height = 30;
  for (let y = baseY; y < baseY + height; y++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const md = Math.abs(dx) + Math.abs(dz);
        if (md > 4) continue;
        set(world, x + dx, y, z + dz, STONE);
      }
    }
  }
}

function createDavidsValley() {
  const world = new VoxelWorld();
  placeValley(world);
  placeGoliath(world);

  const dx = CX - 26;
  const dz = CZ + 6;
  const spawn = { x: dx, y: surfaceYAt(world, dx, dz) + 1, z: dz };
  return {
    world,
    spawn,
    spawnCharacterId: 'david',
    worldName: "David's Valley",
  };
}

/** Nazareth-style hill town: terraces, a simple home, olive trees, and a path. */
function createMaryNazareth() {
  const world = new VoxelWorld();
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const n = Math.sin(x / 14) + Math.cos(z / 16);
      const top = 3 + Math.min(2, Math.floor((n + 1.1) * 0.52));
      for (let y = 0; y <= top; y++) set(world, x, y, z, DIRT);
      set(world, x, top + 1, z, GRASS);
      set(world, x, top + 2, z, 0);
    }
  }

  const hx = CX - 20;
  const hz = CZ + 16;
  for (let dx = 0; dx < 10; dx++) {
    for (let dz = 0; dz < 10; dz++) {
      const x = hx + dx;
      const z = hz + dz;
      const sy = surfaceYAt(world, x, z);
      for (let y = 1; y <= sy; y++) set(world, x, y, z, DIRT);
      set(world, x, sy + 1, z, GRASS);
      set(world, x, sy + 2, z, 0);
    }
  }

  const baseY = surfaceYAt(world, hx + 4, hz + 4) + 1;
  for (let dx = 0; dx < 8; dx++) {
    for (let dz = 0; dz < 8; dz++) {
      for (let dy = 0; dy < 5; dy++) {
        const wall = dx === 0 || dx === 7 || dz === 0 || dz === 7 || dy === 4;
        if (wall) set(world, hx + dx, baseY + dy, hz + dz, WOOD);
      }
    }
  }
  for (let dy = 1; dy <= 3; dy++) {
    set(world, hx + 3, baseY + dy, hz + 0, 0);
    set(world, hx + 4, baseY + dy, hz + 0, 0);
  }
  for (let dx = 0; dx < 8; dx++) {
    for (let dz = 1; dz < 8; dz++) {
      set(world, hx + dx, baseY + 5, hz + dz, WOOD);
    }
  }

  const olives = [
    [CX - 8, CZ - 6],
    [CX + 12, CZ - 2],
    [CX + 4, CZ + 24],
    [CX - 28, CZ + 4],
  ];
  for (const [tx, tz] of olives) placeTree(world, tx, tz, 4, 2);

  const mx = CX + 10;
  const mz = CZ - 8;
  const spawn = { x: mx, y: surfaceYAt(world, mx, mz) + 1, z: mz };
  return {
    world,
    spawn,
    spawnCharacterId: 'mary',
    worldName: "Mary's Nazareth",
  };
}

/** Babylon: sand plain, stepped ziggurat, and a stone lion den. */
function createDanielBabylon() {
  const world = new VoxelWorld();
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const n = Math.sin(x / 13) * Math.cos(z / 15);
      const dune = Math.floor((n + 1.1) * 0.5);
      const top = 3 + Math.min(1, dune);
      fillColumn(world, x, z, 0, top - 1, DIRT);
      set(world, x, top, z, SAND);
      set(world, x, top + 1, z, SAND);
      set(world, x, top + 2, z, 0);
    }
  }

  const zx = CX;
  const zz = CZ + 6;
  const zigguratBase = surfaceYAt(world, zx, zz);
  for (let layer = 0; layer < 5; layer++) {
    const r = 12 - layer * 2;
    const y0 = zigguratBase + 1 + layer * 2;
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        const edge = Math.abs(dx) === r || Math.abs(dz) === r;
        if (!edge && layer < 4) continue;
        set(world, zx + dx, y0, zz + dz, STONE);
        if (layer === 4) {
          set(world, zx + dx, y0 + 1, zz + dz, GOLD);
        } else if (edge) {
          set(world, zx + dx, y0 + 1, zz + dz, STONE);
        }
      }
    }
  }

  const lx = CX + 30;
  const lz = CZ - 16;
  const ly = surfaceYAt(world, lx, lz);
  for (let dx = -4; dx <= 4; dx++) {
    for (let dz = -4; dz <= 4; dz++) {
      const ring = Math.abs(dx) === 4 || Math.abs(dz) === 4;
      if (ring) {
        for (let dy = 0; dy < 3; dy++) set(world, lx + dx, ly + 1 + dy, lz + dz, STONE);
      } else {
        set(world, lx + dx, ly + 1, lz + dz, LEAF);
      }
    }
  }
  set(world, lx, ly + 1, lz + 4, 0);
  set(world, lx, ly + 2, lz + 4, 0);
  set(world, lx - 1, ly + 1, lz + 4, 0);
  set(world, lx - 1, ly + 2, lz + 4, 0);

  const spx = CX - 18;
  const spz = CZ - 8;
  const spawn = { x: spx, y: surfaceYAt(world, spx, spz) + 1, z: spz };
  return {
    world,
    spawn,
    spawnCharacterId: 'daniel',
    worldName: "Daniel's Babylon",
  };
}

/** Persian court: golden floor, pillars, and a throne. */
function createEstherPalace() {
  const world = new VoxelWorld();
  const x0 = CX - 28;
  const x1 = CX + 28;
  const z0 = CZ - 28;
  const z1 = CZ + 28;
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const inHall = x >= x0 && x <= x1 && z >= z0 && z <= z1;
      const edge =
        inHall &&
        (x <= x0 + 3 || x >= x1 - 3 || z <= z0 + 3 || z >= z1 - 3);
      if (inHall) {
        const floorY = edge ? 4 : 3;
        fillColumn(world, x, z, 0, floorY - 1, DIRT);
        set(world, x, floorY, z, GOLD);
        set(world, x, floorY + 1, z, 0);
      } else {
        const n = Math.sin(x / 22) * Math.cos(z / 26);
        const top = 3 + Math.min(2, Math.floor((n + 1.1) * 0.55));
        fillColumn(world, x, z, 0, top - 1, DIRT);
        set(world, x, top, z, GRASS);
        set(world, x, top + 1, z, 0);
      }
    }
  }
  for (let px = x0 + 4; px <= x1 - 4; px += 10) {
    for (let pz = z0 + 4; pz <= z1 - 4; pz += 10) {
      const sy = surfaceYAt(world, px, pz);
      for (let y = 1; y <= 6; y++) set(world, px, sy + y, pz, WOOD);
    }
  }
  const tz = z0 + 10;
  const throneBase = surfaceYAt(world, CX, tz);
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = 0; dy < 5; dy++) {
      set(world, CX + dx, throneBase + 1 + dy, tz, GOLD);
    }
  }

  const spx = CX;
  const spz = CZ + 8;
  const spawn = { x: spx, y: surfaceYAt(world, spx, spz) + 1, z: spz };
  return {
    world,
    spawn,
    spawnCharacterId: 'esther',
    worldName: "Esther's Palace",
  };
}

/** Coastal Joppa-style port: beach, pier, boat, storm clouds. */
function createJonahPort() {
  const world = new VoxelWorld();
  const splitX = 78;
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      fillColumn(world, x, z, 0, 2, DIRT);
      if (x < splitX) {
        const sand = x > splitX - 18;
        const n = Math.sin(x / 16 + z / 20);
        const bump = sand ? 0 : Math.floor((n + 1.05) * 0.4);
        const top = 3 + Math.min(1, bump);
        set(world, x, top, z, sand ? SAND : GRASS);
        set(world, x, top + 1, z, 0);
      } else {
        set(world, x, 3, z, WATER);
        set(world, x, 4, z, WATER);
        set(world, x, 5, z, 0);
      }
    }
  }
  placeWoodenPierAlongX(world, splitX - 16, CZ, 18, 2);
  const bx = splitX + 6;
  const bz = CZ + 4;
  const boatY = surfaceYAt(world, bx, bz) + 1;
  for (let dz = 0; dz < 9; dz++) {
    for (let dx = -3; dx <= 3; dx++) {
      const hull = Math.abs(dx) === 3 || dz === 0 || dz === 8;
      if (hull) {
        set(world, bx + dx, boatY, bz + dz, WOOD);
        set(world, bx + dx, boatY + 1, bz + dz, WOOD);
      }
    }
  }
  for (let dz = 1; dz < 8; dz++) {
    for (let dx = -2; dx <= 2; dx++) {
      set(world, bx + dx, boatY + 2, bz + dz, WOOD);
    }
  }
  placeStormClouds(world);

  const jx = splitX - 32;
  const jz = CZ;
  const spawn = { x: jx, y: surfaceYAt(world, jx, jz) + 1, z: jz };
  return {
    world,
    spawn,
    spawnCharacterId: 'jonah',
    worldName: "Jonah's Port",
  };
}

/** Jericho: circular wall ring, gate gap, camp tents inside. */
function createJoshuaJericho() {
  const world = new VoxelWorld();
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const n = Math.sin(x / 18) * Math.cos(z / 22);
      const bump = Math.floor((n + 1.1) * 0.45);
      const top = 3 + Math.min(2, bump);
      fillColumn(world, x, z, 0, top - 1, DIRT);
      set(world, x, top, z, GRASS);
      set(world, x, top + 1, z, 0);
    }
  }

  const wx = CX;
  const wz = CZ + 12;
  const R = 26;
  function isGateGap(dx, dz) {
    return dz > 8 && Math.abs(dx) < 5;
  }

  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const dx = x - wx;
      const dz = z - wz;
      const d = Math.sqrt(dx * dx + dz * dz);
      const sy = surfaceYAt(world, x, z);
      if (d < R - 2) {
        set(world, x, sy, z, SAND);
        set(world, x, sy + 1, z, 0);
      }
      if (d >= R - 2 && d <= R + 0.5 && !isGateGap(dx, dz)) {
        for (let dy = 1; dy <= 4; dy++) {
          set(world, x, sy + dy, z, STONE);
        }
      }
    }
  }

  for (let i = 0; i < 6; i++) {
    const tx = wx + ((i % 3) - 1) * 8;
    const tz = wz + (Math.floor(i / 3) - 0.5) * 10;
    const ix = Math.floor(tx);
    const iz = Math.floor(tz);
    const baseY = surfaceYAt(world, ix + 1, iz + 1);
    for (let dx = 0; dx < 3; dx++) {
      for (let dz = 0; dz < 3; dz++) {
        set(world, ix + dx, baseY + 1, iz + dz, WOOD);
      }
    }
  }

  const jsx = wx - 38;
  const spawn = { x: jsx, y: surfaceYAt(world, jsx, wz) + 1, z: wz };
  return {
    world,
    spawn,
    spawnCharacterId: 'joshua',
    worldName: "Joshua at Jericho",
  };
}

/** Hebron / Canaan hills: vineyard rows and a giant grape cluster. */
function createCalebVineyard() {
  const world = new VoxelWorld();
  placeValley(world);

  for (let z = CZ + 18; z < CZ + 42; z += 3) {
    for (let x = 36; x < WORLD_SIZE - 36; x += 2) {
      const y = surfaceYAt(world, x, z) + 1;
      set(world, x, y, z, LEAF);
      set(world, x + 1, y, z, GOLD);
    }
  }

  const gx = CX + 18;
  const gz = CZ + 6;
  const gy = surfaceYAt(world, gx, gz) + 1;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      for (let dy = 0; dy < 4; dy++) {
        const core = dx === 0 && dz === 0 && dy < 3;
        set(world, gx + dx, gy + dy, gz + dz, core ? GOLD : LEAF);
      }
    }
  }

  {
    const px = CX - 36;
    const pz = CZ - 4;
    const py = surfaceYAt(world, px, pz);
    for (let dy = 1; dy <= 11; dy++) set(world, px, py + dy, pz, STONE);
  }

  const cx = CX - 10;
  const cz = CZ - 12;
  const spawn = { x: cx, y: surfaceYAt(world, cx, cz) + 1, z: cz };
  return {
    world,
    spawn,
    spawnCharacterId: 'caleb',
    worldName: "Caleb's Vineyard",
  };
}

/** Old save slot ids → canonical preset ids. */
export const WORLD_ID_ALIASES = {
  desert: 'moses',
  ark: 'noah',
};

/** @param {string} [worldId] */
export function resolveWorldId(worldId) {
  if (!worldId) return 'garden';
  return WORLD_ID_ALIASES[worldId] ?? worldId;
}

export const WORLD_PRESETS = [
  {
    id: 'garden',
    name: 'Garden of Eden',
    description: 'A lush world of trees, flowers, and a golden Tree of Knowledge.',
    create: createGardenOfEden,
  },
  {
    id: 'david',
    name: "David's Valley",
    description: 'Shepherd hills, a stream, five stones, and a towering Goliath.',
    create: createDavidsValley,
  },
  {
    id: 'moses',
    name: "Moses' Exodus",
    description: 'Rolling sand, a burning bush, and a path through parted waters.',
    create: createDesertOfExodus,
  },
  {
    id: 'noah',
    name: "Noah's Ark Dock",
    description: 'A wooden ark, animal pairs, and storm clouds over the water.',
    create: createNoahsArkDock,
  },
  {
    id: 'mary',
    name: "Mary's Nazareth",
    description: 'Terraced Galilean hills, a simple home, and olive trees.',
    create: createMaryNazareth,
  },
  {
    id: 'daniel',
    name: "Daniel's Babylon",
    description: 'Desert city sand, a ziggurat, and a lions’ den to explore.',
    create: createDanielBabylon,
  },
  {
    id: 'esther',
    name: "Esther's Palace",
    description: 'A golden great hall with pillars and a throne for the king.',
    create: createEstherPalace,
  },
  {
    id: 'jonah',
    name: "Jonah's Port",
    description: 'Beach, pier, and ship—then open sea under storm clouds.',
    create: createJonahPort,
  },
  {
    id: 'joshua',
    name: "Joshua at Jericho",
    description: 'Israelite camp inside a ring of walls with a gate gap.',
    create: createJoshuaJericho,
  },
  {
    id: 'caleb',
    name: "Caleb's Vineyard",
    description: 'Green hills with grape rows and a huge cluster of fruit.',
    create: createCalebVineyard,
  },
];

/** Default playable world for a Bible hero (for menus / tooling). */
export function getWorldIdForCharacter(characterId) {
  const id = String(characterId);
  if (WORLD_ID_ALIASES[id]) return WORLD_ID_ALIASES[id];
  const match = WORLD_PRESETS.find((w) => w.id === id);
  return match ? id : 'garden';
}

/** @param {string} worldId */
export function createBibleWorld(worldId) {
  const id = resolveWorldId(worldId);
  const preset = WORLD_PRESETS.find((w) => w.id === id) ?? WORLD_PRESETS[0];
  const result = preset.create();
  return { ...result, id: preset.id, name: preset.name, description: preset.description };
}

