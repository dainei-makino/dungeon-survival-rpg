import * as THREE from 'three'

export default function initGame(container: HTMLElement, loadTab: (tab: 'top') => void) {
  container.innerHTML = `
    <button id="back-to-top" style="position:absolute;z-index:1000;top:10px;left:10px;">トップへ戻る</button>
    <div id="game-container" style="width:100%;height:100%"></div>
  `

  const back = container.querySelector('#back-to-top') as HTMLButtonElement
  back.addEventListener('click', () => loadTab('top'))

  const gameContainer = container.querySelector('#game-container') as HTMLElement

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x202020)
  const camera = new THREE.PerspectiveCamera(
    75,
    gameContainer.clientWidth / gameContainer.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight)
  gameContainer.appendChild(renderer.domElement)

  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)

  const animate = () => {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()

  const onResize = () => {
    const width = gameContainer.clientWidth
    const height = gameContainer.clientHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', onResize)
}
