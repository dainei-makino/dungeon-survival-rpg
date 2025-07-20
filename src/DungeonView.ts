import DungeonMap from './DungeonMap'
import Player, { Direction } from './Player'

export default class DungeonView {
  private scene: Phaser.Scene
  private graphics: Phaser.GameObjects.Graphics
  private map: DungeonMap
  private player: Player
  private keys: Record<string, Phaser.Input.Keyboard.Key>
  private dirVectors: Record<Direction, { dx: number; dy: number; left: { dx: number; dy: number }; right: { dx: number; dy: number } }>
  private debugText: Phaser.GameObjects.Text
  private miniMap: Phaser.GameObjects.Graphics
  private readonly FOV = Math.PI / 3
  private readonly numRays = 120
  private readonly maxDepth = 20
  private readonly eyeOffset = 0.3

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.graphics = scene.add.graphics()
    this.map = new DungeonMap()
    this.player = new Player(this.map.playerStart)
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
    const px = x + this.player.x * cellW + cellW / 2
    const py = y + this.player.y * cellH + cellH / 2
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
    const ang = this.angleForDir(this.player.dir)
    return {
      x: this.player.x + 0.5 - Math.cos(ang) * this.eyeOffset,
      y: this.player.y + 0.5 - Math.sin(ang) * this.eyeOffset,
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
    g.fillStyle(0x666666, 1)
    g.fillRect(0, 0, width, height / 2)
    g.fillStyle(0x333333, 1)
    g.fillRect(0, height / 2, width, height / 2)

    const vectors = this.dirVectors[this.player.dir]
    const front = this.tileAt(this.player.x + vectors.dx, this.player.y + vectors.dy)

    let fov = this.FOV
    let rayCount = this.numRays
    if (front === '#') {
      fov = Math.PI / 2
      rayCount = Math.round(this.numRays * (fov / this.FOV))
    }

    const dirAngle = this.angleForDir(this.player.dir)
    const sliceW = width / rayCount

    for (let i = 0; i < rayCount; i++) {
      const rayAngle = dirAngle - fov / 2 + (i / rayCount) * fov
      const dist = this.castRay(rayAngle)
      const corrected = dist * Math.cos(rayAngle - dirAngle)
      const wallScale = width * 0.3
      const h = Math.min(height, wallScale / Math.max(corrected, 0.0001))
      const shade = Math.max(0, 200 - corrected * 40)
      const color = Phaser.Display.Color.GetColor(shade, shade, shade)
      g.fillStyle(color, 1)
      g.fillRect(i * sliceW, (height - h) / 2, sliceW + 1, h)
    }

    this.drawMiniMap()
  }

  update() {
    let changed = false

    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      this.player.rotateLeft()
      changed = true
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
      this.player.rotateRight()
      changed = true
    }

    const vectors = this.dirVectors[this.player.dir]
    if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      const nx = this.player.x + vectors.dx
      const ny = this.player.y + vectors.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
        changed = true
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
      const nx = this.player.x - vectors.dx
      const ny = this.player.y - vectors.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
        changed = true
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
      const nx = this.player.x + vectors.left.dx
      const ny = this.player.y + vectors.left.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
        changed = true
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
      const nx = this.player.x + vectors.right.dx
      const ny = this.player.y + vectors.right.dy
      if (this.tileAt(nx, ny) !== '#') {
        this.player.x = nx
        this.player.y = ny
        changed = true
      }
    }

    if (changed) {
      this.draw()
    }
    this.updateDebugText()
  }
}
