import { VoxelType } from './voxels'

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
        Array.from({ length: width }, () => VoxelType.Floor)
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
}
