import * as THREE from 'three'
import BlockyCharacterLoader from '../games/dungeon-rpg-three/components/BlockyCharacterLoader'

export default function showDebug(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <div id="viewer" style="width:100%;height:100%;"></div>
    <div id="controls" style="position:absolute;z-index:1000;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.8);padding:4px;display:flex;gap:4px;">
      <select id="char-select"></select>
      <button id="rot-left">⟲</button>
      <button id="rot-right">⟳</button>
      <button id="zoom-in">＋</button>
      <button id="zoom-out">－</button>
    </div>
  `
  container.style.position = 'relative'
  container.style.background =
    'repeating-conic-gradient(#888 0% 25%, #444 0% 50%) 0/40px 40px'
  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const viewer = container.querySelector('#viewer') as HTMLDivElement
  const select = container.querySelector('#char-select') as HTMLSelectElement
  const rotL = container.querySelector('#rot-left') as HTMLButtonElement
  const rotR = container.querySelector('#rot-right') as HTMLButtonElement
  const zoomIn = container.querySelector('#zoom-in') as HTMLButtonElement
  const zoomOut = container.querySelector('#zoom-out') as HTMLButtonElement

  const characters = [
    {
      name: 'Blocky Doll',
      url: new URL('../assets/characters/blocky-doll.json', import.meta.url).href,
    },
    {
      name: 'Skeleton Warrior',
      url: new URL('../assets/enemies/json/skeleton-warrior-blocky.json', import.meta.url).href,
    },
  ]
  characters.forEach((c) => {
    const opt = document.createElement('option')
    opt.value = c.url
    opt.textContent = c.name
    select.appendChild(opt)
  })

  const renderer = new THREE.WebGLRenderer()
  viewer.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100)
  camera.position.set(0, 1.5, 5)
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(2, 3, 2)
  scene.add(light)
  let model: THREE.Group | null = null

  async function load(url: string) {
    const loader = new BlockyCharacterLoader(url)
    const obj = await loader.load()
    if (model) scene.remove(model)
    model = obj
    scene.add(model)
  }
  load(select.value)
  select.addEventListener('change', () => load(select.value))

  let rot = 0
  rotL.addEventListener('click', () => {
    rot -= 0.1
  })
  rotR.addEventListener('click', () => {
    rot += 0.1
  })
  zoomIn.addEventListener('click', () => {
    camera.position.z = Math.max(1, camera.position.z - 0.5)
  })
  zoomOut.addEventListener('click', () => {
    camera.position.z += 0.5
  })

  function resize() {
    const w = viewer.clientWidth
    const h = viewer.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  resize()

  function animate() {
    requestAnimationFrame(animate)
    if (model) model.rotation.y = rot
    renderer.render(scene, camera)
  }
  animate()
}
