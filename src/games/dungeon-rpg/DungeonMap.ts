import type { Direction } from './Player'
import { MapEnemy, skeletonWarrior } from './Enemy'
import VoxelMap from '../world/VoxelMap'
import { VoxelType } from '../world/voxels'

export default class DungeonMap extends VoxelMap {
  private tiles: string[]
  enemies: MapEnemy[] = []
  private _playerStart: { x: number; y: number; dir: Direction }

  constructor(width = 31, height = 31) {
    super(width, height, 3)
    this.tiles = Array.from({ length: height }, () => '#'.repeat(width))
    this._playerStart = { x: 1, y: 1, dir: 'north' }
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

  private carveRoom(x: number, y: number, w: number, h: number) {
    for (let r = y; r < y + h; r++) {
      for (let c = x; c < x + w; c++) {
        this.setTile(c, r, '.')
      }
    }
  }

  private intersects(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
  }

  private carveCorridor(x1: number, y1: number, x2: number, y2: number) {
    while (x1 !== x2) {
      this.setTile(x1, y1, '.')
      x1 += x1 < x2 ? 1 : -1
    }
    while (y1 !== y2) {
      this.setTile(x1, y1, '.')
      y1 += y1 < y2 ? 1 : -1
    }
    this.setTile(x1, y1, '.')
  }

  private generate() {
    const rooms: { x: number; y: number; w: number; h: number }[] = []
    const attempts = 12

    for (let i = 0; i < attempts; i++) {
      const w = this.rand(4, 8)
      const h = this.rand(4, 8)
      const x = this.rand(1, this.width - w - 1)
      const y = this.rand(1, this.height - h - 1)
      const room = { x, y, w, h }
      if (rooms.some((r) => this.intersects(r, room))) continue

      this.carveRoom(x, y, w, h)
      if (rooms.length > 0) {
        const prev = rooms[rooms.length - 1]
        const cx = Math.floor(x + w / 2)
        const cy = Math.floor(y + h / 2)
        const px = Math.floor(prev.x + prev.w / 2)
        const py = Math.floor(prev.y + prev.h / 2)
        this.carveCorridor(px, py, cx, cy)
      } else {
        this._playerStart = { x: Math.floor(x + w / 2), y: Math.floor(y + h / 2), dir: 'north' }
      }
      rooms.push(room)
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
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ch = this.tiles[y][x]
        this.setVoxel(x, y, 0, VoxelType.Floor)
        this.setVoxel(x, y, 2, VoxelType.Ceiling)
        if (ch === '#') {
          this.setVoxel(x, y, 1, VoxelType.Wall)
        } else {
          this.setVoxel(x, y, 1, VoxelType.Floor)
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
    return this.voxelAt(ix, iy, 1) === VoxelType.Wall ? '#' : '.'
  }
}
