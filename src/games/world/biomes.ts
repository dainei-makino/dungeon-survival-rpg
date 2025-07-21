import * as THREE from 'three'
import { VoxelType } from './voxels'
import VoxelMap from './VoxelMap'
import DungeonMap from '../dungeon-rpg/DungeonMap'
import ForestMap from './ForestMap'
import {
  swampTexture,
  treeTexture,
  leavesTexture as createLeavesTexture,
  darkSkyTexture,
} from '../dungeon-rpg-three/utils/textures'
import EnvironmentCharacter, {
  tree,
  bush,
  stalactite,
  mushroom,
  grass,
  stone,
  seaweed,
  woodPiece,
  apple,
  stump,
  fallenLeaves,
} from '../dungeon-rpg/Environment'
import Instrument from '../../audio/instruments/Instrument'
import Piano from '../../audio/instruments/Piano'
import Pad from '../../audio/instruments/Pad'
import BasicSynth from '../../audio/BasicSynth'
import { AmbientMusicConfig } from '../../audio/MusicGenerator'

export interface Biome {
  name: string
  generateMap: () => VoxelMap
  voxels: VoxelType[]
  environment: EnvironmentCharacter[]
  fog?: string
  weather?: string
  lighting?: { color: number; intensity: number }
  hasCeiling?: boolean
  skyColor?: number
  skyTexture?: () => THREE.Texture
  floorTexture?: () => THREE.Texture
  treeTexture?: () => THREE.Texture
  leavesTexture?: () => THREE.Texture
  music?: () => AmbientMusicConfig
}

export const forestBiome: Biome = {
  name: 'forest',
  generateMap: () => new ForestMap(),
  voxels: [VoxelType.Swamp, VoxelType.Tree, VoxelType.Leaves],
  environment: [tree, bush, woodPiece, apple, stump, fallenLeaves],
  fog: '#445544',
  weather: 'clear',
  lighting: { color: 0xaaaaaa, intensity: 0.8 },
  hasCeiling: false,
  skyColor: 0x000000,
  skyTexture: darkSkyTexture,
  floorTexture: swampTexture,
  treeTexture: () => treeTexture(40),
  leavesTexture: () => createLeavesTexture(20),
  music: () => ({
    instruments: [
      new Pad(new BasicSynth({ attack: 2, release: 4, reverb: 0.8 })),
      new Piano(new BasicSynth({ attack: 0.5, release: 2, reverb: 0.8 })),
    ],
    root: 261.63,
    scale: [0, 3, 5, 7, 10],
    tempo: 40,
  }),
}

export const caveBiome: Biome = {
  name: 'cave',
  generateMap: () => new DungeonMap(),
  voxels: [VoxelType.Floor, VoxelType.Wall, VoxelType.Ceiling],
  environment: [stalactite, mushroom],
  fog: '#555555',
  weather: 'damp',
  lighting: { color: 0x888888, intensity: 0.5 },
  music: () => ({
    instruments: [new Pad()],
    root: 130.81,
    scale: [0, 3, 5, 6, 10],
    tempo: 50,
  }),
}

export const plainBiome: Biome = {
  name: 'plain',
  generateMap: () => new DungeonMap(),
  voxels: [VoxelType.Floor, VoxelType.Wall, VoxelType.Ceiling],
  environment: [grass, stone, seaweed],
  fog: '#ccffcc',
  weather: 'windy',
  lighting: { color: 0xffffff, intensity: 1 },
  music: () => ({
    instruments: [new Piano()],
    root: 329.63,
    scale: [0, 2, 4, 7, 9],
    tempo: 80,
  }),
}

export const biomes = {
  forest: forestBiome,
  cave: caveBiome,
  plain: plainBiome,
}
