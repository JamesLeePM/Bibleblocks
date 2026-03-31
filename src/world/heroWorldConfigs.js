/**
 * Kids-ministry style "Bible heroes" world configs for BibleBlocks.
 * Data only — no engine imports. Use for generation, UI copy, or future procedural worlds.
 */

/** @typedef {{ type: string, count: number, notes: string }} WorldProp */
/** @typedef {{ id: string, label: string, terrain: string, palette: string[], props: WorldProp[], objectives: string[], memoryHook: string, techNotes: string[] }} BiomeDef */
/** @typedef {{ id: string, name: string, verse: string, biomes: BiomeDef[] }} HeroWorldConfig */

export const world_jesus = {
  id: 'jesus',
  name: "Jesus' Galilee",
  verse: 'Luke 2; John 3 — ministry in Galilee and Jerusalem',
  biomes: [
    {
      id: 'bethlehem_hills',
      label: 'Quiet hills near Bethlehem',
      terrain: 'Gentle grassy slopes with a few paths and night-sky openness; symbolic of the birth story.',
      palette: ['#2e4a2e', '#87ceeb', '#f5e6c8', '#8b7355'],
      props: [
        { type: 'simple_shelter', count: 1, notes: 'Small stable-like wood blocks at one edge' },
        { type: 'path', count: 1, notes: 'Dirt strip leading toward a viewpoint' },
        { type: 'star_marker', count: 1, notes: 'Gold block cluster above the scene' },
      ],
      objectives: ['Walk the path to the shelter', 'Look up at the night sky'],
      memoryHook: 'A baby in a humble place while the sky feels wide and bright.',
      techNotes: [
        'Low rolling heightmap; warm point light near shelter',
        'Sparse instanced trees (boxes + leaf caps)',
      ],
    },
    {
      id: 'sea_of_galilee_shore',
      label: 'Lake shore',
      terrain: 'Beach sand beside calm blue water; open space for “fishers of men” feel.',
      palette: ['#e8d5a8', '#1e88e5', '#5cb85c', '#c4a574'],
      props: [
        { type: 'wood_boat', count: 1, notes: 'Simple voxel boat pulled onto sand' },
        { type: 'dock_pier', count: 1, notes: 'Short plank pier into water' },
        { type: 'fish_basket', count: 2, notes: 'Bread or leaf blocks as props' },
      ],
      objectives: ['Follow the shore', 'Stand on the boat deck'],
      memoryHook: 'Friends by the water, ready to follow Jesus.',
      techNotes: [
        'Half land half water plane split; water material slightly transparent',
        'Boat as grouped boxes with flat deck',
      ],
    },
    {
      id: 'village_streets',
      label: 'Small village lanes',
      terrain: 'Narrow dirt paths between simple one-story houses; sunny and friendly.',
      palette: ['#d7ccc8', '#8d6e63', '#ffe082', '#5d4037'],
      props: [
        { type: 'house', count: 4, notes: 'Low mudbrick-style boxes with flat roofs' },
        { type: 'well_ring', count: 1, notes: 'Stone ring (cobble blocks)' },
        { type: 'bench', count: 2, notes: 'Wood slabs' },
      ],
      objectives: ['Walk between houses', 'Find the well in the center'],
      memoryHook: 'Jesus teaching where everyday people lived and worked.',
      techNotes: [
        'Grid of small building footprints; repeat house module',
        'Directional light with soft shadows for alleys',
      ],
    },
    {
      id: 'temple_courtyard_symbolic',
      label: 'Great court (symbolic)',
      terrain: 'Wide stone floor with columns along the sides; open center for teaching.',
      palette: ['#bdbdbd', '#ffd54f', '#6d4c41', '#eceff1'],
      props: [
        { type: 'column', count: 8, notes: 'Tall wood or stone pillars in two rows' },
        { type: 'steps', count: 1, notes: 'Short stair of stone blocks' },
        { type: 'offering_table', count: 1, notes: 'Flat gold-topped block' },
      ],
      objectives: ['Walk the wide center court', 'Stand between the columns'],
      memoryHook: 'A big, holy space where people gathered to pray and learn.',
      techNotes: [
        'Large flat mesh; instanced columns',
        'Gold emissive accent on table for warmth',
      ],
    },
  ],
};

