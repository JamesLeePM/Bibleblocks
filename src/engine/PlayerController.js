import * as THREE from 'three';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function isSolidVoxelForCollision(type) {
  // Treat water as non-solid so kids can move through it (later we'll add buoyancy).
  return type !== 0 && type !== 5;
}

function getRayDirectionFromYawPitch(yaw, pitch) {
  const cp = Math.cos(pitch);
  return new THREE.Vector3(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp);
}

/**
 * 3D DDA raycast through voxel grid.
 * @param {import('./VoxelWorld.js').VoxelWorld} world
 * @param {THREE.Vector3} origin
 * @param {THREE.Vector3} dir - normalized
 * @param {number} maxDist
 * @returns {{x:number,y:number,z:number,face:{x:number,y:number,z:number},distance:number} | null}
 */
function raycastVoxel(world, origin, dir, maxDist) {
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);

  const stepX = dir.x > 0 ? 1 : -1;
  const stepY = dir.y > 0 ? 1 : -1;
  const stepZ = dir.z > 0 ? 1 : -1;

  const invX = dir.x !== 0 ? 1 / dir.x : 0;
  const invY = dir.y !== 0 ? 1 / dir.y : 0;
  const invZ = dir.z !== 0 ? 1 / dir.z : 0;

  const tDeltaX = dir.x !== 0 ? Math.abs(invX) : Infinity;
  const tDeltaY = dir.y !== 0 ? Math.abs(invY) : Infinity;
  const tDeltaZ = dir.z !== 0 ? Math.abs(invZ) : Infinity;

  let tMaxX;
  let tMaxY;
  let tMaxZ;

  if (dir.x > 0) tMaxX = (x + 1 - origin.x) * invX;
  else if (dir.x < 0) tMaxX = (origin.x - x) * -invX;
  else tMaxX = Infinity;

  if (dir.y > 0) tMaxY = (y + 1 - origin.y) * invY;
  else if (dir.y < 0) tMaxY = (origin.y - y) * -invY;
  else tMaxY = Infinity;

  if (dir.z > 0) tMaxZ = (z + 1 - origin.z) * invZ;
  else if (dir.z < 0) tMaxZ = (origin.z - z) * -invZ;
  else tMaxZ = Infinity;

  // Initial face normal for the first checked voxel (heuristic).
  const ax = Math.abs(dir.x);
  const ay = Math.abs(dir.y);
  const az = Math.abs(dir.z);
  let face = { x: 0, y: 0, z: 0 };
  if (ax >= ay && ax >= az) face.x = dir.x > 0 ? -1 : 1;
  else if (ay >= ax && ay >= az) face.y = dir.y > 0 ? -1 : 1;
  else face.z = dir.z > 0 ? -1 : 1;

  let dist = 0;
  while (dist <= maxDist) {
    const type = world.getBlock(x, y, z);
    if (type !== 0) {
      return { x, y, z, face: { ...face }, distance: dist };
    }

    if (tMaxX < tMaxY) {
      if (tMaxX < tMaxZ) {
        x += stepX;
        dist = tMaxX;
        tMaxX += tDeltaX;
        face = { x: -stepX, y: 0, z: 0 };
      } else {
        z += stepZ;
        dist = tMaxZ;
        tMaxZ += tDeltaZ;
        face = { x: 0, y: 0, z: -stepZ };
      }
    } else {
      if (tMaxY < tMaxZ) {
        y += stepY;
        dist = tMaxY;
        tMaxY += tDeltaY;
        face = { x: 0, y: -stepY, z: 0 };
      } else {
        z += stepZ;
        dist = tMaxZ;
        tMaxZ += tDeltaZ;
        face = { x: 0, y: 0, z: -stepZ };
      }
    }
  }

  return null;
}

