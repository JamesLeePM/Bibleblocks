import * as THREE from 'three';
import { CHUNK_SIZE } from './VoxelWorld.js';
import { getUVRectForBlock } from '../assets/TextureAtlas.js';

const AIR = 0;

/** @param {import('./VoxelWorld.js').VoxelWorld} world */
function blockAt(world, wx, wy, wz) {
  return world.getBlock(wx, wy, wz);
}

function isSolid(type) {
  return type !== AIR;
}

function isTransparentType(type) {
  return type === 5;
}

function createGeoBuffers() {
  return {
    positions: [],
    normals: [],
    uvs: [],
    indices: [],
  };
}

/**
 * mask[i][j]: block type or 0. Width grows along +j, height along +i.
 * @param {number[][]} mask
 * @param {(i:number, j:number, w:number, h:number, type:number) => void} emit
 */
function greedyMerge2D(mask, emit) {
  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      const t = mask[i][j];
      if (t === 0) continue;

      let w = 1;
      while (j + w < CHUNK_SIZE && mask[i][j + w] === t) {
        w++;
      }

      let h = 1;
      let ok = true;
      while (ok && i + h < CHUNK_SIZE) {
        for (let k = 0; k < w; k++) {
          if (mask[i + h][j + k] !== t) {
            ok = false;
            break;
          }
        }
        if (ok) h++;
      }

      emit(i, j, w, h, t);

      for (let hh = 0; hh < h; hh++) {
        for (let ww = 0; ww < w; ww++) {
          mask[i + hh][j + ww] = 0;
        }
      }
    }
  }
}

/**
 * @param {number} type
 * @param {number} repU
 * @param {number} repV
 */
function cornerUVs(type, repU, repV) {
  const { u0, v0, u1, v1 } = getUVRectForBlock(type);
  const du = u1 - u0;
  const dv = v1 - v0;
  return {
    ua: u0,
    ub: u0 + repU * du,
    va: v0,
    vb: v0 + repV * dv,
  };
}

/**
 * @param {ReturnType<createGeoBuffers>} geo
 */
