import * as THREE from 'three';
import { getAtlasTexture } from './assets/TextureAtlas.js';
import { BIBLE_CHARACTERS, CharacterSelector } from './characters/BibleCharacters.js';
import { meshChunk } from './engine/ChunkMesher.js';
import { worldToChunk } from './engine/VoxelWorld.js';
import { PlayerController } from './engine/PlayerController.js';
import { Hotbar } from './ui/Hotbar.js';
import { createBibleWorld } from './world/BibleWorlds.js';
import { WorldSelect } from './ui/WorldSelect.js';
import { MainMenu } from './ui/MainMenu.js';
import { CharacterGallery } from './ui/CharacterGallery.js';
import { HUD } from './ui/HUD.js';
import { SoundManager } from './audio/SoundManager.js';
import { Particles } from './engine/Particles.js';
import { SaveManager } from './world/SaveManager.js';
import {
  ChallengeMode,
  createChallengeWorld,
  mountChallengeSelect,
} from './modes/ChallengeMode.js';

const canvas = document.getElementById('game-canvas');
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

// Hard failsafe: never leave families staring at a stuck loader.
setTimeout(() => {
  forceHideLoading();
}, 4000);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4e0, 1.05);
sun.position.set(80, 120, 60);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 400;
sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;
scene.add(sun);

const atlasTexture = getAtlasTexture();
const sound = new SoundManager();
const particles = new Particles(scene);
const saveManager = new SaveManager();

// Prompt 8: day/night cycle, stars, fog.
const skyBlue = new THREE.Color(0x87ceeb);
const skyDusk = new THREE.Color(0xffa64d);
const skyNight = new THREE.Color(0x0b1d3a);

scene.fog = new THREE.Fog(skyBlue, 35, 240);

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

  // Clear color drives "sky" feel behind the fogged scene.
  renderer.setClearColor(sky, 1);
  if (scene.fog) scene.fog.color.copy(sky);

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
  // Failsafe: hide as soon as we reach 100%, even outside animation timing.
  if (loadingProgress >= 1) {
    hideLoadingOnce();
  }
}

function rebuildChunk(chunkX, chunkY, chunkZ) {
  const key = `${chunkX},${chunkY},${chunkZ}`;
  const old = chunkMeshes.get(key);
  if (old && old.parent) old.parent.remove(old);

  const group = meshChunk(voxelWorld, chunkX, chunkY, chunkZ, atlasTexture);
  if (group.children.length > 0) worldGroup.add(group);
  chunkMeshes.set(key, group);
}

function rebuildAllChunks() {
  worldGroup.clear();
  chunkMeshes = new Map();
  const keys = Array.from(voxelWorld.chunks.keys());
  const total = Math.max(1, keys.length);
  const verse = 'In the beginning, God created... — Genesis 1:1';
  setLoadingUI(0, verse);
  for (let i = 0; i < keys.length; i++) {
    const [chunkX, chunkY, chunkZ] = keys[i].split(',').map(Number);
    rebuildChunk(chunkX, chunkY, chunkZ);
    setLoadingUI((i + 1) / total, verse);
  }
  if (keys.length === 0) setLoadingUI(1, verse);
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
  currentWorldId = worldId;
  currentWorldName = result.worldName;

  rebuildAllChunks();

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

const hotbar = new Hotbar();
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
}

function placeBlockAt(x, y, z, type) {
  if (!type || type === 0) return;
  sound.playBlockPlace();
  particles.spawnBlockPlace(x, y, z, type);
  voxelWorld.setBlock(x, y, z, type);
  rebuildChunksForChangedBlocks(neighbors6(x, y, z));
  challengeMode?.notifyWorldChanged();
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
  onJump: () => sound.playJump(),
  onWalkTick: () => sound.playWalkTick(),
});

