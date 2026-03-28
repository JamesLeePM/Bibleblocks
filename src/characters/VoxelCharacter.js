import * as THREE from 'three';
import { Tween, Easing, update as tweenUpdate } from '@tweenjs/tween.js';

export { VOXEL, addVoxelBox, addVoxelCylinder } from './VoxelPrimitives.js';

/**
 * Humanoid: parts are separate groups for animation.
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

    /** @type {import('@tweenjs/tween.js').Tween<{ bob: number }> | null} */
    this._idleTween = null;
    this._idleHeadY = 0;
    this._idleBob = { bob: 0 };

    this._walking = false;
    this._walkPhase = 0;
  }

  stopIdle() {
    if (!this._idleTween) return;
    this._idleTween.stop();
    this._idleTween = null;
    this.head.position.y = this._idleHeadY;
  }

  /**
   * @param {number} [timeMs]
   */
  startIdleAnimation(timeMs = performance.now()) {
    this.stopIdle();
    this._idleHeadY = this.head.position.y;
    this._idleBob.bob = 0;
    this._idleTween = new Tween(this._idleBob, true)
      .to({ bob: 1 }, 850)
      .yoyo(true)
      .repeat(Infinity)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        this.head.position.y = this._idleHeadY + this._idleBob.bob * 0.035;
      })
      .start(timeMs);
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
   * @param {number} timeMs
   */
  stepWalk(timeMs) {
    if (!this._walking) return;
    this._walkPhase = timeMs * 0.007;
    const swing = 0.42;
    const p = this._walkPhase;
    this.armL.rotation.x = Math.sin(p) * swing;
    this.armR.rotation.x = -Math.sin(p) * swing;
    this.legL.rotation.x = -Math.sin(p) * swing;
    this.legR.rotation.x = Math.sin(p) * swing;
  }

  /**
   * @param {number} timeMs
   */
  static updateTweens(timeMs) {
    tweenUpdate(timeMs);
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
