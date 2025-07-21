export default class Hero {
  hp: number
  strength: number
  leftHand: string
  rightHand: string
  hunger: number
  stamina: number

  constructor(
    hp = 10,
    strength = 5,
    leftHand = 'unarmed',
    rightHand = 'unarmed',
    hunger = 1000,
    stamina = 5,
  ) {
    this.hp = hp
    this.strength = strength
    this.leftHand = leftHand
    this.rightHand = rightHand
    this.hunger = hunger
    this.stamina = stamina
  }
}
