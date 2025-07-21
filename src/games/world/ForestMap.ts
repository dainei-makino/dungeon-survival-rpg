import type { Direction } from '../dungeon-rpg/Player'
import { MapEnemy } from '../dungeon-rpg/Enemy'
import VoxelMap from './VoxelMap'
import { VoxelType } from './voxels'
import { createTreeObject } from './VoxelObject'
import {
  MapEnvironment,
  apple,
  stump,
  fallenLeaves,
} from '../dungeon-rpg/Environment'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'

export default class ForestMap extends VoxelMap {
  enemies: MapEnemy[] = []
  environmentItems: MapEnvironment[] = []
  private _playerStart: { x: number; y: number; dir: Direction }
  private heights: number[][]

  constructor(width = 96, height = 96, depth = 20, private density = 0.1) {
    super(width, height, depth)
    this.heights = Array.from({ length: height }, () => Array(width).fill(1))
    this._playerStart = { x: Math.floor(width / 2), y: Math.floor(height / 2), dir: 'north' }
    this.generate()
    this.buildVoxels()
    this.placeEnvironmentItems()
  }

  get playerStart() {
    return { ...this._playerStart }
  }

  private rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
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
      }
    }
  }

  private placeEnemies() {
    // intentionally left blank – enemies will spawn dynamically elsewhere
  }

  private placeEnvironmentItems() {
    const items = [apple, stump, fallenLeaves]
    const itemCount = Math.floor((this.width * this.height) * 0.02)
    for (let i = 0; i < itemCount; i++) {
      let placed = false
      while (!placed) {
        const x = this.rand(1, this.width - 1)
        const y = this.rand(1, this.height - 1)
        if (this.tileAt(x, y) === '.') {
          const template = items[this.rand(0, items.length)]
          this.environmentItems.push(new MapEnvironment(template, x, y))
          placed = true
        }
      }
    }
  }

  private canPlaceTree(x: number, y: number, radius = 3): boolean {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (ny < 0 || ny >= this.height || nx < 0 || nx >= this.width) continue
        const h = this.heights[ny][nx]
        const v = this.voxelAt(nx, ny, h)
        if (v === VoxelType.Tree) return false
      }
    }
    return true
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
        if (Math.random() < this.density && this.canPlaceTree(x, y)) {
          const available = this.depth - h
          if (available >= 6) {
            this.placeObject(x, y, h, createTreeObject())
          }
        }
      }
    }
    // clear trees around the player start position
    const cx = this._playerStart.x
    const cy = this._playerStart.y
    for (let y = cy - 3; y <= cy + 3; y++) {
      for (let x = cx - 3; x <= cx + 3; x++) {
        const h = this.getHeight(x, y)
        for (let z = h; z < this.depth; z++) {
          const v = this.voxelAt(x, y, z)
          if (v === VoxelType.Tree || v === VoxelType.Leaves) {
            this.setVoxel(x, y, z, VoxelType.Air)
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
    const h = this.heights[iy][ix]
    return this.voxelAt(ix, iy, h) === VoxelType.Tree ? '#' : '.'
  }

  getHeight(x: number, y: number): number {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (iy < 0 || iy >= this.height || ix < 0 || ix >= this.width) {
      return 0
    }
    return this.heights[iy][ix]
  }
}
