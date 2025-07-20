export type Direction = 'north' | 'east' | 'south' | 'west'

export default class Player {
  x: number
  y: number
  z: number
  dir: Direction

  constructor(start: { x: number; y: number; z: number; dir: Direction }) {
    this.x = start.x
    this.y = start.y
    this.z = start.z
    this.dir = start.dir
  }

  rotateLeft() {
    const order: Direction[] = ['north', 'east', 'south', 'west']
    const idx = order.indexOf(this.dir)
    this.dir = order[(idx + 3) % 4]
  }

  rotateRight() {
    const order: Direction[] = ['north', 'east', 'south', 'west']
    const idx = order.indexOf(this.dir)
    this.dir = order[(idx + 1) % 4]
  }
}
