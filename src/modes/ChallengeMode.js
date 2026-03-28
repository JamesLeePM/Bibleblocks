import * as THREE from 'three';
import { VoxelWorld } from '../engine/VoxelWorld.js';

const SAND = 1;
const STONE = 2;
const WOOD = 3;
const LEAF = 4;
const WATER = 5;
const GOLD = 6;
const BREAD = 7;
const GRASS = 8;

const WORLD_SIZE = 160;
const GROUND_Y = 4;

function inBounds(x, z) {
  return x >= 0 && z >= 0 && x < WORLD_SIZE && z < WORLD_SIZE;
}

function setBlock(world, x, y, z, type) {
  if (!inBounds(x, z)) return;
  world.setBlock(x, y, z, type);
}

function fillColumn(world, x, z, y0, y1, type) {
  for (let y = y0; y <= y1; y++) setBlock(world, x, y, z, type);
}

/**
 * Hollow rectangular shell (faces only) — ark / hull outline.
 */
function hollowBoxPositions(ox, oy, oz, w, h, l) {
  const pts = [];
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      for (let k = 0; k < l; k++) {
        const onFace =
          i === 0 ||
          i === w - 1 ||
          j === 0 ||
          j === h - 1 ||
          k === 0 ||
          k === l - 1;
        if (onFace) pts.push({ x: ox + i, y: oy + j, z: oz + k });
      }
    }
  }
  return pts;
}

function makeGhostGroup(positions, color = 0x66ccff) {
  const group = new THREE.Group();
  group.name = 'challenge_ghost';
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.42,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.55,
  });
  for (const p of positions) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x + 0.5, p.y + 0.5, p.z + 0.5);
    group.add(mesh);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      edgeMat
    );
    edges.position.copy(mesh.position);
    group.add(edges);
  }
  return group;
}

/** @type {Array<{ id: string, title: string, story: string, worldName: string, praise: string, spawnCharacterId: string }>} */
export const CHALLENGES = [
  {
    id: 'ark',
    title: "Noah's Ark",
    story:
      'God asked Noah to build a great boat to save his family and the animals from the flood.',
    worldName: "Challenge: Noah's Ark",
    praise: 'Noah',
    spawnCharacterId: 'noah',
  },
  {
    id: 'temple',
    title: 'Temple of Solomon',
    story:
      'Solomon built a glorious temple for God with gold and stone, room by room.',
    worldName: 'Challenge: Temple of Solomon',
    praise: 'Solomon',
    spawnCharacterId: 'david',
  },
  {
    id: 'redsea',
    title: 'Part the Red Sea',
    story:
      'God made a dry path through the sea so His people could walk to freedom.',
    worldName: 'Challenge: Part the Red Sea',
    praise: 'Moses',
    spawnCharacterId: 'moses',
  },
  {
    id: 'tower',
    title: "David's Tower",
    story:
      'David prepared Jerusalem; build a strong stone tower that reaches toward heaven.',
    worldName: "Challenge: David's Tower",
    praise: 'David',
    spawnCharacterId: 'david',
  },
  {
    id: 'garden',
    title: 'Garden Planting',
    story:
      'In Eden, God planted a garden. Tend yours with trees, flowers, and living water.',
    worldName: 'Challenge: Garden Planting',
    praise: 'Adam and Eve',
    spawnCharacterId: 'mary',
  },
];

function flatGrassBase(world) {
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      fillColumn(world, x, z, 0, GROUND_Y, GRASS);
    }
  }
}

function flatSandBase(world) {
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      fillColumn(world, x, z, 0, GROUND_Y, SAND);
    }
  }
}

/**
 * @param {string} challengeId
 * @returns {{ world: VoxelWorld, spawn: {x:number,y:number,z:number}, spawnCharacterId: string, worldName: string }}
 */
