import { getAtlasCanvas, getAtlasTileXY } from '../assets/TextureAtlas.js';
import { HOTBAR_SIZE, INVENTORY_SLOTS } from '../engine/BlockRegistry.js';
import { findMatchingRecipe } from '../inventory/CraftingRecipes.js';

function ensureStyle() {
  if (document.getElementById('inventory-panel-style')) return;
  const style = document.createElement('style');
  style.id = 'inventory-panel-style';
  style.textContent = `
    .inv-panel-overlay{
      position: fixed;
      inset: 0;
      z-index: 170;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .inv-panel{
      border-radius: 10px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.96), rgba(26,21,16,0.98));
      padding: 0.85rem 1rem 1rem;
      box-shadow: 0 16px 60px rgba(0,0,0,0.55);
      max-width: min(560px, 100%);
    }
    .inv-panel__title{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      color: #ffd54f;
      margin-bottom: 0.65rem;
      text-align: center;
    }
    .inv-panel__hint{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.32rem;
      color: #a89878;
      text-align: center;
      margin-bottom: 0.65rem;
      line-height: 1.7;
    }
    .inv-panel__section{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.35rem;
      color: #c4b59a;
      margin-bottom: 0.4rem;
      margin-top: 0.35rem;
    }
    .inv-craft-row{
      display: flex;
      align-items: center;
      gap: 0.55rem;
      margin-bottom: 0.65rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .inv-craft-grid2{
      display: grid;
      grid-template-columns: repeat(2, 40px);
      gap: 0.3rem;
    }
    .inv-craft-arrow{
      font-family: 'Press Start 2P', monospace;
      color: #ffd54f;
      font-size: 0.45rem;
      user-select: none;
    }
    .inv-panel__grid{
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 0.35rem;
    }
    .inv-slot{
      width: 40px;
      height: 40px;
      border-radius: 4px;
      background: rgba(0,0,0,0.28);
      border: 2px solid rgba(212,175,55,0.28);
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .inv-slot:hover{
      border-color: rgba(255,213,79,0.55);
    }
    .inv-slot--preview{
      border-style: dashed;
      opacity: 0.95;
    }
    .inv-slot__icon{
      width: 28px;
      height: 28px;
      image-rendering: pixelated;
    }
    .inv-slot__count{
      position: absolute;
      right: 2px;
      bottom: 0;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.28rem;
      color: #fff;
      text-shadow: 1px 1px 0 #000;
      pointer-events: none;
    }
    .inv-panel__gap{
      height: 0.35rem;
    }
  `;
  document.head.appendChild(style);
}

