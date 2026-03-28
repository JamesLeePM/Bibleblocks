export const CHUNK_SIZE = 16;

function chunkKey(cx, cy, cz) {
  return `${cx},${cy},${cz}`;
}

function floorDiv(a, b) {
  return Math.floor(a / b);
}

/** Local coords within chunk [0, CHUNK_SIZE) */
export function worldToChunk(wx, wy, wz) {
  return {
    cx: floorDiv(wx, CHUNK_SIZE),
    cy: floorDiv(wy, CHUNK_SIZE),
    cz: floorDiv(wz, CHUNK_SIZE),
  };
}

export function worldToLocal(wx, wy, wz) {
  const { cx, cy, cz } = worldToChunk(wx, wy, wz);
  const lx = wx - cx * CHUNK_SIZE;
  const ly = wy - cy * CHUNK_SIZE;
  const lz = wz - cz * CHUNK_SIZE;
  return { cx, cy, cz, lx, ly, lz };
}

function localIndex(lx, ly, lz) {
  return lx + lz * CHUNK_SIZE + ly * CHUNK_SIZE * CHUNK_SIZE;
}

export class VoxelWorld {
  constructor() {
    /** @type {Map<string, Uint8Array>} */
    this.chunks = new Map();
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} cz
   * @returns {Uint8Array | undefined}
   */
  getChunk(cx, cy, cz) {
    return this.chunks.get(chunkKey(cx, cy, cz));
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} cz
   * @returns {Uint8Array}
   */
  getOrCreateChunk(cx, cy, cz) {
    const key = chunkKey(cx, cy, cz);
    let data = this.chunks.get(key);
    if (!data) {
      data = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
      this.chunks.set(key, data);
    }
    return data;
  }

  /**
   * @param {number} wx
   * @param {number} wy
   * @param {number} wz
   * @returns {number} block type, 0 = air
   */
  getBlock(wx, wy, wz) {
    const { cx, cy, cz, lx, ly, lz } = worldToLocal(wx, wy, wz);
    if (
      lx < 0 ||
      ly < 0 ||
      lz < 0 ||
      lx >= CHUNK_SIZE ||
      ly >= CHUNK_SIZE ||
      lz >= CHUNK_SIZE
    ) {
      return 0;
    }
    const chunk = this.getChunk(cx, cy, cz);
    if (!chunk) return 0;
    return chunk[localIndex(lx, ly, lz)];
  }

  /**
   * @param {number} wx
   * @param {number} wy
   * @param {number} wz
   * @param {number} type
   */
  setBlock(wx, wy, wz, type) {
    const { cx, cy, cz, lx, ly, lz } = worldToLocal(wx, wy, wz);
    if (
      lx < 0 ||
      ly < 0 ||
      lz < 0 ||
      lx >= CHUNK_SIZE ||
      ly >= CHUNK_SIZE ||
      lz >= CHUNK_SIZE
    ) {
      return;
    }
    const chunk = this.getOrCreateChunk(cx, cy, cz);
    chunk[localIndex(lx, ly, lz)] = type;
  }
}
