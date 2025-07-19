import Phaser from 'phaser';

export default function initGame(container: HTMLElement) {
  container.innerHTML = '<div id="game-container" style="width:100%;height:100%"></div>';

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: {
      preload() {},
      create() {
        this.add.text(400, 300, 'Hello Phaser!', { color: '#ffffff' }).setOrigin(0.5);
      },
      update() {},
    },
  };

  new Phaser.Game(config);
}
