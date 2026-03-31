import * as THREE from 'three';

/** Default day sky (matches renderer clear / CSS). */
export const SKY_BLUE = new THREE.Color(0x87ceeb);

/**
 * Fog distances tuned for 160×160 voxel presets: from world center, diagonal ~226.
 * Keep `near` above that so gameplay stays unfogged; `far` only softens the horizon.
 */
export const VOXEL_WORLD_FOG_NEAR = 220;
export const VOXEL_WORLD_FOG_FAR = 960;

/**
 * Reset fog span after any world/challenge/save load so every preset behaves the same.
 * Does not overwrite fog color (updateSky owns that each frame).
 * @param {THREE.Scene} scene
 */
export function syncVoxelWorldFog(scene) {
  if (!scene.fog || scene.fog.isFog !== true) {
    scene.fog = new THREE.Fog(
      SKY_BLUE.clone(),
      VOXEL_WORLD_FOG_NEAR,
      VOXEL_WORLD_FOG_FAR
    );
    return;
  }
  scene.fog.near = VOXEL_WORLD_FOG_NEAR;
  scene.fog.far = VOXEL_WORLD_FOG_FAR;
}
