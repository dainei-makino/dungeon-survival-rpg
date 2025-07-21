import DungeonView3D from './DungeonView'

export default function initThreeGame(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <canvas id="mini-map" width="150" height="150" style="position:absolute;z-index:500;top:10px;right:10px;border:1px solid #000"></canvas>
    <div id="debug-info" style="position:absolute;z-index:800;bottom:10px;left:10px;padding:4px;background:rgba(0,0,0,0.5);color:#fff;font:12px monospace;white-space:pre;"></div>
    <div id="arm-controls" style="position:absolute;z-index:600;top:10px;right:170px;padding:4px;background:rgba(0,0,0,0.5);color:#fff;font:12px monospace;">
      <div>Left X <input id="arm-left-x" type="range" min="-3.14" max="3.14" step="0.01"></div>
      <div>Left Z <input id="arm-left-z" type="range" min="-3.14" max="3.14" step="0.01"></div>
      <div>Right X <input id="arm-right-x" type="range" min="-3.14" max="3.14" step="0.01"></div>
      <div>Right Z <input id="arm-right-z" type="range" min="-3.14" max="3.14" step="0.01"></div>
      <div>Scale <input id="arm-scale" type="range" min="0.3" max="2" step="0.01"></div>
      <button id="arm-copy">copy</button>
    </div>
    <div id="three-game" style="width:100%;height:100%"></div>
  `
  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const wrapper = container.querySelector('#three-game') as HTMLElement
  const miniMap = container.querySelector('#mini-map') as HTMLCanvasElement
  const debugDiv = container.querySelector('#debug-info') as HTMLDivElement
  container.style.position = 'relative'
  const view = new DungeonView3D(wrapper, miniMap)

  const armControls = container.querySelector('#arm-controls') as HTMLDivElement
  const leftX = armControls.querySelector('#arm-left-x') as HTMLInputElement
  const leftZ = armControls.querySelector('#arm-left-z') as HTMLInputElement
  const rightX = armControls.querySelector('#arm-right-x') as HTMLInputElement
  const rightZ = armControls.querySelector('#arm-right-z') as HTMLInputElement
  const scale = armControls.querySelector('#arm-scale') as HTMLInputElement
  const copyBtn = armControls.querySelector('#arm-copy') as HTMLButtonElement

  const settings = view.getArmSettings()
  leftX.value = settings.left.rotX.toString()
  leftZ.value = settings.left.rotZ.toString()
  rightX.value = settings.right.rotX.toString()
  rightZ.value = settings.right.rotZ.toString()
  scale.value = settings.scale.toString()

  function updateFromInputs() {
    view.updateArms({
      leftRotX: parseFloat(leftX.value),
      leftRotZ: parseFloat(leftZ.value),
      rightRotX: parseFloat(rightX.value),
      rightRotZ: parseFloat(rightZ.value),
      scale: parseFloat(scale.value),
    })
  }

  ;[leftX, leftZ, rightX, rightZ, scale].forEach((input) => {
    input.addEventListener('input', updateFromInputs)
  })

  copyBtn.addEventListener('click', () => {
    const txt = JSON.stringify(view.getArmSettings())
    navigator.clipboard.writeText(txt)
  })

  function animate() {
    view.update()
    view.render()
    if (debugDiv) {
      debugDiv.textContent = view.getDebugText()
    }
    requestAnimationFrame(animate)
  }
  animate()
}
