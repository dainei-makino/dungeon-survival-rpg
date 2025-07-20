import mapData from './maps/basicMap.json'

export type Direction = 'north' | 'east' | 'south' | 'west'

interface Player {
  x: number
  y: number
  dir: Direction
}

export default class DungeonView {
  private scene: Phaser.Scene
  private graphics: Phaser.GameObjects.Graphics
  private map: string[]
  private player: Player
  private keys: Record<string, Phaser.Input.Keyboard.Key>
  private dirVectors: Record<Direction, { dx: number; dy: number; left: { dx: number; dy: number }; right: { dx: number; dy: number } }>
  private debugText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.graphics = scene.add.graphics()
    this.map = mapData.tiles
    this.player = { ...mapData.playerStart }
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

  private tileAt(x: number, y: number): string | undefined {
    if (y < 0 || y >= this.map.length) return undefined
    if (x < 0 || x >= this.map[0].length) return undefined
    return this.map[y][x]
  }

  draw() {
    const width = this.scene.scale.width
    const height = this.scene.scale.height
    const g = this.graphics

    g.clear()
    g.fillStyle(0x000000, 1)
    g.fillRect(0, 0, width, height)
    g.lineStyle(1, 0xffffff, 1)



    const viewDepth = 3
    const centerX = width / 2
    const centerY = height / 2

    const getRect = (d: number) => {
      const scale = 1 - d * 0.3
      const w = width * scale
      const h = height * scale
      return {
        x: centerX - w / 2,
        y: centerY - h / 2,
        w,
        h,
      }
    }

    for (let step = 1; step <= viewDepth; step++) {
      const { dx, dy, left, right } = this.dirVectors[this.player.dir]
      const tx = this.player.x + dx * step
      const ty = this.player.y + dy * step

      const rectFar = getRect(step)
      const rectNear = getRect(step - 1)

      const leftCell = this.tileAt(tx + left.dx, ty + left.dy)
      if (leftCell === '#') {
        g.beginPath()
        g.moveTo(rectNear.x, rectNear.y)
        g.lineTo(rectFar.x, rectFar.y)
        g.lineTo(rectFar.x, rectFar.y + rectFar.h)
        g.lineTo(rectNear.x, rectNear.y + rectNear.h)
        g.closePath()
        g.strokePath()
      }
      const rightCell = this.tileAt(tx + right.dx, ty + right.dy)
      if (rightCell === '#') {
        g.beginPath()
        g.moveTo(rectNear.x + rectNear.w, rectNear.y)
        g.lineTo(rectFar.x + rectFar.w, rectFar.y)
        g.lineTo(rectFar.x + rectFar.w, rectFar.y + rectFar.h)
        g.lineTo(rectNear.x + rectNear.w, rectNear.y + rectNear.h)
        g.closePath()
        g.strokePath()
      }

      const front = this.tileAt(tx, ty)
      if (front === '#') {
        g.strokeRect(rectFar.x, rectFar.y, rectFar.w, rectFar.h)
        break
      }
    }
  }

  update() {
    let changed = false

    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      const order: Direction[] = ['north', 'east', 'south', 'west']
      const idx = order.indexOf(this.player.dir)
      this.player.dir = order[(idx + 3) % 4]
      changed = true
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
      const order: Direction[] = ['north', 'east', 'south', 'west']
      const idx = order.indexOf(this.player.dir)
      this.player.dir = order[(idx + 1) % 4]
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
