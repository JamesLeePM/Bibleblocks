import { WORLD_PRESETS } from '../world/BibleWorlds.js';

function ensureStyle() {
  if (document.getElementById('world-select-style')) return;
  const style = document.createElement('style');
  style.id = 'world-select-style';
  style.textContent = `
    .world-select-overlay{
      position: fixed;
      inset: 0;
      z-index: 200;
      background: radial-gradient(circle at 50% 30%, rgba(255,213,79,0.18), rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.55) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .world-select{
      width: min(980px, 100%);
      border-radius: 10px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.92), rgba(26,21,16,0.98));
      box-shadow: 0 14px 60px rgba(0,0,0,0.55);
      color: #f5e6c8;
      padding: 1rem 1.15rem 1.25rem;
      animation: worldSelectIn 520ms ease-out both;
    }
    @keyframes worldSelectIn{
      from{ transform: translateY(14px) scale(0.98); opacity: 0; }
      to{ transform: translateY(0px) scale(1); opacity: 1; }
    }
    .world-select__header{
      display:flex;
      align-items:center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .world-select__title{
      font-family: 'Press Start 2P', monospace;
      font-size: 1rem;
      color: #ffd54f;
      text-shadow: 0 2px 0 rgba(92,74,42,0.65);
      line-height: 1.7;
    }
    .world-select__subtitle{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      color: #c4b59a;
      line-height: 1.7;
      max-width: 38ch;
      text-align: right;
    }
    .world-select__grid{
      display:grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem;
    }
    @media (max-width: 720px){
      .world-select__grid{ grid-template-columns: 1fr; }
    }
    .world-card{
      border-radius: 8px;
      border: 2px solid rgba(212,175,55,0.35);
      background: linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.12));
      padding: 0.8rem;
      cursor: pointer;
      transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
      animation: worldCardIn 520ms cubic-bezier(.2,.8,.2,1) both;
    }
    @keyframes worldCardIn{
      from{ transform: translateY(8px); opacity: 0; }
      to{ transform: translateY(0px); opacity: 1; }
    }
    .world-card:hover{
      transform: translateY(-2px);
      border-color: rgba(255,213,79,0.8);
    }
    .world-card__row{
      display:flex;
      align-items:flex-start;
      gap: 0.8rem;
    }
    .world-card__preview{
      width: 96px;
      height: 64px;
      border-radius: 6px;
      border: 2px solid rgba(212,175,55,0.25);
      background: rgba(0,0,0,0.25);
      flex: 0 0 auto;
    }
    .world-card__name{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      color: #f5e6c8;
      margin-top: 0.05rem;
      line-height: 1.7;
    }
    .world-card__desc{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.42rem;
      color: #c4b59a;
      margin-top: 0.35rem;
      line-height: 1.6;
    }
    .world-card__cta{
      margin-top: 0.7rem;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.42rem;
      color: #1a1510;
      background: linear-gradient(180deg, #ffd54f, #c9a227);
      border: 2px solid #5c4a2a;
      border-radius: 4px;
      padding: 0.45rem 0.6rem;
      display:inline-block;
    }
  `;
  document.head.appendChild(style);
}

