import DungeonMap from './DungeonMap'
import Player, { Direction } from './Player'
import { animationSpeed } from './config'

export default class DungeonView {
  private scene: Phaser.Scene
  private graphics: Phaser.GameObjects.Graphics
  private map: DungeonMap
  private player: Player
  private viewX: number
  private viewY: number
  private viewAngle: number
  private keys: Record<string, Phaser.Input.Keyboard.Key>
  private dirVectors: Record<Direction, { dx: number; dy: number; left: { dx: number; dy: number }; right: { dx: number; dy: number } }>
  private debugText: Phaser.GameObjects.Text
  private miniMap: Phaser.GameObjects.Graphics
  private isMoving = false
  private isRotating = false
  private readonly moveDuration = 150 * animationSpeed
  private readonly rotateDuration = 150 * animationSpeed
  private readonly FOV = Math.PI / 3
  private readonly numRays = 120
  private readonly maxDepth = 20
  private readonly eyeOffset = 0.3
  private ceilingPattern: { x: number; y: number; radius: number; color: number }[] = []
  private patternW = 0
  private patternH = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.graphics = scene.add.graphics()
    this.map = new DungeonMap()
    this.player = new Player(this.map.playerStart)
    this.viewX = this.player.x
    this.viewY = this.player.y
    this.viewAngle = this.angleForDir(this.player.dir)
    this.keys = scene.input.keyboard.addKeys('W,S,A,D,J,K') as Record<string, Phaser.Input.Keyboard.Key>
    this.dirVectors = {
      north: { dx: 0, dy: -1, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 } },
      east: { dx: 1, dy: 0, left: { dx: 0, dy: -1 }, right: { dx: 0, dy: 1 } },
      south: { dx: 0, dy: 1, left: { dx: 1, dy: 0 }, right: { dx: -1, dy: 0 } },
      west: { dx: -1, dy: 0, left: { dx: 0, dy: 1 }, right: { dx: 0, dy: -1 } },
    }
    this.debugText = scene.add.text(0, 0, '', {
      color: '#ffffff',
      fontSize: '14px',
      fontFamily: 'monospace',
    })
    this.debugText.setOrigin(1, 0)
    this.miniMap = scene.add.graphics()
    this.updateDebugText()
  }

  private updateDebugText() {
    const pressed = Object.entries(this.keys)
      .filter(([, key]) => key.isDown)
      .map(([name]) => name)
      .join(' ')
    this.debugText.setText(
      `Keys: ${pressed}\nPos: ${this.player.x},${this.player.y}\nDir: ${this.player.dir}`
    )
    this.debugText.setPosition(this.scene.scale.width - 10, 10)
  }

  private tileAt(x: number, y: number): string {
    return this.map.tileAt(x, y)
  }

  private startMove(nx: number, ny: number) {
    this.isMoving = true
    this.player.x = nx
    this.player.y = ny
    this.scene.tweens.add({
      targets: this,
      viewX: nx,
      viewY: ny,
      duration: this.moveDuration,
      onUpdate: () => {
        this.draw()
        this.updateDebugText()
      },
      onComplete: () => {
        this.isMoving = false
        this.draw()
        this.updateDebugText()
      },
    })
  }

  private rotateDir(dir: Direction, delta: number): Direction {
    const order: Direction[] = ['north', 'east', 'south', 'west']
    const idx = order.indexOf(dir)
    return order[(idx + (delta > 0 ? 1 : -1) + 4) % 4]
  }

  private startRotate(delta: number) {
    this.isRotating = true
    const endDir = this.rotateDir(this.player.dir, delta)
    const finalAngle = this.angleForDir(endDir)
    let tweenAngle = finalAngle
    if (tweenAngle - this.viewAngle > Math.PI) {
      tweenAngle -= Math.PI * 2
    } else if (this.viewAngle - tweenAngle > Math.PI) {
      tweenAngle += Math.PI * 2
    }
    this.player.dir = endDir
    this.scene.tweens.add({
      targets: this,
      viewAngle: tweenAngle,
      duration: this.rotateDuration,
      onUpdate: () => {
        this.draw()
        this.updateDebugText()
      },
      onComplete: () => {
        this.isRotating = false
        this.viewAngle = finalAngle
        this.draw()
        this.updateDebugText()
      },
    })
  }

  private drawMiniMap() {
    const size = 80
    const margin = 10
    const rows = this.map.height
    const cols = this.map.width
    const cellW = size / cols
    const cellH = size / rows
    const x = this.scene.scale.width - size - margin
    const y = this.debugText.y + this.debugText.height + 5

    const g = this.miniMap
    g.clear()
    g.fillStyle(0x000000, 1)
    g.fillRect(x - 1, y - 1, size + 2, size + 2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.tileAt(c, r)
        g.fillStyle(cell === '#' ? 0x555555 : 0x222222, 1)
        g.fillRect(x + c * cellW, y + r * cellH, cellW, cellH)
        g.lineStyle(1, 0x888888, 1)
        g.strokeRect(x + c * cellW, y + r * cellH, cellW, cellH)
      }
    }
    const px = x + this.viewX * cellW + cellW / 2
    const py = y + this.viewY * cellH + cellH / 2
    g.fillStyle(0xff0000, 1)
    g.fillCircle(px, py, Math.min(cellW, cellH) / 3)
  }

  private angleForDir(dir: Direction): number {
    switch (dir) {
      case 'north':
        return -Math.PI / 2
      case 'east':
        return 0
      case 'south':
        return Math.PI / 2
      case 'west':
        return Math.PI
    }
  }

  private eyePos() {
    const ang = this.viewAngle
    return {
      x: this.viewX + 0.5 - Math.cos(ang) * this.eyeOffset,
      y: this.viewY + 0.5 - Math.sin(ang) * this.eyeOffset,
    }
  }

  private castRay(angle: number): number {
    const pos = this.eyePos()
    const mapX = Math.floor(pos.x)
    const mapY = Math.floor(pos.y)
    const rayDirX = Math.cos(angle)
    const rayDirY = Math.sin(angle)

    const deltaDistX = Math.abs(1 / (rayDirX === 0 ? 1e-6 : rayDirX))
    const deltaDistY = Math.abs(1 / (rayDirY === 0 ? 1e-6 : rayDirY))

    let stepX: number
    let stepY: number
    let sideDistX: number
    let sideDistY: number

    if (rayDirX < 0) {
      stepX = -1
      sideDistX = (pos.x - mapX) * deltaDistX
    } else {
      stepX = 1
      sideDistX = (mapX + 1 - pos.x) * deltaDistX
    }

    if (rayDirY < 0) {
      stepY = -1
      sideDistY = (pos.y - mapY) * deltaDistY
    } else {
      stepY = 1
      sideDistY = (mapY + 1 - pos.y) * deltaDistY
    }

    let currentX = mapX
    let currentY = mapY
    let side = 0
    let hit = false

    while (!hit && Math.hypot(currentX - mapX, currentY - mapY) < this.maxDepth) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX
        currentX += stepX
        side = 0
      } else {
        sideDistY += deltaDistY
        currentY += stepY
        side = 1
      }
      if (this.tileAt(currentX, currentY) === '#') {
        hit = true
      }
    }

    if (!hit) {
      return this.maxDepth
    }

    if (side === 0) {
      return (currentX - pos.x + (1 - stepX) / 2) / (rayDirX === 0 ? 1e-6 : rayDirX)
    } else {
      return (currentY - pos.y + (1 - stepY) / 2) / (rayDirY === 0 ? 1e-6 : rayDirY)
    }
  }

  draw() {
    const width = this.scene.scale.width
    const height = this.scene.scale.height
    const g = this.graphics

    g.clear()

    this.drawCeiling(width, height)
    this.drawFloor(width, height)
    this.drawWalls(width, height)

    this.drawMiniMap()
  }

  private generateCeilingPattern(width: number, height: number) {
    this.patternW = width
    this.patternH = height
    this.ceilingPattern = []
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * width
      const cy = Math.random() * (height / 2)
      const radius = 5 + Math.random() * 20
      const col = Phaser.Display.Color.GetColor(
        50 + Math.random() * 80,
        0,
        50 + Math.random() * 80
      )
      this.ceilingPattern.push({ x: cx, y: cy, radius, color: col })
    }
  }

  private drawCeiling(width: number, height: number) {
    if (
      this.ceilingPattern.length === 0 ||
      this.patternW !== width ||
      this.patternH !== height
    ) {
      this.generateCeilingPattern(width, height)
    }
    const g = this.graphics
    g.fillStyle(0x222222, 1)
    g.fillRect(0, 0, width, height / 2)
    for (const p of this.ceilingPattern) {
      g.fillStyle(p.color, 0.4)
      g.fillCircle(p.x, p.y, p.radius)
    }
  }

  private drawFloor(width: number, height: number) {
    const g = this.graphics
    const pos = this.eyePos()
    const dirAngle = this.viewAngle
    const dirX = Math.cos(dirAngle)
    const dirY = Math.sin(dirAngle)
    const planeLength = Math.tan(this.FOV / 2)
    const planeX = -Math.sin(dirAngle) * planeLength
    const planeY = Math.cos(dirAngle) * planeLength
    const rayDirX0 = dirX - planeX
    const rayDirY0 = dirY - planeY
    const rayDirX1 = dirX + planeX
    const rayDirY1 = dirY + planeY
    const center = height / 2
    const posZ = height / 2
    const carpetHalf = 0.4
    const border = 0.05

    for (let y = center; y < height; y++) {
      const p = y - center
      const rowDist = posZ / p
      const stepX = rowDist * (rayDirX1 - rayDirX0) / width
      const stepY = rowDist * (rayDirY1 - rayDirY0) / width
      let floorX = pos.x + rowDist * rayDirX0
      let floorY = pos.y + rowDist * rayDirY0
      for (let x = 0; x < width; x++) {
        const worldX = floorX + x * stepX
        const worldY = floorY + x * stepY
        const dx = worldX - pos.x
        const dy = worldY - pos.y
        const lateral = -dx * Math.sin(dirAngle) + dy * Math.cos(dirAngle)
        let r = 139
        let gCol = 69
        let b = 19
        if (Math.abs(lateral) < carpetHalf - border) {
          r = 255
          gCol = 0
          b = 0
        } else if (Math.abs(lateral) < carpetHalf) {
          r = 255
          gCol = 255
          b = 0
        }
        const shade = Math.min(1, 2 / rowDist)
        const color = Phaser.Display.Color.GetColor(
          r * shade,
          gCol * shade,
          b * shade
        )
        g.fillStyle(color, 1)
        g.fillRect(x, y, 1, 1)
      }
    }
  }

  private drawWalls(width: number, height: number) {
    const g = this.graphics
    const fov = this.FOV
    const rayCount = this.numRays

    const dirAngle = this.viewAngle
    const sliceW = width / rayCount

    for (let i = 0; i < rayCount; i++) {
      const rayAngle = dirAngle - fov / 2 + (i / rayCount) * fov
      const dist = this.castRay(rayAngle)
      const corrected = dist * Math.cos(rayAngle - dirAngle)
      const wallScale = width * 0.5
      const h = Math.min(height, wallScale / Math.max(corrected, 0.0001))
      const baseR = 255
      const baseG = 250
      const baseB = 240
      const shadeFactor = Math.max(0, 1 - corrected / 15)
      const color = Phaser.Display.Color.GetColor(
        baseR * shadeFactor,
        baseG * shadeFactor,
        baseB * shadeFactor
      )
      g.fillStyle(color, 1)
      g.fillRect(i * sliceW, (height - h) / 2, sliceW + 1, h)
    }

    g.fillStyle(0xffffff, 1)
  }

  update() {
    if (this.isMoving || this.isRotating) {
      this.draw()
      this.updateDebugText()
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
      this.startRotate(-1)
      return
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
      this.startRotate(1)
      return
    }

    const vectors = this.dirVectors[this.player.dir]
    if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      const nx = this.player.x + vectors.dx
      const ny = this.player.y + vectors.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.startMove(nx, ny)
        return
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
      const nx = this.player.x - vectors.dx
      const ny = this.player.y - vectors.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.startMove(nx, ny)
        return
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      const nx = this.player.x + vectors.left.dx
      const ny = this.player.y + vectors.left.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.startMove(nx, ny)
        return
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
      const nx = this.player.x + vectors.right.dx
      const ny = this.player.y + vectors.right.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.startMove(nx, ny)
        return
      }
    }

    this.draw()
    this.updateDebugText()
  }
}