export function createChallengeWorld(challengeId) {
  const world = new VoxelWorld();
  const def = CHALLENGES.find((c) => c.id === challengeId) ?? CHALLENGES[0];

  if (challengeId === 'ark') {
    flatGrassBase(world);
    const ox = 58;
    const oy = GROUND_Y + 1;
    const oz = 62;
    const w = 14;
    const h = 10;
    const l = 26;
    const shell = hollowBoxPositions(ox, oy, oz, w, h, l);
    for (const p of shell) {
      setBlock(world, p.x, p.y, p.z, 0);
    }
    return {
      world,
      spawn: { x: ox + w / 2, y: GROUND_Y + 2.2, z: oz - 8 },
      spawnCharacterId: def.spawnCharacterId,
      worldName: def.worldName,
    };
  }

  if (challengeId === 'temple') {
    flatGrassBase(world);
    return {
      world,
      spawn: { x: 80, y: GROUND_Y + 2.2, z: 80 },
      spawnCharacterId: def.spawnCharacterId,
      worldName: def.worldName,
    };
  }

  if (challengeId === 'redsea') {
    flatSandBase(world);
    return {
      world,
      spawn: { x: 80, y: GROUND_Y + 2.2, z: 80 },
      spawnCharacterId: def.spawnCharacterId,
      worldName: def.worldName,
    };
  }

  if (challengeId === 'tower') {
    flatGrassBase(world);
    return {
      world,
      spawn: { x: 84, y: GROUND_Y + 2.2, z: 80 },
      spawnCharacterId: def.spawnCharacterId,
      worldName: def.worldName,
    };
  }

  if (challengeId === 'garden') {
    flatGrassBase(world);
    return {
      world,
      spawn: { x: 64, y: GROUND_Y + 2.2, z: 64 },
      spawnCharacterId: def.spawnCharacterId,
      worldName: def.worldName,
    };
  }

  flatGrassBase(world);
  return {
    world,
    spawn: { x: 80, y: GROUND_Y + 2.2, z: 80 },
    spawnCharacterId: def.spawnCharacterId,
    worldName: def.worldName,
  };
}

/** Temple blueprint: gold floor (outer court) + stone walls for three nested courts. */
function buildTempleBlueprint() {
  const map = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  const add = (x, y, z, expected) => {
    map.set(key(x, y, z), { x, y, z, expected });
  };

  const floorY = GROUND_Y + 1;
  const y0 = floorY + 1;
  const y1 = floorY + 4;

  const outer = { x0: 48, x1: 75, z0: 48, z1: 71 };
  const holy = { x0: 54, x1: 69, z0: 54, z1: 65 };
  const inner = { x0: 58, x1: 61, z0: 58, z1: 61 };

  for (let x = outer.x0; x <= outer.x1; x++) {
    for (let z = outer.z0; z <= outer.z1; z++) {
      add(x, floorY, z, GOLD);
    }
  }

  function ringWall(rect) {
    const { x0, x1, z0, z1 } = rect;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        add(x, y, z0, STONE);
        add(x, y, z1, STONE);
      }
      for (let z = z0 + 1; z <= z1 - 1; z++) {
        add(x0, y, z, STONE);
        add(x1, y, z, STONE);
      }
    }
  }

  ringWall(outer);
  ringWall(holy);
  ringWall(inner);

  return Array.from(map.values());
}

let templeBlueprintCache = null;
function getTempleBlueprint() {
  if (!templeBlueprintCache) templeBlueprintCache = buildTempleBlueprint();
  return templeBlueprintCache;
}

function makeGhostWireframeAabb(x0, y0, z0, x1, y1, z1, color = 0x66ccff) {
  const group = new THREE.Group();
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const d = z1 - z0 + 1;
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.38,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const cx = (x0 + x1) / 2 + 0.5;
  const cy = (y0 + y1) / 2 + 0.5;
  const cz = (z0 + z1) / 2 + 0.5;
  mesh.position.set(cx, cy, cz);
  group.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.48 })
  );
  edges.position.copy(mesh.position);
  group.add(edges);
  return group;
}

