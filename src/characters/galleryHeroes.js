import { BIBLE_CHARACTERS } from './BibleCharacters.js';
import { HERO_WORLD_CONFIGS } from '../world/heroWorldConfigs.js';
import { WORLD_PRESETS } from '../world/BibleWorlds.js';

const WORLD_PRESET_IDS = new Set(WORLD_PRESETS.map((w) => w.id));
const VOXEL_IDS = new Set(BIBLE_CHARACTERS.map((c) => c.id));

/**
 * All heroes shown in Character Gallery: data-driven from {@link HERO_WORLD_CONFIGS}
 * plus Caleb (playable voxel + world, not duplicated in that map).
 * @returns {Array<{
 *   id: string,
 *   name: string,
 *   verse: string,
 *   description: string,
 *   hasVoxelRig: boolean,
 *   hasWorldPreset: boolean,
 * }>}
 */
export function getGalleryHeroEntries() {
  const list = [];
  for (const [id, cfg] of Object.entries(HERO_WORLD_CONFIGS)) {
    list.push({
      id,
      name: cfg.name,
      verse: cfg.verse,
      description:
        cfg.biomes?.[0]?.memoryHook ??
        'A Bible hero to learn about and build with.',
      hasVoxelRig: VOXEL_IDS.has(id),
      hasWorldPreset: WORLD_PRESET_IDS.has(id) && id !== 'garden',
    });
  }

  const caleb = BIBLE_CHARACTERS.find((c) => c.id === 'caleb');
  if (caleb && !list.some((e) => e.id === 'caleb')) {
    list.push({
      id: 'caleb',
      name: caleb.name,
      verse: caleb.verse,
      description: caleb.description,
      hasVoxelRig: true,
      hasWorldPreset: WORLD_PRESET_IDS.has('caleb'),
    });
  }

  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return list;
}

/**
 * @param {string} characterId
 * @returns {import('./BibleCharacters.js').BibleCharacterDef | undefined}
 */
export function getGalleryVoxelDef(characterId) {
  return BIBLE_CHARACTERS.find((d) => d.id === characterId);
}

/** Disambiguate cards when two heroes share the same first letter (e.g. Jesus vs Joseph). */
const PLACEHOLDER_TWO_LETTER = {
  jesus: 'Je',
  joseph_genesis: 'Jo',
  shadrach_team: 'Sh',
  samson: 'Sn',
  samuel: 'Sl',
  ruth: 'Ru',
  peter: 'Pe',
  paul: 'Pa',
  gideon: 'Gi',
  elijah: 'El',
  elisha: 'Es',
};

/**
 * @param {{ id: string, name: string }} entry
 * @returns {string} 1–2 characters for placeholder art
 */
export function getGalleryPlaceholderLabel(entry) {
  const special = PLACEHOLDER_TWO_LETTER[entry.id];
  if (special) return special;
  const words = entry.name.split(/[^a-zA-Z]+/).filter((w) => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const compact = entry.id.replace(/_/g, '');
  return compact.slice(0, 2).toUpperCase() || '?';
}
