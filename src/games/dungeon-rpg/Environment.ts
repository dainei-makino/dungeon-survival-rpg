export default class EnvironmentCharacter {
  name: string
  hp: number
  strength: number
  mesh: string

  constructor(name: string, hp: number, mesh: string, strength = 0) {
    this.name = name
    this.hp = hp
    this.mesh = mesh
    this.strength = strength
  }
}

export const seaweed = new EnvironmentCharacter('海藻', 1, 'seaweed-blocky.json')
export const woodPiece = new EnvironmentCharacter('木片', 1, 'woodPiece.json')
export const tree = new EnvironmentCharacter('樹木', 5, 'tree.json')
export const bush = new EnvironmentCharacter('茂み', 2, 'bush.json')
export const stalactite = new EnvironmentCharacter('鍾乳石', 3, 'stalactite.json')
export const mushroom = new EnvironmentCharacter('キノコ', 1, 'mushroom.json')
export const grass = new EnvironmentCharacter('草', 1, 'grass.json')
export const stone = new EnvironmentCharacter('石', 1, 'stone.json')

export const apple = new EnvironmentCharacter('リンゴ', 1, 'apple.json')
export const stump = new EnvironmentCharacter('切り株', 2, 'stump.json')
export const fallenLeaves = new EnvironmentCharacter('落ち葉', 1, 'fallenLeaves.json')

export class MapEnvironment {
  template: EnvironmentCharacter
  x: number
  y: number

  constructor(template: EnvironmentCharacter, x: number, y: number) {
    this.template = template
    this.x = x
    this.y = y
  }
}
