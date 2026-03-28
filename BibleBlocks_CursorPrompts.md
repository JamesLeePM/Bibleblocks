# ⛏️ BibleBlocks — Cursor Build Prompts
> A Minecraft-style voxel builder featuring Bible characters & worlds
> Paste each prompt into Cursor in order. Wait for each to complete before moving to the next.

---

## 🚀 PROMPT 1 — Project Scaffold

```
Create a new Vite + vanilla JavaScript project called "BibleBlocks".

Set up the project with this structure:
- index.html (entry point with a full-screen canvas)
- src/main.js (app entry)
- src/engine/ (folder for 3D engine files)
- src/world/ (folder for world/chunk logic)
- src/characters/ (folder for Bible character definitions)
- src/ui/ (folder for HUD and menus)
- src/assets/ (folder for textures and sounds)
- public/ (static assets)

Install dependencies:
- three (3D rendering)
- @tweenjs/tween.js (animations)

Set up the HTML with:
- Full-screen canvas #game-canvas
- A loading screen overlay with a cross logo and "BibleBlocks" title in a pixel font
- Link Google Fonts: "Press Start 2P" for the pixel style

In main.js, initialize Three.js with:
- A WebGLRenderer filling the full window
- A PerspectiveCamera (75 FOV)
- OrbitControls for testing
- A basic animation loop
- Window resize handling
- A simple directional light (sun) and ambient light

Show a green ground plane so we can confirm the scene works.
```

---

## 🌍 PROMPT 2 — Voxel World Engine

```
In src/engine/VoxelWorld.js, build a voxel chunk system:

CHUNK SYSTEM:
- Chunk size: 16x16x16 blocks
- Use a flat Uint8Array for block data (type 0 = air)
- VoxelWorld class that holds a Map of chunks keyed by "x,y,z"
- Methods: setBlock(x, y, z, type), getBlock(x, y, z), getChunk(cx, cy, cz)

MESH BUILDER (src/engine/ChunkMesher.js):
- Build greedy meshes from chunk data — only render visible faces
- Each block face gets UV coordinates mapped to a 16x16 texture atlas
- Support these block types with atlas UV slots:
  1 = Sand (desert ground)
  2 = Stone (cave/temple walls)
  3 = Wood (Noah's Ark planks)
  4 = Leaf (garden trees)
  5 = Water (blue, semi-transparent)
  6 = Gold (temple decorations)
  7 = Bread (food item)
  8 = Grass

WORLD GENERATOR (src/world/WorldGenerator.js):
- Generate a flat world (10 chunks x 10 chunks) of grass blocks as default
- Add a "desert" biome option that generates sand with occasional stone formations
- Add a "garden" biome with grass, trees (wood trunk + leaf top)

Return the Three.js mesh group from the builder so it can be added to the scene.
```

---

## 🎨 PROMPT 3 — Texture Atlas

```
In src/assets/TextureAtlas.js, create a procedural texture atlas using Three.js CanvasTexture.

Draw a 256x256 canvas where each 16x16 tile is a hand-drawn pixel-art block texture:

- Slot (0,0): Grass — green top, brown sides
- Slot (1,0): Sand — tan with subtle grain dots
- Slot (2,0): Stone — grey with cracks
- Slot (3,0): Wood — brown vertical grain lines
- Slot (4,0): Leaf — bright green with darker dots
- Slot (5,0): Water — blue with white wavy lines, set material to semi-transparent
- Slot (6,0): Gold — bright yellow with shine spots
- Slot (7,0): Bread — tan/brown loaf shape
- Slot (8,0): Dirt — brown with texture dots

Style the textures to look like classic Minecraft pixel art but with warm, bright biblical colors (sandy golds, deep blues, rich greens).

Export:
- getAtlasTexture() → returns Three.js Texture
- getUVsForBlock(blockType) → returns {u, v} for the atlas slot
```

---

## 🧑‍🤝‍🧑 PROMPT 4 — Bible Character System

