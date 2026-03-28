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

function fillColumn(world, x, z, y0, y1, type) {
  for (let y = y0; y <= y1; y++) set(world, x, y, z, type);
}

function placeTree(world, x, z, trunkH = 6, canopyR = 2) {
  const baseY = 4;
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
  const baseY = 4;
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
  // East-west river: x axis direction, run across mid z.
  const y0 = 1;
  const y1 = 2;
  const midZ = CZ - 18;
  for (let x = 8; x < WORLD_SIZE - 8; x++) {
    for (let dz = -2; dz <= 2; dz++) {
      const z = midZ + dz;
      if (!inBoundsXY(x, z)) continue;
      set(world, x, y0, z, WATER);
      set(world, x, y1, z, WATER);
    }
  }
  // Cut a channel so water is exposed on top.
  for (let x = 8; x < WORLD_SIZE - 8; x++) {
    for (let dz = -2; dz <= 2; dz++) {
      const z = midZ + dz;
      for (let y = 3; y <= 4; y++) set(world, x, y, z, DIRT);
    }
  }
}

function placeFlowers(world) {
  // Single block flowers on grass: approximate colors with existing block types.
  const y = 4;
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
    set(world, x, y, z, flower);
  }
}

function createGardenOfEden() {
  const world = new VoxelWorld();
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      fillColumn(world, x, z, 0, 2, DIRT);
      set(world, x, 3, z, GRASS);
      set(world, x, 4, z, 0); // ensure no block on top (except trees/flowers)
    }
  }
  // Tall trees
  const treeCount = 18;
  for (let i = 0; i < treeCount; i++) {
    const x = 10 + Math.floor(Math.random() * (WORLD_SIZE - 20));
    const z = 10 + Math.floor(Math.random() * (WORLD_SIZE - 20));
    if (Math.abs(x - CX) + Math.abs(z - CZ) < 24) continue;
    placeTree(world, x, z, 6 + (i % 3), 2);
  }
  placeTreeOfKnowledge(world);
  placeFlowers(world);
  placeRiver(world);

  const spawn = { x: CX - 6, y: 4, z: CZ + 10 };
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
  const baseY = 4;
  for (let y = 1; y <= 3; y++) set(world, x, baseY + y, z, WOOD);
  for (let y = 4; y <= 8; y++) {
    set(world, x, baseY + y, z, GOLD);
    if (Math.random() < 0.7) set(world, x + 1, baseY + y - 1, z, LEAF);
    if (Math.random() < 0.7) set(world, x - 1, baseY + y - 1, z, LEAF);
  }
}

function placePartedSea(world) {
  // Two water walls with sand path in the middle.
  const seaZ0 = 30;
  const seaZ1 = WORLD_SIZE - 30;
  const midX = CX;
  const wallL = 22;
  const wallR = 22;
  const pathW = 6;
  const waterY0 = 3;
  const waterY1 = 4;

  for (let z = seaZ0; z <= seaZ1; z++) {
    for (let x = midX - pathW; x <= midX + pathW; x++) {
      // Sand path (clear water)
      for (let y = 0; y <= 5; y++) {
        if (x >= midX - pathW + 2 && x <= midX + pathW - 2) {
          set(world, x, y, z, SAND);
        } else {
          set(world, x, y, z, 0);
        }
      }
    }
    // Left wall
    for (let x = midX - pathW - wallL; x < midX - pathW; x++) {
      for (let y = waterY0; y <= waterY1; y++) set(world, x, y, z, WATER);
    }
    // Right wall
    for (let x = midX + pathW + 1; x <= midX + pathW + wallR; x++) {
      for (let y = waterY0; y <= waterY1; y++) set(world, x, y, z, WATER);
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
        for (let dy = 0; dy < h; dy++) {
          if (Math.random() < 0.25) continue;
          set(world, ox + dx, 4 + dy, oz + dz, STONE);
        }
      }
    }
  }

  placeBurningBush(world);
  placePartedSea(world);

  const spawn = { x: CX - 10, y: 5, z: CZ - 10 };
  return {
    world,
    spawn,
    spawnCharacterId: 'moses',
    worldName: 'Desert of Exodus',
  };
}

