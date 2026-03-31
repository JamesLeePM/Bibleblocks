import * as THREE from 'three';
import { Capacitor } from '@capacitor/core';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { applyAtlasAnisotropy, getAtlasTexture } from './assets/TextureAtlas.js';
import { BIBLE_CHARACTERS, CharacterSelector } from './characters/BibleCharacters.js';
import { meshChunk } from './engine/ChunkMesher.js';
import { worldToChunk } from './engine/VoxelWorld.js';
import { PlayerController } from './engine/PlayerController.js';
import { Hotbar } from './ui/Hotbar.js';
import { InventoryPanel } from './ui/InventoryPanel.js';
import { Inventory } from './inventory/Inventory.js';
import { getBaseBreakSeconds, getDropForBlock } from './engine/BlockRegistry.js';
import {
  createBibleWorld,
  getWorldIdForCharacter,
  resolveWorldId,
} from './world/BibleWorlds.js';
import { WorldSelect } from './ui/WorldSelect.js';
import { MainMenu } from './ui/MainMenu.js';
import { CharacterGallery } from './ui/CharacterGallery.js';
import { HUD } from './ui/HUD.js';
import { SoundManager } from './audio/SoundManager.js';
import { Particles } from './engine/Particles.js';
import { isIOSWebKit } from './engine/platform.js';
import {
  syncVoxelWorldFog,
  SKY_BLUE as skyBlue,
  VOXEL_WORLD_FOG_NEAR,
  VOXEL_WORLD_FOG_FAR,
} from './engine/worldEnvironment.js';
import { SaveManager } from './world/SaveManager.js';
import {
  ChallengeMode,
  createChallengeWorld,
  mountChallengeSelect,
} from './modes/ChallengeMode.js';
import { TouchControls } from './ui/TouchControls.js';
import { applyKidsMode } from './ui/KidsMode.js';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** WKWebView / Capacitor often log caught values as `{}`; normalize for display. */
function formatInitError(err) {
  if (err == null) return 'Unknown error (null/undefined)';
  if (typeof err === 'string') return err;
  if (err instanceof Error) {
    const head = `${err.name}: ${err.message || '(no message)'}`;
    return err.stack ? `${head}\n${err.stack}` : head;
  }
  if (typeof err === 'object') {
    const name = err.name;
    const message = err.message;
    const code = err.code;
    if (name || message || code !== undefined) {
      const bits = [name, message, code !== undefined ? `code=${code}` : '']
        .filter(Boolean)
        .join(' — ');
      return err.stack ? `${bits}\n${err.stack}` : bits;
    }
    try {
      return JSON.stringify(err, Object.getOwnPropertyNames(err));
    } catch {
      return Object.prototype.toString.call(err);
    }
  }
  return String(err);
}

function showInitError(err) {
  const text = formatInitError(err);
  document.getElementById('loading-screen')?.classList.add('hidden');
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div style="position:fixed;inset:0;background:#111;color:#f44;' +
      'font-family:monospace;padding:20px;z-index:9999;overflow:auto">' +
      '<h2>Init Error</h2><pre>' +
      escapeHtml(text) +
      '</pre></div>'
  );
}

function reportAsyncInitError(err) {
  console.error('Async init error:', formatInitError(err), err);
  document.getElementById('loading-screen')?.classList.add('hidden');
  showInitError(err instanceof Error ? err : new Error(formatInitError(err)));
}

/** WKWebView / iOS often reports 0×0 until the next frame; Three needs non-zero size. */
function getViewportSize() {
  const vv = window.visualViewport;
  const wRaw =
    (vv && vv.width) ||
    window.innerWidth ||
    document.documentElement?.clientWidth ||
    screen?.width ||
    1;
  const hRaw =
    (vv && vv.height) ||
    window.innerHeight ||
    document.documentElement?.clientHeight ||
    screen?.height ||
    1;
  return {
    width: Math.max(1, Math.floor(wRaw)),
    height: Math.max(1, Math.floor(hRaw)),
  };
}

let appStarted = false;

