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
