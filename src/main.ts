import Phaser from 'phaser'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload() {},
    create() {
      this.add.text(400, 300, 'Hello Phaser!', { color: '#ffffff' }).setOrigin(0.5)
    },
    update() {}
  }
}

new Phaser.Game(config)
