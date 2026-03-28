import * as THREE from 'three';
import {
  VoxelCharacter,
  VOXEL,
  addVoxelBox,
  addVoxelCylinder,
} from './VoxelCharacter.js';

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description: string,
 *   verse: string,
 *   create: () => VoxelCharacter,
 * }} BibleCharacterDef
 */

function baseRig(char, colors) {
  char.legL.position.set(-2 * VOXEL, 0, 0);
  char.legR.position.set(2 * VOXEL, 0, 0);
  addVoxelBox(char.legL, -2, 0, -2, 4, 12, 4, colors.leg);
  addVoxelBox(char.legR, -2, 0, -2, 4, 12, 4, colors.leg);

  char.body.position.set(0, 12 * VOXEL, 0);
  addVoxelBox(char.body, -4, 0, -2, 8, 12, 4, colors.body);

  char.armL.position.set(-6 * VOXEL, 22 * VOXEL, 0);
  char.armR.position.set(6 * VOXEL, 22 * VOXEL, 0);
  addVoxelBox(char.armL, -2, -12, -2, 4, 12, 4, colors.arm);
  addVoxelBox(char.armR, -2, -12, -2, 4, 12, 4, colors.arm);

  char.head.position.set(0, 24 * VOXEL, 0);
  addVoxelBox(char.head, -4, 0, -4, 8, 8, 8, colors.skin);
}

function createDavid() {
  const char = new VoxelCharacter();
  const skin = 0xf5c6a5;
  const brown = 0x6d4c41;
  const hair = 0x3e2723;
  const stone = 0x9e9e9e;
  const gold = 0xffc107;

  baseRig(char, {
    leg: brown,
    body: brown,
    arm: skin,
    skin,
  });

  addVoxelBox(char.head, -4, 4, -4, 8, 2, 8, hair);
  addVoxelBox(char.head, -4, 0, -4, 2, 6, 4, hair);
  addVoxelBox(char.head, 2, 0, -4, 2, 6, 4, hair);

  addVoxelBox(char.body, 2, 2, 2, 2, 1, 1, stone);

  const crown = new THREE.Group();
  crown.name = 'crown';
  addVoxelBox(crown, -2, 4, -2, 4, 1, 4, gold);
  addVoxelBox(crown, -1, 5, -1, 2, 1, 2, gold);
  crown.visible = false;
  char.head.add(crown);

  const root = char.group;
  root.userData.bibleCharacterId = 'david';
  root.userData.setCrownVisible = (v) => {
    const cr = root.getObjectByName('head')?.getObjectByName('crown');
    if (cr) cr.visible = v;
  };

  return char;
}

function createMoses() {
  const char = new VoxelCharacter();
  const white = 0xf5f5f5;
  const skin = 0xe0c4a8;
  const beard = 0x78909c;

  baseRig(char, {
    leg: 0xcfd8dc,
    body: white,
    arm: white,
    skin,
  });

  addVoxelBox(char.head, -2, 0, 3, 4, 2, 2, beard);
  addVoxelBox(char.head, -1, 1, 3, 2, 2, 1, beard);

  addVoxelCylinder(char.armR, 0, -4, 1, 0.5, 10, 0x5d4037);

  addVoxelBox(
    char.body,
    -1,
    4,
    2,
    2,
    3,
    1,
    0xffd54f,
    { emissive: 0xffaa44, emissiveIntensity: 0.55 }
  );

  char.group.userData.bibleCharacterId = 'moses';
  return char;
}

function createNoah() {
  const char = new VoxelCharacter();
  const tunic = 0x6d4c41;
  const skin = 0xd7ccc8;
  const grey = 0x9e9e9e;

  baseRig(char, {
    leg: tunic,
    body: tunic,
    arm: skin,
    skin,
  });

  addVoxelBox(char.head, -4, 4, -4, 8, 2, 8, grey);

  addVoxelBox(char.armR, -1, -8, 1, 2, 3, 2, 0x4e342e);

  addVoxelBox(char.body, -3, 6, 2, 6, 1, 1, 0x90caf9);

  char.group.userData.bibleCharacterId = 'noah';
  return char;
}

