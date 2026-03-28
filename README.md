# BibleBlocks

BibleBlocks is a Minecraft-style voxel builder made for joyful, faith-filled creativity.  
Build worlds, place Bible heroes, and explore stories of courage, trust, and hope.

**Repository:** [github.com/JamesLeePM/Bibleblocks](https://github.com/JamesLeePM/Bibleblocks)

## Tech

- **Three.js** — voxel meshes, lighting, shadows
- **Vite** — dev server and production build
- **Procedural texture atlas** — pixel-art block tiles
- **Web Audio API** — simple procedural sound effects
- **@tweenjs/tween.js** — idle animation for characters

## How to run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (often `http://localhost:5173`).

```bash
npm run build    # production build → dist/
npm run preview  # serve dist locally
```

## Controls (gameplay)

- **Click** the game canvas — pointer lock (mouse look)
- **Mouse** — look around
- **WASD** — move
- **Space** — jump
- **Shift** — sneak (crouch)
- **F** — toggle flying (creative building)
- **Left click** — break targeted block
- **Right click** — place block on targeted face
- **1–9** or **mouse wheel** — hotbar block type
- **Esc** — pause menu
- **C** — toggle David’s crown (character preview)

## Worlds

Preset worlds you can choose from the main menu:

- Garden of Eden  
- Desert of Exodus  
- Noah’s Ark Dock  
- David’s Valley  

## Bible Challenges (optional)

From the main menu, **Challenges** opens guided build modes (ark outline, temple blueprint, Red Sea layout, tower height, garden goals) with on-screen instructions and progress.

## Save slots

Three save slots on the main menu. The game **auto-saves about every 60 seconds** to the selected slot in the browser. Choosing the same world again can restore your edited blocks for that slot.

## Bible heroes

Voxel characters included in the game:

- **David** — *The shepherd who became king*
- **Moses** — *Led God’s people to freedom*
- **Noah** — *Built the ark and saved the animals*
- **Mary** — *Chosen by God, mother of Jesus*
- **Daniel** — *Trusted God in the lion’s den*
- **Esther** — *Brave queen who saved her people*
- **Jonah** — *Learned obedience inside a great fish*
- **Joshua** — *Trusted God and the walls came down*
- **Caleb** — *Faithful scout who trusted God’s promise*

## Privacy & data

- There is **no server** in this repo: gameplay and saves use **your browser only** (`localStorage`).
- Do **not** commit API keys, tokens, or personal paths into this project.

## License

Add a `LICENSE` file if you want to specify terms for others; until then, all rights reserved unless you choose otherwise.

## Contributing

Issues and pull requests are welcome on [the GitHub repository](https://github.com/JamesLeePM/Bibleblocks).