const startApp = () => {
  if (appStarted) return;
  appStarted = true;

  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('hidden');
  }, 5000);

  void (async () => {
    try {
if (!WebGL.isWebGL2Available() && !WebGL.isWebGLAvailable()) {
  document.body.innerHTML =
    '<h1 style="color:white;text-align:center;margin-top:40vh">WebGL not supported</h1>';
  throw new Error('WebGL not available');
}

applyKidsMode();

const canvas = document.getElementById('game-canvas');
if (!canvas) {
  throw new Error('Missing #game-canvas (DOM not ready?)');
}
const loadingScreen = document.getElementById('loading-screen');
const loadingProgressBar = document.getElementById('loading-progress-bar');
const loadingVerse = document.getElementById('loading-verse');

function forceHideLoading() {
  if (!loadingScreen) return;
  loadingScreen.classList.add('hidden');
  loadingScreen.setAttribute('aria-busy', 'false');
}

/** Keep canvas vs DOM overlays consistent (WebGL can steal hit-testing). */
function syncUiForMode() {
  const inMenu = mode === 'menu';
  document.body.classList.toggle('bibleblocks-menu-mode', inMenu);
  if (canvas) {
    canvas.style.pointerEvents = inMenu ? 'none' : 'auto';
  }
  if (inMenu && document.pointerLockElement === canvas) {
    document.exitPointerLock?.();
  }
  const crosshair = document.getElementById('crosshair');
  if (crosshair) {
    crosshair.style.display = inMenu ? 'none' : 'block';
  }
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('game-canvas'),
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
    premultipliedAlpha: false,
    failIfMajorPerformanceCaveat: false,
  });
} catch (e) {
  throw new Error(`WebGLRenderer failed: ${formatInitError(e)}`);
}

// WebXR uses Three's internal loop helpers; keep off unless we add XR. iOS: prefer plain rAF main loop.
if (renderer.xr) renderer.xr.enabled = false;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const initialVp = getViewportSize();
renderer.setSize(initialVp.width, initialVp.height);

renderer.setClearColor(0x87ceeb, 1);
// iOS / Metal: shadow maps can produce dark or missing fragments on some WKWebView builds.
const iosWebKit = isIOSWebKit();
renderer.shadowMap.enabled = !iosWebKit;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  initialVp.width / initialVp.height,
  0.1,
  2000
);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

/** Sky / ground tint — evens lighting across sand, grass, water, and gold floors in every preset. */
const hemi = new THREE.HemisphereLight(0xb8d4f0, 0x4a4538, 0.45);
hemi.name = 'hemi_fill';
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff4e0, 1.05);
sun.position.set(80, 120, 60);
sun.castShadow = !iosWebKit;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 400;
sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;
scene.add(sun);

const atlasTexture = getAtlasTexture();
applyAtlasAnisotropy(renderer);
const sound = new SoundManager();
const particles = new Particles(scene);
const saveManager = new SaveManager();

let mode = 'menu'; // 'menu' | 'inGame'
let creativeMode = true;
const inventory = new Inventory();
inventory.fillCreativeHotbar();
let inventoryPanelOpen = false;

// Prompt 8: day/night cycle, stars, fog.
const skyDusk = new THREE.Color(0xffa64d);
// Dark enough for “night” but not so dark that fog + terrain read as a black void on iPad.
const skyNight = new THREE.Color(0x1f3552);

scene.fog = new THREE.Fog(skyBlue, VOXEL_WORLD_FOG_NEAR, VOXEL_WORLD_FOG_FAR);

const starCount = 900;
const starRadius = 140;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  // Dome: bias stars to be above the horizon.
  const y = starRadius * (0.25 + Math.random() * 0.75);
  const r = Math.sqrt(Math.max(0, starRadius * starRadius - y * y));
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  // Center dome roughly around the world center (matches the 160×160 preset).
  starPositions[i * 3 + 0] = x + 80;
  starPositions[i * 3 + 1] = y + 60;
  starPositions[i * 3 + 2] = z + 80;
}

const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.BufferAttribute(starPositions, 3)
  ),
  new THREE.PointsMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    size: 0.8,
    sizeAttenuation: true,
  })
);
scene.add(stars);

const dayNightDurationMs = 10 * 60 * 1000;

