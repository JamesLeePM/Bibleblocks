import * as THREE from 'three';
import {
  getGalleryHeroEntries,
  getGalleryPlaceholderLabel,
  getGalleryVoxelDef,
} from '../characters/galleryHeroes.js';

function ensureStyle() {
  if (document.getElementById('character-gallery-style')) return;
  const style = document.createElement('style');
  style.id = 'character-gallery-style';
  style.textContent = `
    .character-gallery-overlay{
      position: fixed;
      inset: 0;
      z-index: 200;
      background: radial-gradient(circle at 50% 30%, rgba(255,213,79,0.16), rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.68));
      padding: 1rem;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .character-gallery{
      width: min(1100px, 100%);
      max-height: min(720px, 88vh);
      border-radius: 12px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.92), rgba(26,21,16,0.98));
      box-shadow: 0 16px 70px rgba(0,0,0,0.6);
      padding: 1rem 1.15rem 1.2rem;
      animation: galleryIn 520ms ease-out both;
      overflow-x: hidden;
      overflow-y: auto;
    }
    @keyframes galleryIn{
      from{ transform: translateY(16px) scale(0.98); opacity: 0; }
      to{ transform: translateY(0px) scale(1); opacity: 1; }
    }
    .character-gallery__header{
      display:flex;
      align-items:flex-start;
      justify-content: flex-start;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .character-gallery__title{
      font-family: 'Press Start 2P', monospace;
      font-size: 1rem;
      color: #ffd54f;
      text-shadow: 0 2px 0 rgba(92,74,42,0.7), 0 0 24px rgba(255,213,79,0.35);
      line-height: 1.7;
    }
    .character-gallery__subtitle{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      color: #c4b59a;
      line-height: 1.8;
      text-align:right;
      max-width: 40ch;
      margin-left: auto;
    }
    .character-gallery__grid{
      display:grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.85rem;
    }
    @media (max-width: 900px){
      .character-gallery__grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 540px){
      .character-gallery__grid{ grid-template-columns: 1fr; }
    }
    .char-card{
      border-radius: 10px;
      border: 2px solid rgba(212,175,55,0.35);
      background: linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.12));
      padding: 0.7rem;
      cursor: pointer;
      transition: transform 140ms ease, border-color 140ms ease;
      user-select:none;
    }
    .char-card:hover{
      transform: translateY(-2px);
      border-color: rgba(255,213,79,0.8);
    }
    .char-card__preview-wrap{
      width: 100%;
      aspect-ratio: 4 / 3;
      max-height: 118px;
      position: relative;
      border-radius: 6px;
      border: 2px solid rgba(212,175,55,0.25);
      background: rgba(0,0,0,0.35);
      overflow: hidden;
    }
    .char-card__canvas{
      display: block;
      width: 100% !important;
      height: 100% !important;
    }
    .char-card__name{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.52rem;
      color: #f5e6c8;
      margin-top: 0.5rem;
      line-height: 1.7;
    }
    .char-card__verse{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.4rem;
      color: #c4b59a;
      margin-top: 0.25rem;
      line-height: 1.6;
    }
    .char-card__desc{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.35rem;
      color: #b6a88e;
      margin-top: 0.4rem;
      line-height: 1.6;
      min-height: 2.2em;
    }
    .char-card__placeholder{
      position: absolute;
      inset: 0;
      border-radius: 4px;
      border: 2px dashed rgba(212,175,55,0.45);
      background: linear-gradient(145deg, rgba(40,32,24,0.9), rgba(20,16,12,0.95));
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .char-card__placeholder-letter{
      font-family: 'Press Start 2P', monospace;
      font-size: 2rem;
      color: rgba(255,213,79,0.55);
      text-shadow: 0 2px 0 rgba(0,0,0,0.4);
    }
    .char-card__placeholder-letter--short{
      font-size: 1.35rem;
      letter-spacing: 0.02em;
    }
    .char-card__badge{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.28rem;
      color: #8bc34a;
      margin-top: 0.35rem;
      line-height: 1.5;
    }

    .fact-popup{
      position: fixed;
      inset: 0;
      z-index: 220;
      display:flex;
      align-items:center;
      justify-content:center;
      padding: 1rem;
      background: rgba(0,0,0,0.55);
    }
    .fact-popup__panel{
      width: min(680px, 100%);
      border-radius: 12px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.98), rgba(26,21,16,0.98));
      padding: 1rem 1.1rem 1.1rem;
      box-shadow: 0 16px 70px rgba(0,0,0,0.7);
      animation: popupIn 320ms ease-out both;
    }
    @keyframes popupIn{
      from{ transform: translateY(10px); opacity: 0; }
      to{ transform: translateY(0px); opacity: 1; }
    }
    .fact-popup__title{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.75rem;
      color: #ffd54f;
      line-height: 1.7;
      margin-bottom: 0.6rem;
    }
    .fact-popup__body{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.42rem;
      color: #c4b59a;
      line-height: 1.8;
      white-space: pre-wrap;
      margin-bottom: 0.9rem;
    }
    .fact-popup__row{
      display:flex;
      justify-content:flex-end;
      gap: 0.8rem;
      flex-wrap: wrap;
    }
    .fact-popup__btn{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      padding: 0.55rem 0.8rem;
      cursor:pointer;
      color: #1a1510;
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
      border: 2px solid #5c4a2a;
      border-radius: 6px;
    }
    .fact-popup__btn--gold{
      background: linear-gradient(180deg, #ffd54f, #c9a227);
    }
  `;
  document.head.appendChild(style);
}