export const world_noah = {
  id: 'noah',
  name: "Noah's world",
  verse: 'Genesis 6–9',
  biomes: [
    {
      id: 'forest_yard',
      label: 'Wood-gathering hills',
      terrain: 'Rolling green hills with plenty of trees for lumber feel.',
      palette: ['#5cb85c', '#6d4c41', '#4e342e', '#8bc34a'],
      props: [
        { type: 'tree', count: 24, notes: 'Clustered for “lots of wood”' },
        { type: 'wood_pile', count: 3, notes: 'Stacked plank blocks' },
      ],
      objectives: ['Walk through the trees', 'Count the wood piles'],
      memoryHook: 'Trees everywhere because a big boat needs a lot of wood.',
      techNotes: ['Instanced tree meshes or repeated column+leaf', 'Gentle noise on terrain height'],
    },
    {
      id: 'ark_build_site',
      label: 'Ark build yard',
      terrain: 'Flat packed earth with a huge wooden frame rising in the center.',
      palette: ['#a1887f', '#5d4037', '#8d6e63', '#bcaaa4'],
      props: [
        { type: 'ark_hull', count: 1, notes: 'Large hollow wood shell with ramp' },
        { type: 'hammer_spark_fx', count: 0, notes: 'Optional particle at build site' },
        { type: 'rope_coil', count: 2, notes: 'Brown cylinder-ish voxel props' },
      ],
      objectives: ['Climb the ramp', 'Circle the hull'],
      memoryHook: 'A boat on dry land—because God asked Noah to build it.',
      techNotes: ['Box shell with repeating wood UV rows', 'Ramp as stepped blocks'],
    },
    {
      id: 'animal_pairs_area',
      label: 'Animal staging pens',
      terrain: 'Fenced grass pens near the ark; simple and cheerful.',
      palette: ['#7cb342', '#8d6e63', '#fff9c4', '#795548'],
      props: [
        { type: 'fence_segment', count: 12, notes: 'Low wood posts' },
        { type: 'animal_marker', count: 6, notes: 'Abstract animal silhouettes (blocks)' },
      ],
      objectives: ['Walk each pen path', 'Reach the ramp toward the ark'],
      memoryHook: 'Two-by-two pairs, safe and ready to board.',
      techNotes: ['Low walls as thin boxes; avoid dense geometry'],
    },
    {
      id: 'flood_sea',
      label: 'Rain and sea',
      terrain: 'Endless water surface under grey sky; ark floats as centerpiece.',
      palette: ['#1565c0', '#90a4ae', '#37474f', '#e3f2fd'],
      props: [
        { type: 'ark', count: 1, notes: 'Same ark model, now surrounded by water' },
        { type: 'rain_particle', count: 0, notes: 'Optional vertical streak particles' },
      ],
      objectives: ['Stay on the deck', 'Look across the water'],
      memoryHook: 'Water everywhere—God kept them safe inside.',
      techNotes: ['Large water plane; skybox grey-blue', 'Fog for horizon'],
    },
    {
      id: 'mountain_receding',
      label: 'Mountain rest',
      terrain: 'Rocky peak with olive-branch feel—open ground and a view.',
      palette: ['#78909c', '#8bc34a', '#6d4c41', '#eceff1'],
      props: [
        { type: 'altar_stones', count: 5, notes: 'Small stone heap' },
        { type: 'rainbow_arc_fx', count: 1, notes: 'Transparent colored bands or emissive strips' },
      ],
      objectives: ['Reach the peak', 'Stand by the stones'],
      memoryHook: 'Dry ground again—and a rainbow promise in the sky.',
      techNotes: ['Heightmap peak; emissive arc as thin strips or shader band'],
    },
  ],
};

export const world_moses = {
  id: 'moses',
  name: "Moses' Exodus",
  verse: 'Exodus 3; 14; 19',
  biomes: [
    {
      id: 'egypt_brickfields',
      label: 'Nile brickfields',
      terrain: 'Flat river-side mud flats with reed edges and brick stacks.',
      palette: ['#d7ccc8', '#5d4037', '#8d6e63', '#1e88e5'],
      props: [
        { type: 'brick_stack', count: 8, notes: 'Red-brown blocks stacked' },
        { type: 'water_channel', count: 1, notes: 'Narrow blue strip' },
      ],
      objectives: ['Walk between brick stacks', 'Follow the water channel'],
      memoryHook: 'Hard work by the river, waiting for God to act.',
      techNotes: ['Flat sand plane; brick stacks as columns', 'Water as translucent plane'],
    },
    {
      id: 'burning_bush_area',
      label: 'Desert bush',
      terrain: 'Sandy ground with scattered rocks and one glowing bush.',
      palette: ['#e8d5a8', '#ffd54f', '#6d4c41', '#ffca28'],
      props: [
        { type: 'bush', count: 1, notes: 'Gold + leaf blocks with point light' },
        { type: 'rock', count: 6, notes: 'Stone clusters' },
      ],
      objectives: ['Approach the bush without touching other rocks', 'Look at the glow'],
      memoryHook: 'A bush on fire that did not burn up—God spoke to Moses.',
      techNotes: ['Emissive material on bush; warm light near only'],
    },
    {
      id: 'red_sea_path',
      label: 'Sea path',
      terrain: 'Two water walls with dry sand down the middle.',
      palette: ['#1565c0', '#e8d5a8', '#42a5f5', '#fff9c4'],
      props: [
        { type: 'water_wall', count: 2, notes: 'Tall water columns on each side' },
        { type: 'path', count: 1, notes: 'Central sand strip' },
      ],
      objectives: ['Walk the dry path to the end'],
      memoryHook: 'Walls of water on both sides—God made a way through.',
      techNotes: ['Voxel water columns; clear center strip', 'Fog at corridor depth'],
    },
    {
      id: 'sinai_camp',
      label: 'Mountain camp',
      terrain: 'Rocky plateau with tents and a dark peak above.',
      palette: ['#9e9e9e', '#6d4c41', '#eceff1', '#5d4037'],
      props: [
        { type: 'tent', count: 10, notes: 'Wood + brown blocks' },
        { type: 'mountain', count: 1, notes: 'Steep stone mass behind' },
        { type: 'cloud_base', count: 1, notes: 'Grey block cloud at peak' },
      ],
      objectives: ['Walk through the tent rows', 'Face the mountain'],
      memoryHook: 'Cloud and thunder on the mountain—God’s people camped below.',
      techNotes: ['Heightmap peak; tents as small boxes', 'Grey fog layer at summit'],
    },
  ],
};