function buildChallengeGhostGroup(challengeId) {
  if (challengeId === 'ark') {
    return makeGhostGroup(
      hollowBoxPositions(58, GROUND_Y + 1, 62, 14, 10, 26),
      0x66ccff
    );
  }
  if (challengeId === 'temple') {
    const g = new THREE.Group();
    const floorY = GROUND_Y + 1;
    const wy0 = floorY + 1;
    const wy1 = floorY + 4;
    g.add(makeGhostWireframeAabb(48, floorY, 48, 75, floorY, 71, 0xffc107));
    g.add(makeGhostWireframeAabb(48, wy0, 48, 75, wy1, 71, 0x66cfff));
    g.add(makeGhostWireframeAabb(54, wy0, 54, 69, wy1, 65, 0xffd54f));
    g.add(makeGhostWireframeAabb(58, wy0, 58, 61, wy1, 61, 0xffeb3b));
    return g;
  }
  if (challengeId === 'redsea') {
    const g = new THREE.Group();
    const fy = GROUND_Y + 1;
    g.add(makeGhostWireframeAabb(28, fy, 50, 48, fy, 110, 0x42a5f5));
    g.add(makeGhostWireframeAabb(112, fy, 50, 132, fy, 110, 0x42a5f5));
    g.add(makeGhostWireframeAabb(76, fy, 50, 80, fy, 110, 0xe8d5a8));
    return g;
  }
  if (challengeId === 'tower') {
    const y0 = GROUND_Y + 1;
    const y1 = GROUND_Y + 64;
    return makeGhostWireframeAabb(76, y0, 76, 80, y1, 80, 0xb0bec5);
  }
  if (challengeId === 'garden') {
    const fy = GROUND_Y + 1;
    return makeGhostWireframeAabb(48, fy, 48, 79, fy, 79, 0x7cb342);
  }
  return new THREE.Group();
}

function ensureStyle() {
  if (document.getElementById('challenge-mode-style')) return;
  const style = document.createElement('style');
  style.id = 'challenge-mode-style';
  style.textContent = `
    .challenge-panel{
      position: fixed;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 210;
      width: min(320px, 38vw);
      pointer-events: none;
      font-family: 'Press Start 2P', monospace;
      border-radius: 10px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.94), rgba(26,21,16,0.97));
      box-shadow: 0 12px 40px rgba(0,0,0,0.55);
      padding: 0.85rem 0.75rem 0.75rem;
    }
    .challenge-panel__title{
      color: #ffd54f;
      font-size: 0.52rem;
      line-height: 1.7;
      margin-bottom: 0.45rem;
    }
    .challenge-panel__story{
      color: #c4b59a;
      font-size: 0.38rem;
      line-height: 1.75;
      margin-bottom: 0.55rem;
    }
    .challenge-panel__hint{
      color: #a89a7a;
      font-size: 0.34rem;
      line-height: 1.7;
      margin-bottom: 0.5rem;
    }
    .challenge-panel__bar-wrap{
      height: 10px;
      border-radius: 4px;
      background: rgba(0,0,0,0.35);
      border: 2px solid rgba(92,74,42,0.8);
      overflow: hidden;
      margin-bottom: 0.35rem;
    }
    .challenge-panel__bar{
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #43a047, #ffd54f);
      transition: width 220ms ease;
    }
    .challenge-panel__pct{
      color: #e8d5a8;
      font-size: 0.42rem;
      text-align: right;
    }
    .challenge-overlay-select{
      position: fixed;
      inset: 0;
      z-index: 200;
      background: radial-gradient(circle at 50% 20%, rgba(255,213,79,0.15), rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.72));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .challenge-select-panel{
      width: min(920px, 100%);
      border-radius: 12px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.96), rgba(26,21,16,0.98));
      box-shadow: 0 16px 70px rgba(0,0,0,0.65);
      padding: 1.1rem 1rem 1rem;
    }
    .challenge-select-title{
      font-family: 'Press Start 2P', monospace;
      color: #ffd54f;
      font-size: 0.75rem;
      text-align: center;
      margin-bottom: 0.75rem;
    }
    .challenge-select-grid{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.65rem;
    }
    .challenge-card{
      font-family: 'Press Start 2P', monospace;
      border: 2px solid #5c4a2a;
      border-radius: 8px;
      padding: 0.65rem 0.55rem;
      cursor: pointer;
      background: linear-gradient(180deg, rgba(60,48,32,0.9), rgba(35,28,20,0.95));
      color: #e8d5a8;
      font-size: 0.42rem;
      line-height: 1.65;
      text-align: left;
      transition: transform 140ms ease, border-color 140ms ease;
    }
    .challenge-card:hover{
      transform: translateY(-2px);
      border-color: rgba(255,213,79,0.65);
    }
    .challenge-card__name{
      color: #ffd54f;
      font-size: 0.48rem;
      margin-bottom: 0.35rem;
    }
    .challenge-select-actions{
      display: flex;
      justify-content: flex-end;
      margin-top: 0.85rem;
      gap: 0.6rem;
    }
    .challenge-btn{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.45rem;
      padding: 0.55rem 0.85rem;
      cursor: pointer;
      color: #1a1510;
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
      border: 2px solid #5c4a2a;
      border-radius: 4px;
    }
    .challenge-celebrate{
      position: fixed;
      inset: 0;
      z-index: 240;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .challenge-celebrate__panel{
      width: min(560px, 100%);
      border-radius: 12px;
      border: 3px solid #ffd54f;
      background: linear-gradient(180deg, rgba(45,36,24,0.98), rgba(26,21,16,0.99));
      padding: 1.2rem 1rem 1rem;
      text-align: center;
    }
    .challenge-celebrate__title{
      font-family: 'Press Start 2P', monospace;
      color: #ffd54f;
      font-size: 0.85rem;
      line-height: 1.7;
      margin-bottom: 0.65rem;
    }
    .challenge-celebrate__msg{
      font-family: 'Press Start 2P', monospace;
      color: #c4b59a;
      font-size: 0.48rem;
      line-height: 1.8;
      margin-bottom: 1rem;
    }
  `;
  document.head.appendChild(style);
}

