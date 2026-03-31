import { applyKidsMode, getKidsMode, setKidsMode } from './KidsMode.js';

function ensureStyle() {
  if (document.getElementById('main-menu-style')) return;
  const style = document.createElement('style');
  style.id = 'main-menu-style';
  style.textContent = `
    .main-menu-overlay{
      position: fixed;
      inset: 0;
      z-index: 200;
      display:flex;
      align-items:center;
      justify-content:center;
      padding: 1rem;
      background: radial-gradient(circle at 50% 20%, rgba(255,213,79,0.18), rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.68));
    }
    .main-menu{
      width: min(980px, 100%);
      border-radius: 12px;
      border: 3px solid #8b6914;
      background: linear-gradient(180deg, rgba(45,36,24,0.92), rgba(26,21,16,0.98));
      box-shadow: 0 16px 70px rgba(0,0,0,0.6);
      padding: 1.6rem 1.4rem 1.3rem;
      animation: menuIn 520ms ease-out both;
      position: relative;
      overflow:hidden;
    }
    @keyframes menuIn{
      from{ transform: translateY(16px) scale(0.98); opacity: 0; }
      to{ transform: translateY(0px) scale(1); opacity: 1; }
    }
    .main-menu__glow{
      position:absolute;
      inset:-40%;
      background: radial-gradient(circle at 50% 35%, rgba(255,213,79,0.18), rgba(255,213,79,0) 56%);
      pointer-events:none;
    }
    .main-menu__content{
      position: relative;
      display:flex;
      flex-direction: column;
      align-items:center;
      gap: 1rem;
    }
    .main-menu__top{
      width: 100%;
      display:flex;
      align-items:center;
      justify-content: center;
      gap: 1.2rem;
    }
    .hexagram{
      width: 48px;
      height: 48px;
      position: relative;
      filter: drop-shadow(0 0 14px rgba(255,213,79,0.25));
      flex: 0 0 auto;
    }
    .hexagram .tri{
      position:absolute;
      left: 50%;
      top: 50%;
      width: 0;
      height: 0;
      transform: translate(-50%, -50%);
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
    }
    .hexagram .up{
      border-bottom: 41px solid rgba(212,175,55,0.95);
      opacity: 0.95;
    }
    .hexagram .down{
      border-top: 41px solid rgba(212,175,55,0.78);
      transform: translate(-50%, -50%) rotate(180deg);
      opacity: 0.85;
    }
    .main-menu__title{
      font-family: 'Press Start 2P', monospace;
      font-size: clamp(1.1rem, 3.2vw, 1.8rem);
      text-align:center;
      color: #ffd54f;
      text-shadow: 0 2px 0 rgba(92,74,42,0.7), 0 0 24px rgba(255,213,79,0.35);
      line-height: 1.7;
    }
    .main-menu__subtitle{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      color: #c4b59a;
      text-align:center;
      max-width: 62ch;
      line-height: 1.8;
    }
    .main-menu__buttons{
      display:flex;
      gap: 0.9rem;
      flex-wrap: wrap;
      justify-content:center;
      margin-top: 0.6rem;
    }
    .main-menu__btn{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      padding: 0.65rem 1rem;
      cursor: pointer;
      color: #1a1510;
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
      border: 2px solid #5c4a2a;
      border-radius: 4px;
      transition: transform 140ms ease, filter 140ms ease;
      user-select:none;
    }
    .main-menu__btn:hover{
      transform: translateY(-2px);
      filter: saturate(1.05);
    }

    .main-menu__saveRow{
      width: 100%;
      display:flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items:center;
      margin-top: 0.95rem;
    }
    .main-menu__saveLabel{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.45rem;
      color: #c4b59a;
      line-height: 1.8;
      text-align:center;
    }
    .main-menu__saveBtns{
      display:flex;
      gap: 0.65rem;
      flex-wrap: wrap;
      justify-content:center;
    }
    .main-menu__saveBtn{
      width: 110px;
      padding: 0.5rem 0.65rem;
      border-radius: 6px;
      border: 2px solid rgba(92,74,42,1);
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
      cursor:pointer;
      user-select:none;
      color: #1a1510;
      display:flex;
      flex-direction: column;
      align-items:center;
      gap: 0.3rem;
      transition: transform 140ms ease, filter 140ms ease, border-color 140ms ease;
      filter: saturate(0.9);
    }
    .main-menu__saveBtn:hover{
      transform: translateY(-2px);
      filter: saturate(1.05);
    }
    .main-menu__saveBtn.selected{
      border-color: rgba(255,213,79,0.95);
      box-shadow: 0 0 0 2px rgba(255,213,79,0.12), 0 0 18px rgba(255,213,79,0.15);
      filter: saturate(1.1);
    }
    .main-menu__saveBtnTop{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      line-height: 1.7;
    }
    .main-menu__saveBtnSub{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.42rem;
      color: #3d3020;
      line-height: 1.6;
      text-align:center;
      opacity: 0.9;
    }
    .main-menu__kids{
      display: flex;
      align-items: center;
      gap: 0.55rem;
      margin-top: 0.35rem;
      user-select: none;
      cursor: pointer;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.42rem;
      color: #c4b59a;
      line-height: 1.7;
    }
    .main-menu__kids input{
      width: 18px;
      height: 18px;
      accent-color: #ffd54f;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}

export class MainMenu {
  /**
   * @param {{
   *  onPlay?: ()=>void,
   *  onChallenges?: ()=>void,
   *  onCharacters?: ()=>void,
   *  onAbout?: ()=>void,
   *  saveSlots?: Array<{ index:number, label?:string, hasSaved?:boolean }>,
   *  selectedSaveSlot?: number,
   *  onSelectSaveSlot?: (slotIndex:number)=>void
   * }} [options]
   */
  constructor(options = {}) {
    ensureStyle();
    this._onPlay = options.onPlay ?? (() => {});
    this._onChallenges = options.onChallenges ?? (() => {});
    this._onCharacters = options.onCharacters ?? (() => {});
    this._onAbout = options.onAbout ?? (() => {});

    this._saveSlots = options.saveSlots ?? [];
    this._selectedSaveSlot = options.selectedSaveSlot ?? 1;
    this._onSelectSaveSlot = options.onSelectSaveSlot ?? (() => {});

    this._root = document.createElement('div');
    this._root.className = 'main-menu-overlay';

    const panel = document.createElement('div');
    panel.className = 'main-menu';

    const glow = document.createElement('div');
    glow.className = 'main-menu__glow';

    const content = document.createElement('div');
    content.className = 'main-menu__content';

    const top = document.createElement('div');
    top.className = 'main-menu__top';

    const star = document.createElement('div');
    star.className = 'hexagram';
    const up = document.createElement('div');
    up.className = 'tri up';
    const down = document.createElement('div');
    down.className = 'tri down';
    star.append(up, down);

    const title = document.createElement('div');
    title.className = 'main-menu__title';
    title.textContent = 'BibleBlocks';

    top.append(star, title);

    const subtitle = document.createElement('div');
    subtitle.className = 'main-menu__subtitle';
    subtitle.textContent = 'Build the Stories of the Bible';

    const buttons = document.createElement('div');
    buttons.className = 'main-menu__buttons';

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'main-menu__btn';
    play.textContent = 'Play';
    play.addEventListener('click', () => this._onPlay());

    const challenges = document.createElement('button');
    challenges.type = 'button';
    challenges.className = 'main-menu__btn';
    challenges.textContent = 'Challenges';
    challenges.addEventListener('click', () => this._onChallenges());

    const characters = document.createElement('button');
    characters.type = 'button';
    characters.className = 'main-menu__btn';
    characters.textContent = 'Characters';
    characters.addEventListener('click', () => this._onCharacters());

    const about = document.createElement('button');
    about.type = 'button';
    about.className = 'main-menu__btn';
    about.textContent = 'About';
    about.addEventListener('click', () => this._onAbout());

    buttons.append(play, challenges, characters, about);

    const kidsRow = document.createElement('label');
    kidsRow.className = 'main-menu__kids';
    const kidsCheckbox = document.createElement('input');
    kidsCheckbox.type = 'checkbox';
    kidsCheckbox.checked = getKidsMode();
    kidsCheckbox.addEventListener('change', () => {
      setKidsMode(kidsCheckbox.checked);
    });
    const kidsSpan = document.createElement('span');
    kidsSpan.textContent = 'Bigger text (easier for kids)';
    kidsRow.append(kidsCheckbox, kidsSpan);

    content.append(top, subtitle, kidsRow, buttons);

    // Save Slots UI (Prompt 8)
    const saveRow = document.createElement('div');
    saveRow.className = 'main-menu__saveRow';

    const saveLabel = document.createElement('div');
    saveLabel.className = 'main-menu__saveLabel';
    saveLabel.textContent = 'Save Slot';

    const saveBtns = document.createElement('div');
    saveBtns.className = 'main-menu__saveBtns';

    const saveBtnEls = [];
    for (let slotIndex = 1; slotIndex <= 3; slotIndex++) {
      const info = this._saveSlots[slotIndex - 1] ?? null;
      const hasSaved = info?.hasSaved ?? false;
      const sub = info?.label ?? (hasSaved ? 'Saved' : 'Empty');

      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'main-menu__saveBtn';
      b.setAttribute('aria-label', `Select save slot ${slotIndex}`);

      const t = document.createElement('div');
      t.className = 'main-menu__saveBtnTop';
      t.textContent = `Slot ${slotIndex}`;

      const s = document.createElement('div');
      s.className = 'main-menu__saveBtnSub';
      s.textContent = sub;

      b.append(t, s);
      if (slotIndex === this._selectedSaveSlot) b.classList.add('selected');

      b.addEventListener('click', () => {
        this._selectedSaveSlot = slotIndex;
        saveBtnEls.forEach((el, idx) => {
          el.classList.toggle('selected', idx + 1 === slotIndex);
        });
        this._onSelectSaveSlot(slotIndex);
      });

      saveBtnEls.push(b);
      saveBtns.appendChild(b);
    }

    saveRow.append(saveLabel, saveBtns);
    content.append(saveRow);
    panel.append(glow, content);
    this._root.appendChild(panel);
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  unmount() {
    this._root.remove();
  }
}