```
In src/characters/, build a voxel character system:

CHARACTER MODEL (src/characters/VoxelCharacter.js):
Build characters from colored voxel blocks using Three.js BoxGeometry:
- Head: 8x8x8 blocks
- Body: 8x12x4 blocks
- Arms: 4x12x4 (x2)
- Legs: 4x12x4 (x2)

Each body part is a separate mesh so we can animate them.
Add a simple idle animation (slight bob up/down using TweenJS).
Add a walk cycle animation method.

CHARACTER DEFINITIONS (src/characters/BibleCharacters.js):
Define these 8 characters with unique color palettes and accessories:

1. DAVID — shepherd boy
   - Brown tunic, dark hair, small sling accessory (flat stone block)
   - Crown accessory (gold blocks on head) togglable
   - Description: "The shepherd who became king"

2. MOSES — prophet
   - White robe, grey beard, holds staff (tall brown cylinder)
   - Glowing tablets accessory (gold flat blocks)
   - Description: "Led God's people to freedom"

3. NOAH — builder
   - Brown work tunic, grey hair, holds hammer
   - Boat/ark blueprint accessory
   - Description: "Built the ark and saved the animals"

4. MARY — mother of Jesus
   - Blue robe, head covering
   - Baby Jesus swaddle accessory (white bundle)
   - Description: "Chosen by God, mother of Jesus"

5. DANIEL — lion tamer
   - Purple robe, calm expression
   - Lion cub sitting beside him (small orange voxel lion)
   - Description: "Trusted God in the lion's den"

6. ESTHER — queen
   - Purple and gold robes, crown
   - Scroll accessory
   - Description: "Brave queen who saved her people"

7. JONAH — sailor
   - Blue sailor tunic, holds fish
   - Whale accessory (large blue voxel shape)
   - Description: "Learned obedience inside a great fish"

8. JOSHUA — warrior
   - Bronze armor, shield, trumpet
   - Walls of Jericho block formation accessory
   - Description: "Trusted God and the walls came down"

Export a CharacterSelector class that:
- Shows all 8 characters in a carousel
- Lets the player pick one to "place" in the world
- Returns the Three.js group for the selected character
```

---

## 🎮 PROMPT 5 — First Person Controls & Block Placement

```
In src/engine/PlayerController.js, build Minecraft-style first-person controls:

MOVEMENT:
- Lock pointer on canvas click (Pointer Lock API)
- WASD movement relative to camera direction
- Space to jump (with gravity)
- Shift to sneak/crouch
- Flying mode toggle with F key (for creative building)
- Speed: walk=5, run=8 (hold Shift+W), fly=12

CAMERA:
- Mouse look (pitch/yaw) with pointer lock
- Head bob animation while walking
- FOV: 75 normal, 90 running

BLOCK INTERACTION:
- Raycast from camera center to find targeted block
- Show wireframe highlight cube on targeted block face
- Left click: remove block
- Right click: place block on the adjacent face
- Currently selected block type shown in hotbar

HOTBAR (src/ui/Hotbar.js):
- 9 slots at bottom center of screen
- Number keys 1-9 to select block type
- Scroll wheel to cycle
- Show block icon (small canvas preview using atlas) in each slot
- Pre-fill slots with: Grass, Sand, Stone, Wood, Leaf, Water, Gold, Bread, Dirt

Also add a crosshair (+) at screen center using CSS overlay.
```

---

## 🏛️ PROMPT 6 — Bible World Presets

```
In src/world/BibleWorlds.js, create 4 pre-built world presets that generate using the VoxelWorld system:

1. GARDEN OF EDEN
- Lush flat grassland with tall trees (wood trunk, leaf canopy)
- Flowers (colored single blocks on grass)
- A central Tree of Knowledge (extra tall, gold-tipped)
- River (water channel running east-west)
- Spawn with Mary or Noah character nearby

2. DESERT OF EXODUS  
- Rolling sand terrain with height variation
- Red sandstone rock formations
- Burning bush (orange/red leaf blocks on a small wood stump)
- Parted sea effect (two water walls with sand path between)
- Spawn with Moses character

3. NOAH'S ARK DOCK
- Ocean water base layer
- Large wooden ark structure (pre-built with wood blocks, 3 stories tall)
- Ramp leading up to ark entrance
- Animal pairs nearby (simple voxel shapes: elephant, giraffe, dove)
- Storm clouds (dark grey blocks high in sky)
- Spawn with Noah character

4. DAVID'S VALLEY (Valley of Elah)
- Grassy valley with hills on sides
- Stream (water path down center)
- Five smooth stones on the ground (grey sphere-ish blocks)
- Goliath — a giant enemy-type character (extra tall, grey armor)
- Spawn with David character

Add a World Select screen (src/ui/WorldSelect.js) with:
- 4 cards showing each world name + description + pixel art preview (drawn on canvas)
- Click to load that world
- Animated entrance transition
```

---

## 🖥️ PROMPT 7 — Main Menu & HUD