function evaluateArk(world, positions) {
  let ok = 0;
  for (const p of positions) {
    if (world.getBlock(p.x, p.y, p.z) === WOOD) ok++;
  }
  return positions.length ? ok / positions.length : 0;
}

function evaluateTemple(world) {
  const bp = getTempleBlueprint();
  let ok = 0;
  for (const c of bp) {
    if (world.getBlock(c.x, c.y, c.z) === c.expected) ok++;
  }
  return bp.length ? ok / bp.length : 0;
}

function hasWaterNearSurface(world, x, z) {
  for (let dy = 0; dy < 4; dy++) {
    if (world.getBlock(x, GROUND_Y + 1 + dy, z) === WATER) return true;
  }
  return false;
}

function drySandColumn(world, x, z) {
  let sand = false;
  for (let dy = 0; dy < 5; dy++) {
    const b = world.getBlock(x, GROUND_Y + 1 + dy, z);
    if (b === WATER) return false;
    if (b === SAND) sand = true;
  }
  return sand;
}

function evaluateRedSea(world) {
  const z0 = 50;
  const z1 = 110;
  let leftW = 0;
  let leftT = 0;
  for (let z = z0; z <= z1; z++) {
    for (let x = 28; x <= 48; x++) {
      leftT++;
      if (hasWaterNearSurface(world, x, z)) leftW++;
    }
  }
  let rightW = 0;
  let rightT = 0;
  for (let z = z0; z <= z1; z++) {
    for (let x = 112; x <= 132; x++) {
      rightT++;
      if (hasWaterNearSurface(world, x, z)) rightW++;
    }
  }
  let pathOk = 0;
  let pathT = 0;
  for (let z = z0; z <= z1; z++) {
    for (let x = 76; x <= 80; x++) {
      pathT++;
      if (drySandColumn(world, x, z)) pathOk++;
    }
  }
  const lRatio = leftT ? leftW / leftT : 0;
  const rRatio = rightT ? rightW / rightT : 0;
  const pRatio = pathT ? pathOk / pathT : 0;
  return (lRatio + rRatio + pRatio) / 3;
}

