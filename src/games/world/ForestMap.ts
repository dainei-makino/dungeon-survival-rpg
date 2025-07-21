import type { Direction } from '../dungeon-rpg/Player'
import { MapEnemy, skeletonWarrior } from '../dungeon-rpg/Enemy'
import VoxelMap from './VoxelMap'
import { VoxelType } from './voxels'

export default class ForestMap extends VoxelMap {
  private tiles: string[]
  enemies: MapEnemy[] = []
  private _playerStart: { x: number; y: number; dir: Direction }

  constructor(width = 51, height = 51, private density = 0.2) {
    super(width, height, 5)
    this.tiles = Array.from({ length: height }, () => '.'.repeat(width))
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
    // fill map with floor and random trees as walls
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (Math.random() < this.density) {
          this.setTile(x, y, '#')
        }
      }
    }
    // clearing around player start
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
    const top = this.depth - 1
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ch = this.tiles[y][x]
        this.setVoxel(x, y, 0, VoxelType.Swamp)
        if (ch === '#') {
          const treeHeight = this.rand(2, top + 1)
          for (let z = 1; z < treeHeight; z++) {
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
    const v = this.voxelAt(ix, iy, 1)
    return v === VoxelType.Tree ? '#' : '.'
  }
}