export class PlayerController {
  /**
   * @param {object} opts
   * @param {HTMLCanvasElement} opts.canvas
   * @param {THREE.PerspectiveCamera} opts.camera
   * @param {import('./VoxelWorld.js').VoxelWorld} opts.world
   * @param {THREE.Scene} opts.scene
 * @param {() => number} opts.getSelectedBlockType
 * @param {(x:number,y:number,z:number,type:number) => void} opts.placeBlockAt
 * @param {(x:number,y:number,z:number) => void} opts.breakBlockAt
 * @param {{ x:number, y:number, z:number }} opts.spawn
 * @param {() => boolean} [opts.isCreative]
 * @param {(type:number) => number} [opts.getBreakTimeSeconds]
 */
  constructor(opts) {
    this.canvas = opts.canvas;
    this.camera = opts.camera;
    this.world = opts.world;
    this.scene = opts.scene;
    this.getSelectedBlockType = opts.getSelectedBlockType;
    this.placeBlockAt = opts.placeBlockAt;
    this.breakBlockAt = opts.breakBlockAt;
    this.isCreative = opts.isCreative ?? (() => true);
    this.getBreakTimeSeconds = opts.getBreakTimeSeconds ?? (() => 0.25);

    this.pos = new THREE.Vector3(opts.spawn.x, opts.spawn.y, opts.spawn.z); // feet position

    // View angles
    this.yaw = 0;
    this.pitch = 0;
    this.pointerLocked = false;
    this.paused = false;

    // Movement tuning (Minecraft-ish)
    this.walkSpeed = 5;
    this.runSpeed = 8;
    this.flySpeed = 12;
    this.gravity = -20;
    this.jumpVel = 8;
    this.sneakSpeedFactor = 0.35;

    this.radius = 0.35;
    this.heightStand = 1.7;
    this.heightCrouch = 1.25;

    this.flyMode = false;
    this.crouching = false;

    this.vel = new THREE.Vector3(0, 0, 0);
    this.onGround = false;

    this.keys = new Set();
    this.jumpPressed = false;
    /** Mobile / tablet: movement stick (-1..1), x = strafe, y = forward. */
    this._touchAxes = new THREE.Vector2(0, 0);
    this._touchJumpPressed = false;
    this._touchGameplayActive = false;

    this.maxInteractDist = 8;
    this.raycastHit = null;

    this.breakCooldownMs = 140;
    this.placeCooldownMs = 140;
    this._lastBreakAt = 0;
    this._lastPlaceAt = 0;

    /** @type {{ x:number,y:number,z:number,type:number } | null} */
    this._miningAt = null;
    this._miningProgress = 0;
    this._breakHeld = false;

    this._mouseLookSensitivity = 0.0022;
    this._touchLookSensitivity = 0.0032;
    /** Canvas touch look (iOS has no pointer lock; deltas applied in update). */
    this._touchLookStartX = 0;
    this._touchLookStartY = 0;
    this._touchCanvasAccX = 0;
    this._touchCanvasAccY = 0;
    this._canvasTouchLookId = null;
    this._touchDevice =
      typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
    this._raycastTarget = { x: 0, y: 0, z: 0 };

    this._onJump = opts.onJump ?? (() => {});
    this._onWalkTick = opts.onWalkTick ?? (() => {});
    this._nextWalkTickAt = 0;

    const hl = this._createHighlightMesh();
    this._highlight = hl.line;
    this._highlightMat = hl.mat;
    this.scene.add(this._highlight);

    this._bindEvents();
    this._syncCameraPose(0, false);
  }

