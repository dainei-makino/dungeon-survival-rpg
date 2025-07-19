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

    this.graphics.clear()
    this.graphics.lineStyle(2, 0xffffff, 1)

    const steps = 5
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps
      const w = width * (1 - ratio)
      const h = height * (1 - ratio)
      const x = (width - w) / 2
      const y = (height - h) / 2
      this.graphics.strokeRect(x, y, w, h)
    }
  }
}
