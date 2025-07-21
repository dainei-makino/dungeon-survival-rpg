import DungeonView3D from './DungeonView3D'
import sound from '../../audio'

export default function initThreeGame(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <canvas id="mini-map" width="150" height="150" style="position:absolute;z-index:500;top:10px;right:10px;border:1px solid #000"></canvas>
    <div id="status-display" style="position:absolute;z-index:700;top:10px;left:50%;transform:translateX(-50%);font-size:24px;color:#fff;text-shadow:0 0 2px #000"></div>
    <div id="debug-info" style="position:absolute;z-index:800;bottom:10px;left:10px;padding:4px;background:rgba(0,0,0,0.5);color:#fff;font:12px monospace;white-space:pre;"></div>
    <div id="arm-controls" style="position:absolute;z-index:600;top:10px;right:170px;padding:4px;background:rgba(0,0,0,0.5);color:#fff;font:12px monospace;">
      <div>PosY <input id="arm-pos-y" type="range" min="-1.2" max="0" step="0.01"></div>
      <div>Upper X <input id="arm-upper-x" type="range" min="-3.14" max="3.14" step="0.01"></div>
      <div>Lower X <input id="arm-lower-x" type="range" min="-3.14" max="3.14" step="0.01"></div>
      <div>Rot Z <input id="arm-rot-z" type="range" min="-1.57" max="1.57" step="0.01"></div>
      <div>Scale <input id="arm-scale" type="range" min="0.3" max="2" step="0.01"></div>
      <div>Spacing <input id="arm-spacing" type="range" min="0" max="1" step="0.01"></div>
      <div>Lower Dist <input id="arm-lower-dist" type="range" min="-1" max="0" step="0.01"></div>
      <div>Fist Dist <input id="arm-fist-dist" type="range" min="-1" max="0" step="0.01"></div>
      <button id="arm-copy">copy</button>
    </div>
    <div id="three-game" style="width:100%;height:100%"></div>
  `
  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const wrapper = container.querySelector('#three-game') as HTMLElement
  const miniMap = container.querySelector('#mini-map') as HTMLCanvasElement
  const statusDiv = container.querySelector('#status-display') as HTMLDivElement
  const debugDiv = container.querySelector('#debug-info') as HTMLDivElement
  container.style.position = 'relative'
  const view = new DungeonView3D(wrapper, miniMap)
  sound.playBgm('main')

  const armControls = container.querySelector('#arm-controls') as HTMLDivElement
  const posY = armControls.querySelector('#arm-pos-y') as HTMLInputElement
  const upperX = armControls.querySelector('#arm-upper-x') as HTMLInputElement
  const lowerX = armControls.querySelector('#arm-lower-x') as HTMLInputElement
  const rotZ = armControls.querySelector('#arm-rot-z') as HTMLInputElement
  const scale = armControls.querySelector('#arm-scale') as HTMLInputElement
  const spacing = armControls.querySelector('#arm-spacing') as HTMLInputElement
  const lowerDist = armControls.querySelector('#arm-lower-dist') as HTMLInputElement
  const fistDist = armControls.querySelector('#arm-fist-dist') as HTMLInputElement
  const copyBtn = armControls.querySelector('#arm-copy') as HTMLButtonElement

  const settings = view.getArmSettings()
  posY.value = settings.posY.toString()
  upperX.value = settings.upperRotX.toString()
  lowerX.value = settings.lowerRotX.toString()
  rotZ.value = settings.rotZ.toString()
  scale.value = settings.scale.toString()
  spacing.value = settings.spacing.toString()
  lowerDist.value = settings.lowerDist.toString()
  fistDist.value = settings.fistDist.toString()

  function updateFromInputs() {
    view.updateArms({
      posY: parseFloat(posY.value),
      upperRotX: parseFloat(upperX.value),
      lowerRotX: parseFloat(lowerX.value),
      rotZ: parseFloat(rotZ.value),
      scale: parseFloat(scale.value),
      spacing: parseFloat(spacing.value),
      lowerDist: parseFloat(lowerDist.value),
      fistDist: parseFloat(fistDist.value),
    })
  }
  [posY, upperX, lowerX, rotZ, scale, spacing, lowerDist, fistDist].forEach((input) => {
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
    if (statusDiv) {
      statusDiv.innerHTML = view.getStatusHTML()
    }
    requestAnimationFrame(animate)
  }
  animate()
}
