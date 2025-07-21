import * as THREE from 'three'
import DungeonMap from '../dungeon-rpg/DungeonMap'
import { Biome, forestBiome } from '../world/biomes'
import { VoxelType } from '../world/voxels'
import Player, { Direction } from '../dungeon-rpg/Player'
import Hero from '../dungeon-rpg/Hero'
import Enemy, { skeletonWarrior } from '../dungeon-rpg/Enemy'
import EnvironmentCharacter from '../dungeon-rpg/Environment'
import PlayerArms from './components/PlayerArms'
import BlockyCharacterLoader from './components/BlockyCharacterLoader'
import {
  floorTexture,
  wallTexture,
  perlinTexture,
  treeTexture,
  leavesTexture,
} from './utils/textures'


export default class DungeonView3D {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private map: DungeonMap
  private biome: Biome
  private player: Player
  private hero: Hero
  private enemies: {
    enemy: Enemy
    x: number
    y: number
    mesh?: THREE.Object3D
    dir: Direction
    nextMove: number
  }[] = []
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
  private blockyNPC?: THREE.Group
  private animStart: number | null = null
  private startPos = new THREE.Vector3()
  private startRot = 0
  private targetPos = new THREE.Vector3()
  private targetRot = 0
  private readonly animDuration = 200 // ms
  private arms: PlayerArms
  private readonly cellSize = 2
  private readonly playerHeight = this.cellSize * 2
  private readonly eyeLevel = this.playerHeight - 0.4
  private readonly wallNoiseScale = 25
  private readonly drawDistance = 30
  private mapGroup = new THREE.Group()
  private mapCenterX = 0
  private mapCenterY = 0
  private enemyBase?: THREE.Group
  private items: { name: string; x: number; y: number; mesh: THREE.Object3D }[] = []
  private spawnCooldown = 0

