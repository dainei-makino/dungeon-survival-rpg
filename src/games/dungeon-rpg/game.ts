import Phaser from 'phaser'
import DungeonView from './DungeonView'

export default function initGame(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <div id="game-container" style="width:100%;height:100%"></div>
  `;
  const back = container.querySelector('#back-to-top') as HTMLButtonElement;
  back.addEventListener('click', () => loadTab('top'));

  let view: DungeonView

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: true,
    },
    scene: {
      preload() {},
      create() {
        view = new DungeonView(this)
        view.draw()
      },
      update() {
        view.update()
      },
    },
  }

  new Phaser.Game(config);
}
