import DungeonView3D from './DungeonView3D'
import { forestBiome } from '../world/biomes'

export default function initThreeGame(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <div id="three-game" style="width:100%;height:100%"></div>
    <div id="debug-overlay" style="display:none;position:absolute;z-index:900;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);">
      <div id="debug-window" style="position:absolute;top:20px;left:20px;background:rgba(0,0,0,0.8);padding:0;color:#fff;display:flex;flex-direction:column;">
        <div id="debug-header" style="background:#555;padding:4px;cursor:move;">Debug</div>
        <div style="display:flex;">
        <div style="padding:10px;">
          <div id="status-display" style="font-size:24px;text-shadow:0 0 2px #000"></div>
          <pre id="debug-info" style="font:12px monospace;white-space:pre;"></pre>
          <canvas id="mini-map" width="150" height="150" style="margin-top:10px;border:1px solid #000"></canvas>
          <div id="arm-controls" style="margin-top:10px;background:rgba(0,0,0,0.5);padding:4px;font:12px monospace;">
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
        <div id="hero-controls" style="margin-top:10px;font:12px monospace;">
          <div>HP <input id="hero-hp" type="number" style="width:60px;"></div>
          <div>Hunger <input id="hero-hunger" type="number" style="width:60px;"></div>
          <div>Stamina <input id="hero-stamina" type="number" style="width:60px;"></div>
          <button id="float-btn">Float: OFF</button>
        </div>
        </div>
        <div id="character-panel" style="padding:10px;border-left:1px solid #888;min-width:200px;">
          <div style="font-weight:bold;margin-bottom:4px;">Characters</div>
          <pre id="character-list" style="font:12px monospace;white-space:pre;"></pre>
        </div>
        <div id="spawn-panel" style="padding:10px;border-left:1px solid #888;min-width:200px;">
          <div style="font-weight:bold;margin-bottom:4px;">Spawn</div>
          <select id="spawn-select" style="width:100%;margin-bottom:4px;"></select>
          <button id="spawn-btn">Spawn</button>
        </div>
        </div>
      </div>
    </div>
  `
  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const wrapper = container.querySelector('#three-game') as HTMLElement
  const overlay = container.querySelector('#debug-overlay') as HTMLDivElement
  const debugWin = container.querySelector('#debug-window') as HTMLDivElement
  const debugHeader = container.querySelector('#debug-header') as HTMLDivElement
  const miniMap = container.querySelector('#mini-map') as HTMLCanvasElement
  const statusDiv = container.querySelector('#status-display') as HTMLDivElement
  const debugDiv = container.querySelector('#debug-info') as HTMLPreElement
  const charList = container.querySelector('#character-list') as HTMLPreElement
  const spawnSelect = container.querySelector('#spawn-select') as HTMLSelectElement
  const spawnBtn = container.querySelector('#spawn-btn') as HTMLButtonElement
  const heroControls = container.querySelector('#hero-controls') as HTMLDivElement
  const heroHp = heroControls.querySelector('#hero-hp') as HTMLInputElement
  const heroHunger = heroControls.querySelector('#hero-hunger') as HTMLInputElement
  const heroStamina = heroControls.querySelector('#hero-stamina') as HTMLInputElement
  const floatBtn = heroControls.querySelector('#float-btn') as HTMLButtonElement
  container.style.position = 'relative'
  const view = new DungeonView3D(wrapper, miniMap, forestBiome)

  heroHp.value = view.getHero().hp.toString()
  heroHunger.value = view.getHero().hunger.toString()
  heroStamina.value = view.getHero().stamina.toString()

  view.getSpawnOptions().forEach((opt) => {
    const option = document.createElement('option')
    option.value = opt.id
    option.textContent = opt.label
    spawnSelect.appendChild(option)
  })

  spawnBtn.addEventListener('click', () => {
    view.spawnCharacter(spawnSelect.value)
  })

  function updateHero() {
    const hero = view.getHero()
    hero.hp = parseInt(heroHp.value)
    hero.hunger = parseInt(heroHunger.value)
    hero.stamina = parseInt(heroStamina.value)
  }
  ;[heroHp, heroHunger, heroStamina].forEach((i) => i.addEventListener('input', updateHero))
  floatBtn.addEventListener('click', () => {
    const on = view.toggleFloatMode()
    floatBtn.textContent = on ? 'Float: ON' : 'Float: OFF'
  })

  let dragging = false
  let offsetX = 0
  let offsetY = 0
  debugHeader.addEventListener('mousedown', (e) => {
    dragging = true
    offsetX = e.clientX - debugWin.offsetLeft
    offsetY = e.clientY - debugWin.offsetTop
  })
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return
    debugWin.style.left = `${e.clientX - offsetX}px`
    debugWin.style.top = `${e.clientY - offsetY}px`
  })
  window.addEventListener('mouseup', () => {
    dragging = false
  })

  function toggleOverlay() {
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none'
  }
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
      e.preventDefault()
      toggleOverlay()
    }
  })
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) toggleOverlay()
  })

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
      debugDiv.textContent = view.getDetailedDebug()
    }
    if (charList) {
      charList.textContent = view.getCharacterList()
    }
    if (statusDiv) {
      statusDiv.innerHTML = view.getStatusHTML()
    }
    requestAnimationFrame(animate)
  }
  animate()
}