/** Longer kid-friendly blurbs for heroes that also have a 3D voxel preview. */
const VOXEL_FACT_STORIES = {
  david:
    'David learned to trust God even when he felt small. He chose faith, not fear, and God helped him face giants.',
  moses:
    "Moses followed God's voice. Even when things seemed impossible, he led God's people forward with courage.",
  noah:
    'Noah kept building when it was hard. He trusted God and helped protect his family and animals.',
  mary:
    'Mary said “yes” to God. Her gentle heart was ready to serve and love in a special way.',
  daniel:
    'Daniel stayed faithful when the world pressured him. God protected him in the lion’s den.',
  esther:
    'Esther spoke up with bravery. She trusted God and helped save her people.',
  jonah:
    'Jonah learned obedience inside a great fish. God used even a surprise journey to guide him.',
  joshua:
    'Joshua trusted God and obeyed. Step by step, the walls came down at the right time.',
  caleb:
    'Caleb kept his hope strong. He trusted God’s promises and urged the people onward.',
};

/**
 * @param {{ id: string, description: string }} entry
 */
function getFactStoryParagraph(entry) {
  return VOXEL_FACT_STORIES[entry.id] ?? entry.description;
}

/**
 * Full-body voxel preview: fixed 4:3 aspect via ResizeObserver (avoids stretched “flat” torsos).
 * @param {{ create: () => object }} def
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement} wrapEl
 */
