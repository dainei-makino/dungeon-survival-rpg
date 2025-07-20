import mapData from './maps/basicMap.json'

export default class DungeonMap {
  tiles: string[]
  floors: number[][]
  ceilings: number[][]
  width: number
  height: number

  constructor() {
    this.tiles = mapData.tiles
    this.floors = mapData.floors
    this.ceilings = mapData.ceilings
    this.height = this.tiles.length
    this.width = this.tiles[0].length
  }

  get playerStart() {
    return { ...mapData.playerStart }
  }

  tileAt(x: number, y: number): string {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (iy < 0 || iy >= this.height || ix < 0 || ix >= this.width) {
      return '#'
    }
    return this.tiles[iy][ix]
  }

  floorAt(x: number, y: number): number {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (iy < 0 || iy >= this.height || ix < 0 || ix >= this.width) {
      return 0
    }
    return this.floors[iy][ix]
  }

  ceilingAt(x: number, y: number): number {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (iy < 0 || iy >= this.height || ix < 0 || ix >= this.width) {
      return 0
    }
    return this.ceilings[iy][ix]
  }
}
