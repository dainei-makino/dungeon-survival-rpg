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

Each biome specifies the map generation style, available voxels and decoration
characters, as well as fog, lighting, and whether a ceiling is used. The
following biomes are defined:

- **forest** – default biome with a dense forest map generator. Swampy ground
  and tree voxels are used, and the ceiling is replaced by a dark sky.
- **cave** – darker environment with damp weather.
- **plain** – open terrain with windy weather.

Additional systems like weather effects are planned but not yet implemented.

