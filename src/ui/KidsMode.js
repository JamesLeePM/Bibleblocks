const STORAGE_KEY = 'bibleblocksKidsMode';

function ensureKidsStyle() {
  if (document.getElementById('kids-mode-style')) return;
  const style = document.createElement('style');
  style.id = 'kids-mode-style';
  style.textContent = `
    body.bibleblocks-kids-mode .main-menu__btn{
      font-size: 0.68rem !important;
      padding: 0.8rem 1.15rem !important;
    }
    body.bibleblocks-kids-mode .main-menu__subtitle{
      font-size: 0.62rem !important;
    }
    body.bibleblocks-kids-mode .main-menu__saveLabel,
    body.bibleblocks-kids-mode .main-menu__saveBtnSub{
      font-size: 0.52rem !important;
    }
    body.bibleblocks-kids-mode .main-menu__saveBtnTop{
      font-size: 0.62rem !important;
    }
    body.bibleblocks-kids-mode .main-menu__kids span{
      font-size: 0.52rem !important;
    }
    body.bibleblocks-kids-mode .hud__top-left{
      font-size: 0.62rem !important;
    }
    body.bibleblocks-kids-mode .hud__char-name{
      font-size: 0.58rem !important;
    }
    body.bibleblocks-kids-mode .hud__fact-btn{
      font-size: 0.58rem !important;
      padding: 0.75rem 1rem !important;
    }
    body.bibleblocks-kids-mode .bb-touch-btn{
      font-size: 0.48rem !important;
    }
    body.bibleblocks-kids-mode .bb-touch-btn--round{
      width: 72px !important;
      height: 72px !important;
      font-size: 0.42rem !important;
    }
    body.bibleblocks-kids-mode .hotbar{
      padding: 0.85rem 0.9rem !important;
      gap: 0.55rem !important;
    }
    body.bibleblocks-kids-mode .hotbar__slot{
      width: 48px !important;
      height: 48px !important;
    }
    body.bibleblocks-kids-mode .character-selector__title{
      font-size: 0.72rem !important;
    }
    body.bibleblocks-kids-mode .character-selector__desc{
      font-size: 0.5rem !important;
    }
  `;
  document.head.appendChild(style);
}

export function getKidsMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setKidsMode(enabled) {
  try {
    if (enabled) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  applyKidsMode();
}

export function applyKidsMode() {
  ensureKidsStyle();
  document.body.classList.toggle('bibleblocks-kids-mode', getKidsMode());
}
