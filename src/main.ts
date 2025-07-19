import Phaser from 'phaser'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: {
    preload() {},
    create() {
      this.add.text(400, 300, 'Hello Phaser!', { color: '#ffffff' }).setOrigin(0.5)
    },
    update() {}
  }
}

new Phaser.Game(config)