function updateSky(timeMs) {
  const t = (timeMs % dayNightDurationMs) / dayNightDurationMs; // 0..1

  let sky;
  if (t < 0.5) {
    sky = skyBlue.clone().lerp(skyDusk, t / 0.5);
  } else {
    sky = skyDusk.clone().lerp(skyNight, (t - 0.5) / 0.5);
  }

  // Clear + scene background so WKWebView always has a solid sky (avoids black “void” gaps).
  renderer.setClearColor(sky, 1);
  scene.background = sky;
  if (scene.fog) scene.fog.color.copy(sky);

  // Keep ground readable when the sky goes dark (fog was washing terrain into near-black).
  const nightish = Math.min(1, Math.max(0, (t - 0.38) / 0.62));
  const nightFade = Math.pow(nightish, 0.9);
  ambient.intensity = 0.48 + 0.38 * (1 - nightFade * 0.88);
  sun.intensity = 1.05 * (0.42 + 0.58 * (1 - nightFade * 0.62));
  hemi.intensity = 0.4 + 0.32 * (1 - nightFade * 0.78);

  // Rotate sun slowly around the scene.
  const a = t * Math.PI * 2;
  sun.position.x = Math.cos(a) * 120;
  sun.position.z = Math.sin(a) * 120;
  sun.position.y = 80 + Math.sin(a) * 20;

  // Stars visible mostly at "night" (later in cycle).
  const night = Math.pow(Math.min(1, Math.max(0, (t - 0.55) / 0.35)), 2);
  stars.material.opacity = night;
  stars.visible = night > 0.02;
}

const worldSize = 160;
const cx = worldSize / 2;
const cz = worldSize / 2;

let voxelWorld = null;
let worldGroup = new THREE.Group();
worldGroup.name = 'voxel_world';
let chunkMeshes = new Map(); // key="cx,cy,cz" → THREE.Group

let spawnCharacterGroup = null;
let spawnCharacterRig = null;

let currentWorldName = 'Garden of Eden';
let currentWorldId = 'garden';
let selectedSaveSlot = 1;
/** @type {ChallengeMode | null} */
let challengeMode = null;
let loadingProgress = 0;
let loadingHidden = false;

function setLoadingUI(progress01, verseText) {
  loadingProgress = Math.max(0, Math.min(1, progress01));
  if (loadingProgress < 1) loadingHidden = false;
  if (!loadingScreen) return;
  if (loadingProgress < 1) loadingScreen.classList.remove('hidden');
  if (loadingProgressBar) loadingProgressBar.style.width = `${Math.floor(loadingProgress * 100)}%`;
  if (verseText && loadingVerse) loadingVerse.textContent = verseText;
}

function rebuildChunk(chunkX, chunkY, chunkZ) {
  const key = `${chunkX},${chunkY},${chunkZ}`;
  const old = chunkMeshes.get(key);
  if (old && old.parent) old.parent.remove(old);

  const group = meshChunk(voxelWorld, chunkX, chunkY, chunkZ, atlasTexture);
  if (group.children.length > 0) worldGroup.add(group);
  chunkMeshes.set(key, group);
}

/**
 * @param {{ showLoading?: boolean }} [options] - Set showLoading false during gameplay rebuilds (no full-screen bar).
 */
function rebuildAllChunks(options = {}) {
  const showLoading = options.showLoading !== false;
  worldGroup.clear();
  chunkMeshes = new Map();
  const keys = Array.from(voxelWorld.chunks.keys());
  const total = Math.max(1, keys.length);
  const verse = 'In the beginning, God created... — Genesis 1:1';
  if (showLoading) setLoadingUI(0, verse);
  for (let i = 0; i < keys.length; i++) {
    const [chunkX, chunkY, chunkZ] = keys[i].split(',').map(Number);
    rebuildChunk(chunkX, chunkY, chunkZ);
    if (showLoading) setLoadingUI((i + 1) / total, verse);
  }
  if (keys.length === 0 && showLoading) setLoadingUI(1, verse);
  syncVoxelWorldFog(scene);
}

function spawnCharacterNear(spawn, characterId) {
  if (spawnCharacterRig) {
    spawnCharacterRig.stopIdle();
    spawnCharacterRig = null;
  }
  if (spawnCharacterGroup) {
    scene.remove(spawnCharacterGroup);
    spawnCharacterGroup = null;
  }

  const def =
    BIBLE_CHARACTERS.find((d) => d.id === characterId) ?? BIBLE_CHARACTERS[0];
  const rig = def.create();
  rig.startIdleAnimation();
  rig.setWalking(false);

  const group = rig.getGroup();
  group.position.set(spawn.x, spawn.y, spawn.z);
  scene.add(group);
  spawnCharacterRig = rig;
  spawnCharacterGroup = group;
}

