import * as THREE from 'three'
import BlockyCharacterLoader from '../games/dungeon-rpg-three/components/BlockyCharacterLoader'
import { checkerTexture } from '../games/dungeon-rpg-three/utils/textures'
import sound from '../audio'

const characterFiles = import.meta.glob('../assets/characters/*.json', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

export default function showDebug(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <div id="debug-controls" style="position:absolute;z-index:800;top:10px;right:10px;padding:4px;background:rgba(0,0,0,0.5);color:#fff;font:12px monospace;">
      <div>
        キャラクター:
        <select id="char-select"></select>
      </div>
      <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
        <button id="rot-left">左回転</button>
        <button id="rot-right">右回転</button>
        <button id="zoom-in">拡大</button>
        <button id="zoom-out">縮小</button>
      </div>
      <div style="margin-top:0.5rem;">
        BGM:
        <select id="bgm-select">
          <option value="main">main</option>
        </select>
        <button id="bgm-play">再生</button>
        <button id="bgm-stop">停止</button>
      </div>
      <div style="margin-top:0.5rem;">
        SE:
        <select id="se-select">
          <option value="beep">beep</option>
        </select>
        <button id="se-play">再生</button>
      </div>
    </div>
    <canvas id="char-view" style="width:100%;height:100%;display:block;"></canvas>
  `

  container.style.position = 'relative'
  container.style.backgroundImage =
    'repeating-conic-gradient(#eee 0% 25%, #ccc 0% 50%) 0 0 / 40px 40px'
  container.style.backgroundColor = '#eee'

  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const select = container.querySelector('#char-select') as HTMLSelectElement
  for (const path in characterFiles) {
    const option = document.createElement('option')
    option.value = new URL(characterFiles[path], import.meta.url).href
    option.textContent = path.split('/').pop()?.replace('.json', '') || path
    select.appendChild(option)
  }

  const canvas = container.querySelector('#char-view') as HTMLCanvasElement
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setPixelRatio(window.devicePixelRatio)
  function resize() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  const scene = new THREE.Scene()
  const bgTex = checkerTexture('#ccc', '#eee', 8)
  bgTex.repeat.set(20, 20)
  scene.background = bgTex
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0x666666))
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  let distance = 3
  function updateCamera() {
    camera.position.set(distance, distance, distance)
    camera.lookAt(0, 1, 0)
  }
  updateCamera()
  resize()
  let current: THREE.Group | undefined

  async function loadCharacter(url: string) {
    if (current) scene.remove(current)
    const loader = new BlockyCharacterLoader(url)
    current = await loader.load()
    scene.add(current)
  }

  select.addEventListener('change', () => {
    const url = select.value
    loadCharacter(url)
  })

  // load first character
  if (select.options.length > 0) {
    loadCharacter(select.options[0].value)
  }

  const rotLeft = container.querySelector('#rot-left') as HTMLButtonElement
  const rotRight = container.querySelector('#rot-right') as HTMLButtonElement
  const zoomIn = container.querySelector('#zoom-in') as HTMLButtonElement
  const zoomOut = container.querySelector('#zoom-out') as HTMLButtonElement

  rotLeft.addEventListener('click', () => {
    if (current) current.rotation.y -= 0.3
  })
  rotRight.addEventListener('click', () => {
    if (current) current.rotation.y += 0.3
  })
  zoomIn.addEventListener('click', () => {
    distance = Math.max(1, distance - 0.5)
    updateCamera()
  })
  zoomOut.addEventListener('click', () => {
    distance = Math.min(10, distance + 0.5)
    updateCamera()
  })

  function animate() {
    requestAnimationFrame(animate)
    if (current) current.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()

  const bgmSel = container.querySelector('#bgm-select') as HTMLSelectElement
  const bgmPlay = container.querySelector('#bgm-play') as HTMLButtonElement
  const bgmStop = container.querySelector('#bgm-stop') as HTMLButtonElement
  bgmPlay.addEventListener('click', () => sound.playBgm(bgmSel.value))
  bgmStop.addEventListener('click', () => sound.stopBgm(bgmSel.value))

  const seSel = container.querySelector('#se-select') as HTMLSelectElement
  const sePlay = container.querySelector('#se-play') as HTMLButtonElement
  sePlay.addEventListener('click', () => sound.playSe(seSel.value))
}