  constructor(
    container: HTMLElement,
    miniMap?: HTMLCanvasElement,
    biome: Biome = forestBiome
  ) {
    this.biome = biome
    this.map = biome.generateMap() as DungeonMap
    this.player = new Player(this.map.playerStart)
    this.hero = new Hero()
    const mapAny: any = this.map as any
    if (Array.isArray(mapAny.enemies)) {
      const now = performance.now()
      mapAny.enemies.forEach((e: any) => {
        this.enemies.push({
          enemy: e.template,
          x: e.x,
          y: e.y,
          dir: 'south',
          nextMove: now + Math.random() * 1000,
        })
      })
    }

    this.mapCenterX = Math.floor(this.player.x)
    this.mapCenterY = Math.floor(this.player.y)

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
    const h0 = this.map.getHeight(this.player.x, this.player.y) * this.cellSize
    this.camera.position.set(
      this.player.x * this.cellSize + this.cellSize / 2,
      h0 + this.eyeLevel,
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

    this.scene.add(this.mapGroup)
    this.buildMapGeometry(this.mapCenterX, this.mapCenterY)

    const torchGeo = new THREE.SphereGeometry(0.1, 8, 8)
    const torchMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    this.torch = new THREE.Mesh(torchGeo, torchMat)
    const th = this.map.getHeight(this.player.x, this.player.y) * this.cellSize
    this.torch.position.set(
      this.player.x * this.cellSize + this.cellSize / 2,
      th + this.eyeLevel,
      this.player.y * this.cellSize + this.cellSize / 2
    )
    const light = new THREE.PointLight(0xffaa00, 1, 5)
    this.torch.add(light)
    this.scene.add(this.torch)
    this.spawnEnemies()
    this.spawnEnvironment()
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (!['w', 'a', 's', 'd', 'j', 'k', 'u', 'i'].includes(key)) return
    e.preventDefault()
    const vectors = this.dirVectors[this.player.dir]

    const tryMove = (dx: number, dy: number) => {
      const nx = this.player.x + dx
      const ny = this.player.y + dy
      if (this.map.tileAt(nx, ny) === '#') return false
      const isDiag = Math.abs(dx) === 1 && Math.abs(dy) === 1
      if (
        isDiag &&
        (this.map.tileAt(this.player.x + dx, this.player.y) === '#' ||
          this.map.tileAt(this.player.x, this.player.y + dy) === '#')
      ) {
        return false
      }
      this.player.x = nx
      this.player.y = ny
      this.hero.hunger = Math.max(0, this.hero.hunger - 1)
      return true
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
    this.checkRegion()
    this.renderMiniMap()
  }

  private handleHandAction(left: boolean) {
    const vectors = this.dirVectors[this.player.dir]
    const targetX = Math.floor(this.player.x + vectors.dx)
    const targetY = Math.floor(this.player.y + vectors.dy)
    const enemy = this.enemies.find((e) => e.x === targetX && e.y === targetY)
    const hand = left ? 'leftHand' : 'rightHand'
    const current = (this.hero as any)[hand] as string
    const itemIdx = this.items.findIndex((i) => i.x === targetX && i.y === targetY)

    if (current === 'unarmed' && itemIdx !== -1) {
      const grabbed = this.items.splice(itemIdx, 1)[0]
      this.mapGroup.remove(grabbed.mesh)
      this.arms.attachItem(grabbed.mesh, left)
      ;(this.hero as any)[hand] = grabbed.name
    } else if (current === 'unarmed') {
      if (enemy) {
        console.log(`${left ? 'Left' : 'Right'} hand interacts with ${enemy.enemy.name}`)
      } else {
        console.log(`${left ? 'Left' : 'Right'} hand finds nothing`)
      }
    } else {
      console.log(`${left ? 'Left' : 'Right'} hand uses ${current}`)
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
    if (this.enemyBase) {
      this.addEnemies()
      return
    }
    const loader = new BlockyCharacterLoader(
      new URL('../../assets/enemies/json/skeleton-warrior-blocky.json', import.meta.url).href
    )
    loader.load().then((base) => {
      this.enemyBase = base
      this.addEnemies()
    })
  }

  private addEnemies() {
    if (!this.enemyBase) return
    const minX = this.mapCenterX - this.drawDistance
    const maxX = this.mapCenterX + this.drawDistance
    const minY = this.mapCenterY - this.drawDistance
    const maxY = this.mapCenterY + this.drawDistance
    this.enemies.forEach((e) => {
      if (e.x < minX || e.x > maxX || e.y < minY || e.y > maxY) {
        if (e.mesh) {
          this.mapGroup.remove(e.mesh)
          e.mesh = undefined
        }
        return
      }
      if (!e.mesh) {
        const mesh = this.enemyBase.clone(true)
        const scale = 0.3 * this.cellSize
        mesh.scale.set(scale, scale, scale)
        mesh.position.set(
          e.x * this.cellSize + this.cellSize / 2,
          0,
          e.y * this.cellSize + this.cellSize / 2
        )
        e.mesh = mesh
        this.mapGroup.add(mesh)
      } else {
        e.mesh.position.set(
          e.x * this.cellSize + this.cellSize / 2,
          0,
          e.y * this.cellSize + this.cellSize / 2
        )
      }
    })
  }

  private spawnBlockyNPC() {
    if (this.blockyNPC) {
      this.mapGroup.add(this.blockyNPC)
      return
    }
    const loader = new BlockyCharacterLoader(
      new URL('../../assets/characters/blocky-doll.json', import.meta.url).href
    )
    loader.load().then((doll) => {
      let x = this.player.x + 2
      let y = this.player.y + 2
      if (this.map.tileAt(x, y) === '#') {
        outer: for (let iy = 1; iy < this.map.height - 1; iy++) {
          for (let ix = 1; ix < this.map.width - 1; ix++) {
            if (this.map.tileAt(ix, iy) === '.') {
              x = ix
              y = iy
              break outer
            }
          }
        }
      }
      doll.position.set(
        x * this.cellSize + this.cellSize / 2,
        0,
        y * this.cellSize + this.cellSize / 2
      )
      this.blockyNPC = doll
      this.mapGroup.add(doll)
    })
  }

  private spawnEnvironment() {
    const map: any = this.map as any
    if (!map.environmentItems || map.environmentItems.length === 0) return

    const templates = Array.from(
      new Set(map.environmentItems.map((i: any) => i.template))
    ) as EnvironmentCharacter[]

    Promise.all(
      templates.map((t) => {
        const url = new URL(
          `../../assets/environment/json/${t.mesh}`,
          import.meta.url
        ).href
        const loader = new BlockyCharacterLoader(url)
        return loader.load().then((group) => [t, group] as const)
      })
    ).then((pairs) => {
      const baseMap = new Map<EnvironmentCharacter, THREE.Group>()
      pairs.forEach(([t, g]) => baseMap.set(t, g))
      map.environmentItems.forEach((item: any) => {
        const base = baseMap.get(item.template)
        if (!base) return
        const mesh = base.clone(true)
        const vh = (mesh.userData.voxelHeight as number) || 1
        const scale = this.cellSize / vh
        mesh.scale.set(scale, scale, scale)
        const h = this.map.getHeight(item.x, item.y) * this.cellSize
        mesh.position.set(
          item.x * this.cellSize + this.cellSize / 2,
          h,
          item.y * this.cellSize + this.cellSize / 2
        )
        this.scene.add(mesh)
      })
    })
  }

  private spawnItems() {
    const loader = new BlockyCharacterLoader(
      new URL('../../assets/environment/json/seaweed-blocky.json', import.meta.url).href
    )
    loader.load().then((obj) => {
      const x = this.player.x + 1
      const y = this.player.y
      const scale = 0.3 * this.cellSize
      obj.scale.set(scale, scale, scale)
      obj.position.set(
        x * this.cellSize + this.cellSize / 2,
        0,
        y * this.cellSize + this.cellSize / 2
      )
      this.items.push({ name: 'seaweed', x, y, mesh: obj })
      this.mapGroup.add(obj)
    })
  }

  private randomSpawnLocation() {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * this.map.width)
      const y = Math.floor(Math.random() * this.map.height)
      if (this.map.tileAt(x, y) !== '#') {
        const dx = x - this.player.x
        const dy = y - this.player.y
        if (dx * dx + dy * dy > this.drawDistance * this.drawDistance) {
          return { x, y }
        }
      }
    }
    return null
  }

  private spawnFromBiome() {
    if (!this.biome.spawns) return
    this.biome.spawns.forEach((s) => {
      if (Math.random() < s.probability) {
        const loc = this.randomSpawnLocation()
        if (loc) {
          this.enemies.push({
            enemy: s.enemy,
            x: loc.x,
            y: loc.y,
            dir: 'south',
            nextMove: performance.now() + Math.random() * 1000,
          })
          this.addEnemies()
        }
      }
    })
  }

  spawnEnemyNearPlayer(enemy: Enemy) {
    const offsets = [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
    ]
    for (const [dx, dy] of offsets) {
      const x = Math.floor(this.player.x) + dx
      const y = Math.floor(this.player.y) + dy
      if (this.map.tileAt(x, y) !== '#') {
        this.enemies.push({
          enemy,
          x,
          y,
          dir: 'south',
          nextMove: performance.now() + Math.random() * 1000,
        })
        this.addEnemies()
        break
      }
    }
  }

  private updateEnemies() {
    const now = performance.now()
    this.enemies.forEach((e) => {
      if (now >= e.nextMove) {
        const dirs: Direction[] = ['north', 'south', 'east', 'west']
        const dir = dirs[Math.floor(Math.random() * dirs.length)]
        const vec = this.dirVectors[dir]
        const nx = e.x + vec.dx
        const ny = e.y + vec.dy
        if (this.map.tileAt(nx, ny) !== '#') {
          e.x = nx
          e.y = ny
          if (e.mesh) {
            e.mesh.position.set(
              e.x * this.cellSize + this.cellSize / 2,
              0,
              e.y * this.cellSize + this.cellSize / 2
            )
          }
        }
        e.dir = dir
        e.nextMove = now + 1000 + Math.random() * 1000
      }
    })
  }

  private buildMapGeometry(cx: number, cy: number) {
    this.mapCenterX = cx
    this.mapCenterY = cy
    this.mapGroup.clear()

    const minX = Math.max(0, cx - this.drawDistance)
    const maxX = Math.min(this.map.width - 1, cx + this.drawDistance)
    const minY = Math.max(0, cy - this.drawDistance)
    const maxY = Math.min(this.map.height - 1, cy + this.drawDistance)
    const width = maxX - minX + 1
    const height = maxY - minY + 1

    const floorTex = this.biome.floorTexture
      ? this.biome.floorTexture()
      : floorTexture()
    const geo = new THREE.PlaneGeometry(
      width * this.cellSize,
      height * this.cellSize,
      width,
      height
    )
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        const idx = y * (width + 1) + x
        const h = this.map.getHeight(minX + Math.min(x, width - 1), minY + Math.min(y, height - 1))
        pos.setZ(idx, h * this.cellSize)
      }
    }
    geo.rotateX(-Math.PI / 2)
    pos.needsUpdate = true
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
    floorTex.repeat.set(width, height)
    const floorMat = new THREE.MeshBasicMaterial({ map: floorTex, side: THREE.DoubleSide })
    const floor = new THREE.Mesh(geo, floorMat)
    floor.position.set(
      (minX + width / 2) * this.cellSize,
      0,
      (minY + height / 2) * this.cellSize
    )
    this.mapGroup.add(floor)

