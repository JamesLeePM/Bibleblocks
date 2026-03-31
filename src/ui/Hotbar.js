import { getAtlasCanvas, getAtlasTileXY } from '../assets/TextureAtlas.js';
import { HOTBAR_SIZE } from '../engine/BlockRegistry.js';

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
      z-index: 155;
      display: flex;
      gap: 0.45rem;
      padding: 0.65rem 0.7rem;
      background: linear-gradient(180deg, rgba(45, 36, 24, 0.92), rgba(26, 21, 16, 0.96));
      border: 3px solid #8b6914;
      border-radius: 6px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.45);
      pointer-events: auto;
      touch-action: none;
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
      position: relative;
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
    .hotbar__count {
      position: absolute;
      right: 2px;
      bottom: 0;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.28rem;
      color: #fff;
      text-shadow: 1px 1px 0 #000;
      pointer-events: none;
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
  /**
   * @param {{
   *   inventory: import('../inventory/Inventory.js').Inventory,
   *   isCreative: () => boolean,
   *   allowKeys?: () => boolean,
   *   onChange?: (blockType: number, index: number) => void,
   * }} options
   */
  constructor(options = {}) {
    this._inv = options.inventory;
    if (!this._inv) throw new Error('Hotbar requires inventory');
    this._isCreative = options.isCreative ?? (() => true);
    this._allowKeys = options.allowKeys ?? (() => true);
    this._onChange = options.onChange ?? (() => {});

    ensureStyle();

    this._root = document.createElement('div');
    this._root.className = 'hotbar';

    this._slotEls = [];
    const atlasCanvas = getAtlasCanvas();

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar__slot';

      const icon = document.createElement('canvas');
      icon.className = 'hotbar__icon';
      const count = document.createElement('div');
      count.className = 'hotbar__count';

      slot.append(icon, count);
      this._root.appendChild(slot);
      this._slotEls.push({ slot, icon, count });
    }

    this._atlasCanvas = atlasCanvas;
    this._syncSelection();
    this.refresh();
    this._bindEvents();
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  unmount() {
    this._root.remove();
  }

  refresh() {
    const creative = this._isCreative();
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const { icon, count } = this._slotEls[i];
      const s = this._inv.slots[i];
      const id = s?.id ?? 0;
      const ctx = icon.getContext('2d');
      if (id > 0) {
        const rendered = renderIconFromAtlas(this._atlasCanvas, id, 28);
        icon.width = rendered.width;
        icon.height = rendered.height;
        ctx?.drawImage(rendered, 0, 0);
        count.textContent =
          creative || !id ? '' : s.count > 1 ? String(s.count) : '';
      } else {
        icon.width = 28;
        icon.height = 28;
        ctx?.clearRect(0, 0, 28, 28);
        count.textContent = '';
      }
    }
    this._syncSelection();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this._allowKeys()) return;
      if (e.repeat) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) {
        this.setSelectedIndex(n - 1);
      }
    });

    window.addEventListener(
      'wheel',
      (e) => {
        if (!this._allowKeys()) return;
        e.preventDefault();
        const dir = e.deltaY > 0 ? 1 : -1;
        this.setSelectedIndex(this._inv.selectedHotbarIndex + dir);
      },
      { passive: false }
    );

    let swipeStartX = null;
    this._root.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        swipeStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    this._root.addEventListener(
      'touchend',
      (e) => {
        if (swipeStartX == null) return;
        const x = e.changedTouches[0]?.clientX;
        if (x == null) {
          swipeStartX = null;
          return;
        }
        const dx = x - swipeStartX;
        swipeStartX = null;
        if (Math.abs(dx) < 48) return;
        this.setSelectedIndex(this._inv.selectedHotbarIndex + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );
  }

  _syncSelection() {
    const sel = this._inv.selectedHotbarIndex;
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      this._slotEls[i].slot.classList.toggle('selected', i === sel);
    }
  }

  setSelectedIndex(i) {
    const n = HOTBAR_SIZE;
    const next = ((i % n) + n) % n;
    if (next === this._inv.selectedHotbarIndex) return;
    this._inv.setSelectedHotbarIndex(next);
    this._syncSelection();
    this._onChange(this.getSelectedBlockType(), next);
  }

  getSelectedBlockType() {
    return this._inv.getSelectedBlockType();
  }
}
