import { VoxelWorld, CHUNK_SIZE } from '../engine/VoxelWorld.js';

const SAVE_VERSION = 1;

function keyForSlot(slotIndex) {
  return `bibleblocks_save_slot_${slotIndex}`;
}

function serializeWorld(voxelWorld) {
  /** @type {Array<{key:string, packed:number[]}>} */
  const chunks = [];
  for (const [key, arr] of voxelWorld.chunks.entries()) {
    const packed = [];
    for (let idx = 0; idx < arr.length; idx++) {
      const type = arr[idx];
      if (!type) continue;
      // type fits in 4 bits; idx fits in 12 bits (0..4095)
      packed.push((type << 12) | idx);
    }
    chunks.push({ key, packed });
  }
  return { version: SAVE_VERSION, chunks };
}

function deserializeWorld(data) {
  const world = new VoxelWorld();
  if (!data?.chunks) return world;
  for (const c of data.chunks) {
    const [cx, cy, cz] = c.key.split(',').map(Number);
    for (const p of c.packed) {
      const type = p >> 12;
      const idx = p & 4095;
      const ly = Math.floor(idx / (CHUNK_SIZE * CHUNK_SIZE));
      const r = idx - ly * CHUNK_SIZE * CHUNK_SIZE;
      const lz = Math.floor(r / CHUNK_SIZE);
      const lx = r - lz * CHUNK_SIZE;
      const wx = cx * CHUNK_SIZE + lx;
      const wy = cy * CHUNK_SIZE + ly;
      const wz = cz * CHUNK_SIZE + lz;
      world.setBlock(wx, wy, wz, type);
    }
  }
  return world;
}

export class SaveManager {
  constructor(options = {}) {
    this._baseKey = options.baseKey ?? 'bibleblocks_save_slot';
    this._autoTimer = null;
    this._autoIntervalMs = 60_000;
    this._onSerialize = options.onSerialize ?? (() => ({}));
    this._onDeserialize = options.onDeserialize ?? (() => null);
  }

  getSlotInfo(slotIndex) {
    try {
      const raw = localStorage.getItem(keyForSlot(slotIndex));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        savedAt: parsed?.savedAt ?? null,
        meta: parsed?.meta ?? null,
      };
    } catch {
      return null;
    }
  }

  loadWorld(slotIndex) {
    try {
      const raw = localStorage.getItem(keyForSlot(slotIndex));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const world = deserializeWorld(parsed.world);
      return { world, meta: parsed.meta ?? null };
    } catch {
      return null;
    }
  }

  saveWorld(slotIndex, voxelWorld, meta = {}) {
    const worldData = serializeWorld(voxelWorld);
    const payload = { world: worldData, meta, savedAt: Date.now() };
    try {
      localStorage.setItem(keyForSlot(slotIndex), JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  startAutoSave(slotIndex, getWorld, getMeta) {
    this.stopAutoSave();
    this._autoTimer = window.setInterval(() => {
      try {
        const world = getWorld();
        const meta = getMeta ? getMeta() : {};
        this.saveWorld(slotIndex, world, meta);
      } catch {
        // ignore
      }
    }, this._autoIntervalMs);
  }

  stopAutoSave() {
    if (this._autoTimer) window.clearInterval(this._autoTimer);
    this._autoTimer = null;
  }
}