function loadWorld(worldId) {
  const result = createBibleWorld(worldId);
  voxelWorld = result.world;
  currentWorldId = result.id;
  currentWorldName = result.worldName;

  rebuildAllChunks({ showLoading: false });

  player.world = voxelWorld;
  player.teleportTo(result.spawn);
  spawnCharacterNear(result.spawn, result.spawnCharacterId);

  // Keep the selected character aligned with the world's suggested spawn character.
  characterSelector.setSelectedCharacterId(result.spawnCharacterId);
  if (hud) {
    hud.setCharacterId(characterSelector.getSelectedCharacterId());
    hud.setWorldName(currentWorldName);
  }

  return result;
}

const initial = createBibleWorld('garden');
voxelWorld = initial.world;
scene.add(worldGroup);
rebuildAllChunks();
setLoadingUI(1, 'In the beginning, God created... — Genesis 1:1');

const previewAnchor = new THREE.Group();
previewAnchor.name = 'character_preview';
scene.add(previewAnchor);

let davidCrownOn = false;

const characterSelector = new CharacterSelector({
  onPreviewChange: (group) => {
    previewAnchor.clear();
    previewAnchor.add(group);
    group.position.set(cx + 22, 4, cz);
    group.rotation.y = -0.45;
    sound.playCharacterSelect();
    particles.spawnCharacterStarBurst(cx + 22, 4, cz);
    davidCrownOn = false;
    if (group.userData.setCrownVisible) {
      group.userData.setCrownVisible(false);
    }
  },
  onPlace: (group) => {
    const placed = group.clone(true);
    placed.position.set(
      cx + (Math.random() - 0.5) * 10,
      4,
      cz + (Math.random() - 0.5) * 10
    );
    placed.rotation.y = Math.random() * Math.PI * 2;
    scene.add(placed);
  },
});
characterSelector.mount(document.body);

window.addEventListener('keydown', (e) => {
  if (e.key === 'c' || e.key === 'C') {
    davidCrownOn = !davidCrownOn;
    characterSelector.setDavidCrownVisible(davidCrownOn);
  }
});

const hotbar = new Hotbar({
  inventory,
  isCreative: () => creativeMode,
  allowKeys: () => !inventoryPanelOpen && mode === 'inGame',
});
hotbar.mount(document.body);

function rebuildChunksForChangedBlocks(blockCoords) {
  const keys = new Set();
  for (const p of blockCoords) {
    const { cx: ccx, cy: ccy, cz: ccz } = worldToChunk(p.x, p.y, p.z);
    keys.add(`${ccx},${ccy},${ccz}`);
  }
  for (const key of keys) {
    const [ccx, ccy, ccz] = key.split(',').map(Number);
    rebuildChunk(ccx, ccy, ccz);
  }
}

function neighbors6(x, y, z) {
  return [
    { x, y, z },
    { x: x - 1, y, z },
    { x: x + 1, y, z },
    { x, y: y - 1, z },
    { x, y: y + 1, z },
    { x, y, z: z - 1 },
    { x, y, z: z + 1 },
  ];
}

function breakBlockAt(x, y, z) {
  const cur = voxelWorld.getBlock(x, y, z);
  if (cur === 0) return;
  voxelWorld.setBlock(x, y, z, 0);
  sound.playBlockBreak();
  particles.spawnBlockBreak(x, y, z, cur);
  rebuildChunksForChangedBlocks(neighbors6(x, y, z));
  challengeMode?.notifyWorldChanged();
  if (!creativeMode && !challengeMode) {
    const drop = getDropForBlock(cur);
    if (drop) inventory.add(drop.id, drop.count);
    hotbar.refresh();
  }
}

function placeBlockAt(x, y, z, type) {
  if (!type || type === 0) return;
  if (!challengeMode && !creativeMode) {
    const sel = inventory.getSelectedBlockType();
    if (sel !== type) return;
    const slot = inventory.slots[inventory.selectedHotbarIndex];
    if (!slot?.id || slot.count < 1) return;
    if (!inventory.consumeSelectedForPlace()) return;
  }
  sound.playBlockPlace();
  particles.spawnBlockPlace(x, y, z, type);
  voxelWorld.setBlock(x, y, z, type);
  rebuildChunksForChangedBlocks(neighbors6(x, y, z));
  challengeMode?.notifyWorldChanged();
  if (!creativeMode && !challengeMode) hotbar.refresh();
}

