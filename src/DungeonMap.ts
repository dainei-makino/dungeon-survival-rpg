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
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
      return '#'
    }
    return this.tiles[y][x]
  }
}