export const world_david = {
  id: 'david',
  name: "David's valley",
  verse: '1 Samuel 16–17; Psalm 23',
  biomes: [
    {
      id: 'shepherd_hills',
      label: 'Shepherd hills',
      terrain: 'Rolling green hills with paths and scattered sheep markers.',
      palette: ['#5cb85c', '#8bc34a', '#6d4c41', '#87ceeb'],
      props: [
        { type: 'sheep_marker', count: 8, notes: 'Small white wool blocks' },
        { type: 'staff', count: 1, notes: 'Thin brown column' },
      ],
      objectives: ['Walk the ridge', 'Gather near the sheep pens'],
      memoryHook: 'A shepherd with a sling and a brave heart.',
      techNotes: ['Grass height noise; scattered props'],
    },
    {
      id: 'still_waters',
      label: 'Still waters',
      terrain: 'Grass beside a slow stream and flat stones.',
      palette: ['#43a047', '#1e88e5', '#9e9e9e', '#c8e6c9'],
      props: [
        { type: 'stream', count: 1, notes: 'Blue water strip' },
        { type: 'stones', count: 5, notes: 'Five smooth stones' },
      ],
      objectives: ['Walk beside the stream', 'Stand on the stones'],
      memoryHook: 'Five smooth stones—God can use small things.',
      techNotes: ['Water slightly below grass level', 'Stone as instanced meshes'],
    },
    {
      id: 'valley_floor',
      label: 'Valley battleground',
      terrain: 'Open flat grass between two hills.',
      palette: ['#4caf50', '#9e9e9e', '#7b7b7b', '#bdbdbd'],
      props: [
        { type: 'goliath_silhouette', count: 1, notes: 'Tall grey column stack' },
        { type: 'banner', count: 2, notes: 'Thin poles on each side' },
      ],
      objectives: ['Walk from one hill to the other', 'Look at the tall figure'],
      memoryHook: 'A small shepherd and a giant warrior—God’s power wins.',
      techNotes: ['Very tall stacked mesh for giant', 'Keep player scale small'],
    },
  ],
};

export const world_abraham = {
  id: 'abraham',
  name: "Abraham's journey",
  verse: 'Genesis 12; 15; 22',
  biomes: [
    {
      id: 'ur_city_edge',
      label: 'City edge',
      terrain: 'Dusty roads near simple mudbrick walls.',
      palette: ['#d7ccc8', '#8d6e63', '#ffe082', '#5d4037'],
      props: [
        { type: 'city_wall_segment', count: 6, notes: 'Low wall ring' },
        { type: 'cart', count: 1, notes: 'Wood box + wheels as blocks' },
      ],
      objectives: ['Walk the road', 'Leave the gate'],
      memoryHook: 'Leaving home to follow God’s call.',
      techNotes: ['Walls as repeated boxes', 'Dirt path strip'],
    },
    {
      id: 'desert_tent_route',
      label: 'Desert tent route',
      terrain: 'Open sand with dunes and a tent camp.',
      palette: ['#e8d5a8', '#c4a574', '#ffcc80', '#8d6e63'],
      props: [
        { type: 'tent', count: 3, notes: 'Brown peaked blocks' },
        { type: 'altar_stones', count: 1, notes: 'Small stone heap' },
        { type: 'flock', count: 4, notes: 'White block markers' },
      ],
      objectives: ['Circle the camp', 'Find the altar'],
      memoryHook: 'Tents under stars—God promised a big family.',
      techNotes: ['Rolling sand dunes; point light at campfire'],
    },
    {
      id: 'hill_country_view',
      label: 'Promised land overlook',
      terrain: 'Hilltop with view over green valleys below.',
      palette: ['#8bc34a', '#689f38', '#a5d6a7', '#fff9c4'],
      props: [
        { type: 'standing_stones', count: 3, notes: 'Mark the viewpoint' },
        { type: 'path', count: 1, notes: 'Dirt to the edge' },
      ],
      objectives: ['Walk to the ridge', 'Look over the valley'],
      memoryHook: 'God showed Abraham the land he would bless.',
      techNotes: ['Heightmap drop; distant fog for “far” land'],
    },
    {
      id: 'mountain_moriah',
      label: 'Quiet mountain',
      terrain: 'Rocky summit with sparse bushes and open sky.',
      palette: ['#8d6e63', '#9e9e9e', '#c5e1a5', '#eceff1'],
      props: [
        { type: 'wood_stack', count: 1, notes: 'Altar wood pile' },
        { type: 'ram_marker', count: 1, notes: 'Simple animal shape in bushes' },
      ],
      objectives: ['Walk the path up', 'Stand at the altar stones'],
      memoryHook: 'God provided—trust in the hardest moment.',
      techNotes: ['Steep path; bush clusters as leaf blocks'],
    },
  ],
};

export const world_joshua = {
  id: 'joshua',
  name: "Joshua at Jericho",
  verse: 'Joshua 6',
  biomes: [
    {
      id: 'israelite_camp',
      label: 'Camp outside the city',
      terrain: 'Open grass with tents and a view of walls.',
      palette: ['#7cb342', '#8d6e63', '#fff9c4', '#5d4037'],
      props: [
        { type: 'tent', count: 14, notes: 'Ring around camp' },
        { type: 'banner', count: 4, notes: 'Tall poles' },
      ],
      objectives: ['Walk the camp perimeter', 'Face the city'],
      memoryHook: 'God’s people marching before big walls.',
      techNotes: ['Flat grass; tents in circle'],
    },
    {
      id: 'jericho_wall_ring',
      label: 'Walls of Jericho',
      terrain: 'Circular mudbrick wall with a gap for the gate.',
      palette: ['#bcaaa4', '#8d6e63', '#ffe0b2', '#a1887f'],
      props: [
        { type: 'wall_segment', count: 48, notes: 'Ring of stone/mudbrick' },
        { type: 'gate_gap', count: 1, notes: 'Open section' },
      ],
      objectives: ['Walk around the city once', 'Stop at the gate gap'],
      memoryHook: 'Marching around and around—then the walls fell.',
      techNotes: ['Circular spline or box segments', 'Trumpet sound optional'],
    },
    {
      id: 'fallen_rubble',
      label: 'Fallen city',
      terrain: 'Rubble pile at the base of broken walls; safe path.',
      palette: ['#a1887f', '#d7ccc8', '#8d6e63', '#ffe082'],
      props: [
        { type: 'rubble', count: 20, notes: 'Scattered blocks' },
        { type: 'cleared_path', count: 1, notes: 'Sand through rubble' },
      ],
      objectives: ['Walk the path into the city'],
      memoryHook: 'Walls down—God’s power, not just strength.',
      techNotes: ['Lower wall segments; random debris boxes'],
    },
  ],
};

