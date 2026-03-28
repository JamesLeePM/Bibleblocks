import { getAtlasCanvas, getAtlasTileXY } from '../assets/TextureAtlas.js';

const DEFAULT_BLOCK_TYPES = [8, 1, 2, 3, 4, 5, 6, 7, 9]; // Grass, Sand, Stone, Wood, Leaf, Water, Gold, Bread, Dirt

function ensureStyle() {
  if (document.getElementById('hotbar-style')) return;
  const style = document.createElement('style');
  style.id = 'hotbar-style';
  style.textContent = `
    .hotbar {
      position: fixed;
      left: 50%;
      bottom: 1.25rem;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      gap: 0.45rem;
      padding: 0.65rem 0.7rem;
      background: linear-gradient(180deg, rgba(45, 36, 24, 0.92), rgba(26, 21, 16, 0.96));
      border: 3px solid #8b6914;
      border-radius: 6px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.45);
      pointer-events: none;
    }
    .hotbar__slot {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      background: rgba(0,0,0,0.25);
      border: 2px solid rgba(212, 175, 55, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
    }
    .hotbar__slot.selected {
      border-color: #ffd54f;
      box-shadow: 0 0 0 2px rgba(255, 213, 79, 0.35), 0 0 18px rgba(255, 213, 79, 0.15);
      background: rgba(255, 213, 79, 0.08);
    }
    .hotbar__icon {
      width: 28px;
      height: 28px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  `;
  document.head.appendChild(style);
}

function renderIconFromAtlas(atlasCanvas, blockType, size = 28) {
  const { tx, ty } = getAtlasTileXY(blockType);
  const tilePx = 16;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  // Center the 16px tile in the icon for nicer padding.
  const pad = Math.floor((size - 16) / 2);
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(
    atlasCanvas,
    tx * tilePx,
    ty * tilePx,
    tilePx,
    tilePx,
    pad,
    pad,
    16,
    16
  );
  return canvas;
}

export class Hotbar {
  constructor(options = {}) {
    this._blockTypes = options.blockTypes ?? DEFAULT_BLOCK_TYPES;
    this._selectedIndex = 0;
    this._onChange = options.onChange ?? (() => {});

    ensureStyle();

    this._root = document.createElement('div');
    this._root.className = 'hotbar';

    this._slots = [];
    const atlasCanvas = getAtlasCanvas();

    for (let i = 0; i < this._blockTypes.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar__slot';

      const icon = document.createElement('canvas');
      icon.className = 'hotbar__icon';

      const rendered = renderIconFromAtlas(atlasCanvas, this._blockTypes[i], 28);
      icon.width = rendered.width;
      icon.height = rendered.height;
      icon.getContext('2d')?.drawImage(rendered, 0, 0);

      slot.appendChild(icon);
      this._root.appendChild(slot);
      this._slots.push(slot);
    }

    this._syncSelection();
    this._bindEvents();
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  unmount() {
    this._root.remove();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) {
        this.setSelectedIndex(n - 1);
      }
    });

    window.addEventListener('wheel', (e) => {
      // Prevent scrolling the page while building.
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      this.setSelectedIndex(this._selectedIndex + dir);
    }, { passive: false });
  }

  _syncSelection() {
    for (let i = 0; i < this._slots.length; i++) {
      this._slots[i].classList.toggle('selected', i === this._selectedIndex);
    }
  }

  setSelectedIndex(i) {
    const n = this._blockTypes.length;
    const next = ((i % n) + n) % n;
    if (next === this._selectedIndex) return;
    this._selectedIndex = next;
    this._syncSelection();
    this._onChange(this.getSelectedBlockType(), next);
  }

  getSelectedBlockType() {
    return this._blockTypes[this._selectedIndex] ?? 8;
  }
}