```
Build the full game UI:

MAIN MENU (src/ui/MainMenu.js):
- Animated background: a slow-panning voxel scene (rotating world preview)
- Title: "BibleBlocks" in Press Start 2P font, with a glowing golden color
- Subtitle: "Build the Stories of the Bible"
- Menu buttons:
  → Play (opens World Select)
  → Characters (opens Character Gallery)
  → About (shows brief text: "Learn about Bible heroes through building!")
- A small cross/star of David symbol as decoration
- Warm parchment/gold color scheme

CHARACTER GALLERY (src/ui/CharacterGallery.js):
- Grid of 8 character cards
- Each card shows:
  - Character voxel render (3D canvas preview — a mini Three.js scene)
  - Character name
  - Bible verse reference (just the reference, not the full verse)
  - Their description
- Click a card to get a fun Bible fact popup

IN-GAME HUD (src/ui/HUD.js):
- Hotbar at bottom
- Current world name top-left
- Current character name + small icon top-right
- "Bible Fact" button bottom-right → shows a fun popup with a Bible story snippet for the current character
- Pause menu (Esc) with: Resume, Change World, Change Character, Main Menu

Style everything with:
- Press Start 2P font for headings
- Warm parchment/papyrus background textures (draw with canvas)
- Gold and earth-tone color palette
- No modern/corporate UI — keep it playful and biblical
```

---

## 🔊 PROMPT 8 — Sound & Polish

```
Add final polish:

SOUNDS (src/audio/SoundManager.js):
Use the Web Audio API to generate 8-bit style sounds procedurally (no audio files needed):
- Block place: short click tone
- Block break: crunchy low tone  
- Jump: quick ascending beep
- Walk: soft tick every step
- Menu open: harp-like ascending chord
- Character select: triumphant 3-note fanfare

PARTICLE EFFECTS (src/engine/Particles.js):
- Block break: 6-8 small colored cubes fly out, gravity, fade
- Block place: brief sparkle puff
- Character spawn: golden star burst particles

SAVE SYSTEM (src/world/SaveManager.js):
- Save world to localStorage as JSON (block positions + types)
- Auto-save every 60 seconds
- Load on return
- "Save Slot" system with 3 slots, shown on main menu

FINAL TOUCHES:
- Day/night cycle: directional light slowly rotates, sky color shifts from blue → orange → dark blue over 10 minutes
- Stars at night: white dot particles in a dome around the scene
- Fog: THREE.Fog on the scene for depth, color matches sky
- Loading screen: progress bar as chunks generate, with Bible verse displayed:
  "In the beginning, God created..." — Genesis 1:1
- Add a README.md explaining the game and all 8 characters
```

---

## 🧪 BONUS PROMPT — Bible Challenges Mode

```
Add an optional "Bible Challenges" mode (src/modes/ChallengeMode.js):

Create 5 guided building challenges:

1. BUILD NOAH'S ARK
- Show a ghost/outline of the ark shape
- Player must fill it in with wood blocks
- Progress bar shows % complete
- Win condition: 90% of blocks filled

2. BUILD THE TEMPLE OF SOLOMON
- Provide a blueprint overlay
- Must use Gold and Stone blocks
- 3 rooms: Outer Court, Holy Place, Most Holy Place

3. PART THE RED SEA
- Place water blocks to form two walls
- Leave a path down the middle
- Sand path must be at least 3 wide

4. BUILD DAVID'S TOWER
- Stack stone blocks to reach a height marker (64 blocks high)
- Must be at least 5x5 base

5. GARDEN PLANTING
- Place trees, flowers, and water to fill a 32x32 garden area
- Must include: 5 trees, 10 flowers, 1 water source

Each challenge shows:
- Instructions panel (left side)
- Bible story context (1-2 sentences)
- Progress tracker
- Completion celebration: confetti particles + fanfare sound + "Well done! Just like [character]!"
```

---

## 📁 Final Project Structure Reference

```
BibleBlocks/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/
└── src/
    ├── main.js
    ├── engine/
    │   ├── VoxelWorld.js
    │   ├── ChunkMesher.js
    │   ├── PlayerController.js
    │   └── Particles.js
    ├── world/
    │   ├── WorldGenerator.js
    │   ├── BibleWorlds.js
    │   └── SaveManager.js
    ├── characters/
    │   ├── VoxelCharacter.js
    │   └── BibleCharacters.js
    ├── audio/
    │   └── SoundManager.js
    ├── modes/
    │   └── ChallengeMode.js
    ├── ui/
    │   ├── MainMenu.js
    │   ├── WorldSelect.js
    │   ├── CharacterGallery.js
    │   ├── HUD.js
    │   └── Hotbar.js
    └── assets/
        └── TextureAtlas.js
```

---

## 💡 Tips for Using These in Cursor

1. **Open each prompt in Cursor's Composer** (Cmd+I or Ctrl+I)
2. **Always complete one before starting the next** — each builds on the last
3. If Cursor gets confused, **add this context header** to any prompt:
   > "This is for BibleBlocks, a Minecraft-style voxel game using Three.js and Vite. We are building Prompt [N] of 8."
4. After Prompt 2, run `npm run dev` to test the world renders
5. After Prompt 5, test block placement works before moving forward
6. Use **Cursor's Chat mode** to debug specific errors mid-build

---

*Total estimated build time: 3–6 hours | Ages 6+ for gameplay | Three.js + Vite + Vanilla JS*