export const world_joseph_genesis = {
  id: 'joseph_genesis',
  name: "Joseph's story",
  verse: 'Genesis 37; 39–45',
  biomes: [
    {
      id: 'family_fields',
      label: 'Canaan fields',
      terrain: 'Grain fields and hills where the coat story begins.',
      palette: ['#cddc39', '#8bc34a', '#ffeb3b', '#795548'],
      props: [
        { type: 'grain_rows', count: 12, notes: 'Striped green blocks' },
        { type: 'pit_marker', count: 1, notes: 'Dry hole (stone ring)' },
      ],
      objectives: ['Walk the field rows', 'Find the pit'],
      memoryHook: 'A colorful coat and a hard family moment.',
      techNotes: ['Striped rows; low height variation'],
    },
    {
      id: 'caravan_road',
      label: 'Desert road',
      terrain: 'Sandy road with caravan markers.',
      palette: ['#e8d5a8', '#a1887f', '#5d4037', '#8d6e63'],
      props: [
        { type: 'cart', count: 2, notes: 'Wood boxes' },
        { type: 'rope', count: 1, notes: 'Brown line blocks' },
      ],
      objectives: ['Follow the road'],
      memoryHook: 'Taken far from home—God was still with him.',
      techNotes: ['Long flat strip; occasional dunes'],
    },
    {
      id: 'egyptian_palace_yard',
      label: 'Palace yard',
      terrain: 'Stone courtyard with columns and a gate.',
      palette: ['#d7ccc8', '#ffd54f', '#8d6e63', '#eceff1'],
      props: [
        { type: 'column', count: 6, notes: 'Sandstone pillars' },
        { type: 'granary', count: 1, notes: 'Tall box with door' },
      ],
      objectives: ['Walk the courtyard', 'Reach the granary door'],
      memoryHook: 'From prison to planner—God’s plan in Egypt.',
      techNotes: ['Large flat floor; repeating columns'],
    },
    {
      id: 'family_reunion',
      label: 'Reunion tent',
      terrain: 'Open grass with one big tent and wagons.',
      palette: ['#66bb6a', '#8d6e63', '#fff9c4', '#795548'],
      props: [
        { type: 'large_tent', count: 1, notes: 'Central meeting tent' },
        { type: 'wagon', count: 3, notes: 'Simple voxel wagons' },
      ],
      objectives: ['Enter the tent area', 'Walk to the wagons'],
      memoryHook: 'Forgiveness and hugs—family together again.',
      techNotes: ['Open space; warm point light at tent'],
    },
  ],
};

export const world_daniel = {
  id: 'daniel',
  name: "Daniel's Babylon",
  verse: 'Daniel 1; 6',
  biomes: [
    {
      id: 'ishtar_gate_style',
      label: 'City gate',
      terrain: 'Blue and gold tiled gate area leading inward.',
      palette: ['#1e88e5', '#ffd54f', '#8d6e63', '#eceff1'],
      props: [
        { type: 'gate_arch', count: 1, notes: 'Wide archway' },
        { type: 'lion_relief', count: 2, notes: 'Blocky lion shapes' },
      ],
      objectives: ['Walk through the gate'],
      memoryHook: 'A new city with new rules—Daniel stayed faithful.',
      techNotes: ['Colored tiles as repeated UVs or vertex colors'],
    },
    {
      id: 'palace_court',
      label: 'Royal court',
      terrain: 'Polished floor + throne platform.',
      palette: ['#ffd54f', '#8d6e63', '#eceff1', '#5d4037'],
      props: [
        { type: 'throne', count: 1, notes: 'Raised gold blocks' },
        { type: 'pillar', count: 8, notes: 'Ring around room' },
      ],
      objectives: ['Walk the center aisle', 'Stand before the throne'],
      memoryHook: 'Wise words in a king’s court.',
      techNotes: ['Large room; gold emissive on throne'],
    },
    {
      id: 'lions_den',
      label: 'Lions’ den',
      terrain: 'Stone pit with a single opening ring.',
      palette: ['#9e9e9e', '#6d4c41', '#4e342e', '#8bc34a'],
      props: [
        { type: 'pit_wall', count: 1, notes: 'Cylinder ring of stone' },
        { type: 'lion_marker', count: 2, notes: 'Simple shapes in shadows' },
      ],
      objectives: ['Look into the pit from the edge', 'Walk the rim'],
      memoryHook: 'God shut the lions’ mouths—peace in the night.',
      techNotes: ['Cylinder or box ring; dim light inside'],
    },
  ],
};