function tileIconCanvas(atlasCanvas, blockType, size = 28) {
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

export class InventoryPanel {
  /**
   * @param {{
   *   inventory: import('../inventory/Inventory.js').Inventory,
   *   isCreative: () => boolean,
   *   onClose: () => void,
   *   onChanged?: () => void,
   * }} opts
   */
  constructor(opts) {
    ensureStyle();
    this._onClose = opts.onClose;
    this._onChanged = opts.onChanged ?? (() => {});
    this._inv = opts.inventory;
    this._isCreative = opts.isCreative;

    this._root = document.createElement('div');
    this._root.className = 'inv-panel-overlay';
    this._root.setAttribute('role', 'dialog');
    this._root.setAttribute('aria-label', 'Inventory');

    const panel = document.createElement('div');
    panel.className = 'inv-panel';

    const title = document.createElement('div');
    title.className = 'inv-panel__title';
    title.textContent = 'Inventory & Crafting';

    const hint = document.createElement('div');
    hint.className = 'inv-panel__hint';
    hint.textContent =
      '2×2 crafting: place items from the hotbar (selected slot). Click a crafting cell to add one block, click again to return to your bag. Click the result to craft. E or Esc to close.';

    const craftLabel = document.createElement('div');
    craftLabel.className = 'inv-panel__section';
    craftLabel.textContent = 'Crafting';

    const craftRow = document.createElement('div');
    craftRow.className = 'inv-craft-row';

    const craftGrid = document.createElement('div');
    craftGrid.className = 'inv-craft-grid2';

    this._craftEls = [];
    const atlasCanvas = getAtlasCanvas();

    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.tabIndex = 0;
      const icon = document.createElement('canvas');
      icon.className = 'inv-slot__icon';
      const count = document.createElement('div');
      count.className = 'inv-slot__count';
      slot.append(icon, count);
      slot.addEventListener('click', () => this._onCraftingSlotClick(i));
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this._onCraftingSlotClick(i);
      });
      craftGrid.appendChild(slot);
      this._craftEls.push({ slot, icon, count });
    }

    const arrow = document.createElement('div');
    arrow.className = 'inv-craft-arrow';
    arrow.textContent = '→';

    const outSlot = document.createElement('div');
    outSlot.className = 'inv-slot inv-slot--preview';
    outSlot.title = 'Click to craft';
    const outIcon = document.createElement('canvas');
    outIcon.className = 'inv-slot__icon';
    const outCount = document.createElement('div');
    outCount.className = 'inv-slot__count';
    outSlot.append(outIcon, outCount);
    outSlot.addEventListener('click', () => this._onCraftOutputClick());
    outSlot.tabIndex = 0;

    craftRow.append(craftGrid, arrow, outSlot);
    this._outCraft = { slot: outSlot, icon: outIcon, count: outCount };

    const invLabel = document.createElement('div');
    invLabel.className = 'inv-panel__section';
    invLabel.textContent = 'Bag';

    const grid = document.createElement('div');
    grid.className = 'inv-panel__grid';

    this._slotEls = [];

    for (let i = 0; i < INVENTORY_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.tabIndex = 0;
      const icon = document.createElement('canvas');
      icon.className = 'inv-slot__icon';
      const count = document.createElement('div');
      count.className = 'inv-slot__count';
      slot.append(icon, count);
      slot.addEventListener('click', () => this._onSlotClick(i));
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this._onSlotClick(i);
      });
      grid.appendChild(slot);
      this._slotEls.push({ slot, icon, count });
    }

    const gap = document.createElement('div');
    gap.className = 'inv-panel__gap';

    panel.append(
      title,
      hint,
      craftLabel,
      craftRow,
      invLabel,
      grid,
      gap
    );
    this._root.appendChild(panel);

    this._atlasCanvas = atlasCanvas;

    this._onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        this._onClose();
      }
    };
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
    this._refresh();
    window.addEventListener('keydown', this._onKey);
    this._root.addEventListener('click', (e) => {
      if (e.target === this._root) this._onClose();
    });
  }

  unmount() {
    window.removeEventListener('keydown', this._onKey);
    this._root.remove();
  }

  refresh() {
    this._refresh();
  }

  _onCraftingSlotClick(index) {
    const hb = this._inv.slots[this._inv.selectedHotbarIndex];
    const c = this._inv.craftingSlots[index];
    const creative = this._isCreative();
    if (c.id > 0) {
      if (!creative) {
        this._inv.add(c.id, c.count);
      }
      c.id = 0;
      c.count = 0;
    } else if (hb.id > 0) {
      if (creative) {
        c.id = hb.id;
        c.count = 1;
      } else {
        const id = hb.id;
        hb.count--;
        if (hb.count <= 0) {
          hb.id = 0;
          hb.count = 0;
        }
        c.id = id;
        c.count = 1;
      }
    }
    this._refresh();
    this._onChanged();
  }

  _onCraftOutputClick() {
    if (this._inv.tryCraftOutput()) {
      this._refresh();
      this._onChanged();
    }
  }

  _onSlotClick(index) {
    if (index < HOTBAR_SIZE) {
      this._inv.setSelectedHotbarIndex(index);
      this._onChanged();
      return;
    }
    const hb = this._inv.selectedHotbarIndex;
    if (index === hb) return;
    const a = this._inv.slots[index];
    const b = this._inv.slots[hb];
    this._inv.slots[index] = { id: b.id, count: b.count };
    this._inv.slots[hb] = { id: a.id, count: a.count };
    this._refresh();
    this._onChanged();
  }

  _paintSlot(icon, countEl, s, creative, hotbarIdx) {
    const id = s.id ?? 0;
    const ctx = icon.getContext('2d');
    if (id > 0) {
      const rendered = tileIconCanvas(this._atlasCanvas, id, 28);
      icon.width = rendered.width;
      icon.height = rendered.height;
      ctx?.drawImage(rendered, 0, 0);
      if (creative && typeof hotbarIdx === 'number' && hotbarIdx < HOTBAR_SIZE) {
        countEl.textContent = '';
      } else {
        countEl.textContent = id && s.count > 1 ? String(s.count) : '';
      }
    } else {
      icon.width = 28;
      icon.height = 28;
      ctx?.clearRect(0, 0, 28, 28);
      countEl.textContent = '';
    }
  }

  _refresh() {
    const creative = this._isCreative();

    for (let i = 0; i < 4; i++) {
      this._paintSlot(
        this._craftEls[i].icon,
        this._craftEls[i].count,
        this._inv.craftingSlots[i],
        creative,
        undefined
      );
    }

    const recipe = findMatchingRecipe(this._inv.craftingSlots);
    const { icon: oi, count: oc, slot: os } = this._outCraft;
    const ctx = oi.getContext('2d');
    if (recipe) {
      const rendered = tileIconCanvas(this._atlasCanvas, recipe.out.id, 28);
      oi.width = rendered.width;
      oi.height = rendered.height;
      ctx?.drawImage(rendered, 0, 0);
      oc.textContent =
        recipe.out.count > 1 ? String(recipe.out.count) : '';
      os.classList.add('inv-slot--preview');
    } else {
      oi.width = 28;
      oi.height = 28;
      ctx?.clearRect(0, 0, 28, 28);
      oc.textContent = '';
    }

    for (let i = 0; i < INVENTORY_SLOTS; i++) {
      const s = this._inv.slots[i];
      this._paintSlot(
        this._slotEls[i].icon,
        this._slotEls[i].count,
        s,
        creative,
        i
      );
    }
  }
}
