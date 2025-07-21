import * as THREE from 'three'
import DungeonMap from '../dungeon-rpg/DungeonMap'
import Player, { Direction } from '../dungeon-rpg/Player'
import Hero from '../dungeon-rpg/Hero'

export default class DungeonView3D {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private map: DungeonMap
  private player: Player
  private hero: Hero
  private keys = new Set<string>()
  private dirVectors: Record<
    Direction,
    {
      dx: number
      dy: number
      left: { dx: number; dy: number }
      right: { dx: number; dy: number }
    }
  >
  private miniMap?: HTMLCanvasElement
  private miniCtx?: CanvasRenderingContext2D
  private torch?: THREE.Mesh

  constructor(container: HTMLElement, miniMap?: HTMLCanvasElement) {
    this.map = new DungeonMap()
    this.player = new Player(this.map.playerStart)
    this.hero = new Hero()

    const width = container.clientWidth
    const height = container.clientHeight

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(width, height)
    container.appendChild(this.renderer.domElement)

    this.miniMap = miniMap
    if (this.miniMap) {
      this.miniCtx = this.miniMap.getContext('2d') as CanvasRenderingContext2D
    }

    this.dirVectors = {
      north: { dx: 0, dy: -1, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 } },
      east: { dx: 1, dy: 0, left: { dx: 0, dy: -1 }, right: { dx: 0, dy: 1 } },
      south: { dx: 0, dy: 1, left: { dx: 1, dy: 0 }, right: { dx: -1, dy: 0 } },
      west: { dx: -1, dy: 0, left: { dx: 0, dy: 1 }, right: { dx: 0, dy: -1 } },
    }

    window.addEventListener('keydown', this.handleKeyDown)

    this.buildScene()
    this.updateCamera()
  }

  private checkerTexture(color1: string, color2: string, squares = 8) {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const s = size / squares
    for (let y = 0; y < squares; y++) {
      for (let x = 0; x < squares; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? color1 : color2
        ctx.fillRect(x * s, y * s, s, s)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }

  private buildScene() {
    const floorTex = this.checkerTexture('#555', '#444', 4)
    floorTex.repeat.set(this.map.width, this.map.height)
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTex })
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.map.width, this.map.height),
      floorMaterial
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(this.map.width / 2, 0, this.map.height / 2)
    this.scene.add(floor)

    const ceilTex = this.checkerTexture('#333', '#222', 4)
    ceilTex.repeat.set(this.map.width, this.map.height)
    const ceilingMaterial = new THREE.MeshBasicMaterial({ map: ceilTex })
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(this.map.width, this.map.height),
      ceilingMaterial
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(this.map.width / 2, 2, this.map.height / 2)
    this.scene.add(ceiling)

    const wallTex = this.checkerTexture('#999', '#666', 2)
    const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTex })
    const wallGeometry = new THREE.BoxGeometry(1, 2, 1)
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.tileAt(x, y) === '#') {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial)
          wall.position.set(x + 0.5, 1, y + 0.5)
          this.scene.add(wall)
        }
      }
    }

    this.scene.add(new THREE.AmbientLight(0xcccccc))

    const torchGeo = new THREE.SphereGeometry(0.1, 8, 8)
    const torchMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    this.torch = new THREE.Mesh(torchGeo, torchMat)
    this.torch.position.set(
      this.player.x + 0.5,
      1.6,
      this.player.y + 0.5
    )
    const light = new THREE.PointLight(0xffaa00, 1, 5)
    this.torch.add(light)
    this.scene.add(this.torch)
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (!['w', 'a', 's', 'd', 'j', 'k'].includes(key)) return
    e.preventDefault()
    const vectors = this.dirVectors[this.player.dir]
    if (key === 'a') {
      this.player.rotateLeft()
    } else if (key === 'd') {
      this.player.rotateRight()
    } else if (key === 'w') {
      const nx = this.player.x + vectors.dx
      const ny = this.player.y + vectors.dy
      if (this.map.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
      }
    } else if (key === 's') {
      const nx = this.player.x - vectors.dx
      const ny = this.player.y - vectors.dy
      if (this.map.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
      }
    } else if (key === 'j') {
      const nx = this.player.x + vectors.left.dx
      const ny = this.player.y + vectors.left.dy
      if (this.map.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
      }
    } else if (key === 'k') {
      const nx = this.player.x + vectors.right.dx
      const ny = this.player.y + vectors.right.dy
      if (this.map.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
      }
    }
    this.updateCamera()
    this.renderMiniMap()
  }

  private renderMiniMap() {
    if (!this.miniCtx || !this.miniMap) return
    const ctx = this.miniCtx
    const size = Math.min(this.miniMap.width, this.miniMap.height)
    const cols = this.map.width
    const rows = this.map.height
    const cellW = size / cols
    const cellH = size / rows
    ctx.clearRect(0, 0, this.miniMap.width, this.miniMap.height)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.map.tileAt(c, r)
        ctx.fillStyle = cell === '#' ? '#555' : '#222'
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH)
        ctx.strokeStyle = '#888'
        ctx.strokeRect(c * cellW, r * cellH, cellW, cellH)
      }
    }
    const px = this.player.x * cellW + cellW / 2
    const py = this.player.y * cellH + cellH / 2
    ctx.fillStyle = '#f00'
    ctx.beginPath()
    ctx.arc(px, py, Math.min(cellW, cellH) / 3, 0, Math.PI * 2)
    ctx.fill()
  }

  update() {
    if (this.torch) {
      this.torch.rotation.y += 0.01
    }
    this.renderMiniMap()
  }

  private angleForDir(dir: Direction): number {
    switch (dir) {
      case 'north':
        return 0
      case 'east':
        return -Math.PI / 2
      case 'south':
        return Math.PI
      case 'west':
        return Math.PI / 2
    }
  }

  updateCamera() {
    this.camera.position.set(this.player.x + 0.5, 1.6, this.player.y + 0.5)
    this.camera.rotation.set(0, this.angleForDir(this.player.dir), 0)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