function applyDefaultInventoryForMode() {
  if (creativeMode) inventory.fillCreativeHotbar();
  else inventory.fillStarterSurvival();
  inventory.loadCrafting([]);
}

function applyInventoryFromSaveMeta(meta) {
  if (meta?.inventory && Array.isArray(meta.inventory)) {
    inventory.loadSlots(meta.inventory);
  }
  if (meta?.craftingSlots && Array.isArray(meta.craftingSlots)) {
    inventory.loadCrafting(meta.craftingSlots);
  } else {
    inventory.loadCrafting([]);
  }
  if (typeof meta?.creativeMode === 'boolean') {
    creativeMode = meta.creativeMode;
  } else {
    creativeMode = true;
  }
}

/** @type {InventoryPanel | null} */
let inventoryPanel = null;

function toggleInventoryPanel() {
  if (inventoryPanel) {
    inventoryPanel.unmount();
    inventoryPanel = null;
    inventoryPanelOpen = false;
    return;
  }
  inventoryPanel = new InventoryPanel({
    inventory,
    isCreative: () => creativeMode,
    onClose: () => {
      inventoryPanel?.unmount();
      inventoryPanel = null;
      inventoryPanelOpen = false;
    },
    onChanged: () => hotbar.refresh(),
  });
  inventoryPanelOpen = true;
  inventoryPanel.mount();
}

const player = new PlayerController({
  canvas,
  camera,
  world: voxelWorld,
  scene,
  spawn: initial.spawn,
  getSelectedBlockType: () => hotbar.getSelectedBlockType(),
  placeBlockAt,
  breakBlockAt,
  isCreative: () => creativeMode || !!challengeMode,
  getBreakTimeSeconds: (t) => getBaseBreakSeconds(t),
  onJump: () => sound.playJump(),
  onWalkTick: () => sound.playWalkTick(),
});

camera.position.set(8, 12, 24);
camera.lookAt(new THREE.Vector3(8, 0, 8));
spawnCharacterNear(initial.spawn, initial.spawnCharacterId);

window.addEventListener('keydown', (e) => {
  if (mode !== 'inGame') return;
  if (player.paused) return;
  if (e.repeat) return;
  if (e.key === 'e' || e.key === 'E') {
    const ae = document.activeElement?.tagName;
    if (ae === 'INPUT' || ae === 'TEXTAREA') return;
    e.preventDefault();
    toggleInventoryPanel();
  }
});

// World Select / Menu / HUD state
let hud = null;
let mainMenu = null;

const isTouchLikeDevice =
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches);

/** @type {TouchControls | null} */
let touchControls = null;
if (isTouchLikeDevice) {
  touchControls = new TouchControls({
    canvas,
    player,
    getInGame: () => mode === 'inGame',
  });
  touchControls.mount(document.body);
}

