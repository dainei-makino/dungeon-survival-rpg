export default class Hero {
  hp: number
  strength: number
  leftHand: string
  rightHand: string

  constructor(
    hp = 10,
    strength = 5,
    leftHand = 'unarmed',
    rightHand = 'unarmed',
  ) {
    this.hp = hp
    this.strength = strength
    this.leftHand = leftHand
    this.rightHand = rightHand
  }
}
