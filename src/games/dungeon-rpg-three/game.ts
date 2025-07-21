import DungeonView3D from './DungeonView'

export default function initThreeGame(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <canvas id="mini-map" width="150" height="150" style="position:absolute;z-index:500;top:10px;right:10px;border:1px solid #000"></canvas>
    <div id="three-game" style="width:100%;height:100%"></div>
  `
  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const wrapper = container.querySelector('#three-game') as HTMLElement
  const miniMap = container.querySelector('#mini-map') as HTMLCanvasElement
  container.style.position = 'relative'
  const view = new DungeonView3D(wrapper, miniMap)

  function animate() {
    view.update()
    view.render()
    requestAnimationFrame(animate)
  }
  animate()
}