function createMary() {
  const char = new VoxelCharacter();
  const blue = 0x1565c0;
  const skin = 0xf5c6a5;
  const white = 0xfafafa;

  baseRig(char, {
    leg: blue,
    body: blue,
    arm: skin,
    skin,
  });

  addVoxelBox(char.head, -4, 4, -4, 8, 3, 8, white);
  addVoxelBox(char.head, -4, 6, -4, 8, 1, 8, white);

  addVoxelBox(char.armL, -1, -6, 1, 3, 3, 3, white);

  char.group.userData.bibleCharacterId = 'mary';
  return char;
}

function createDaniel() {
  const char = new VoxelCharacter();
  const purple = 0x7b1fa2;
  const skin = 0xf5c6a5;

  baseRig(char, {
    leg: purple,
    body: purple,
    arm: skin,
    skin,
  });

  const lion = new THREE.Group();
  lion.position.set(10 * VOXEL, 0, 2 * VOXEL);
  addVoxelBox(lion, -2, 0, -2, 6, 4, 5, 0xff9800);
  addVoxelBox(lion, -1, 4, 0, 2, 2, 3, 0xffcc80);
  addVoxelBox(lion, 1, 2, 4, 1, 1, 1, 0x212121);
  addVoxelBox(lion, 3, 2, 4, 1, 1, 1, 0x212121);
  char.group.add(lion);

  char.group.userData.bibleCharacterId = 'daniel';
  return char;
}

function createEsther() {
  const char = new VoxelCharacter();
  const purple = 0x6a1b9a;
  const gold = 0xffc107;
  const skin = 0xf5c6a5;

  baseRig(char, {
    leg: purple,
    body: purple,
    arm: skin,
    skin,
  });

  addVoxelBox(char.body, -4, 8, -2, 8, 2, 4, gold);
  addVoxelBox(char.head, -2, 4, -4, 4, 1, 8, gold);

  addVoxelCylinder(char.armR, 0, -6, 2, 0.5, 4, 0xd7ccc8);

  char.group.userData.bibleCharacterId = 'esther';
  return char;
}

function createJonah() {
  const char = new VoxelCharacter();
  const blue = 0x1565c0;
  const skin = 0xf5c6a5;

  baseRig(char, {
    leg: blue,
    body: blue,
    arm: skin,
    skin,
  });

  addVoxelBox(char.armR, -1, -6, 1, 2, 2, 4, 0x78909c);

  const whale = new THREE.Group();
  whale.position.set(-14 * VOXEL, 4 * VOXEL, -4 * VOXEL);
  addVoxelBox(whale, 0, 0, 0, 12, 6, 8, 0x0d47a1);
  addVoxelBox(whale, 10, 2, 2, 4, 3, 4, 0x1565c0);
  char.group.add(whale);

  char.group.userData.bibleCharacterId = 'jonah';
  return char;
}

function createJoshua() {
  const char = new VoxelCharacter();
  const bronze = 0xbcaaa4;
  const dark = 0x5d4037;
  const skin = 0xf5c6a5;

  baseRig(char, {
    leg: dark,
    body: bronze,
    arm: skin,
    skin,
  });

  addVoxelBox(char.body, -4, 4, -2, 8, 8, 4, bronze);

  addVoxelBox(char.armL, -2, -10, -1, 1, 6, 4, 0x8d6e63);

  addVoxelCylinder(char.armR, 0, -8, 1, 0.45, 5, 0xffd54f);

  const walls = new THREE.Group();
  walls.position.set(0, 0, 12 * VOXEL);
  addVoxelBox(walls, -6, 0, 0, 4, 10, 3, 0x9e9e9e);
  addVoxelBox(walls, 2, 0, 0, 4, 10, 3, 0x9e9e9e);
  char.group.add(walls);

  char.group.userData.bibleCharacterId = 'joshua';
  return char;
}

