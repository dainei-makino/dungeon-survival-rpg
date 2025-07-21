import { promises as fs } from 'fs';
import { join, parse } from 'path';
import { parse as parseSVG } from 'svgson';
import svgPathProperties from 'svg-path-properties';

const SVG_DIR = join('src', 'assets', 'enemies', 'svg');
const OUT_DIR = join('src', 'assets', 'enemies', 'json');

async function readSVG(path) {
  const data = await fs.readFile(path, 'utf8');
  return parseSVG(data);
}

function samplePath(d, segments = 50) {
  const props = new svgPathProperties.svgPathProperties(d);
  const len = props.getTotalLength();
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const { x, y } = props.getPointAtLength((len * i) / segments);
    points.push([x, y]);
  }
  return points;
}

async function convertFile(file) {
  const svg = await readSVG(join(SVG_DIR, file));
  const paths = [];
  function walk(node) {
    if (node.name === 'path' && node.attributes.d) {
      paths.push(samplePath(node.attributes.d));
    }
    if (node.children) node.children.forEach(walk);
  }
  walk(svg);
  const outPath = join(OUT_DIR, parse(file).name + '.json');
  await fs.writeFile(outPath, JSON.stringify({ paths }, null, 2));
  console.log(`Converted ${file} -> ${outPath}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await fs.readdir(SVG_DIR);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.svg')) {
      await convertFile(file);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
