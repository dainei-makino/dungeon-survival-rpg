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

export function createTreeObject(height = 9): VoxelObject {
  const parts: VoxelObjectPart[] = []
  const trunkHeight = Math.max(5, height)
  // trunk
  for (let z = 0; z < trunkHeight; z++) {
    parts.push({ dx: 0, dy: 0, dz: z, type: VoxelType.Tree })
  }
  const radius = 4
  const leafBase = trunkHeight - 2
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
