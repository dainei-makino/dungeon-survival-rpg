import * as THREE from 'three'
import BlockyCharacterLoader from '../games/dungeon-rpg-three/components/BlockyCharacterLoader'
import sound from '../audio'

const characterFiles = import.meta.glob('../assets/characters/*.json', { as: 'url' })

export default function showDebug(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top">トップへ戻る</button>
    <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding-top:1rem;">
      <div>
        キャラクター:
        <select id="char-select"></select>
      </div>
      <canvas id="char-view" width="300" height="300" style="border:1px solid #000"></canvas>
      <div>
        BGM:
        <select id="bgm-select">
          <option value="main">main</option>
        </select>
        <button id="bgm-play">再生</button>
        <button id="bgm-stop">停止</button>
      </div>
      <div>
        SE:
        <select id="se-select">
          <option value="beep">beep</option>
        </select>
        <button id="se-play">再生</button>
      </div>
    </div>
  `

  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const select = container.querySelector('#char-select') as HTMLSelectElement
  for (const path in characterFiles) {
    const option = document.createElement('option')
    option.value = characterFiles[path]() as unknown as string
    option.textContent = path.split('/').pop()?.replace('.json', '') || path
    select.appendChild(option)
  }

  const canvas = container.querySelector('#char-view') as HTMLCanvasElement
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(300, 300)
  const scene = new THREE.Scene()
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(3, 3, 3)
  camera.lookAt(0, 1, 0)
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