function placeArk(world) {
  // Centered at x=CX, z=CZ+10
  const ox = CX - 14;
  const oz = CZ + 10;
  const baseY = 4;
  const width = 12;
  const length = 18;
  const stories = 3;
  const storyH = 6;
  for (let s = 0; s < stories; s++) {
    const y0 = baseY + s * storyH;
    // Outer shell
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < length; z++) {
        const isEdge = x === 0 || x === width - 1 || z === 0 || z === length - 1;
        if (!isEdge && !(s === stories - 1 && (x === 3 || x === 8))) continue;
        set(world, ox + x, y0, oz + z, WOOD);
        set(world, ox + x, y0 + storyH - 1, oz + z, WOOD);
      }
    }
    // Floors
    for (let x = 2; x < width - 2; x++) {
      for (let z = 2; z < length - 2; z++) {
        set(world, ox + x, y0 + 1, oz + z, WOOD);
      }
    }
    // Simple openings (entrance on front)
    for (let y = y0; y <= y0 + storyH - 2; y++) {
      set(world, ox + Math.floor(width / 2), y, oz + 0, 0);
      set(world, ox + Math.floor(width / 2) + 1, y, oz + 0, 0);
    }
  }
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
  const baseY = 4;
  const ox = CX - 20;
  const oz = CZ + 18;

  // Elephant pair (grey-ish stone)
  const elephantX = [ox + 2, ox + 6];
  for (let i = 0; i < elephantX.length; i++) {
    const x = elephantX[i];
    for (let y = 0; y < 3; y++) {
      set(world, x, baseY + y, oz, STONE);
      set(world, x + 1, baseY + y, oz, STONE);
    }
  }

  // Giraffe pair (leaf/gold mix)
  const giraffeZ = [oz + 8, oz + 12];
  for (let i = 0; i < giraffeZ.length; i++) {
    const z = giraffeZ[i];
    for (let y = 0; y < 7; y++) set(world, ox + 10, baseY + y, z, LEAF);
    set(world, ox + 10, baseY + 8, z, GOLD);
  }

  // Dove pair (bread-ish)
  for (let i = 0; i < 2; i++) {
    const x = ox + 6 + i * 5;
    set(world, x, baseY + 1, oz + 4, BREAD);
    set(world, x + 1, baseY + 1, oz + 4, BREAD);
    set(world, x, baseY + 2, oz + 4, BREAD);
  }
}

function placeStormClouds(world) {
  // Dark grey blocks high in sky (use stone).
  const cloudCount = 18;
  for (let i = 0; i < cloudCount; i++) {
    const ox = 20 + Math.floor(Math.random() * (WORLD_SIZE - 40));
    const oz = 20 + Math.floor(Math.random() * (WORLD_SIZE - 40));
    const baseY = 18 + Math.floor(Math.random() * 8);
    const r = 3 + Math.floor(Math.random() * 3);
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > r + 1) continue;
        const y = baseY + Math.floor(Math.random() * 3);
        set(world, ox + dx, y, oz + dz, STONE);
      }
    }
  }
}

function createNoahsArkDock() {
  const world = new VoxelWorld();
  // Ocean base
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      set(world, x, 0, z, DIRT);
      set(world, x, 1, z, WATER);
      set(world, x, 2, z, WATER);
    }
  }
  placeArk(world);
  placeAnimals(world);
  placeStormClouds(world);

  const spawn = { x: CX - 5, y: 6, z: CZ + 26 };
  return { world, spawn, spawnCharacterId: 'noah', worldName: "Noah's Ark Dock" };
}

function placeValley(world) {
  // Grass valley with hills
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const hill = Math.floor(
        (1 + Math.cos((x - CX) / 24) + Math.cos((z - CZ) / 30)) * 1.2
      );
      const base = 2 + (hill > 4 ? 1 : 0);
      for (let y = 0; y <= base; y++) set(world, x, y, z, DIRT);
      set(world, x, base + 1, z, GRASS);
      set(world, x, base + 2, z, 0);
    }
  }
  // Stream down center (east-west isn't crucial; run along z axis)
  const streamX = CX;
  for (let z = 20; z < WORLD_SIZE - 20; z++) {
    for (let dx = -1; dx <= 1; dx++) {
      set(world, streamX + dx, 2, z, WATER);
      set(world, streamX + dx, 3, z, WATER);
    }
  }
  // Five stones (sphere-ish approximation)
  const stonesX = [CX - 16, CX - 8, CX, CX + 8, CX + 16];
  for (let i = 0; i < 5; i++) {
    const x = stonesX[i];
    const z = CZ + 14 + (i % 2) * 4;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (dx * dx + dz * dz > 4) continue;
        set(world, x + dx, 3, z + dz, STONE);
        set(world, x + dx, 4, z + dz, STONE);
      }
    }
  }
}

function placeGoliath(world) {
  // Extra tall grey armor made from stacked stone blocks.
  const x = CX + 34;
  const z = CZ;
  const baseY = 4;
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

  const spawn = { x: CX - 26, y: 5, z: CZ + 6 };
  return {
    world,
    spawn,
    spawnCharacterId: 'david',
    worldName: "David's Valley",
  };
}

export const WORLD_PRESETS = [
  {
    id: 'garden',
    name: 'Garden of Eden',
    description: 'A lush world of trees, flowers, and a golden Tree of Knowledge.',
    create: createGardenOfEden,
  },
  {
    id: 'desert',
    name: 'Desert of Exodus',
    description: 'Rolling sand, a burning bush, and a parted-sea path.',
    create: createDesertOfExodus,
  },
  {
    id: 'ark',
    name: "Noah's Ark Dock",
    description: "A wooden ark, animal friends, and storm clouds overhead.",
    create: createNoahsArkDock,
  },
  {
    id: 'david',
    name: "David's Valley",
    description: 'A grassy valley with a stream, stones, and a towering Goliath.',
    create: createDavidsValley,
  },
];

/** @param {string} worldId */
export function createBibleWorld(worldId) {
  const preset = WORLD_PRESETS.find((w) => w.id === worldId) ?? WORLD_PRESETS[0];
  const result = preset.create();
  return { ...result, id: preset.id, name: preset.name, description: preset.description };
}

