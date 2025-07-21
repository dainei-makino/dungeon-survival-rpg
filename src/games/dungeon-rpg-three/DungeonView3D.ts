import * as THREE from 'three'
import DungeonMap from '../dungeon-rpg/DungeonMap'
import { Biome, forestBiome } from '../world/biomes'
import Player, { Direction } from '../dungeon-rpg/Player'
import Hero from '../dungeon-rpg/Hero'
import Enemy, { skeletonWarrior } from '../dungeon-rpg/Enemy'
import PlayerArms from './components/PlayerArms'
import skeletonShape from '../../assets/enemies/json/skeleton-warrior.json'
import { floorTexture, wallTexture, perlinTexture } from './utils/textures'

export default class DungeonView3D {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private map: DungeonMap
  private biome: Biome
  private player: Player
  private hero: Hero
  private enemies: { enemy: Enemy; x: number; y: number; mesh?: THREE.Mesh }[] = []
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
  private animStart: number | null = null
  private startPos = new THREE.Vector3()
  private startRot = 0
  private targetPos = new THREE.Vector3()
  private targetRot = 0
  private readonly animDuration = 200 // ms
  private arms: PlayerArms
  private readonly cellSize = 2
  private readonly wallNoiseScale = 25

  constructor(
    container: HTMLElement,
    miniMap?: HTMLCanvasElement,
    biome: Biome = forestBiome
  ) {
    this.biome = biome
    this.map = biome.generateMap() as DungeonMap
    this.player = new Player(this.map.playerStart)
    this.hero = new Hero()
    // place a sample enemy for debugging purposes
    let ex = this.map.playerStart.x + 3
    let ey = this.map.playerStart.y
    if (this.map.tileAt(ex, ey) === '#') {
      // find first open tile
      outer: for (let y = 1; y < this.map.height - 1; y++) {
        for (let x = 1; x < this.map.width - 1; x++) {
          if (this.map.tileAt(x, y) !== '#') {
            ex = x
            ey = y
            break outer
          }
        }
      }
    }
    this.enemies.push({ enemy: skeletonWarrior, x: ex, y: ey })

    const width = container.clientWidth
    const height = container.clientHeight

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.scene.add(this.camera)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(width, height)
    container.appendChild(this.renderer.domElement)

    this.miniMap = miniMap
    if (this.miniMap) {
      this.miniCtx = this.miniMap.getContext('2d') as CanvasRenderingContext2D
    }

    this.dirVectors = {
      north: { dx: 0, dy: -1, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 } },
      northEast: {
        dx: 1,
        dy: -1,
        left: { dx: 0, dy: -1 },
        right: { dx: 1, dy: 0 },
      },
      east: { dx: 1, dy: 0, left: { dx: 0, dy: -1 }, right: { dx: 0, dy: 1 } },
      southEast: {
        dx: 1,
        dy: 1,
        left: { dx: 1, dy: 0 },
        right: { dx: 0, dy: 1 },
      },
      south: { dx: 0, dy: 1, left: { dx: 1, dy: 0 }, right: { dx: -1, dy: 0 } },
      southWest: {
        dx: -1,
        dy: 1,
        left: { dx: 0, dy: 1 },
        right: { dx: -1, dy: 0 },
      },
      west: { dx: -1, dy: 0, left: { dx: 0, dy: 1 }, right: { dx: 0, dy: -1 } },
      northWest: {
        dx: -1,
        dy: -1,
        left: { dx: -1, dy: 0 },
        right: { dx: 0, dy: -1 },
      },
    }

    window.addEventListener('keydown', this.handleKeyDown)