    if (this.biome.hasCeiling !== false) {
      const ceilTex = perlinTexture(256, 10, 20)
      ceilTex.repeat.set(width * this.cellSize, height * this.cellSize)
      const ceilingMaterial = new THREE.MeshBasicMaterial({ map: ceilTex })
      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(width * this.cellSize, height * this.cellSize),
        ceilingMaterial
      )
      ceiling.rotation.x = Math.PI / 2
      ceiling.position.set(
        (minX + width / 2) * this.cellSize,
        2,
        (minY + height / 2) * this.cellSize
      )
      this.mapGroup.add(ceiling)
    } else if (this.biome.skyColor !== undefined) {
      this.scene.background = new THREE.Color(this.biome.skyColor)
      if (this.biome.skyTexture) {
        const tex = this.biome.skyTexture()
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
        const skyGeo = new THREE.SphereGeometry(500, 32, 32)
        const skyMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })
        const sky = new THREE.Mesh(skyGeo, skyMat)
        this.mapGroup.add(sky)
      }
    }

    const wallTex = wallTexture(this.wallNoiseScale)
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping
    const treeTex = this.biome.treeTexture ? this.biome.treeTexture() : treeTexture(this.wallNoiseScale)
    treeTex.wrapS = treeTex.wrapT = THREE.RepeatWrapping
    const leavesTex = this.biome.leavesTexture ? this.biome.leavesTexture() : leavesTexture(this.wallNoiseScale)
    leavesTex.wrapS = leavesTex.wrapT = THREE.RepeatWrapping
    const wallScale = this.wallNoiseScale
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const h = this.map.getHeight(x, y)
        for (let z = h; z < this.map.depth; z++) {
          const voxel = this.map.voxelAt(x, y, z)
          if (voxel !== VoxelType.Tree && voxel !== VoxelType.Leaves) continue
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
          const tex =
            voxel === VoxelType.Tree
              ? treeTex
              : voxel === VoxelType.Leaves
              ? leavesTex
              : wallTex
          const mat = new THREE.MeshBasicMaterial({ map: tex })
          const wall = new THREE.Mesh(geom, mat)
          wall.position.set(
            (x + 0.5) * this.cellSize,
            z * this.cellSize + 1,
            (y + 0.5) * this.cellSize
          )
          this.mapGroup.add(wall)
        }
      }
    }

    this.addEnemies()
    this.spawnBlockyNPC()
    this.spawnItems()
  }

  private checkRegion() {
    const px = Math.floor(this.player.x)
    const py = Math.floor(this.player.y)
    const margin = 5
    if (
      px - this.mapCenterX > this.drawDistance - margin ||
      this.mapCenterX - px > this.drawDistance - margin ||
      py - this.mapCenterY > this.drawDistance - margin ||
      this.mapCenterY - py > this.drawDistance - margin
    ) {
      this.buildMapGeometry(px, py)
    } else {
      this.addEnemies()
    }
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

    this.updateEnemies()
    if (performance.now() > this.spawnCooldown) {
      this.spawnFromBiome()
      this.spawnCooldown = performance.now() + 5000
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
          this.camera.position.y,
          this.camera.position.z
        )
      }
      this.arms.sway(t)
      if (t === 1) {
        this.animStart = null
        this.arms.finishSway()
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
    this.checkRegion()
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
      this.map.getHeight(this.player.x, this.player.y) * this.cellSize +
        this.eyeLevel,
      this.player.y * this.cellSize + this.cellSize / 2
    )
    this.targetRot = this.angleForDir(this.player.dir)
    this.animStart = performance.now()
    this.arms.startSway()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  getStatusHTML(): string {
    const heartIcon = '❤️'
    const hungerIcon = '🍖'
    const staminaIcon = '⚡'
    const hearts = heartIcon.repeat(this.hero.hp)
    const hunger = hungerIcon.repeat(Math.floor(this.hero.hunger / 100))
    const stamina = staminaIcon.repeat(this.hero.stamina)
    return `<div>${hearts}</div><div>${hunger}</div><div>${stamina}</div>`
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
      `Hunger: ${this.hero.hunger} Stamina: ${this.hero.stamina}\n` +
      `L: ${this.hero.leftHand} R: ${this.hero.rightHand}\n` +
      `Enemies: ${enemyInfo}`
    )
  }

  getHero() {
    return this.hero
  }

  getDetailedDebug(): string {
    const lines: string[] = []
    lines.push(
      `Player: (${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)}) Dir:${
        this.player.dir}`,
    )
    lines.push(
      `HP:${this.hero.hp} Hunger:${this.hero.hunger} Stamina:${this.hero.stamina}`,
    )
    const footH = this.map.getHeight(this.player.x, this.player.y)
    lines.push(`Foot height: ${footH}`)
    lines.push('Around:')
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const x = Math.floor(this.player.x) + dx
        const y = Math.floor(this.player.y) + dy
        const tile = this.map.tileAt(x, y)
        const enemy = this.enemies.find((e) => e.x === x && e.y === y)
        const voxel = this.map.voxelAt(x, y, footH - 1)
        const voxelName = voxel !== null ? voxel : 'null'
        lines.push(
          `(${x},${y}) ${tile} ${voxelName} ${enemy ? enemy.enemy.name : ''}`,
        )
      }
    }
    lines.push(`Map ${this.map.width}x${this.map.height}`)
    return lines.join('\n')
  }
}
