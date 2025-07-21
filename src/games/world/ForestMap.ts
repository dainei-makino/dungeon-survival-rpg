import type { Direction } from '../dungeon-rpg/Player'
import { MapEnemy, skeletonWarrior } from '../dungeon-rpg/Enemy'
import VoxelMap from './VoxelMap'
import { VoxelType } from './voxels'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'

export default class ForestMap extends VoxelMap {
  private tiles: string[]
  enemies: MapEnemy[] = []
  private _playerStart: { x: number; y: number; dir: Direction }
  private heights: number[][]

  constructor(width = 96, height = 96, depth = 20, private density = 0.3) {
    super(width, height, depth)
    this.tiles = Array.from({ length: height }, () => '.'.repeat(width))
    this.heights = Array.from({ length: height }, () => Array(width).fill(1))
    this._playerStart = { x: Math.floor(width / 2), y: Math.floor(height / 2), dir: 'north' }
    this.generate()
    this.buildVoxels()
    this.placeEnemies()
  }

  get playerStart() {
    return { ...this._playerStart }
  }

  private rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  private setTile(x: number, y: number, val: string) {
    const row = this.tiles[y].split('')
    row[x] = val
    this.tiles[y] = row.join('')
  }

  private generate() {
    const noise = new ImprovedNoise()
    const baseScale = 60
    const detailScale = 15
    const amp = this.depth - 5
    const baseSeed = Math.random() * 100
    const detailSeed = Math.random() * 100
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const base = noise.noise(x / baseScale, y / baseScale, baseSeed)
        const detail = noise.noise(x / detailScale, y / detailScale, detailSeed)
        let h = (base * 0.7 + detail * 0.3 + 1) / 2
        h = Math.floor(h * amp) + 2
        this.heights[y][x] = Math.min(h, this.depth - 1)
        if (Math.random() < this.density) {
          this.setTile(x, y, '#')
        }
      }
    }
    const cx = this._playerStart.x
    const cy = this._playerStart.y
    for (let y = cy - 3; y <= cy + 3; y++) {
      for (let x = cx - 3; x <= cx + 3; x++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          this.setTile(x, y, '.')
        }
      }
    }
  }

  private placeEnemies() {
    const enemyCount = 5
    for (let i = 0; i < enemyCount; i++) {
      let placed = false
      while (!placed) {
        const x = this.rand(1, this.width - 1)
        const y = this.rand(1, this.height - 1)
        if (this.tileAt(x, y) === '.') {
          this.enemies.push(new MapEnemy(skeletonWarrior, x, y))
          placed = true
        }
      }
    }
  }

  private buildVoxels() {
    const caveNoise = new ImprovedNoise()
    const caveScale = 20
    const caveSeed = Math.random() * 100
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const h = this.heights[y][x]
        for (let z = 0; z < h && z < this.depth; z++) {
          const c = caveNoise.noise(x / caveScale, y / caveScale, z / caveScale + caveSeed)
          if (c > 0.2) {
            this.setVoxel(x, y, z, VoxelType.Swamp)
          }
        }
        if (this.tiles[y][x] === '#') {
          const treeHeight = this.rand(2, Math.min(this.depth - h, 5))
          for (let z = h; z < h + treeHeight && z < this.depth; z++) {
            this.setVoxel(x, y, z, VoxelType.Tree)
          }
        }
      }
    }
  }

  tileAt(x: number, y: number): string {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (iy < 0 || iy >= this.height || ix < 0 || ix >= this.width) {
      return '#'
    }
    return this.tiles[iy][ix] === '#' ? '#' : '.'
  }
}
