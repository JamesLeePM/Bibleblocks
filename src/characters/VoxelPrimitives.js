import * as THREE from 'three';

/** One voxel unit in world space (head is 8 voxels wide). */
export const VOXEL = 1 / 16;

/**
 * @param {THREE.Group} parent
 * @param {number} x0 min corner voxel x
 * @param {number} y0
 * @param {number} z0
 * @param {number} w
 * @param {number} h
 * @param {number} d
 * @param {number} color hex
 * @param {object} [opts]
 */
export function addVoxelBox(parent, x0, y0, z0, w, h, d, color, opts = {}) {
  const geom = new THREE.BoxGeometry(w * VOXEL, h * VOXEL, d * VOXEL);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(
    (x0 + w / 2) * VOXEL,
    (y0 + h / 2) * VOXEL,
    (z0 + d / 2) * VOXEL
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * @param {THREE.Group} parent
 * @param {number} x center x in voxels
 * @param {number} y0 base y
 * @param {number} z center z
 * @param {number} radiusVoxels
 * @param {number} heightVoxels
 * @param {number} color
 */
export function addVoxelCylinder(
  parent,
  x,
  y0,
  z,
  radiusVoxels,
  heightVoxels,
  color
) {
  const r = radiusVoxels * VOXEL;
  const h = heightVoxels * VOXEL;
  const geom = new THREE.CylinderGeometry(r, r, h, 10);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x * VOXEL, (y0 + heightVoxels / 2) * VOXEL, z * VOXEL);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