function pushQuad(
  geo,
  x0,
  y0,
  z0,
  x1,
  y1,
  z1,
  x2,
  y2,
  z2,
  x3,
  y3,
  z3,
  uv00,
  uv10,
  uv11,
  uv01,
  nx,
  ny,
  nz
) {
  const base = geo.positions.length / 3;
  const pushVert = (x, y, z, u, v) => {
    geo.positions.push(x, y, z);
    geo.normals.push(nx, ny, nz);
    geo.uvs.push(u, v);
  };

  pushVert(x0, y0, z0, uv00.u, uv00.v);
  pushVert(x1, y1, z1, uv10.u, uv10.v);
  pushVert(x2, y2, z2, uv11.u, uv11.v);
  pushVert(x3, y3, z3, uv01.u, uv01.v);

  geo.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

/**
 * @param {import('./VoxelWorld.js').VoxelWorld} world
 * @param {number} cx
 * @param {number} cy
 * @param {number} cz
 * @param {ReturnType<createGeoBuffers>} opaque
 * @param {ReturnType<createGeoBuffers>} transparent
 */
function meshChunkInternal(world, cx, cy, cz, opaque, transparent) {
  const baseX = cx * CHUNK_SIZE;
  const baseY = cy * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;

  const mask = Array.from({ length: CHUNK_SIZE }, () =>
    new Array(CHUNK_SIZE).fill(0)
  );

  function targetGeo(type) {
    return isTransparentType(type) ? transparent : opaque;
  }

  // +X faces (normal +X), one slice per lx
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let a = 0; a < CHUNK_SIZE; a++) {
      for (let b = 0; b < CHUNK_SIZE; b++) {
        mask[a][b] = 0;
      }
    }
    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const t = blockAt(world, wx, wy, wz);
        if (!isSolid(t)) continue;
        if (isSolid(blockAt(world, wx + 1, wy, wz))) continue;
        mask[ly][lz] = t;
      }
    }
    greedyMerge2D(mask, (ly, lz, w, h, type) => {
      const g = targetGeo(type);
      const wy0 = baseY + ly;
      const wz0 = baseZ + lz;
      const wy1 = wy0 + h;
      const wz1 = wz0 + w;
      const x = baseX + lx + 1;
      const uv = cornerUVs(type, w, h);
      pushQuad(
        g,
        x,
        wy0,
        wz0,
        x,
        wy1,
        wz0,
        x,
        wy1,
        wz1,
        x,
        wy0,
        wz1,
        { u: uv.ua, v: uv.va },
        { u: uv.ub, v: uv.va },
        { u: uv.ub, v: uv.vb },
        { u: uv.ua, v: uv.vb },
        1,
        0,
        0
      );
    });
  }

  // -X
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let a = 0; a < CHUNK_SIZE; a++) {
      for (let b = 0; b < CHUNK_SIZE; b++) {
        mask[a][b] = 0;
      }
    }
    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const t = blockAt(world, wx, wy, wz);
        if (!isSolid(t)) continue;
        if (isSolid(blockAt(world, wx - 1, wy, wz))) continue;
        mask[ly][lz] = t;
      }
    }
    greedyMerge2D(mask, (ly, lz, w, h, type) => {
      const g = targetGeo(type);
      const wy0 = baseY + ly;
      const wz0 = baseZ + lz;
      const wy1 = wy0 + h;
      const wz1 = wz0 + w;
      const x = baseX + lx;
      const uv = cornerUVs(type, w, h);
      pushQuad(
        g,
        x,
        wy0,
        wz1,
        x,
        wy1,
        wz1,
        x,
        wy1,
        wz0,
        x,
        wy0,
        wz0,
        { u: uv.ua, v: uv.vb },
        { u: uv.ub, v: uv.vb },
        { u: uv.ub, v: uv.va },
        { u: uv.ua, v: uv.va },
        -1,
        0,
        0
      );
    });
  }

  // +Y
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let a = 0; a < CHUNK_SIZE; a++) {
      for (let b = 0; b < CHUNK_SIZE; b++) {
        mask[a][b] = 0;
      }
    }
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const t = blockAt(world, wx, wy, wz);
        if (!isSolid(t)) continue;
        if (isSolid(blockAt(world, wx, wy + 1, wz))) continue;
        mask[lx][lz] = t;
      }
    }
    greedyMerge2D(mask, (lx, lz, w, h, type) => {
      const g = targetGeo(type);
      const wx0 = baseX + lx;
      const wz0 = baseZ + lz;
      const wx1 = wx0 + w;
      const wz1 = wz0 + h;
      const y = baseY + ly + 1;
      const uv = cornerUVs(type, w, h);
      pushQuad(
        g,
        wx0,
        y,
        wz0,
        wx1,
        y,
        wz0,
        wx1,
        y,
        wz1,
        wx0,
        y,
        wz1,
        { u: uv.ua, v: uv.va },
        { u: uv.ub, v: uv.va },
        { u: uv.ub, v: uv.vb },
        { u: uv.ua, v: uv.vb },
        0,
        1,
        0
      );
    });
  }

  // -Y
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let a = 0; a < CHUNK_SIZE; a++) {
      for (let b = 0; b < CHUNK_SIZE; b++) {
        mask[a][b] = 0;
      }
    }
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const t = blockAt(world, wx, wy, wz);
        if (!isSolid(t)) continue;
        if (isSolid(blockAt(world, wx, wy - 1, wz))) continue;
        mask[lx][lz] = t;
      }
    }
    greedyMerge2D(mask, (lx, lz, w, h, type) => {
      const g = targetGeo(type);
      const wx0 = baseX + lx;
      const wz0 = baseZ + lz;
      const wx1 = wx0 + w;
      const wz1 = wz0 + h;
      const y = baseY + ly;
      const uv = cornerUVs(type, w, h);
      pushQuad(
        g,
        wx0,
        y,
        wz1,
        wx1,
        y,
        wz1,
        wx1,
        y,
        wz0,
        wx0,
        y,
        wz0,
        { u: uv.ua, v: uv.vb },
        { u: uv.ub, v: uv.vb },
        { u: uv.ub, v: uv.va },
        { u: uv.ua, v: uv.va },
        0,
        -1,
        0
      );
    });
  }

  // +Z
  for (let lz = 0; lz < CHUNK_SIZE; lz++) {
    for (let a = 0; a < CHUNK_SIZE; a++) {
      for (let b = 0; b < CHUNK_SIZE; b++) {
        mask[a][b] = 0;
      }
    }
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let ly = 0; ly < CHUNK_SIZE; ly++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const t = blockAt(world, wx, wy, wz);
        if (!isSolid(t)) continue;
        if (isSolid(blockAt(world, wx, wy, wz + 1))) continue;
        mask[lx][ly] = t;
      }
    }
    greedyMerge2D(mask, (lx, ly, w, h, type) => {
      const g = targetGeo(type);
      const wx0 = baseX + lx;
      const wy0 = baseY + ly;
      const wx1 = wx0 + w;
      const wy1 = wy0 + h;
      const z = baseZ + lz + 1;
      const uv = cornerUVs(type, w, h);
      pushQuad(
        g,
        wx0,
        wy0,
        z,
        wx1,
        wy0,
        z,
        wx1,
        wy1,
        z,
        wx0,
        wy1,
        z,
        { u: uv.ua, v: uv.va },
        { u: uv.ub, v: uv.va },
        { u: uv.ub, v: uv.vb },
        { u: uv.ua, v: uv.vb },
        0,
        0,
        1
      );
    });
  }

  // -Z
  for (let lz = 0; lz < CHUNK_SIZE; lz++) {
    for (let a = 0; a < CHUNK_SIZE; a++) {
      for (let b = 0; b < CHUNK_SIZE; b++) {
        mask[a][b] = 0;
      }
    }
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let ly = 0; ly < CHUNK_SIZE; ly++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const t = blockAt(world, wx, wy, wz);
        if (!isSolid(t)) continue;
        if (isSolid(blockAt(world, wx, wy, wz - 1))) continue;
        mask[lx][ly] = t;
      }
    }
    greedyMerge2D(mask, (lx, ly, w, h, type) => {
      const g = targetGeo(type);
      const wx0 = baseX + lx;
      const wy0 = baseY + ly;
      const wx1 = wx0 + w;
      const wy1 = wy0 + h;
      const z = baseZ + lz;
      const uv = cornerUVs(type, w, h);
      pushQuad(
        g,
        wx0,
        wy1,
        z,
        wx1,
        wy1,
        z,
        wx1,
        wy0,
        z,
        wx0,
        wy0,
        z,
        { u: uv.ua, v: uv.vb },
        { u: uv.ub, v: uv.vb },
        { u: uv.ub, v: uv.va },
        { u: uv.ua, v: uv.va },
        0,
        0,
        -1
      );
    });
  }
}

