import { VoxelType } from './voxels'

export interface VoxelObjectPart {
  dx: number
  dy: number
  dz: number
  type: VoxelType
}

export interface VoxelObject {
  parts: VoxelObjectPart[]
}

export function createTreeObject(trunkHeight = 4, radius = 2): VoxelObject {
  const parts: VoxelObjectPart[] = []
  // trunk
  for (let z = 0; z < trunkHeight; z++) {
    parts.push({ dx: 0, dy: 0, dz: z, type: VoxelType.Tree })
  }
  const leafBase = trunkHeight - 1
  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = 0; z <= radius; z++) {
        const dz = leafBase + z
        if (Math.abs(x) + Math.abs(y) + z <= radius * 2) {
          parts.push({ dx: x, dy: y, dz, type: VoxelType.Leaves })
        }
      }
    }
  }
  return { parts }
}