function drawPreview(canvas, worldId) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;

  // Background
  ctx.fillStyle = '#2c2418';
  ctx.fillRect(0, 0, w, h);

  const pxSize = 4;
  const gridW = Math.floor(w / pxSize);
  const gridH = Math.floor(h / pxSize);

  function pixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * pxSize, y * pxSize, pxSize, pxSize);
  }

  if (worldId === 'garden') {
    // Sun
    for (let x = 1; x <= 3; x++) pixel(x, 2, '#ffd54f');
    pixel(5, 1, '#fff9c4');
    // Hills
    for (let x = 0; x < gridW; x++) {
      const y = 9 + Math.floor(Math.sin(x / 3) * 1.2);
      if (y >= 0 && y < gridH) pixel(x, y, '#5cb85c');
      if (y + 1 < gridH && (x % 2 === 0)) pixel(x, y + 1, '#4a7c3f');
    }
    // Tree
    for (let y = 3; y < 10; y++) pixel(5, y, '#6d4c41');
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > 3) continue;
        pixel(5 + dx, 2 + dz, '#43a047');
      }
    }
    // River line
    for (let x = 1; x < gridW - 1; x++) pixel(x, 7, '#1e88e5');
  } else if (worldId === 'desert') {
    // Sun
    for (let x = 2; x <= 6; x++) pixel(x, 2, '#ffca28');
    for (let y = 1; y <= 3; y++) pixel(5, y, '#fff9c4');
    // Dunes
    for (let x = 0; x < gridW; x++) {
      const y = 9 + Math.floor(Math.cos(x / 2.3) * 1.1);
      for (let k = 0; k < 2; k++) pixel(x, y - k, '#e8d5a8');
      if (y - 2 > 0 && x % 3 === 0) pixel(x, y - 2, '#c4a574');
    }
    // Burning bush glow
    for (let dx = -1; dx <= 1; dx++) for (let dy = 0; dy < 3; dy++) pixel(3 + dx, 6 + dy, '#ffd54f');
    for (let dy = 0; dy < 3; dy++) pixel(3, 5 - dy, '#6d4c41');
    // Parted sea
    for (let z = 5; z < 12; z++) {
      pixel(1, z, '#1565c0');
      pixel(gridW - 2, z, '#1565c0');
      if (z % 2 === 0) pixel(Math.floor(gridW / 2), z, '#e8d5a8');
    }
  } else if (worldId === 'ark') {
    // Water base
    for (let x = 0; x < gridW; x++) for (let y = 9; y < gridH; y++) pixel(x, y, '#1e88e5');
    // Ark hull
    for (let x = 2; x < 10; x++) for (let y = 6; y < 9; y++) pixel(x, y, '#7a5545');
    for (let x = 4; x < 8; x++) pixel(x, 5, '#5d4037');
    // Ramp
    for (let i = 0; i < 6; i++) for (let x = 6 - i; x <= 7 - i; x++) pixel(x, 8 - i, '#6d4c41');
    // Storm clouds
    for (let x = 1; x <= 6; x++) for (let y = 1; y <= 3; y++) if (x + y < 7) pixel(x, y, '#9e9e9e');
  } else if (worldId === 'david') {
    // Valley
    for (let x = 0; x < gridW; x++) {
      const y = 10 + Math.floor(Math.abs(x - gridW / 2) / 3);
      pixel(x, y, '#5cb85c');
      if (y + 1 < gridH) pixel(x, y + 1, '#2e7d32');
    }
    // Stream
    for (let z = 2; z < gridH; z++) {
      pixel(Math.floor(gridW / 2), z, '#1e88e5');
      if (z % 2 === 0) pixel(Math.floor(gridW / 2) - 1, z, '#1565c0');
    }
    // Stones
    const stonesX = [6, 7, 8, 9, 10];
    for (let i = 0; i < 5; i++) {
      const x = stonesX[i];
      pixel(x, 8, '#9e9e9e');
      pixel(x, 9, '#6d6d6d');
      pixel(x - 1, 9, '#6d6d6d');
    }
    // Goliath silhouette
    for (let y = 1; y < 12; y++) pixel(12, y, '#7b7b7b');
  }
}

export class WorldSelect {
  /** @param {{ onWorldChosen?: (worldId: string) => void }} [options] */
  constructor(options = {}) {
    this._onWorldChosen = options.onWorldChosen ?? (() => {});
    ensureStyle();

    this._root = document.createElement('div');
    this._root.className = 'world-select-overlay';
    this._root.setAttribute('role', 'dialog');
    this._root.setAttribute('aria-label', 'Choose a world');

    this._panel = document.createElement('div');
    this._panel.className = 'world-select';

    const header = document.createElement('div');
    header.className = 'world-select__header';

    const title = document.createElement('div');
    title.className = 'world-select__title';
    title.textContent = 'World Select';

    const subtitle = document.createElement('div');
    subtitle.className = 'world-select__subtitle';
    subtitle.textContent = 'Pick a Bible World and start building';

    header.append(title, subtitle);

    const grid = document.createElement('div');
    grid.className = 'world-select__grid';

    const cards = WORLD_PRESETS;
    cards.forEach((preset, idx) => {
      const card = document.createElement('div');
      card.className = 'world-card';
      card.style.animationDelay = `${idx * 60}ms`;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Load ${preset.name}`);

      const row = document.createElement('div');
      row.className = 'world-card__row';

      const canvas = document.createElement('canvas');
      canvas.className = 'world-card__preview';
      canvas.width = 96;
      canvas.height = 64;
      drawPreview(canvas, preset.id);

      const meta = document.createElement('div');
      meta.style.flex = '1 1 auto';

      const name = document.createElement('div');
      name.className = 'world-card__name';
      name.textContent = preset.name;

      const desc = document.createElement('div');
      desc.className = 'world-card__desc';
      desc.textContent = preset.description;

      meta.append(name, desc);
      row.append(canvas, meta);

      const cta = document.createElement('div');
      cta.className = 'world-card__cta';
      cta.textContent = 'Click to build';

      card.append(row, cta);
      card.addEventListener('click', () => this._onChoose(preset.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this._onChoose(preset.id);
      });
      grid.appendChild(card);
    });

    this._panel.append(header, grid);
    this._root.appendChild(this._panel);
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  unmount() {
    this._root.remove();
  }

  _onChoose(worldId) {
    this.unmount();
    this._onWorldChosen(worldId);
  }
}