export const world_jonah = {
  id: 'jonah',
  name: "Jonah's port",
  verse: 'Jonah 1–4',
  biomes: [
    {
      id: 'joppa_docks',
      label: 'Harbor docks',
      terrain: 'Wood piers over blue water.',
      palette: ['#7a5545', '#1565c0', '#90caf9', '#8d6e63'],
      props: [
        { type: 'ship', count: 1, notes: 'Medium hull' },
        { type: 'cargo', count: 4, notes: 'Crates on dock' },
      ],
      objectives: ['Walk the pier', 'Board the ship deck'],
      memoryHook: 'Running from God—storm on the way.',
      techNotes: ['Water plane; wood pier as planks'],
    },
    {
      id: 'storm_sea',
      label: 'Stormy sea',
      terrain: 'Rough water with dark clouds above.',
      palette: ['#0d47a1', '#37474f', '#90a4ae', '#e3f2fd'],
      props: [
        { type: 'wave_marker', count: 6, notes: 'White foam blocks' },
        { type: 'ship', count: 1, notes: 'Rocking optional' },
      ],
      objectives: ['Stay on deck', 'Look at the waves'],
      memoryHook: 'Big waves—God got Jonah’s attention.',
      techNotes: ['Fog + darker sky color', 'Animated water offset optional'],
    },
    {
      id: 'nineveh_gate',
      label: 'Big city gate',
      terrain: 'Wide stone gate and long streets.',
      palette: ['#bcaaa4', '#8d6e63', '#ffe082', '#5d4037'],
      props: [
        { type: 'wall', count: 8, notes: 'Long segments' },
        { type: 'banner', count: 3, notes: 'Over gate' },
      ],
      objectives: ['Walk the main street', 'Reach the gate'],
      memoryHook: 'A whole city to hear God’s message.',
      techNotes: ['Straight street grid'],
    },
    {
      id: 'vine_shelter',
      label: 'Quiet plant shade',
      terrain: 'Small hill with a leafy shelter over a bench.',
      palette: ['#689f38', '#8bc34a', '#d7ccc8', '#87ceeb'],
      props: [
        { type: 'vine_canopy', count: 1, notes: 'Leaf blocks overhead' },
        { type: 'bench', count: 1, notes: 'Wood seat' },
      ],
      objectives: ['Sit under the shade'],
      memoryHook: 'God teaches kindness—even when we’re grumpy.',
      techNotes: ['Leaf canopy; soft light'],
    },
  ],
};

export const world_esther = {
  id: 'esther',
  name: "Esther's palace",
  verse: 'Esther 4–5; 7',
  biomes: [
    {
      id: 'outer_court',
      label: 'Outer court',
      terrain: 'Wide stone yard with fountains.',
      palette: ['#eceff1', '#90a4ae', '#ffd54f', '#b0bec5'],
      props: [
        { type: 'fountain', count: 2, notes: 'Blue center + stone ring' },
        { type: 'bench', count: 4, notes: 'Along walls' },
      ],
      objectives: ['Walk the courtyard', 'Pass the fountains'],
      memoryHook: 'Brave steps toward the king.',
      techNotes: ['Large plaza; water plane in fountain'],
    },
    {
      id: 'inner_court',
      label: 'Inner court',
      terrain: 'Polished floor + long rug runner.',
      palette: ['#ffd54f', '#8d6e63', '#ffecb3', '#5d4037'],
      props: [
        { type: 'rug', count: 1, notes: 'Red carpet strip' },
        { type: 'pillar', count: 10, notes: 'Gold caps' },
      ],
      objectives: ['Walk the carpet', 'Stop at the scepter marker'],
      memoryHook: '“If I die, I die”—courage for her people.',
      techNotes: ['Emissive gold trim on pillars'],
    },
    {
      id: 'banquet_hall',
      label: 'Banquet hall',
      terrain: 'Low tables and cushions.',
      palette: ['#ffe082', '#8d6e63', '#fff8e1', '#6d4c41'],
      props: [
        { type: 'table', count: 6, notes: 'Low blocks' },
        { type: 'cup', count: 12, notes: 'Small gold blocks' },
      ],
      objectives: ['Walk between tables'],
      memoryHook: 'God’s timing at the feast.',
      techNotes: ['Interior box room; warm lights'],
    },
  ],
};

export const world_mary = {
  id: 'mary',
  name: "Mary's Nazareth",
  verse: 'Luke 1–2',
  biomes: [
    {
      id: 'nazareth_hills',
      label: 'Hill village',
      terrain: 'Terraced hills with small houses.',
      palette: ['#8bc34a', '#d7ccc8', '#8d6e63', '#ffe082'],
      props: [
        { type: 'house', count: 6, notes: 'Simple blocks' },
        { type: 'olive_tree', count: 8, notes: 'Short trees' },
      ],
      objectives: ['Walk the path between houses'],
      memoryHook: 'A young woman who said yes to God.',
      techNotes: ['Terrace steps as height bands'],
    },
    {
      id: 'home_interior_symbolic',
      label: 'Simple home',
      terrain: 'Small room with window light.',
      palette: ['#efebe9', '#8d6e63', '#fff9c4', '#795548'],
      props: [
        { type: 'table', count: 1, notes: 'Center' },
        { type: 'lamp', count: 1, notes: 'Oil lamp block' },
      ],
      objectives: ['Walk the room', 'Stand by the window'],
      memoryHook: 'God’s good news in a quiet room.',
      techNotes: ['Interior box; window as bright quad'],
    },
    {
      id: 'road_to_bethlehem',
      label: 'Road to Bethlehem',
      terrain: 'Dirt road winding over hills.',
      palette: ['#c4a574', '#8d6e63', '#a5d6a7', '#90a4ae'],
      props: [
        { type: 'donkey_marker', count: 1, notes: 'Simple animal shape' },
        { type: 'inn_marker', count: 1, notes: 'Small building' },
      ],
      objectives: ['Follow the road to the end'],
      memoryHook: 'A journey to Bethlehem—God’s Son was born.',
      techNotes: ['Curved path strip on heightmap'],
    },
  ],
};

