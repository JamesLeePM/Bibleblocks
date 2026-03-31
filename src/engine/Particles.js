import * as THREE from 'three';

const GOLD = 0xffd54f;

function colorForBlockType(type) {
  const map = {
    1: 0xe8d5a8,
    2: 0x9e9e9e,
    3: 0x7a5545,
    4: 0x43a047,
    5: 0x1e88e5,
    6: 0xffc107,
    7: 0xbcaaa4,
    8: 0x5cb85c,
    9: 0x6d4c41,
    10: 0x757575,
    11: 0xa1887f,
    12: 0xb71c1c,
    13: 0xb3e5fc,
    14: 0xd7ccc8,
    15: 0xeceff1,
    16: 0xbcaaa4,
    17: 0x795548,
    18: 0x78909c,
    19: 0x90a4ae,
    20: 0x6d4c41,
    21: 0x8bc34a,
    22: 0xffca28,
  };
  return map[type] ?? GOLD;
}

export class Particles {
  constructor(scene) {
    this.scene = scene;
    /** @type {Array<{mesh:THREE.Mesh, vel:THREE.Vector3, life:number, age:number, gravity:number, spin:number}>} */
    this._particles = [];
    this._boxGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  }

  _spawnCube({ x, y, z, color, count = 8, speed = 2.0, life = 0.6 }) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.6,
        metalness: 0.0,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(this._boxGeo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.2 + 0.4,
        (Math.random() - 0.5) * 2
      ).normalize();
      const vel = dir.multiplyScalar(speed * (0.65 + Math.random() * 0.7));
      const gravity = -9.5;
      const spin = (Math.random() - 0.5) * 8;

      this.scene.add(mesh);
      this._particles.push({ mesh, vel, life, age: 0, gravity, spin });
    }
  }

  spawnBlockBreak(x, y, z, blockType) {
    const color = colorForBlockType(blockType);
    this._spawnCube({
      x: x + 0.5,
      y: y + 0.5,
      z: z + 0.5,
      color,
      count: 7 + Math.floor(Math.random() * 2),
      speed: 2.2,
      life: 0.75,
    });
  }

  spawnBlockPlace(x, y, z, blockType) {
    const color = colorForBlockType(blockType);
    this._spawnCube({
      x: x + 0.5,
      y: y + 0.5,
      z: z + 0.5,
      color,
      count: 5,
      speed: 1.3,
      life: 0.35,
    });
  }

  spawnCharacterStarBurst(x, y, z) {
    // Golden spark burst.
    for (let k = 0; k < 3; k++) {
      this._spawnCube({
        x: x + 0.5,
        y: y + 0.8,
        z: z + 0.5,
        color: GOLD,
        count: 10,
        speed: 3.0,
        life: 0.55,
      });
    }
  }

  /** Challenge completion — colorful confetti burst. */
  spawnConfetti(x, y, z) {
    const colors = [0xff5252, 0xffc107, 0x4caf50, 0x2196f3, 0xe040fb, 0xffd54f];
    for (let k = 0; k < 4; k++) {
      const color = colors[(Math.random() * colors.length) | 0];
      this._spawnCube({
        x: x + 0.5,
        y: y + 1.2,
        z: z + 0.5,
        color,
        count: 14,
        speed: 4.2,
        life: 1.1,
      });
    }
  }

  update(dt) {
    if (this._particles.length === 0) return;
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (p.mesh.material?.dispose) p.mesh.material.dispose();
        this._particles.splice(i, 1);
        continue;
      }
      p.vel.y += p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.y += p.spin * dt;
      const opacity = 1 - t;
      if (p.mesh.material && p.mesh.material.opacity != null) {
        p.mesh.material.opacity = opacity;
      }
    }
  }
}

