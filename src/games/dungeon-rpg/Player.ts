export type Direction =
  | 'north'
  | 'northEast'
  | 'east'
  | 'southEast'
  | 'south'
  | 'southWest'
  | 'west'
  | 'northWest'

export default class Player {
  x: number
  y: number
  dir: Direction

  constructor(start: { x: number; y: number; dir: Direction }) {
    this.x = start.x
    this.y = start.y
    this.dir = start.dir
  }

  rotateLeft() {
    const order: Direction[] = [
      'north',
      'northEast',
      'east',
      'southEast',
      'south',
      'southWest',
      'west',
      'northWest',
    ]
    const idx = order.indexOf(this.dir)
    this.dir = order[(idx + order.length - 1) % order.length]
  }

  rotateRight() {
    const order: Direction[] = [
      'north',
      'northEast',
      'east',
      'southEast',
      'south',
      'southWest',
      'west',
      'northWest',
    ]
    const idx = order.indexOf(this.dir)
    this.dir = order[(idx + 1) % order.length]
  }
}