export const world_peter = {
  id: 'peter',
  name: "Peter's lakeside",
  verse: 'Luke 5; Acts 2–3',
  biomes: [
    {
      id: 'galilee_shore',
      label: 'Lake shore',
      terrain: 'Pebbly beach and nets laid out.',
      palette: ['#e8d5a8', '#1e88e5', '#78909c', '#5d4037'],
      props: [
        { type: 'net', count: 2, notes: 'Flat green mesh-like blocks' },
        { type: 'boat', count: 2, notes: 'Fishing boats' },
      ],
      objectives: ['Walk the shore', 'Step into a boat'],
      memoryHook: 'Fishers of men—leaving nets to follow Jesus.',
      techNotes: ['Water edge; boat hulls as boxes'],
    },
    {
      id: 'city_street_jerusalem',
      label: 'Jerusalem street',
      terrain: 'Stone street with crowd space.',
      palette: ['#d7ccc8', '#8d6e63', '#ffe082', '#5d4037'],
      props: [
        { type: 'market_stall', count: 5, notes: 'Small tents' },
        { type: 'temple_gate', count: 1, notes: 'Big arch' },
      ],
      objectives: ['Walk toward the gate'],
      memoryHook: 'Bold preaching—God’s Spirit at work.',
      techNotes: ['Straight street; gate as large arch mesh'],
    },
    {
      id: 'temple_courtyard_symbolic',
      label: 'Temple gate',
      terrain: 'Open stone area with pool edge.',
      palette: ['#bdbdbd', '#ffd54f', '#4fc3f7', '#6d4c41'],
      props: [
        { type: 'pool', count: 1, notes: 'Rectangular water' },
        { type: 'column', count: 6, notes: 'Portico' },
      ],
      objectives: ['Walk the portico', 'Circle the pool'],
      memoryHook: 'Healing in Jesus’ name—hope in the city.',
      techNotes: ['Water in pool; stone floor'],
    },
  ],
};

export const world_paul = {
  id: 'paul',
  name: "Paul's journeys",
  verse: 'Acts 9; 16; 27',
  biomes: [
    {
      id: 'damascus_road',
      label: 'Desert road',
      terrain: 'Bright sky and dusty road.',
      palette: ['#e8d5a8', '#fff9c4', '#ffeb3b', '#795548'],
      props: [
        { type: 'road', count: 1, notes: 'Long strip' },
        { type: 'stones', count: 5, notes: 'Alongside' },
      ],
      objectives: ['Walk the road to the bright marker'],
      memoryHook: 'A bright light—Paul’s life changed.',
      techNotes: ['Strong directional light; bloom optional'],
    },
    {
      id: 'philippi_river',
      label: 'River prayer spot',
      terrain: 'River bank with small gathering space.',
      palette: ['#81c784', '#1e88e5', '#8d6e63', '#ffe082'],
      props: [
        { type: 'river', count: 1, notes: 'Flowing strip' },
        { type: 'stones_seat', count: 4, notes: 'Sitting rocks' },
      ],
      objectives: ['Stand by the riverbank'],
      memoryHook: 'New friends in faith by the water.',
      techNotes: ['Water shader simple; bank grass'],
    },
    {
      id: 'philippi_prison',
      label: 'Prison yard',
      terrain: 'Stone walls with iron gate.',
      palette: ['#9e9e9e', '#6d4c41', '#eceff1', '#ffd54f'],
      props: [
        { type: 'cell_gate', count: 1, notes: 'Bars as thin columns' },
        { type: 'chains', count: 0, notes: 'Optional chain blocks' },
      ],
      objectives: ['Walk the yard', 'Stand at the gate'],
      memoryHook: 'Singing at midnight—God set them free.',
      techNotes: ['Dim interior; point light in cell'],
    },
    {
      id: 'shipwreck_beach',
      label: 'Island beach',
      terrain: 'Sand, broken planks, and friendly fire.',
      palette: ['#ffe082', '#8d6e63', '#5d4037', '#ff7043'],
      props: [
        { type: 'ship_debris', count: 10, notes: 'Wood scatter' },
        { type: 'campfire', count: 1, notes: 'Orange emissive' },
      ],
      objectives: ['Walk the beach', 'Gather near the fire'],
      memoryHook: 'Shipwrecked but safe—God kept his promise.',
      techNotes: ['Debris random boxes; fire emissive'],
    },
  ],
};

export const world_ruth = {
  id: 'ruth',
  name: "Ruth's fields",
  verse: 'Ruth 1–4',
  biomes: [
    {
      id: 'moab_hills',
      label: 'Moab hills',
      terrain: 'Dry hills with a path leaving town.',
      palette: ['#d7ccc8', '#8d6e63', '#ffe082', '#a1887f'],
      props: [
        { type: 'house', count: 3, notes: 'Edge of map' },
        { type: 'path', count: 1, notes: 'Dirt away' },
      ],
      objectives: ['Walk the path out of town'],
      memoryHook: 'A hard choice to stay loyal.',
      techNotes: ['Arid tint; dust particles optional'],
    },
    {
      id: 'bethlehem_barley',
      label: 'Barley fields',
      terrain: 'Golden fields with rows.',
      palette: ['#ffd54f', '#ffb300', '#8bc34a', '#fff8e1'],
      props: [
        { type: 'barley_row', count: 20, notes: 'Striped blocks' },
        { type: 'well', count: 1, notes: 'Stone ring' },
      ],
      objectives: ['Walk the rows', 'Reach the well'],
      memoryHook: 'Kindness in the grain—God sees faithfulness.',
      techNotes: ['Striped rows; tall grass color'],
    },
    {
      id: 'threshing_floor',
      label: 'Threshing floor',
      terrain: 'Flat packed earth with a pile of grain.',
      palette: ['#d7ccc8', '#ffe082', '#8d6e63', '#fff9c4'],
      props: [
        { type: 'grain_pile', count: 1, notes: 'Yellow mound' },
        { type: 'winnowing_tool', count: 1, notes: 'Wood fork prop' },
      ],
      objectives: ['Circle the pile'],
      memoryHook: 'A story of loyalty and blessing.',
      techNotes: ['Flat circle; pile as pyramid blocks'],
    },
  ],
};

