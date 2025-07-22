# Dungeon Survival RPG

This project is a small website built with Vite. It contains a 3D dungeon game implemented using Three.js along with a simple novel viewer.
The game now supports **biomes** which control map generation and environmental
features. Currently available biomes are **forest**, **cave**, and **plain**.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run preview
```

To build the project for production:

```bash
npm run build
```

## Biomes

-Each biome specifies the map generation style, available voxels and decoration
characters, as well as fog, lighting, and whether a ceiling is used. The
following biomes are defined:

- **forest** – default biome using a multi‑octave Perlin terrain generator. The
  landscape features steep hills and occasional caves filled with swamp and tree
  voxels. Apples, stumps and piles of fallen leaves appear scattered around the
  woods. A handful of skeleton warriors are placed randomly when the map is
  generated. No ceiling is placed and a distant dark sky texture surrounds the
  map.
- **cave** – darker environment with damp weather.
- **plain** – open terrain with windy weather.

Additional systems like weather effects are planned but not yet implemented.

## Documentation

- [Character Animation Design](docs/character-animation.md)
- [Player Arm Animation Guide](docs/arm-animation.md)
- The character loader now creates a simple bone hierarchy using the new
  [Skeleton](src/games/animation/Skeleton.ts) class. Animations operate on these
  bones.

