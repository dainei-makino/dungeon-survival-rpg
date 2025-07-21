import { VoxelType } from './voxels'
import VoxelMap from './VoxelMap'
import DungeonMap from '../dungeon-rpg/DungeonMap'
import ForestMap from './ForestMap'
import EnvironmentCharacter, {
  tree,
  bush,
  stalactite,
  mushroom,
  grass,
  stone,
  seaweed,
  woodPiece,
} from '../dungeon-rpg/Environment'

export interface Biome {
  name: string
  generateMap: () => VoxelMap
  voxels: VoxelType[]
  environment: EnvironmentCharacter[]
  fog?: string
  weather?: string
  lighting?: { color: number; intensity: number }
}

export const forestBiome: Biome = {
  name: 'forest',
  generateMap: () => new ForestMap(),
  voxels: [VoxelType.Floor, VoxelType.Wall, VoxelType.Ceiling],
  environment: [tree, bush, woodPiece],
  fog: '#88aa88',
  weather: 'clear',
  lighting: { color: 0xffffff, intensity: 1 },
}

export const caveBiome: Biome = {
  name: 'cave',
  generateMap: () => new DungeonMap(),
  voxels: [VoxelType.Floor, VoxelType.Wall, VoxelType.Ceiling],
  environment: [stalactite, mushroom],
  fog: '#555555',
  weather: 'damp',
  lighting: { color: 0x888888, intensity: 0.5 },
}

export const plainBiome: Biome = {
  name: 'plain',
  generateMap: () => new DungeonMap(),
  voxels: [VoxelType.Floor, VoxelType.Wall, VoxelType.Ceiling],
  environment: [grass, stone, seaweed],
  fog: '#ccffcc',
  weather: 'windy',
  lighting: { color: 0xffffff, intensity: 1 },
}

export const biomes = {
  forest: forestBiome,
  cave: caveBiome,
  plain: plainBiome,
}
