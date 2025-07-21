import { VoxelType } from './voxels'
import type { VoxelObject } from './VoxelObject'

export default class VoxelMap {
  width: number
  height: number
  depth: number
  voxels: VoxelType[][][]

  constructor(width: number, height: number, depth = 5) {
    this.width = width
    this.height = height
    this.depth = depth
    this.voxels = Array.from({ length: depth }, () =>
      Array.from({ length: height }, () =>
        Array.from({ length: width }, () => VoxelType.Air)
      )
    )
  }

  voxelAt(x: number, y: number, z: number): VoxelType | null {
    if (
      z < 0 ||
      z >= this.depth ||
      y < 0 ||
      y >= this.height ||
      x < 0 ||
      x >= this.width
    ) {
      return null
    }
    return this.voxels[z][y][x]
  }

  setVoxel(x: number, y: number, z: number, type: VoxelType) {
    if (
      z < 0 ||
      z >= this.depth ||
      y < 0 ||
      y >= this.height ||
      x < 0 ||
      x >= this.width
    ) {
      return
    }
    this.voxels[z][y][x] = type
  }

  placeObject(x: number, y: number, z: number, obj: VoxelObject) {
    for (const part of obj.parts) {
      this.setVoxel(x + part.dx, y + part.dy, z + part.dz, part.type)
    }
  }

  /**
   * Return the height in voxels of solid ground at the given coordinates.
   * This is calculated by scanning upward from z=0 until the highest
   * non-Air voxel is found. The result is one plus that z index,
   * representing the surface level used when rendering heightmaps.
   */
  getHeight(x: number, y: number): number {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) return 0
    for (let z = this.depth - 1; z >= 0; z--) {
      if (this.voxels[z][y][x] !== VoxelType.Air) {
        return z + 1
      }
    }
    return 0
  }

  /**
   * Check if the vertical space above the given column is free of solid blocks.
   * @param x map x coordinate
   * @param y map y coordinate
   * @param fromZ starting voxel height (inclusive)
   * @param height number of voxels to test
   */
  isClearAbove(x: number, y: number, fromZ: number, height: number): boolean {
    for (let z = fromZ; z < fromZ + height; z++) {
      const v = this.voxelAt(x, y, z)
      if (v === null || v !== VoxelType.Air) return false
    }
    return true
  }
}