function setupCharacterGalleryPreview(def, canvas, wrapEl) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x18120c);

  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  cam.position.set(5.4, 2.85, 4.5);
  cam.lookAt(0, 0.92, 0);

  scene.add(new THREE.HemisphereLight(0xfff2e0, 0x3a3228, 0.58));
  const key = new THREE.DirectionalLight(0xfff5e6, 0.95);
  key.position.set(4.5, 9, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb8c0ff, 0.38);
  fill.position.set(-5, 4, -3);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshStandardMaterial({
      color: 0x2a2418,
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const rig = def.create();
  rig.startIdleAnimation();
  rig.setWalking(false);
  const group = rig.getGroup();
  group.position.set(0, 0, 0);
  group.rotation.y = 0.35;
  group.scale.set(1.48, 1.48, 1.48);
  scene.add(group);

  function resize() {
    const w = Math.max(1, Math.floor(wrapEl.clientWidth));
    const h = Math.max(1, Math.floor(wrapEl.clientHeight));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  resize();

  return { renderer, scene, cam, group, rig, resize, previewWrap: wrapEl };
}

export class CharacterGallery {
  /**
   * @param {{
   *   onSelect?: (characterId: string) => void,
   *   onPlayInWorld?: (characterId: string) => void,
   * }} [options]
   */
  constructor(options = {}) {
    ensureStyle();
    this._onSelect = options.onSelect ?? (() => {});
    this._onPlayInWorld = options.onPlayInWorld ?? null;

    this._root = document.createElement('div');
    this._root.className = 'character-gallery-overlay';
    this._root.setAttribute('role', 'dialog');
    this._root.setAttribute('aria-label', 'Choose a character');

    const panel = document.createElement('div');
    panel.className = 'character-gallery';

    const header = document.createElement('div');
    header.className = 'character-gallery__header';

    const title = document.createElement('div');
    title.className = 'character-gallery__title';
    title.textContent = 'Character Gallery';

    const subtitle = document.createElement('div');
    subtitle.className = 'character-gallery__subtitle';
    subtitle.textContent =
      'Scroll to explore Bible heroes — open a card to read, remember a hero, or build in their world';

    header.append(title, subtitle);

    const grid = document.createElement('div');
    grid.className = 'character-gallery__grid';

    this._previewRigs = [];
    /** @type {ResizeObserver[]} */
    this._resizeObservers = [];

    for (const entry of getGalleryHeroEntries()) {
      const def = getGalleryVoxelDef(entry.id);

      const card = document.createElement('div');
      card.className = 'char-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Open info for ${entry.name}`);

      const name = document.createElement('div');
      name.className = 'char-card__name';
      name.textContent = entry.name;

      const verse = document.createElement('div');
      verse.className = 'char-card__verse';
      verse.textContent = entry.verse;

      const desc = document.createElement('div');
      desc.className = 'char-card__desc';
      desc.textContent = entry.description;

      const previewWrap = document.createElement('div');
      previewWrap.className = 'char-card__preview-wrap';

      if (def) {
        const canvas = document.createElement('canvas');
        canvas.className = 'char-card__canvas';
        previewWrap.appendChild(canvas);
        card.append(previewWrap, name, verse, desc);
        grid.appendChild(card);

        const preview = setupCharacterGalleryPreview(def, canvas, previewWrap);
        this._previewRigs.push(preview);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'char-card__placeholder';
        const letter = document.createElement('span');
        letter.className = 'char-card__placeholder-letter';
        const label = getGalleryPlaceholderLabel(entry);
        letter.textContent = label;
        if (label.length >= 2) letter.classList.add('char-card__placeholder-letter--short');
        placeholder.appendChild(letter);

        const badge = document.createElement('div');
        badge.className = 'char-card__badge';
        badge.textContent = '3D hero coming soon';

        previewWrap.appendChild(placeholder);
        card.append(previewWrap, name, verse, desc, badge);
        grid.appendChild(card);
      }

      const openPopup = () => this._openFactPopup(entry);
      card.addEventListener('click', openPopup);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') openPopup();
      });
    }

    panel.append(header, grid);
    this._root.appendChild(panel);
    this._popup = null;

    this._animating = false;
    this._raf = 0;
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
    for (const p of this._previewRigs) {
      if (p.resize && p.previewWrap) {
        const ro = new ResizeObserver(() => p.resize());
        ro.observe(p.previewWrap);
        this._resizeObservers.push(ro);
      }
    }
    if (!this._animating) this._startLoop();
  }

  unmount() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._animating = false;
    for (const ro of this._resizeObservers) ro.disconnect();
    this._resizeObservers = [];
    if (this._popup) this._popup.remove();
    this._root.remove();
    for (const p of this._previewRigs) {
      p.renderer?.dispose();
    }
  }

  _startLoop() {
    this._animating = true;
    const loop = (t) => {
      if (!this._animating) return;
      for (const p of this._previewRigs) {
        if (!p.rig) continue;
        p.rig.update(t / 1000);
        p.group.rotation.y += 0.006;
        p.renderer.render(p.scene, p.cam);
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  /**
   * @param {{
   *   id: string,
   *   name: string,
   *   verse: string,
   *   description: string,
   *   hasVoxelRig: boolean,
   *   hasWorldPreset: boolean,
   * }} entry
   */
  _openFactPopup(entry) {
    if (this._popup) this._popup.remove();

    const story = getFactStoryParagraph(entry);

    const popup = document.createElement('div');
    popup.className = 'fact-popup';

    const panel = document.createElement('div');
    panel.className = 'fact-popup__panel';

    const title = document.createElement('div');
    title.className = 'fact-popup__title';
    title.textContent = entry.name;

    const body = document.createElement('div');
    body.className = 'fact-popup__body';
    body.textContent = `${entry.verse}\n\n${story}`;

    const row = document.createElement('div');
    row.className = 'fact-popup__row';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'fact-popup__btn';
    close.textContent = 'Close';
    close.addEventListener('click', () => popup.remove());

    row.append(close);

    if (entry.hasVoxelRig) {
      const choose = document.createElement('button');
      choose.type = 'button';
      choose.className = 'fact-popup__btn';
      choose.textContent = 'Remember hero';
      choose.addEventListener('click', () => {
        this._onSelect(entry.id);
        this.unmount();
      });
      row.append(choose);
    }

    if (this._onPlayInWorld && entry.hasWorldPreset) {
      const build = document.createElement('button');
      build.type = 'button';
      build.className = 'fact-popup__btn fact-popup__btn--gold';
      build.textContent = 'Build in their world';
      build.addEventListener('click', () => {
        this._onPlayInWorld(entry.id);
        this.unmount();
      });
      row.append(build);
    }
    panel.append(title, body, row);
    popup.append(panel);

    this._popup = popup;
    this._root.appendChild(popup);

    // Clicking outside closes the popup (optional polish).
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });
  }
}