export const world_elijah = {
  id: 'elijah',
  name: "Elijah's mountain",
  verse: '1 Kings 17–18',
  biomes: [
    {
      id: 'brook_cherith',
      label: 'Brook in the hills',
      terrain: 'Narrow stream with bushes.',
      palette: ['#689f38', '#1e88e5', '#8d6e63', '#c8e6c9'],
      props: [
        { type: 'stream', count: 1, notes: 'Thin blue line' },
        { type: 'raven_marker', count: 0, notes: 'Optional bird silhouette' },
      ],
      objectives: ['Follow the brook upstream'],
      memoryHook: 'God cared for Elijah day by day.',
      techNotes: ['Water in trench; rocks along bank'],
    },
    {
      id: 'carmel_high_place',
      label: 'Mount Carmel summit',
      terrain: 'Rocky plateau with altar stones.',
      palette: ['#9e9e9e', '#6d4c41', '#eceff1', '#ff7043'],
      props: [
        { type: 'altar', count: 1, notes: 'Stone heap + wood' },
        { type: 'trench', count: 1, notes: 'Around altar' },
      ],
      objectives: ['Walk the plateau', 'Stand at the altar'],
      memoryHook: 'Fire from heaven—God is real.',
      techNotes: ['Flat top; fire effect for finale'],
    },
    {
      id: 'storm_cloud',
      label: 'Storm coming',
      terrain: 'Same hill with dark clouds and wind.',
      palette: ['#546e7a', '#37474f', '#90a4ae', '#e3f2fd'],
      props: [
        { type: 'cloud_layer', count: 3, notes: 'Grey blocks above' },
      ],
      objectives: ['Look toward the sea horizon'],
      memoryHook: 'A small cloud—God’s rain after drought.',
      techNotes: ['Fog density up; sky color darker'],
    },
  ],
};

export const world_elisha = {
  id: 'elisha',
  name: "Elisha's road",
  verse: '2 Kings 2; 4–6',
  biomes: [
    {
      id: 'jordan_river',
      label: 'River crossing',
      terrain: 'Wide river with shallow banks.',
      palette: ['#42a5f5', '#8d6e63', '#c8e6c9', '#ffe082'],
      props: [
        { type: 'river', count: 1, notes: 'Wide water' },
        { type: 'cloak_marker', count: 1, notes: 'Cloth on ground' },
      ],
      objectives: ['Wade the shallow edge', 'Reach the far bank'],
      memoryHook: 'God’s power passed on—cloak on the water.',
      techNotes: ['Water plane; bank slopes'],
    },
    {
      id: 'shunem_room',
      label: 'Upper room',
      terrain: 'Small house with a bed platform.',
      palette: ['#efebe9', '#8d6e63', '#fff9c4', '#795548'],
      props: [
        { type: 'bed', count: 1, notes: 'Wood frame' },
        { type: 'lamp', count: 1, notes: 'Oil lamp' },
      ],
      objectives: ['Walk upstairs', 'Stand by the bed'],
      memoryHook: 'A kind room built for God’s prophet.',
      techNotes: ['Interior box; window light'],
    },
    {
      id: 'axe_head_river',
      label: 'River with trees',
      terrain: 'River bank with logs floating.',
      palette: ['#1e88e5', '#5d4037', '#8bc34a', '#a1887f'],
      props: [
        { type: 'log', count: 3, notes: 'Floating wood' },
        { type: 'axe', count: 1, notes: 'Small tool prop' },
      ],
      objectives: ['Walk the bank', 'Reach the log'],
      memoryHook: 'God helped when something was lost.',
      techNotes: ['Water + floating logs as bobbing'],
    },
  ],
};

export const world_gideon = {
  id: 'gideon',
  name: "Gideon's camp",
  verse: 'Judges 6–7',
  biomes: [
    {
      id: 'winepress_hide',
      label: 'Hidden winepress',
      terrain: 'Sunken pit with wheat nearby.',
      palette: ['#8d6e63', '#d7ccc8', '#8bc34a', '#6d4c41'],
      props: [
        { type: 'winepress', count: 1, notes: 'Stone pit' },
        { type: 'wheat', count: 6, notes: 'Sheaves' },
      ],
      objectives: ['Step down into the pit', 'Return to the field'],
      memoryHook: 'Afraid at first—God called him brave.',
      techNotes: ['Depression in terrain; pit walls'],
    },
    {
      id: 'spring_lap_test',
      label: 'Spring by the camp',
      terrain: 'Small pool with banks.',
      palette: ['#42a5f5', '#8d6e63', '#c8e6c9', '#ffe082'],
      props: [
        { type: 'pool', count: 1, notes: 'Clear water' },
        { type: 'soldier_marker', count: 12, notes: 'Abstract figures' },
      ],
      objectives: ['Walk the bank', 'Count the markers'],
      memoryHook: 'God chose a smaller army on purpose.',
      techNotes: ['Water circle; figures as thin columns'],
    },
    {
      id: 'midnight_torch',
      label: 'Camp at night',
      terrain: 'Torches and jars around tents.',
      palette: ['#263238', '#ff7043', '#ffd54f', '#5d4037'],
      props: [
        { type: 'torch', count: 20, notes: 'Point lights' },
        { type: 'jar', count: 20, notes: 'Clay pots' },
      ],
      objectives: ['Walk between tents without bumping jars'],
      memoryHook: 'Torches, jars, and a shout—God won the battle.',
      techNotes: ['Many point lights; performance limit'],
    },
  ],
};