function createCaleb() {
  const char = new VoxelCharacter();
  const green = 0x2e7d32;
  const greenDark = 0x1b5e20;
  const skin = 0xf5c6a5;
  const hair = 0x3e2723;
  const scrollGold = 0xffd54f;
  const scroll = 0xe8d5a8;

  // Faithful explorer: green tunic, staff + small scroll.
  baseRig(char, {
    leg: greenDark,
    body: green,
    arm: skin,
    skin,
  });

  // Head hair + simple face tone.
  addVoxelBox(char.head, -4, 0, -4, 8, 2, 8, hair);
  addVoxelBox(char.head, -3, 2, -3, 6, 3, 6, skin);

  // Chest "faith stone" highlight.
  addVoxelBox(char.body, -1, 7, -1, 2, 1, 2, scrollGold);

  // Staff in right arm.
  addVoxelCylinder(char.armR, 0, -9, 1, 0.35, 10, 0x4e342e);
  addVoxelBox(char.armR, -1, -10, 0, 2, 1, 2, scrollGold, {
    emissive: 0xffb300,
    emissiveIntensity: 0.35,
  });

  // Scroll in left arm.
  addVoxelBox(char.armL, -1, -10, -2, 2, 1, 4, scroll);
  addVoxelBox(char.armL, -1, -10, -1, 2, 1, 1, scrollGold);

  char.group.userData.bibleCharacterId = 'caleb';
  return char;
}

/** @type {BibleCharacterDef[]} */
export const BIBLE_CHARACTERS = [
  {
    id: 'david',
    name: 'David',
    description: 'The shepherd who became king',
    verse: '1 Samuel 16',
    create: createDavid,
  },
  {
    id: 'moses',
    name: 'Moses',
    description: "Led God's people to freedom",
    verse: 'Exodus 3',
    create: createMoses,
  },
  {
    id: 'noah',
    name: 'Noah',
    description: 'Built the ark and saved the animals',
    verse: 'Genesis 6',
    create: createNoah,
  },
  {
    id: 'mary',
    name: 'Mary',
    description: 'Chosen by God, mother of Jesus',
    verse: 'Luke 1',
    create: createMary,
  },
  {
    id: 'daniel',
    name: 'Daniel',
    description: "Trusted God in the lion's den",
    verse: 'Daniel 6',
    create: createDaniel,
  },
  {
    id: 'esther',
    name: 'Esther',
    description: 'Brave queen who saved her people',
    verse: 'Esther 4',
    create: createEsther,
  },
  {
    id: 'jonah',
    name: 'Jonah',
    description: 'Learned obedience inside a great fish',
    verse: 'Jonah 1–2',
    create: createJonah,
  },
  {
    id: 'joshua',
    name: 'Joshua',
    description: 'Trusted God and the walls came down',
    verse: 'Joshua 6',
    create: createJoshua,
  },
  {
    id: 'caleb',
    name: 'Caleb',
    description: 'The faithful spy who trusted God',
    verse: 'Numbers 13–14',
    create: createCaleb,
  },
];

/**
 * @param {number} index
 * @returns {VoxelCharacter}
 */
export function createCharacterByIndex(index) {
  const def = BIBLE_CHARACTERS[index % BIBLE_CHARACTERS.length];
  return def.create();
}

/**
 * Carousel UI: pick a hero; returns a fresh Three.js group for the current selection.
 */
export class CharacterSelector {
  /**
   * @param {{
   *   onPlace?: (group: THREE.Group) => void,
   *   onPreviewChange?: (group: THREE.Group) => void,
   * }} [options]
   */
  constructor(options = {}) {
    this._onPlace = options.onPlace ?? (() => {});
    this._onPreviewChange = options.onPreviewChange ?? (() => {});
    this._index = 0;
    /** @type {VoxelCharacter | null} */
    this._current = null;
    this._root = document.createElement('div');
    this._root.className = 'character-selector';
    this._root.setAttribute('role', 'region');
    this._root.setAttribute('aria-label', 'Choose a Bible hero');

    this._title = document.createElement('div');
    this._title.className = 'character-selector__title';
    this._desc = document.createElement('div');
    this._desc.className = 'character-selector__desc';

    const nav = document.createElement('div');
    nav.className = 'character-selector__nav';

    this._prev = document.createElement('button');
    this._prev.type = 'button';
    this._prev.className = 'character-selector__btn';
    this._prev.textContent = '◀';
    this._prev.setAttribute('aria-label', 'Previous character');

    this._next = document.createElement('button');
    this._next.type = 'button';
    this._next.className = 'character-selector__btn';
    this._next.textContent = '▶';
    this._next.setAttribute('aria-label', 'Next character');

    this._placeBtn = document.createElement('button');
    this._placeBtn.type = 'button';
    this._placeBtn.className = 'character-selector__place';
    this._placeBtn.textContent = 'Place hero';

    this._walkBtn = document.createElement('button');
    this._walkBtn.type = 'button';
    this._walkBtn.className = 'character-selector__walk';
    this._walkBtn.textContent = 'Walk: off';
    this._walkOn = false;

    nav.append(this._prev, this._next);
    this._root.append(this._title, this._desc, nav, this._walkBtn, this._placeBtn);

    this._prev.addEventListener('click', () => this._step(-1));
    this._next.addEventListener('click', () => this._step(1));
    this._placeBtn.addEventListener('click', () => this._emitPlace());
    this._walkBtn.addEventListener('click', () => this._toggleWalk());

    this._refreshCharacter();
    this._syncLabels();
  }

