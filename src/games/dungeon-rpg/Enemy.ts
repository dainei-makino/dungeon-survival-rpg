export default class Enemy {
  name: string
  hp: number
  strength: number

  constructor(name: string, hp: number, strength: number) {
    this.name = name
    this.hp = hp
    this.strength = strength
  }
}

export const skeletonWarrior = new Enemy('スケルトン戦士', 8, 4)
