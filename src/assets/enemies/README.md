# Enemy Assets

- `svg/` contains raw SVG files used to design enemy sprites or shapes.
- `json/` contains the vertex data generated from the SVG files. These JSON files are loaded by the game. Blocky models built from cubes are stored here as well.

To convert all SVG files in `svg/` into JSON, run:

```bash
npm run convert-svgs
```

This will create corresponding `.json` files in the `json/` directory.

Blocky models currently included:

- `skeleton-warrior-blocky.json`