export const world_samson = {
  id: 'samson',
  name: "Samson's land",
  verse: 'Judges 13–16',
  biomes: [
    {
      id: 'vineyard_path',
      label: 'Vineyard path',
      terrain: 'Grape rows and stone pillars.',
      palette: ['#7cb342', '#6a1b9a', '#8d6e63', '#c8e6c9'],
      props: [
        { type: 'vine_row', count: 8, notes: 'Trellis posts' },
        { type: 'pillar', count: 2, notes: 'Famous pair' },
      ],
      objectives: ['Walk the row', 'Stand between pillars'],
      memoryHook: 'Strong—but God’s power had a purpose.',
      techNotes: ['Tall pillars; breakable optional'],
    },
    {
      id: 'philistine_city_gate',
      label: 'City gate',
      terrain: 'Heavy gate and walls.',
      palette: ['#d7ccc8', '#8d6e63', '#ffe082', '#5d4037'],
      props: [
        { type: 'gate', count: 1, notes: 'Large doors' },
        { type: 'path', count: 1, notes: 'Dirt road' },
      ],
      objectives: ['Walk through the gate'],
      memoryHook: 'A story about strength and choices.',
      techNotes: ['Gate as thick blocks'],
    },
  ],
};

export const world_shadrach_team = {
  id: 'shadrach_team',
  name: 'Fiery furnace',
  verse: 'Daniel 3',
  biomes: [
    {
      id: 'golden_statue',
      label: 'Plain of Dura',
      terrain: 'Flat plain with one huge statue.',
      palette: ['#e8d5a8', '#ffd54f', '#ffb300', '#8d6e63'],
      props: [
        { type: 'statue', count: 1, notes: 'Tall gold block stack' },
        { type: 'crowd_ring', count: 1, notes: 'Stone markers' },
      ],
      objectives: ['Walk the ring', 'Look up at the statue'],
      memoryHook: 'Everyone bowed—three friends stood tall.',
      techNotes: ['Gold emissive; tall mesh'],
    },
    {
      id: 'furnace_mouth',
      label: 'Furnace',
      terrain: 'Brick furnace with open door.',
      palette: ['#bf360c', '#ff6f00', '#9e9e9e', '#37474f'],
      props: [
        { type: 'furnace', count: 1, notes: 'Box with orange interior' },
        { type: 'guard', count: 4, notes: 'Simple figures' },
      ],
      objectives: ['Walk to the door', 'Step back from heat'],
      memoryHook: 'Fire that did not win—God’s friends walked free.',
      techNotes: ['Orange emissive inside; heat particles'],
    },
    {
      id: 'cooling_floor',
      label: 'After the fire',
      terrain: 'Same room with cool floor.',
      palette: ['#eceff1', '#90a4ae', '#ffd54f', '#b0bec5'],
      props: [
        { type: 'fourth_figure', count: 1, notes: 'Bright humanoid silhouette' },
      ],
      objectives: ['Stand in the center'],
      memoryHook: 'Four walking in the fire—God was with them.',
      techNotes: ['Bright light in furnace interior'],
    },
  ],
};

export const world_samuel = {
  id: 'samuel',
  name: "Samuel's night",
  verse: '1 Samuel 3',
  biomes: [
    {
      id: 'tabernacle_yard',
      label: 'Tabernacle yard',
      terrain: 'Open court with lamp stands.',
      palette: ['#d7ccc8', '#ffd54f', '#8d6e63', '#eceff1'],
      props: [
        { type: 'lamp', count: 7, notes: 'Gold stands' },
        { type: 'altar', count: 1, notes: 'Stone heap' },
      ],
      objectives: ['Walk the court', 'Circle the lamp stands'],
      memoryHook: 'Quiet night where God spoke a boy’s name.',
      techNotes: ['Warm lamp lights; night sky'],
    },
    {
      id: 'sleeping_room',
      label: 'Sleeping room',
      terrain: 'Small room with bed mat.',
      palette: ['#efebe9', '#5d4037', '#fff9c4', '#8d6e63'],
      props: [
        { type: 'mat', count: 1, notes: 'Flat rug' },
        { type: 'lamp', count: 1, notes: 'Small oil light' },
      ],
      objectives: ['Lie path to door', 'Walk to the doorway'],
      memoryHook: '“Speak, Lord—your servant is listening.”',
      techNotes: ['Interior; dim blue moonlight'],
    },
    {
      id: 'temple_steps',
      label: 'Steps to the Ark area',
      terrain: 'Short steps up to inner curtain symbol.',
      palette: ['#bdbdbd', '#ffd54f', '#6d4c41', '#eceff1'],
      props: [
        { type: 'steps', count: 1, notes: 'Short stair' },
        { type: 'curtain', count: 1, notes: 'Blue blocks' },
      ],
      objectives: ['Climb the steps', 'Stop at the curtain'],
      memoryHook: 'God called a child—listening matters.',
      techNotes: ['Steps; curtain as vertical plane'],
    },
  ],
};

/** All configs keyed by id for lookup. */
export const HERO_WORLD_CONFIGS = {
  jesus: world_jesus,
  noah: world_noah,
  moses: world_moses,
  david: world_david,
  abraham: world_abraham,
  joshua: world_joshua,
  joseph_genesis: world_joseph_genesis,
  daniel: world_daniel,
  jonah: world_jonah,
  esther: world_esther,
  mary: world_mary,
  peter: world_peter,
  paul: world_paul,
  ruth: world_ruth,
  elijah: world_elijah,
  elisha: world_elisha,
  gideon: world_gideon,
  samson: world_samson,
  shadrach_team: world_shadrach_team,
  samuel: world_samuel,
};