camera.position.set(initial.spawn.x, initial.spawn.y + 1.7, initial.spawn.z);
camera.lookAt(new THREE.Vector3(cx, initial.spawn.y + 0.8, cz + 10));
spawnCharacterNear(initial.spawn, initial.spawnCharacterId);

// World Select / Menu / HUD state
let mode = 'menu'; // 'menu' | 'inGame'
let hud = null;
let mainMenu = null;

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

  panel.innerHTML = `
    <div style="font-family: 'Press Start 2P', monospace; color:#ffd54f; font-size:0.75rem; line-height:1.7; margin-bottom:0.6rem;">
      About BibleBlocks
    </div>
    <div style="font-family: 'Press Start 2P', monospace; color:#c4b59a; font-size:0.42rem; line-height:1.8; white-space:pre-wrap; margin-bottom:0.9rem;">
Learn about Bible heroes by building their worlds in 3D.\n
Click Play to choose a world, then build and place characters as you learn.
    </div>
    <div style="display:flex; justify-content:flex-end; gap:0.8rem;">
      <button type="button" id="aboutClose" style="font-family: 'Press Start 2P', monospace; font-size:0.5rem; padding:0.55rem 0.8rem; cursor:pointer; color:#1a1510; background:linear-gradient(180deg,#e8d5a8,#c4a574); border:2px solid #5c4a2a; border-radius:6px;">
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
    onSetPaused: (p) => player.setPaused(p),
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
    }));
  }
  syncUiForMode();
}

function startChallenge(challengeId) {
  clearChallengeIfAny();
  const result = createChallengeWorld(challengeId);
  voxelWorld = result.world;
  currentWorldId = `challenge_${challengeId}`;
  currentWorldName = result.worldName;

  rebuildAllChunks();

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
      if (saved?.meta?.worldId && saved.meta.worldId === worldId) {
        voxelWorld = saved.world;
        currentWorldId = saved.meta.worldId;
        currentWorldName = saved.meta.worldName ?? currentWorldName;
        player.world = voxelWorld;
        rebuildAllChunks();
        player.teleportTo(result.spawn);
        const savedChar = saved.meta.characterId ?? result.spawnCharacterId;
        characterSelector.setSelectedCharacterId(savedChar);
        spawnCharacterNear(result.spawn, savedChar);
      }
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
      if (saved?.meta?.worldId && saved.meta.worldId === worldId) {
        voxelWorld = saved.world;
        currentWorldId = saved.meta.worldId;
        currentWorldName = saved.meta.worldName ?? currentWorldName;
        player.world = voxelWorld;
        rebuildAllChunks();
        player.teleportTo(result.spawn);
        const savedChar = saved.meta.characterId ?? result.spawnCharacterId;
        characterSelector.setSelectedCharacterId(savedChar);
        spawnCharacterNear(result.spawn, savedChar);
      }
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

function showCharacterGalleryFromMenu() {
  clearChallengeIfAny();
  mainMenu?.unmount();
  mainMenu = null;
  const gallery = new CharacterGallery({
    onSelect: (characterId) => {
      characterSelector.setSelectedCharacterId(characterId);
      if (hud) hud.setCharacterId(characterId);
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

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

function hideLoadingOnce() {
  if (loadingHidden || !loadingScreen) return;
  if (loadingProgress < 1) return;
  loadingHidden = true;
  forceHideLoading();
}

let lastTime = performance.now();
function animate(timeMs) {
  requestAnimationFrame(animate);
  const deltaTime = (timeMs - lastTime) / 1000;
  lastTime = timeMs;

  updateSky(timeMs);

  if (mode === 'menu') {
    // Slow-panning rotating background.
    worldGroup.rotation.y += deltaTime * 0.12;
  } else {
    // Keep the background calm.
    worldGroup.rotation.y *= 0.98;
  }

  characterSelector.update(timeMs);
  player.update(timeMs, deltaTime);
  particles.update(deltaTime);
  renderer.render(scene, camera);
  hideLoadingOnce();
}
requestAnimationFrame(animate);