    this.buildScene()
    this.arms = new PlayerArms(this.camera)
    // set initial camera state without animation
    this.camera.position.set(
      this.player.x * this.cellSize + this.cellSize / 2,
      1.6,
      this.player.y * this.cellSize + this.cellSize / 2
    )
    this.camera.rotation.set(0, this.angleForDir(this.player.dir), 0)
    this.startPos.copy(this.camera.position)
    this.startRot = this.camera.rotation.y
    this.targetPos.copy(this.startPos)
    this.targetRot = this.startRot
  }


  private buildScene() {
    if (this.biome.fog) {
      this.scene.fog = new THREE.Fog(this.biome.fog, 0, 50)
    }
    if (this.biome.lighting) {
      this.scene.add(
        new THREE.AmbientLight(
          this.biome.lighting.color,
          this.biome.lighting.intensity
        )
      )
    } else {
      this.scene.add(new THREE.AmbientLight(0x666666))
    }
    // TODO: use this.biome.weather to add weather effects
    const floorTex = floorTexture()
    floorTex.repeat.set(
      this.map.width * this.cellSize,
      this.map.height * this.cellSize
    )
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTex })
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(
        this.map.width * this.cellSize,
        this.map.height * this.cellSize
      ),
      floorMaterial
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(
      (this.map.width * this.cellSize) / 2,
      0,
      (this.map.height * this.cellSize) / 2
    )
    this.scene.add(floor)


    const ceilTex = perlinTexture(256, 10, 20)

    ceilTex.repeat.set(
      this.map.width * this.cellSize,
      this.map.height * this.cellSize
    )
    const ceilingMaterial = new THREE.MeshBasicMaterial({ map: ceilTex })
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(
        this.map.width * this.cellSize,
        this.map.height * this.cellSize
      ),
      ceilingMaterial
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(
      (this.map.width * this.cellSize) / 2,
      2,
      (this.map.height * this.cellSize) / 2
    )
    this.scene.add(ceiling)

    const wallTex = wallTexture(this.wallNoiseScale)
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping
    const wallScale = this.wallNoiseScale
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.tileAt(x, y) === '#') {
          const geom = new THREE.BoxGeometry(this.cellSize, 2, this.cellSize)
          const pos = geom.attributes.position as THREE.BufferAttribute
          const normal = geom.attributes.normal as THREE.BufferAttribute
          const uv: number[] = []
          for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i)
            const vy = pos.getY(i)
            const vz = pos.getZ(i)
            const nx = normal.getX(i)
            const nz = normal.getZ(i)
            const wx = (x + 0.5) * this.cellSize + vx
            const wy = vy + 1
            const wz = (y + 0.5) * this.cellSize + vz
            let u = 0
            let v = 0
            if (Math.abs(nx) === 1) {
              u = wz / wallScale
              v = wy / wallScale
            } else if (Math.abs(nz) === 1) {
              u = wx / wallScale
              v = wy / wallScale
            } else {
              u = wx / wallScale
              v = wz / wallScale
            }
            uv.push(u, v)
          }
          geom.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
          const mat = new THREE.MeshBasicMaterial({ map: wallTex })
          const wall = new THREE.Mesh(geom, mat)
          wall.position.set(
            (x + 0.5) * this.cellSize,
            1,
            (y + 0.5) * this.cellSize
          )
          this.scene.add(wall)
        }
      }
    }

    if (!this.biome.lighting) {
      this.scene.add(new THREE.AmbientLight(0x666666))
    }

    const torchGeo = new THREE.SphereGeometry(0.1, 8, 8)
    const torchMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    this.torch = new THREE.Mesh(torchGeo, torchMat)
    this.torch.position.set(
      this.player.x * this.cellSize + this.cellSize / 2,
      1.6,
      this.player.y * this.cellSize + this.cellSize / 2
    )
    const light = new THREE.PointLight(0xffaa00, 1, 5)
    this.torch.add(light)
    this.scene.add(this.torch)

    this.spawnEnemies()
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (!['w', 'a', 's', 'd', 'j', 'k', 'u', 'i'].includes(key)) return
    e.preventDefault()
    const vectors = this.dirVectors[this.player.dir]

    const tryMove = (dx: number, dy: number) => {
      const nx = this.player.x + dx
      const ny = this.player.y + dy
      if (this.map.tileAt(nx, ny) === '#') return
      const isDiag = Math.abs(dx) === 1 && Math.abs(dy) === 1
      if (
        isDiag &&
        (this.map.tileAt(this.player.x + dx, this.player.y) === '#' ||
          this.map.tileAt(this.player.x, this.player.y + dy) === '#')
      ) {
        return
      }
      this.player.x = nx
      this.player.y = ny
    }

    if (key === 'a') {
      this.player.rotateLeft()
    } else if (key === 'd') {
      this.player.rotateRight()
    } else if (key === 'w') {
      tryMove(vectors.dx, vectors.dy)
    } else if (key === 's') {
      tryMove(-vectors.dx, -vectors.dy)
    } else if (key === 'j') {
      tryMove(vectors.left.dx, vectors.left.dy)
    } else if (key === 'k') {
      tryMove(vectors.right.dx, vectors.right.dy)
    } else if (key === 'u') {
      this.handleHandAction(true)
    } else if (key === 'i') {
      this.handleHandAction(false)
    }
    this.updateCamera()
    this.renderMiniMap()
  }

  private handleHandAction(left: boolean) {
    const vectors = this.dirVectors[this.player.dir]
    const targetX = Math.floor(this.player.x + vectors.dx)
    const targetY = Math.floor(this.player.y + vectors.dy)
    const enemy = this.enemies.find((e) => e.x === targetX && e.y === targetY)
    const hand = left ? 'leftHand' : 'rightHand'
    const item = (this.hero as any)[hand] as string
    if (item === 'unarmed') {
      if (enemy) {
        console.log(`${left ? 'Left' : 'Right'} hand interacts with ${enemy.enemy.name}`)
      } else {
        console.log(`${left ? 'Left' : 'Right'} hand finds nothing`)
      }
    } else {
      console.log(`${left ? 'Left' : 'Right'} hand uses ${item}`)
    }
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

    ctx.fillStyle = '#0f0'
    this.enemies.forEach((e) => {
      const ex = e.x * cellW + cellW / 2
      const ey = e.y * cellH + cellH / 2
      ctx.beginPath()
      ctx.arc(ex, ey, Math.min(cellW, cellH) / 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  private spawnEnemies() {
    const shapes = (skeletonShape.paths as number[][][]).map((pts) => {
      const sh = new THREE.Shape()
      pts.forEach(([x, y], idx) => {
        if (idx === 0) sh.moveTo(x, -y)
        else sh.lineTo(x, -y)
      })
      return sh
    })
    const enemyGeo = new THREE.ShapeGeometry(shapes)
    enemyGeo.computeBoundingBox()
    if (enemyGeo.boundingBox) {
      const bb = enemyGeo.boundingBox
      const offX = -(bb.min.x + bb.max.x) / 2
      const offY = -bb.min.y
      enemyGeo.translate(offX, offY, 0)
    }
    const enemyMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    this.enemies.forEach((e) => {
      const mesh = new THREE.Mesh(enemyGeo, enemyMat)
      const scale = 0.08 * this.cellSize
      mesh.scale.set(scale, scale, scale)
      mesh.position.set(
        e.x * this.cellSize + this.cellSize / 2,
        0,
        e.y * this.cellSize + this.cellSize / 2
      )
      e.mesh = mesh
      this.scene.add(mesh)
    })
  }

  getArmSettings() {
    return this.arms.getSettings()
  }

  updateArms(settings: {
    posY?: number
    upperRotX?: number
    lowerRotX?: number
    rotZ?: number
    scale?: number

    spacing?: number
    lowerDist?: number
    fistDist?: number
  }) {
    this.arms.update(settings)
  }

  update() {
    if (this.torch) {
      this.torch.rotation.y += 0.01
    }

    if (this.animStart !== null) {
      const elapsed = performance.now() - this.animStart
      const t = Math.min(1, elapsed / this.animDuration)
      this.camera.position.lerpVectors(this.startPos, this.targetPos, t)
      let rotDiff = this.targetRot - this.startRot
      rotDiff =
        ((rotDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) -
        Math.PI
      this.camera.rotation.y = this.startRot + rotDiff * t
      if (this.torch) {
        this.torch.position.set(
          this.camera.position.x,
          1.6,
          this.camera.position.z
        )
      }
      if (t === 1) {
        this.animStart = null
      }
    }

    // orient billboard enemies toward the camera
    this.enemies.forEach((e) => {
      if (e.mesh) {
        const camPos = this.camera.position.clone()
        camPos.y = e.mesh.position.y
        e.mesh.lookAt(camPos)
      }
    })

    this.renderMiniMap()
  }

  private angleForDir(dir: Direction): number {
    switch (dir) {
      case 'north':
        return 0
      case 'northEast':
        return -Math.PI / 4
      case 'east':
        return -Math.PI / 2
      case 'southEast':
        return -Math.PI * 3/4
      case 'south':
        return Math.PI
      case 'southWest':
        return Math.PI * 3/4
      case 'west':
        return Math.PI / 2
      case 'northWest':
        return Math.PI / 4
    }
  }

  updateCamera() {
    this.startPos.copy(this.camera.position)
    this.startRot = this.camera.rotation.y
    this.targetPos.set(
      this.player.x * this.cellSize + this.cellSize / 2,
      1.6,
      this.player.y * this.cellSize + this.cellSize / 2
    )
    this.targetRot = this.angleForDir(this.player.dir)
    this.animStart = performance.now()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  getDebugText(): string {
    const pos = `(${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`
    const enemyInfo =
      this.enemies.length > 0
        ? this.enemies
            .map((e) => `${e.enemy.name}@(${e.x},${e.y})`)
            .join(', ')
        : 'none'
    return (
      `Pos: ${pos} Dir: ${this.player.dir}\n` +
      `HP: ${this.hero.hp} STR: ${this.hero.strength}\n` +
      `L: ${this.hero.leftHand} R: ${this.hero.rightHand}\n` +
      `Enemies: ${enemyInfo}`
    )
  }
}