  /**
   * @param {HTMLElement} [parent]
   */
  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  unmount() {
    this._root.remove();
  }

  /**
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._root.style.display = visible ? 'flex' : 'none';
  }

  _step(delta) {
    const n = BIBLE_CHARACTERS.length;
    this._index = (this._index + delta + n) % n;
    this._refreshCharacter();
    this._syncLabels();
  }

  _refreshCharacter() {
    if (this._current) {
      this._current.stopIdle();
    }
    this._walkOn = false;
    this._walkBtn.textContent = 'Walk: off';
    this._current = createCharacterByIndex(this._index);
    this._current.startIdleAnimation();
    this._current.setWalking(false);
    this._onPreviewChange(this._current.getGroup());
  }

  _toggleWalk() {
    if (!this._current) return;
    this._walkOn = !this._walkOn;
    this._walkBtn.textContent = this._walkOn ? 'Walk: on' : 'Walk: off';
    this._current.setWalking(this._walkOn);
    if (this._walkOn) {
      this._current.stopIdle();
    } else {
      this._current.startIdleAnimation();
    }
  }

  _syncLabels() {
    const def = BIBLE_CHARACTERS[this._index];
    this._title.textContent = def.name;
    this._desc.textContent = def.description;
  }

  /**
   * @param {number} index
   */
  setSelectedIndex(index) {
    const n = BIBLE_CHARACTERS.length;
    const next = ((index % n) + n) % n;
    if (next === this._index) return;
    this._index = next;
    this._refreshCharacter();
    this._syncLabels();
  }

  /**
   * @param {string} characterId
   */
  setSelectedCharacterId(characterId) {
    const idx = BIBLE_CHARACTERS.findIndex((d) => d.id === characterId);
    if (idx >= 0) this.setSelectedIndex(idx);
  }

  /**
   * @returns {string}
   */
  getSelectedCharacterId() {
    return BIBLE_CHARACTERS[this._index]?.id ?? BIBLE_CHARACTERS[0].id;
  }

  _emitPlace() {
    if (!this._current) return;
    const g = this._current.cloneGroup();
    const id = BIBLE_CHARACTERS[this._index].id;
    g.userData.bibleCharacterId = id;
    if (id === 'david') {
      const root = g;
      g.userData.setCrownVisible = (v) => {
        const cr = root.getObjectByName('head')?.getObjectByName('crown');
        if (cr) cr.visible = v;
      };
    }
    this._onPlace(g);
  }

  /**
   * Three.js group for the **preview** instance (live animated rig).
   * @returns {THREE.Group | null}
   */
  getPreviewGroup() {
    return this._current ? this._current.getGroup() : null;
  }

  /**
   * Fresh clone for world placement (same as Place hero).
   * @returns {THREE.Group}
   */
  getSelectedGroup() {
    if (!this._current) this._refreshCharacter();
    return this._current.cloneGroup();
  }

  /**
   * @returns {number}
   */
  getSelectedIndex() {
    return this._index;
  }

  /**
   * @param {number} timeMs
   */
  update(timeMs) {
    VoxelCharacter.updateTweens(timeMs);
    if (this._current && this._walkOn) {
      this._current.stepWalk(timeMs);
    }
  }

  /**
   * Toggle David’s crown if applicable (preview instance).
   * @param {boolean} visible
   */
  setDavidCrownVisible(visible) {
    const g = this.getPreviewGroup();
    if (g?.userData.setCrownVisible) {
      g.userData.setCrownVisible(visible);
    }
  }
}
