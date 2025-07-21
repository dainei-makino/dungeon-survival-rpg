export default class EnvironmentCharacter {
  name: string
  hp: number
  strength: number

  constructor(name: string, hp: number, strength = 0) {
    this.name = name
    this.hp = hp
    this.strength = strength
  }
}

export const seaweed = new EnvironmentCharacter('海藻', 1, 0)
export const woodPiece = new EnvironmentCharacter('木片', 1, 0)
export const tree = new EnvironmentCharacter('樹木', 5, 0)
export const bush = new EnvironmentCharacter('茂み', 2, 0)
export const stalactite = new EnvironmentCharacter('鍾乳石', 3, 0)
export const mushroom = new EnvironmentCharacter('キノコ', 1, 0)
export const grass = new EnvironmentCharacter('草', 1, 0)
export const stone = new EnvironmentCharacter('石', 1, 0)
