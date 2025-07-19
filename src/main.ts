import Phaser from 'phaser'
import DungeonView from './DungeonView'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload() {},
    create() {
      const dungeon = new DungeonView(this)
      dungeon.draw()
    },
    update() {}
  }
}

new Phaser.Game(config)
