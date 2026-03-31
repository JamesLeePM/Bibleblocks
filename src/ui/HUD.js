import { getAtlasCanvas, getAtlasTileXY } from '../assets/TextureAtlas.js';
import { BIBLE_CHARACTERS } from '../characters/BibleCharacters.js';

function ensureStyle() {
  if (document.getElementById('hud-style')) return;
  const style = document.createElement('style');
  style.id = 'hud-style';
  style.textContent = `
    .hud{
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 200;
    }
    .hud__top-left{
      position:absolute;
      left: 1rem;
      top: 1rem;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      color: #ffd54f;
      text-shadow: 0 2px 0 rgba(92,74,42,0.6);
      pointer-events:none;
      max-width: 50vw;
      line-height: 1.7;
    }
    .hud__top-right{
      position:absolute;
      right: 1rem;
      top: 1rem;
      display:flex;
      align-items:center;
      gap: 0.65rem;
      pointer-events:none;
    }
    .hud__char-icon{
      width: 26px;
      height: 26px;
      border-radius: 6px;
      border: 2px solid rgba(212,175,55,0.35);
      background: rgba(0,0,0,0.25);
      pointer-events:none;
      overflow:hidden;
    }
    .hud__char-name{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.48rem;
      color: #f5e6c8;
      text-shadow: 0 2px 0 rgba(92,74,42,0.6);
      line-height: 1.7;
      pointer-events:none;
    }
    .hud__fact-btn{
      position:absolute;
      right: 1rem;
      bottom: 1rem;
      pointer-events:auto;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      color: #1a1510;
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
      border: 2px solid #5c4a2a;
      border-radius: 6px;
      box-shadow: 0 10px 26px rgba(0,0,0,0.35);
    }
    .hud__fact-btn:active{
      transform: translateY(1px);
    }

    .pause-overlay{
      position: fixed;
      inset: 0;
      z-index: 220;
      background: rgba(0,0,0,0.55);
      display:flex;
      align-items:center;
      justify-content:center;
      padding: 1rem;
    }
    .pause-panel{
      width: min(740px, 100%);
      border-radius: 12px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.98), rgba(26,21,16,0.98));
      box-shadow: 0 16px 70px rgba(0,0,0,0.7);
      padding: 1rem 1.1rem 1.1rem;
    }
    .pause-title{
      font-family: 'Press Start 2P', monospace;
      color: #ffd54f;
      font-size: 0.9rem;
      line-height: 1.7;
      margin-bottom: 0.8rem;
    }
    .pause-buttons{
      display:grid;
      grid-template-columns: 1fr;
      gap: 0.65rem;
    }
    .pause-btn{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      padding: 0.7rem 1rem;
      cursor:pointer;
      color: #1a1510;
      background: linear-gradient(180deg, #ffd54f, #c9a227);
      border: 2px solid #5c4a2a;
      border-radius: 8px;
      text-align:center;
    }
    .pause-btn--paper{
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
    }

    .fact-popup{
      position: fixed;
      inset: 0;
      z-index: 230;
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

function bibleSnippetForCharacter(characterId) {
  const snippets = {
    david: 'David learned to trust God even when he felt small. He chose faith, not fear.',
    moses: 'Moses followed God’s voice. Even when things seemed impossible, he led God’s people forward.',
    noah: 'Noah kept building when it was hard. Trust helped him protect his family and animals.',
    mary: 'Mary said “yes” to God. A gentle heart can still do big things.',
    daniel: 'Daniel stayed faithful when the world pressured him. God protected him in the lion’s den.',
    esther: 'Esther chose bravery. She trusted God and helped save her people.',
    jonah: 'Jonah learned obedience inside a great fish. God used even surprises to guide him.',
    joshua: 'Joshua trusted God and obeyed. The walls came down at the right time.',
    caleb: 'Caleb kept hope strong. He trusted God’s promises and urged the people onward.',
  };
  return snippets[characterId] ?? 'Build with faith, and God will guide you!';
}

function renderIconCanvas(blockType, size = 22) {
  const atlasCanvas = getAtlasCanvas();
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

export class HUD {
  /** @param {object} opts */
  constructor(opts) {
    ensureStyle();
    this._getWorldName = opts.getWorldName ?? (() => 'World');
    this._getCharacterId = opts.getCharacterId ?? (() => 'david');
    this._getCreativeMode = opts.getCreativeMode ?? (() => true);
    this._onToggleCreativeMode = opts.onToggleCreativeMode ?? null;
    this._onResume = opts.onResume ?? (() => {});
    this._onChangeWorld = opts.onChangeWorld ?? (() => {});
    this._onChangeCharacter = opts.onChangeCharacter ?? (() => {});
    this._onMainMenu = opts.onMainMenu ?? (() => {});
    this._onSetPaused = opts.onSetPaused ?? (() => {});

    this._root = document.createElement('div');
    this._root.className = 'hud';

    this._worldNameEl = document.createElement('div');
    this._worldNameEl.className = 'hud__top-left';
    this._worldNameEl.textContent = this._getWorldName();

    this._topRight = document.createElement('div');
    this._topRight.className = 'hud__top-right';

    this._iconWrap = document.createElement('div');
    this._iconWrap.className = 'hud__char-icon';

    this._charNameEl = document.createElement('div');
    this._charNameEl.className = 'hud__char-name';

    this._topRight.append(this._iconWrap, this._charNameEl);

    this._factBtn = document.createElement('button');
    this._factBtn.type = 'button';
    this._factBtn.className = 'hud__fact-btn';
    this._factBtn.textContent = 'Bible Fact';
    this._factBtn.addEventListener('click', () => this._showFactPopup());

    this._root.append(this._worldNameEl, this._topRight, this._factBtn);

    this._pauseOverlay = null;
    this._paused = false;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this._paused) this.openPauseMenu();
        else this.closePauseMenu();
      }
    });
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  unmount() {
    this._root.remove();
    this.closePauseMenu();
  }

  setWorldName(name) {
    this._worldNameEl.textContent = name;
  }

  setCharacterId(characterId) {
    const def = BIBLE_CHARACTERS.find((d) => d.id === characterId) ?? BIBLE_CHARACTERS[0];
    this._charNameEl.textContent = def.name;

    // Icon: map character to a block type just for fun.
    const map = {
      david: 6,
      moses: 1,
      noah: 3,
      mary: 4,
      daniel: 2,
      esther: 6,
      jonah: 5,
      joshua: 7,
      caleb: 4,
    };
    const blockType = map[characterId] ?? 8;
    const iconCanvas = renderIconCanvas(blockType, 22);
    this._iconWrap.innerHTML = '';
    this._iconWrap.appendChild(iconCanvas);
  }

  _sync() {
    this.setWorldName(this._getWorldName());
    this.setCharacterId(this._getCharacterId());
  }

  openPauseMenu() {
    if (this._paused) return;
    this._paused = true;
    this._onSetPaused(true);
    this._sync();

    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';

    const panel = document.createElement('div');
    panel.className = 'pause-panel';

    const title = document.createElement('div');
    title.className = 'pause-title';
    title.textContent = 'Paused';

    const buttons = document.createElement('div');
    buttons.className = 'pause-buttons';

    const resume = document.createElement('button');
    resume.type = 'button';
    resume.className = 'pause-btn pause-btn--paper';
    resume.textContent = 'Resume';
    resume.addEventListener('click', () => this.closePauseMenu());

    const changeWorld = document.createElement('button');
    changeWorld.type = 'button';
    changeWorld.className = 'pause-btn';
    changeWorld.textContent = 'Change World';
    changeWorld.addEventListener('click', () => {
      this._pauseOverlay?.remove();
      this._pauseOverlay = null;
      this._onChangeWorld();
    });

    const changeCharacter = document.createElement('button');
    changeCharacter.type = 'button';
    changeCharacter.className = 'pause-btn';
    changeCharacter.textContent = 'Change Character';
    changeCharacter.addEventListener('click', () => {
      this._pauseOverlay?.remove();
      this._pauseOverlay = null;
      this._onChangeCharacter();
    });

    const mainMenu = document.createElement('button');
    mainMenu.type = 'button';
    mainMenu.className = 'pause-btn pause-btn--paper';
    mainMenu.textContent = 'Main Menu';
    mainMenu.addEventListener('click', () => {
      this._pauseOverlay?.remove();
      this._pauseOverlay = null;
      this._onMainMenu();
    });

    buttons.append(resume, changeWorld, changeCharacter);

    if (this._onToggleCreativeMode) {
      const creativeBtn = document.createElement('button');
      creativeBtn.type = 'button';
      creativeBtn.className = 'pause-btn pause-btn--paper';
      const syncCreativeLabel = () => {
        creativeBtn.textContent = this._getCreativeMode()
          ? 'Mode: Creative (instant break, infinite blocks)'
          : 'Mode: Survival (hold to mine, gather blocks)';
      };
      syncCreativeLabel();
      creativeBtn.addEventListener('click', () => {
        this._onToggleCreativeMode();
        syncCreativeLabel();
      });
      buttons.appendChild(creativeBtn);
    }

    buttons.appendChild(mainMenu);
    panel.append(title, buttons);
    overlay.appendChild(panel);

    this._pauseOverlay = overlay;
    document.body.appendChild(overlay);
  }

  closePauseMenu() {
    if (!this._paused) return;
    this._paused = false;
    this._onSetPaused(false);
    if (this._pauseOverlay) this._pauseOverlay.remove();
    this._pauseOverlay = null;
  }

  _showFactPopup() {
    const characterId = this._getCharacterId();
    const def = BIBLE_CHARACTERS.find((d) => d.id === characterId) ?? BIBLE_CHARACTERS[0];
    const snippet = bibleSnippetForCharacter(characterId);

    const popup = document.createElement('div');
    popup.className = 'fact-popup';

    // Reuse CharacterGallery popup styling by copying minimal DOM.
    const panel = document.createElement('div');
    panel.className = 'fact-popup__panel';
    panel.innerHTML = `
      <div class="fact-popup__title">${def.name}</div>
      <div class="fact-popup__body">${def.verse}\n\n${snippet}</div>
      <div class="fact-popup__row">
        <button type="button" class="fact-popup__btn fact-popup__btn--gold">Close</button>
      </div>
    `;
    const btn = panel.querySelector('button');
    btn.addEventListener('click', () => popup.remove());

    popup.appendChild(panel);
    document.body.appendChild(popup);
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });
  }
}

