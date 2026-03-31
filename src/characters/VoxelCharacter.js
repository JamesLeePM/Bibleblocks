import * as THREE from 'three';

export { VOXEL, addVoxelBox, addVoxelCylinder } from './VoxelPrimitives.js';

/** Linear interpolation for manual animation (requestAnimationFrame). */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Humanoid: parts are separate groups. Manual math only (no skeletal or clip-based animation APIs).
 */
export class VoxelCharacter {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'VoxelCharacter';

    this.head = new THREE.Group();
    this.head.name = 'head';
    this.body = new THREE.Group();
    this.body.name = 'body';
    this.armL = new THREE.Group();
    this.armL.name = 'armL';
    this.armR = new THREE.Group();
    this.armR.name = 'armR';
    this.legL = new THREE.Group();
    this.legL.name = 'legL';
    this.legR = new THREE.Group();
    this.legR.name = 'legR';

    this.group.add(this.legL);
    this.group.add(this.legR);
    this.group.add(this.body);
    this.group.add(this.armL);
    this.group.add(this.armR);
    this.group.add(this.head);

    /** Rest Y for vertical bob (world space). */
    this._baseGroupY = null;
    this._idlePlaying = false;
    this._walking = false;
  }

  stopIdle() {
    this._idlePlaying = false;
    if (this._baseGroupY !== null) {
      this.group.position.y = this._baseGroupY;
    }
  }

  startIdleAnimation() {
    this._baseGroupY = this.group.position.y;
    this._idlePlaying = true;
  }

  /**
   * @param {boolean} on
   */
  setWalking(on) {
    this._walking = on;
    if (!on) {
      this.armL.rotation.x = 0;
      this.armR.rotation.x = 0;
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
    }
  }

  /**
   * Manual animation only. `time` is seconds (e.g. performance.now() / 1000).
   * Idle: vertical bob on the root group. Walk: limb swing from time.
   * @param {number} time
   */
  update(time) {
    if (this._walking) {
      if (this._baseGroupY !== null) {
        this.group.position.y = this._baseGroupY;
      }
      const p = time * 7;
      const swing = 0.42;
      this.armL.rotation.x = Math.sin(p) * swing;
      this.armR.rotation.x = -Math.sin(p) * swing;
      this.legL.rotation.x = -Math.sin(p) * swing;
      this.legR.rotation.x = Math.sin(p) * swing;
      return;
    }

    if (this._idlePlaying && this._baseGroupY !== null) {
      this.group.position.y = this._baseGroupY + Math.sin(time * 2) * 0.05;
    }
  }

  /**
   * @returns {THREE.Group}
   */
  getGroup() {
    return this.group;
  }

  /**
   * @returns {THREE.Group}
   */
  cloneGroup() {
    return this.group.clone(true);
  }
}