function showAboutPopup() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '250';
  overlay.style.background = 'rgba(0,0,0,0.55)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '1rem';

  const panel = document.createElement('div');
  panel.style.width = 'min(680px, 100%)';
  panel.style.borderRadius = '12px';
  panel.style.border = '3px solid #8b6914';
  panel.style.background =
    'linear-gradient(180deg, rgba(45,36,24,0.98), rgba(26,21,16,0.98))';
  panel.style.boxShadow = '0 16px 70px rgba(0,0,0,0.7)';
  panel.style.padding = '1rem 1.1rem 1.1rem';

  const uiFont = "'Press Start 2P', 'Courier New', Courier, monospace";
  panel.innerHTML = `
    <div style="font-family: ${uiFont}; color:#ffd54f; font-size:0.75rem; line-height:1.7; margin-bottom:0.6rem;">
      About BibleBlocks
    </div>
    <div style="font-family: ${uiFont}; color:#c4b59a; font-size:0.42rem; line-height:1.8; white-space:pre-wrap; margin-bottom:0.9rem;">
Learn about Bible heroes by building their worlds in 3D.\n
Click Play to choose a world, then build and place characters as you learn.
    </div>
    <div style="display:flex; justify-content:flex-end; gap:0.8rem;">
      <button type="button" id="aboutClose" style="font-family: ${uiFont}; font-size:0.5rem; padding:0.55rem 0.8rem; cursor:pointer; color:#1a1510; background:linear-gradient(180deg,#e8d5a8,#c4a574); border:2px solid #5c4a2a; border-radius:6px;">
        Close
      </button>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  panel.querySelector('#aboutClose')?.addEventListener('click', () => overlay.remove());
}

function ensureHUD() {
  if (hud) return hud;
  hud = new HUD({
    getWorldName: () => currentWorldName,
    getCharacterId: () => characterSelector.getSelectedCharacterId(),
    getCreativeMode: () => creativeMode,
    onToggleCreativeMode: () => {
      creativeMode = !creativeMode;
      hotbar.refresh();
      player.setBreakHeld(false);
    },
    onSetPaused: (p) => {
      player.setPaused(p);
      touchControls?.setGamePaused(p);
    },
    onChangeWorld: () => showWorldSelectFromPause(),
    onChangeCharacter: () => showCharacterGalleryFromPause(),
    onMainMenu: () => exitToMainMenu(),
  });
  hud.mount(document.body);
  hud.setWorldName(currentWorldName);
  hud.setCharacterId(characterSelector.getSelectedCharacterId());
  return hud;
}

function clearChallengeIfAny() {
  challengeMode?.unmount();
  challengeMode = null;
}

/**
 * @param {{ skipSave?: boolean }} [options]
 */
function startInGame(options = {}) {
  mode = 'inGame';
  player.setPaused(false);
  ensureHUD();
  if (!options.skipSave) {
    saveManager.startAutoSave(selectedSaveSlot, () => voxelWorld, () => ({
      worldId: currentWorldId,
      worldName: currentWorldName,
      characterId: characterSelector.getSelectedCharacterId(),
      creativeMode,
      inventory: inventory.serializeSlots(),
      craftingSlots: inventory.serializeCrafting(),
    }));
  }
  syncUiForMode();
  touchControls?.setActive(true);
}

function startChallenge(challengeId) {
  clearChallengeIfAny();
  const result = createChallengeWorld(challengeId);
  voxelWorld = result.world;
  currentWorldId = `challenge_${challengeId}`;
  currentWorldName = result.worldName;

  rebuildAllChunks({ showLoading: false });

  player.world = voxelWorld;
  player.teleportTo(result.spawn);
  spawnCharacterNear(result.spawn, result.spawnCharacterId);
  characterSelector.setSelectedCharacterId(result.spawnCharacterId);
  ensureHUD();
  hud.setCharacterId(result.spawnCharacterId);
  hud.setWorldName(currentWorldName);

  challengeMode = new ChallengeMode({
    challengeId,
    scene,
    voxelWorld,
    sound,
    particles,
    onComplete: () => {
      clearChallengeIfAny();
      exitToMainMenu();
    },
  });
  challengeMode.mount(document.body);

  startInGame({ skipSave: true });
}

function showWorldSelectFromMenu() {
  clearChallengeIfAny();
  mainMenu?.unmount();
  mainMenu = null;
  const ws = new WorldSelect({
    onWorldChosen: (worldId) => {
      const result = loadWorld(worldId);
      const saved = saveManager.loadWorld(selectedSaveSlot);
      if (
        saved?.meta?.worldId &&
        resolveWorldId(saved.meta.worldId) === resolveWorldId(worldId)
      ) {
        voxelWorld = saved.world;
        currentWorldId = resolveWorldId(saved.meta.worldId);
        currentWorldName = saved.meta.worldName ?? currentWorldName;
        player.world = voxelWorld;
        rebuildAllChunks({ showLoading: false });
        player.teleportTo(result.spawn);
        const savedChar = saved.meta.characterId ?? result.spawnCharacterId;
        characterSelector.setSelectedCharacterId(savedChar);
        spawnCharacterNear(result.spawn, savedChar);
        applyInventoryFromSaveMeta(saved.meta);
      } else {
        applyDefaultInventoryForMode();
      }
      hotbar.refresh();
      startInGame();
    },
  });
  ws.mount(document.body);
}

function showWorldSelectFromPause() {
  clearChallengeIfAny();
  const ws = new WorldSelect({
    onWorldChosen: (worldId) => {
      const result = loadWorld(worldId);
      const saved = saveManager.loadWorld(selectedSaveSlot);
      if (
        saved?.meta?.worldId &&
        resolveWorldId(saved.meta.worldId) === resolveWorldId(worldId)
      ) {
        voxelWorld = saved.world;
        currentWorldId = resolveWorldId(saved.meta.worldId);
        currentWorldName = saved.meta.worldName ?? currentWorldName;
        player.world = voxelWorld;
        rebuildAllChunks({ showLoading: false });
        player.teleportTo(result.spawn);
        const savedChar = saved.meta.characterId ?? result.spawnCharacterId;
        characterSelector.setSelectedCharacterId(savedChar);
        spawnCharacterNear(result.spawn, savedChar);
        applyInventoryFromSaveMeta(saved.meta);
      } else {
        applyDefaultInventoryForMode();
      }
      hotbar.refresh();
      // Resume after world changes.
      hud?.closePauseMenu?.();
    },
  });
  ws.mount(document.body);
}

function showChallengesFromMenu() {
  clearChallengeIfAny();
  mainMenu?.unmount();
  mainMenu = null;
  sound.playMenuOpen();
  mountChallengeSelect({
    onPick: (id) => {
      startChallenge(id);
    },
    onCancel: () => {
      exitToMainMenu();
    },
  });
}

/**
 * Loads the preset world for this hero, restores the current save slot when it
 * matches that world, then enters gameplay with the chosen character.
 * @param {string} characterId
 */
function enterGameInHeroWorld(characterId) {
  clearChallengeIfAny();
  const worldId = getWorldIdForCharacter(characterId);
  const result = loadWorld(worldId);
  const saved = saveManager.loadWorld(selectedSaveSlot);
  if (
    saved?.meta?.worldId &&
    resolveWorldId(saved.meta.worldId) === resolveWorldId(worldId)
  ) {
    voxelWorld = saved.world;
    currentWorldId = resolveWorldId(saved.meta.worldId);
    currentWorldName = saved.meta.worldName ?? currentWorldName;
    player.world = voxelWorld;
    rebuildAllChunks({ showLoading: false });
    player.teleportTo(result.spawn);
    applyInventoryFromSaveMeta(saved.meta);
  } else {
    applyDefaultInventoryForMode();
  }
  hotbar.refresh();
  characterSelector.setSelectedCharacterId(characterId);
  spawnCharacterNear(result.spawn, characterId);
  startInGame();
  hud.setCharacterId(characterId);
  hud.setWorldName(currentWorldName);
}

function showCharacterGalleryFromMenu() {
  clearChallengeIfAny();
  mainMenu?.unmount();
  mainMenu = null;
  const gallery = new CharacterGallery({
    onSelect: (characterId) => {
      characterSelector.setSelectedCharacterId(characterId);
      if (hud) hud.setCharacterId(characterId);
    },
    onPlayInWorld: (characterId) => {
      enterGameInHeroWorld(characterId);
    },
  });
  gallery.mount(document.body);
}

function showCharacterGalleryFromPause() {
  const gallery = new CharacterGallery({
    onSelect: (characterId) => {
      characterSelector.setSelectedCharacterId(characterId);
      hud?.setCharacterId(characterId);
      hud?.closePauseMenu?.();
    },
    onPlayInWorld: (characterId) => {
      enterGameInHeroWorld(characterId);
      hud?.closePauseMenu?.();
    },
  });
  gallery.mount(document.body);
}

function getSaveSlotsForMenu() {
  const fmtTime = (ms) => {
    if (!ms) return null;
    try {
      return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };
  const slots = [];
  for (let i = 1; i <= 3; i++) {
    const info = saveManager.getSlotInfo(i);
    const hasSaved = !!info?.meta;
    const timeLabel = fmtTime(info?.savedAt);
    slots.push({
      index: i,
      hasSaved,
      label: hasSaved ? `Saved ${timeLabel ?? ''}`.trim() : 'Empty',
    });
  }
  return slots;
}

function exitToMainMenu() {
  mode = 'menu';
  if (inventoryPanel) {
    inventoryPanel.unmount();
    inventoryPanel = null;
    inventoryPanelOpen = false;
  }
  touchControls?.setActive(false);
  clearChallengeIfAny();
  player.setPaused(true);
  saveManager.stopAutoSave();
  hud?.unmount();
  hud = null;
  mainMenu?.unmount();
  mainMenu = new MainMenu({
    onPlay: () => showWorldSelectFromMenu(),
    onChallenges: () => showChallengesFromMenu(),
    onCharacters: () => showCharacterGalleryFromMenu(),
    onAbout: () => showAboutPopup(),
    saveSlots: getSaveSlotsForMenu(),
    selectedSaveSlot,
    onSelectSaveSlot: (slotIndex) => {
      selectedSaveSlot = slotIndex;
    },
  });
  mainMenu.mount(document.body);
  syncUiForMode();
  try {
    sound.playMenuOpen();
  } catch {
    /* Audio can throw before a user gesture; menu must still appear. */
  }
}

// Prompt 7 — Main Menu
// Route initial boot through one code path to avoid menu/crosshair state drift.
exitToMainMenu();
loadingProgress = 1;
hideLoadingOnce();

function onResize() {
  const { width: w, height: h } = getViewportSize();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', onResize);
  window.visualViewport.addEventListener('scroll', onResize);
}
function scheduleViewportFixes() {
  onResize();
  requestAnimationFrame(() => {
    onResize();
    requestAnimationFrame(onResize);
  });
}
scheduleViewportFixes();
setTimeout(scheduleViewportFixes, 50);
setTimeout(scheduleViewportFixes, 250);

function hideLoadingOnce() {
  if (loadingHidden || !loadingScreen) return;
  if (loadingProgress < 1) return;
  loadingHidden = true;
  forceHideLoading();
}

let lastTimeSec = performance.now() / 1000;
/** Main render loop — always requestAnimationFrame (never renderer.setAnimationLoop). iOS WebKit + Three r170: internal _update.bind / setAnimationLoop path has been unstable for some apps. */
let bibleblocksMainLoopRunning = true; // set false to stop scheduling (e.g. teardown)
/** Stops scheduling frames when the tab/app is backgrounded (battery / App Store review). */
let appDocumentVisible = typeof document === 'undefined' ? true : !document.hidden;

document.addEventListener('visibilitychange', () => {
  appDocumentVisible = !document.hidden;
  if (appDocumentVisible && bibleblocksMainLoopRunning) {
    lastTimeSec = performance.now() / 1000;
    requestAnimationFrame(animate);
  }
});

function animate() {
  if (!bibleblocksMainLoopRunning || !appDocumentVisible) return;
  try {
    const time = performance.now() / 1000;
    const deltaTime = time - lastTimeSec;
    lastTimeSec = time;

    updateSky(time * 1000);

    if (mode === 'menu') {
      worldGroup.rotation.y += deltaTime * 0.12;
    } else {
      worldGroup.rotation.y *= 0.98;
    }

    characterSelector.update(time);
    spawnCharacterRig?.update(time);
    player.update(time * 1000, deltaTime);
    particles.update(deltaTime);
    renderer.render(scene, camera);
    hideLoadingOnce();
  } catch (err) {
    console.error('[BibleBlocks] animation tick', err);
  }
  if (bibleblocksMainLoopRunning && appDocumentVisible) {
    requestAnimationFrame(animate);
  }
}

const _loopKind = 'rAF';
const _plat = isIOSWebKit() ? 'iOS-WebKit' : 'other';
console.log(`[BibleBlocks] main loop: ${_loopKind} platform=${_plat} (not setAnimationLoop)`);
requestAnimationFrame(animate);
  } catch (err) {
    console.error('Init error:', formatInitError(err), err);
    document.getElementById('loading-screen')?.classList.add('hidden');
    showInitError(err);
  }
})().catch(reportAsyncInitError);
};

/** Native bridge must define triggerEvent before plugin code runs (see Capacitor native-bridge.js). */
function isCapacitorBridgeReady() {
  return typeof window.Capacitor?.triggerEvent === 'function';
}

function tryStartApp() {
  if (Capacitor.isNativePlatform()) {
    if (!isCapacitorBridgeReady()) {
      return false;
    }
  }
  startApp();
  return true;
}

function scheduleAppBootstrap() {
  const pollBridgeThenStart = () => {
    if (tryStartApp()) return;
    let frames = 0;
    const step = () => {
      frames += 1;
      if (tryStartApp()) return;
      if (frames >= 240 || !Capacitor.isNativePlatform()) {
        if (!appStarted) startApp();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (Capacitor.isNativePlatform()) {
    document.addEventListener('deviceready', pollBridgeThenStart, false);
    setTimeout(() => {
      if (!appStarted) pollBridgeThenStart();
    }, 2000);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pollBridgeThenStart);
  } else {
    pollBridgeThenStart();
  }
}

scheduleAppBootstrap();