function evaluateTower(world) {
  let maxY = 0;
  for (let x = 76; x <= 80; x++) {
    for (let z = 76; z <= 80; z++) {
      for (let y = 0; y < 128; y++) {
        if (world.getBlock(x, y, z) === STONE) {
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  const needY = GROUND_Y + 64;
  return maxY >= needY ? 1 : maxY / needY;
}

function evaluateGarden(world) {
  const x0 = 48;
  const x1 = 79;
  const z0 = 48;
  const z1 = 79;
  let trees = 0;
  const treeMarks = new Set();
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      let woodRun = 0;
      for (let y = GROUND_Y + 1; y <= GROUND_Y + 12; y++) {
        if (world.getBlock(x, y, z) === WOOD) woodRun++;
        else woodRun = 0;
        if (woodRun >= 4) {
          const k = `${x},${z}`;
          if (!treeMarks.has(k)) {
            treeMarks.add(k);
            trees++;
          }
          break;
        }
      }
    }
  }
  let flowers = 0;
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const b = world.getBlock(x, GROUND_Y + 1, z);
      if (b === LEAF || b === BREAD) flowers++;
    }
  }
  let water = 0;
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      for (let y = GROUND_Y; y <= GROUND_Y + 4; y++) {
        if (world.getBlock(x, y, z) === WATER) water++;
      }
    }
  }
  const tOk = Math.min(1, trees / 5);
  const fOk = Math.min(1, flowers / 10);
  const wOk = water >= 1 ? 1 : 0;
  return (tOk + fOk + wOk) / 3;
}

function hintFor(challengeId) {
  switch (challengeId) {
    case 'ark':
      return 'Fill the glowing hull outline with Wood blocks (hotbar slot 3). Reach 90% to win.';
    case 'temple':
      return 'Match the blueprint: Gold floors and Stone walls in the three nested courts.';
    case 'redsea':
      return 'Cover the side zones with Water. Keep the center strip dry Sand (3+ wide).';
    case 'tower':
      return 'Stack Stone in a 5×5 tower from the marked area up to the height goal.';
    case 'garden':
      return 'Inside the plot: plant 5 trees (Wood trunks), 10 flowers (Leaf/Bread on top), and 1 Water.';
    default:
      return '';
  }
}

export class ChallengeMode {
  /**
   * @param {{
   *  challengeId: string,
   *  scene: THREE.Scene,
   *  voxelWorld: import('../engine/VoxelWorld.js').VoxelWorld,
   *  sound: { playChallengeComplete?: ()=>void, playCharacterSelect?: ()=>void },
   *  particles: { spawnConfetti?: (x:number,y:number,z:number)=>void, spawnCharacterStarBurst?: (x:number,y:number,z:number)=>void },
   *  onProgress?: (progress01: number) => void,
   *  onComplete?: (info: { praise: string, title: string }) => void,
   * }} options
   */
  constructor(options) {
    ensureStyle();
    this.challengeId = options.challengeId;
    this.scene = options.scene;
    this.world = options.voxelWorld;
    this.sound = options.sound;
    this.particles = options.particles;
    this.onProgress = options.onProgress ?? (() => {});
    this.onComplete = options.onComplete ?? (() => {});

    this._def = CHALLENGES.find((c) => c.id === this.challengeId) ?? CHALLENGES[0];
    this._arkShell =
      this.challengeId === 'ark'
        ? hollowBoxPositions(58, GROUND_Y + 1, 62, 14, 10, 26)
        : [];

    this._ghostGroup = buildChallengeGhostGroup(this.challengeId);
    this.scene.add(this._ghostGroup);

    this._panel = document.createElement('div');
    this._panel.className = 'challenge-panel';
    this._panel.innerHTML = `
      <div class="challenge-panel__title"></div>
      <div class="challenge-panel__story"></div>
      <div class="challenge-panel__hint"></div>
      <div class="challenge-panel__bar-wrap"><div class="challenge-panel__bar"></div></div>
      <div class="challenge-panel__pct">0%</div>
    `;
    this._titleEl = this._panel.querySelector('.challenge-panel__title');
    this._storyEl = this._panel.querySelector('.challenge-panel__story');
    this._hintEl = this._panel.querySelector('.challenge-panel__hint');
    this._barEl = this._panel.querySelector('.challenge-panel__bar');
    this._pctEl = this._panel.querySelector('.challenge-panel__pct');

    this._titleEl.textContent = this._def.title;
    this._storyEl.textContent = this._def.story;
    this._hintEl.textContent = hintFor(this.challengeId);

    this._completed = false;
    this.refresh();
  }

