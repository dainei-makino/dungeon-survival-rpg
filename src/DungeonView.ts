import basicMap from './maps/basicMap'

export default class DungeonView {
  private scene: Phaser.Scene
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.graphics = scene.add.graphics()
  }

  draw() {
    const width = this.scene.scale.width
    const height = this.scene.scale.height

    const rows = basicMap.length
    const cols = basicMap[0].length

    const tileSize = Math.min(width / cols, height / rows)
    const offsetX = (width - cols * tileSize) / 2
    const offsetY = (height - rows * tileSize) / 2

    this.graphics.clear()
    this.graphics.lineStyle(1, 0xffffff, 1)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = basicMap[y][x]
        const px = offsetX + x * tileSize
        const py = offsetY + y * tileSize
        if (cell === '#') {
          this.graphics.fillStyle(0x222222, 1)
          this.graphics.fillRect(px, py, tileSize, tileSize)
        }
        this.graphics.strokeRect(px, py, tileSize, tileSize)
      }
    }
  }
}
