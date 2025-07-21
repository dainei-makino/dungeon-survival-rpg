import mapData from './maps/basicMap.json'

export default class DungeonMap {
  tiles: string[]
  width: number
  height: number

  constructor() {
    this.tiles = mapData.tiles
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
}