  mount(parent = document.body) {
    parent.appendChild(this._panel);
  }

  unmount() {
    this._panel.remove();
    if (this._ghostGroup && this._ghostGroup.parent) {
      this._ghostGroup.parent.remove(this._ghostGroup);
    }
    this._ghostGroup.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }

  refresh() {
    if (this._completed) return;
    const p = this.computeProgress();
    this.onProgress(p);
    const pct = Math.min(100, Math.floor(p * 100));
    if (this._barEl) this._barEl.style.width = `${pct}%`;
    if (this._pctEl) this._pctEl.textContent = `${pct}%`;

    const need = this.challengeId === 'ark' ? 0.9 : 0.88;
    if (p >= need) this._celebrate();
  }

  computeProgress() {
    const w = this.world;
    switch (this.challengeId) {
      case 'ark':
        return evaluateArk(w, this._arkShell);
      case 'temple':
        return evaluateTemple(w);
      case 'redsea':
        return evaluateRedSea(w);
      case 'tower':
        return evaluateTower(w);
      case 'garden':
        return evaluateGarden(w);
      default:
        return 0;
    }
  }

  _celebrate() {
    if (this._completed) return;
    this._completed = true;
    if (this.sound?.playChallengeComplete) this.sound.playChallengeComplete();
    else if (this.sound?.playCharacterSelect) this.sound.playCharacterSelect();

    if (this.particles?.spawnConfetti) {
      this.particles.spawnConfetti(80, 40, 80);
    } else if (this.particles?.spawnCharacterStarBurst) {
      this.particles.spawnCharacterStarBurst(80, 20, 80);
    }

    const overlay = document.createElement('div');
    overlay.className = 'challenge-celebrate';
    overlay.innerHTML = `
      <div class="challenge-celebrate__panel">
        <div class="challenge-celebrate__title">Challenge Complete!</div>
        <div class="challenge-celebrate__msg"></div>
        <button type="button" class="challenge-btn" id="challenge-celebrate-close">Continue</button>
      </div>
    `;
    const msg = overlay.querySelector('.challenge-celebrate__msg');
    msg.textContent = `Well done! Just like ${this._def.praise}!`;
    document.body.appendChild(overlay);
    overlay.querySelector('#challenge-celebrate-close')?.addEventListener('click', () => {
      overlay.remove();
      this.onComplete({
        praise: this._def.praise,
        title: this._def.title,
      });
    });
  }

  notifyWorldChanged() {
    this.refresh();
  }
}

/**
 * @param {{ onPick: (challengeId: string) => void, onCancel?: () => void }} options
 */
export function mountChallengeSelect(options) {
  ensureStyle();
  const onPick = options.onPick;
  const onCancel = options.onCancel ?? (() => {});

  const root = document.createElement('div');
  root.className = 'challenge-overlay-select';

  const panel = document.createElement('div');
  panel.className = 'challenge-select-panel';

  const title = document.createElement('div');
  title.className = 'challenge-select-title';
  title.textContent = 'Bible Challenges';

  const grid = document.createElement('div');
  grid.className = 'challenge-select-grid';

  for (const c of CHALLENGES) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'challenge-card';
    card.innerHTML = `<div class="challenge-card__name">${c.title}</div>${c.story}`;
    card.addEventListener('click', () => {
      root.remove();
      onPick(c.id);
    });
    grid.appendChild(card);
  }

  const actions = document.createElement('div');
  actions.className = 'challenge-select-actions';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'challenge-btn';
  back.textContent = 'Back';
  back.addEventListener('click', () => {
    root.remove();
    onCancel();
  });
  actions.appendChild(back);

  panel.append(title, grid, actions);
  root.appendChild(panel);
  document.body.appendChild(root);
  return root;
}
