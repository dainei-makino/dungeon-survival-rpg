export default class Hero {
  hp: number
  strength: number

  constructor(hp = 10, strength = 5) {
    this.hp = hp
    this.strength = strength
  }
}