  _createHighlightMesh() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(geo);
    const mat = new THREE.LineBasicMaterial({
      color: 0x7cff6b,
      transparent: true,
      opacity: 0.88,
    });
    const line = new THREE.LineSegments(edges, mat);
    line.visible = false;
    return { line, mat };
  }

  /** Touch / mouse: hold to mine in survival. */
  setBreakHeld(v) {
    this._breakHeld = !!v;
    if (!this._breakHeld) {
      this._miningAt = null;
      this._miningProgress = 0;
      if (this._highlightMat) this._highlightMat.color.setHex(0x7cff6b);
    }
  }

  _bindEvents() {
    // Pointer lock — desktop only (iOS WebKit has no usable pointer lock API).
    this.canvas.addEventListener('click', async () => {
      if (this._touchDevice) return;
      if (this.pointerLocked) return;
      if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (!this.pointerLocked) {
        this._highlight.visible = false;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * this._mouseLookSensitivity;
      this.pitch -= e.movementY * this._mouseLookSensitivity;
      this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
    });

    // Virtual look on canvas for touch / iOS (no Pointer Lock).
    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        if (!this._touchGameplayActive || e.touches.length !== 1) return;
        const t = e.touches[0];
        this._canvasTouchLookId = t.identifier;
        this._touchLookStartX = t.clientX;
        this._touchLookStartY = t.clientY;
      },
      { passive: true }
    );
    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        if (!this._touchGameplayActive || this._canvasTouchLookId == null) return;
        const t = Array.from(e.touches).find(
          (x) => x.identifier === this._canvasTouchLookId
        );
        if (!t) return;
        e.preventDefault();
        const dx = t.clientX - this._touchLookStartX;
        const dy = t.clientY - this._touchLookStartY;
        this._touchLookStartX = t.clientX;
        this._touchLookStartY = t.clientY;
        this._touchCanvasAccX += dx;
        this._touchCanvasAccY += dy;
      },
      { passive: false }
    );
    const endCanvasTouchLook = (e) => {
      if (
        this._canvasTouchLookId == null ||
        ![...e.changedTouches].some((c) => c.identifier === this._canvasTouchLookId)
      ) {
        return;
      }
      this._canvasTouchLookId = null;
      this._touchCanvasAccX = 0;
      this._touchCanvasAccY = 0;
    };
    this.canvas.addEventListener('touchend', endCanvasTouchLook);
    this.canvas.addEventListener('touchcancel', endCanvasTouchLook);

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.code) this.keys.add(e.code);
      if (e.key === ' ' || e.code === 'Space') this.jumpPressed = true;

      if (!e.repeat && (e.key === 'f' || e.key === 'F')) {
        this.flyMode = !this.flyMode;
        if (this.flyMode) {
          this.onGround = false;
          this.vel.y = 0;
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code) this.keys.delete(e.code);
      if (e.code === 'Space') this.jumpPressed = false;
    });

    // Mouse buttons (break/place)
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.pointerLocked || this._touchDevice) return;

      const now = performance.now();
      if (e.button === 0) {
        if (this.isCreative()) {
          if (!this.raycastHit) return;
          if (now - this._lastBreakAt < this.breakCooldownMs) return;
          this._lastBreakAt = now;
          this.breakBlockAt(this.raycastHit.x, this.raycastHit.y, this.raycastHit.z);
        } else {
          this.setBreakHeld(true);
        }
      } else if (e.button === 2) {
        if (!this.raycastHit) return;
        if (now - this._lastPlaceAt < this.placeCooldownMs) return;
        this._lastPlaceAt = now;
        const sel = this.getSelectedBlockType();
        const f = this.raycastHit.face;
        const ax = this.raycastHit.x + f.x;
        const ay = this.raycastHit.y + f.y;
        const az = this.raycastHit.z + f.z;
        if (sel !== 0) this.placeBlockAt(ax, ay, az, sel);
      }
    });
    const releaseBreak = (e) => {
      if (e.button === 0) this.setBreakHeld(false);
    };
    this.canvas.addEventListener('mouseup', releaseBreak);
    window.addEventListener('mouseup', releaseBreak);
    window.addEventListener('blur', () => this.setBreakHeld(false));
  }

  _currentHeight() {
    if (!this.flyMode && this.crouching) return this.heightCrouch;
    return this.heightStand;
  }

  _syncCameraPose(bobOffset, forceVisible) {
    const height = this._currentHeight();
    this.camera.position.set(this.pos.x, this.pos.y + height + bobOffset, this.pos.z);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = this.yaw;
    this._highlight.visible = forceVisible ?? this._highlight.visible;
  }

  _getWishDir() {
    const fwd = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const move = new THREE.Vector3(0, 0, 0);

    const w = this.keys.has('KeyW');
    const s = this.keys.has('KeyS');
    const a = this.keys.has('KeyA');
    const d = this.keys.has('KeyD');

    if (w) move.add(fwd);
    if (s) move.addScaledVector(fwd, -1);
    if (a) move.addScaledVector(right, -1);
    if (d) move.add(right);

    if (this._touchAxes.lengthSq() > 1e-6) {
      const tx = this._touchAxes.x;
      const tz = this._touchAxes.y;
      move.addScaledVector(right, tx);
      move.addScaledVector(fwd, tz);
    }

    if (move.lengthSq() > 0) move.normalize();
    return move;
  }

  setTouchGameplayActive(on) {
    this._touchGameplayActive = !!on;
    if (!on) {
      this._touchAxes.set(0, 0);
      this._touchJumpPressed = false;
    }
  }

  setTouchAxes(x, y) {
    this._touchAxes.set(x, y);
  }

  setTouchJumpPressed(v) {
    this._touchJumpPressed = !!v;
  }

  tryInteractBreak() {
    if (this.paused || !this.raycastHit) return;
    if (!this.isCreative()) {
      this.setBreakHeld(true);
      return;
    }
    const now = performance.now();
    if (now - this._lastBreakAt < this.breakCooldownMs) return;
    this._lastBreakAt = now;
    this.breakBlockAt(this.raycastHit.x, this.raycastHit.y, this.raycastHit.z);
  }

  tryInteractPlace() {
    if (this.paused || !this.raycastHit) return;
    const now = performance.now();
    if (now - this._lastPlaceAt < this.placeCooldownMs) return;
    this._lastPlaceAt = now;
    const sel = this.getSelectedBlockType();
    if (!sel) return;
    const f = this.raycastHit.face;
    const ax = this.raycastHit.x + f.x;
    const ay = this.raycastHit.y + f.y;
    const az = this.raycastHit.z + f.z;
    this.placeBlockAt(ax, ay, az, sel);
  }

  /** Same as keyboard F — creative fly mode. */
  toggleFlyMode() {
    this.flyMode = !this.flyMode;
    if (this.flyMode) {
      this.onGround = false;
      this.vel.y = 0;
    }
  }

  _collidesAt(posX, posY, posZ, height) {
    const r = this.radius;
    const minX = posX - r;
    const maxX = posX + r;
    const minY = posY;
    const maxY = posY + height;
    const minZ = posZ - r;
    const maxZ = posZ + r;

    const x0 = Math.floor(minX);
    const x1 = Math.floor(maxX);
    const y0 = Math.floor(minY);
    const y1 = Math.floor(maxY);
    const z0 = Math.floor(minZ);
    const z1 = Math.floor(maxZ);

    for (let bx = x0; bx <= x1; bx++) {
      for (let by = y0; by <= y1; by++) {
        for (let bz = z0; bz <= z1; bz++) {
          const type = this.world.getBlock(bx, by, bz);
          if (!isSolidVoxelForCollision(type)) continue;

          // Block cube: [bx,bx+1] etc
          const blockMinX = bx;
          const blockMaxX = bx + 1;
          const blockMinY = by;
          const blockMaxY = by + 1;
          const blockMinZ = bz;
          const blockMaxZ = bz + 1;

          const overlapX = minX < blockMaxX && maxX > blockMinX;
          const overlapY = minY < blockMaxY && maxY > blockMinY;
          const overlapZ = minZ < blockMaxZ && maxZ > blockMinZ;
          if (overlapX && overlapY && overlapZ) return true;
        }
      }
    }
    return false;
  }

  _tryMove(deltaTime) {
    // Compute crouch state (Shift key) only on ground and only when not flying.
    const shift = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const forward = this.keys.has('KeyW');

    if (!this.flyMode && shift && !forward) this.crouching = true;
    else this.crouching = false;

    const height = this._currentHeight();

    const wish = this._getWishDir();
    const wishLen = wish.lengthSq();

    const shiftHeld = shift;
    const run = shiftHeld && forward && !this.flyMode;

    let speed = this.walkSpeed;
    if (this.flyMode) speed = this.flySpeed;
    else if (run) speed = this.runSpeed;
    else if (this.crouching) speed = this.walkSpeed * this.sneakSpeedFactor;

    // Build desired velocity
    const accel = speed;

    // Sub-step for stability.
    const steps = Math.max(1, Math.ceil(deltaTime / 0.016));
    const dt = deltaTime / steps;

    for (let i = 0; i < steps; i++) {
      const heightNow = this._currentHeight();

      // Vertical
      if (this.flyMode) {
        // Space up, Shift down
        const descend = shiftHeld;
        this.vel.y = 0;
        if (this.keys.has('Space')) this.vel.y = accel;
        if (descend) this.vel.y = -accel;
      } else {
        // Gravity
        this.vel.y += this.gravity * dt;
        if (this.onGround && (this.jumpPressed || this._touchJumpPressed)) {
          this.vel.y = this.jumpVel;
          this.onGround = false;
          this.crouching = false;
          this._onJump();
        }
      }

      // Horizontal
      const move = wishLen > 0 ? wish.clone().multiplyScalar(accel) : new THREE.Vector3(0, 0, 0);
      const dx = move.x * dt;
      const dz = move.z * dt;
      const dy = this.vel.y * dt;

      // X
      const oldX = this.pos.x;
      this.pos.x += dx;
      if (this._collidesAt(this.pos.x, this.pos.y, this.pos.z, heightNow)) {
        this.pos.x = oldX;
      }

      // Z
      const oldZ = this.pos.z;
      this.pos.z += dz;
      if (this._collidesAt(this.pos.x, this.pos.y, this.pos.z, heightNow)) {
        this.pos.z = oldZ;
      }

      // Y
      const oldY = this.pos.y;
      this.pos.y += dy;
      if (this._collidesAt(this.pos.x, this.pos.y, this.pos.z, heightNow)) {
        this.pos.y = oldY;
        if (!this.flyMode && dy < 0) {
          this.onGround = true;
          this.vel.y = 0;
        } else {
          this.vel.y = 0;
        }
      } else {
        if (!this.flyMode) this.onGround = false;
      }
    }
  }

  update(timeMs, deltaTime) {
    if (this.paused) return;
    if (!this.pointerLocked && !this._touchGameplayActive) return;

    const dt = Math.min(deltaTime, 0.05);

    // Touch canvas look: apply accumulated deltas (iOS / no pointer lock).
    if (this._touchGameplayActive && (this._touchCanvasAccX !== 0 || this._touchCanvasAccY !== 0)) {
      this.yaw -= this._touchCanvasAccX * this._touchLookSensitivity;
      this.pitch -= this._touchCanvasAccY * this._touchLookSensitivity;
      this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
      this._touchCanvasAccX = 0;
      this._touchCanvasAccY = 0;
    }

    // Raycast + highlight
    const dir = getRayDirectionFromYawPitch(this.yaw, this.pitch).normalize();
    const origin = this.camera.position.clone();
    this.raycastHit = raycastVoxel(this.world, origin, dir, this.maxInteractDist);
    if (this.raycastHit) {
      const f = this.raycastHit.face;
      const cx = this.raycastHit.x + 0.5 + f.x * 0.501;
      const cy = this.raycastHit.y + 0.5 + f.y * 0.501;
      const cz = this.raycastHit.z + 0.5 + f.z * 0.501;
      this._highlight.position.set(cx, cy, cz);
      this._highlight.visible = true;
    } else {
      this._highlight.visible = false;
      if (!this.isCreative()) this.setBreakHeld(false);
    }

    // Survival: hold LMB to mine (progress ring color).
    if (
      !this.paused &&
      !this.isCreative() &&
      this._breakHeld &&
      this.raycastHit &&
      (this.pointerLocked || this._touchGameplayActive)
    ) {
      const hx = this.raycastHit.x;
      const hy = this.raycastHit.y;
      const hz = this.raycastHit.z;
      const t = this.world.getBlock(hx, hy, hz);
      if (
        !this._miningAt ||
        this._miningAt.x !== hx ||
        this._miningAt.y !== hy ||
        this._miningAt.z !== hz ||
        this._miningAt.type !== t
      ) {
        this._miningAt = { x: hx, y: hy, z: hz, type: t };
        this._miningProgress = 0;
      }
      const secs = this.getBreakTimeSeconds(t);
      if (secs >= 500) {
        this._miningProgress = 0;
      } else {
        this._miningProgress += dt / secs;
        const p = Math.min(1, this._miningProgress);
        this._highlightMat.color.setRGB(0.25 + p * 0.75, 1 - p * 0.72, 0.2);
        if (this._miningProgress >= 1) {
          this.breakBlockAt(hx, hy, hz);
          this._miningAt = null;
          this._miningProgress = 0;
          this._highlightMat.color.setHex(0x7cff6b);
        }
      }
    } else if (!this.isCreative()) {
      if (!this._breakHeld && this._highlightMat) {
        this._miningAt = null;
        this._miningProgress = 0;
        this._highlightMat.color.setHex(0x7cff6b);
      }
    }

    // Move + collisions
    this._tryMove(dt);

    // Walk tick sound: every step while on ground and moving.
    if (!this.flyMode && this.onGround) {
      const moving =
        this.keys.has('KeyW') ||
        this.keys.has('KeyS') ||
        this.keys.has('KeyA') ||
        this.keys.has('KeyD') ||
        this._touchAxes.lengthSq() > 0.04;
      if (moving && timeMs >= this._nextWalkTickAt) {
        const interval = this.crouching ? 300 : this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 160 : 230;
        this._nextWalkTickAt = timeMs + interval;
        this._onWalkTick();
      }
    }

    // Head bob while walking (no bob in fly mode)
    let bob = 0;
    if (!this.flyMode && this.onGround) {
      const moving =
        this.keys.has('KeyW') ||
        this.keys.has('KeyS') ||
        this.keys.has('KeyA') ||
        this.keys.has('KeyD') ||
        this._touchAxes.lengthSq() > 0.04;
      if (moving) {
        const speedFactor = this.crouching
          ? this.walkSpeed * this.sneakSpeedFactor
          : (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) && this.keys.has('KeyW')
            ? this.runSpeed
            : this.walkSpeed;
        const t = timeMs * 0.012 * (speedFactor / this.walkSpeed);
        bob = Math.sin(t) * 0.045 * (this.crouching ? 0.6 : 1);
      }
    }

    this._syncCameraPose(bob, false);
  }

  /**
   * Teleport player and sync camera immediately (used by World Select).
   * @param {{x:number,y:number,z:number}} spawn
   */
  teleportTo(spawn) {
    this.pos.set(spawn.x, spawn.y, spawn.z);
    this.vel.set(0, 0, 0);
    this.onGround = false;
    this.crouching = false;
    this._highlight.visible = false;
    this._syncCameraPose(0, false);
  }

  setPaused(paused) {
    this.paused = paused;
    if (paused) {
      this._highlight.visible = false;
      this.setBreakHeld(false);
    }
  }
}

