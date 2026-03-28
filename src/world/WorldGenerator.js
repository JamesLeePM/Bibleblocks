import { VoxelWorld, CHUNK_SIZE } from '../engine/VoxelWorld.js';
import { meshWorld } from '../engine/ChunkMesher.js';

/** Horizontal extent: 10×10 chunks (160×160 blocks). */
export const WORLD_CHUNKS_X = 10;
export const WORLD_CHUNKS_Z = 10;

const GRASS = 8;
const SAND = 1;
const STONE = 2;
const WOOD = 3;
const LEAF = 4;

/**
 * @param {VoxelWorld} world
 * @param {number} wx
 * @param {number} wy
 * @param {number} wz
 * @param {number} type
 */
function set(world, wx, wy, wz, type) {
  world.setBlock(wx, wy, wz, type);
}

/**
 * Flat grass columns (several blocks deep) across the whole area.
 * @param {VoxelWorld} world
 */
function fillFlatGrass(world) {
  for (let cx = 0; cx < WORLD_CHUNKS_X; cx++) {
    for (let cz = 0; cz < WORLD_CHUNKS_Z; cz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const wx = cx * CHUNK_SIZE + lx;
          const wz = cz * CHUNK_SIZE + lz;
          for (let y = 0; y < 4; y++) {
            set(world, wx, y, wz, GRASS);
          }
        }
      }
    }
  }
}

/**
 * @param {VoxelWorld} world
 */
function fillDesert(world) {
  for (let cx = 0; cx < WORLD_CHUNKS_X; cx++) {
    for (let cz = 0; cz < WORLD_CHUNKS_Z; cz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const wx = cx * CHUNK_SIZE + lx;
          const wz = cz * CHUNK_SIZE + lz;
          for (let y = 0; y < 3; y++) {
            set(world, wx, y, wz, SAND);
          }
        }
      }
    }
  }

  const formations = 18;
  for (let i = 0; i < formations; i++) {
    const ox = Math.floor(
      Math.random() * (WORLD_CHUNKS_X * CHUNK_SIZE - 6)
    );
    const oz = Math.floor(
      Math.random() * (WORLD_CHUNKS_Z * CHUNK_SIZE - 6)
    );
    const h = 2 + Math.floor(Math.random() * 4);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        for (let dz = 0; dz < 4; dz++) {
          if (Math.random() > 0.15) {
            set(world, ox + dx, 3 + dy, oz + dz, STONE);
          }
        }
      }
    }
  }
}

/**
 * @param {VoxelWorld} world
 * @param {number} wx
 * @param {number} wz
 */
function placeTree(world, wx, wz) {
  const groundTop = 3;
  for (let y = 1; y <= 4; y++) {
    set(world, wx, groundTop + y, wz, WOOD);
  }
  const ly = groundTop + 5;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dz === 0) {
        set(world, wx, ly, wz, LEAF);
      } else if (Math.abs(dx) + Math.abs(dz) === 1) {
        set(world, wx + dx, ly, wz + dz, LEAF);
      }
    }
  }
  set(world, wx, ly + 1, wz, LEAF);
}

/**
 * @param {VoxelWorld} world
 */
function fillGarden(world) {
  fillFlatGrass(world);

  const trees = 42;
  for (let t = 0; t < trees; t++) {
    const wx =
      4 +
      Math.floor(Math.random() * (WORLD_CHUNKS_X * CHUNK_SIZE - 8));
    const wz =
      4 +
      Math.floor(Math.random() * (WORLD_CHUNKS_Z * CHUNK_SIZE - 8));
    placeTree(world, wx, wz);
  }
}

/**
 * @param {'flat' | 'desert' | 'garden'} biome
 * @returns {VoxelWorld}
 */
export function generateVoxelWorld(biome = 'flat') {
  const world = new VoxelWorld();
  if (biome === 'desert') {
    fillDesert(world);
  } else if (biome === 'garden') {
    fillGarden(world);
  } else {
    fillFlatGrass(world);
  }
  return world;
}

/**
 * @param {VoxelWorld} world
 * @param {import('three').Texture} atlasTexture
 * @returns {import('three').Group}
 */
export function buildWorldMesh(world, atlasTexture) {
  return meshWorld(world, atlasTexture);
}