function geoToBufferGeometry(geo) {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(new Float32Array(geo.positions), 3)
  );
  g.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(new Float32Array(geo.normals), 3)
  );
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.uvs), 2));
  g.setIndex(geo.indices);
  g.computeBoundingSphere();
  return g;
}

/**
 * @param {import('./VoxelWorld.js').VoxelWorld} world
 * @param {number} cx
 * @param {number} cy
 * @param {number} cz
 * @param {THREE.Texture} atlasTexture
 * @returns {THREE.Group}
 */
export function meshChunk(world, cx, cy, cz, atlasTexture) {
  const opaque = createGeoBuffers();
  const transparent = createGeoBuffers();
  meshChunkInternal(world, cx, cy, cz, opaque, transparent);

  const group = new THREE.Group();
  group.name = `chunk_${cx}_${cy}_${cz}`;

  const opaqueMat = new THREE.MeshStandardMaterial({
    map: atlasTexture,
    roughness: 0.92,
    metalness: 0.05,
    side: THREE.FrontSide,
  });

  const transMat = new THREE.MeshStandardMaterial({
    map: atlasTexture,
    roughness: 0.85,
    metalness: 0.05,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  if (opaque.positions.length > 0) {
    const mesh = new THREE.Mesh(geoToBufferGeometry(opaque), opaqueMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  if (transparent.positions.length > 0) {
    const mesh = new THREE.Mesh(geoToBufferGeometry(transparent), transMat);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}

/**
 * @param {import('./VoxelWorld.js').VoxelWorld} world
 * @param {THREE.Texture} atlasTexture
 * @returns {THREE.Group}
 */
export function meshWorld(world, atlasTexture) {
  const root = new THREE.Group();
  root.name = 'voxel_world';

  for (const key of world.chunks.keys()) {
    const [cx, cy, cz] = key.split(',').map(Number);
    const chunkGroup = meshChunk(world, cx, cy, cz, atlasTexture);
    if (chunkGroup.children.length > 0) root.add(chunkGroup);
  }

  return root;
}
