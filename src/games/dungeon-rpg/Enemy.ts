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

export class MapEnemy {
  template: Enemy
  x: number
  y: number
  hp: number

  constructor(template: Enemy, x: number, y: number) {
    this.template = template
    this.x = x
    this.y = y
    // copy HP so each enemy can take damage independently
    this.hp = template.hp
  }
}

export const skeletonWarrior = new Enemy('スケルトン戦士', 8, 4)
