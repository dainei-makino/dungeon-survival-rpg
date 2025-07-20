import Phaser from 'phaser'
import DungeonMap from './DungeonMap'
import Player, { Direction } from './Player'
import { animationSpeed } from './config'

export default class DungeonView {
  private scene: Phaser.Scene
  private map: DungeonMap
  private player: Player
  private mesh: Phaser.GameObjects.Mesh
  private keys: Record<string, Phaser.Input.Keyboard.Key>
  private dirVectors: Record<Direction, { dx: number; dy: number; left: { dx: number; dy: number }; right: { dx: number; dy: number } }>
  private debugText: Phaser.GameObjects.Text
  private miniMap: Phaser.GameObjects.Graphics
  private isMoving = false
  private isRotating = false
  private readonly moveDuration = 150 * animationSpeed
  private readonly rotateDuration = 150 * animationSpeed
  private readonly WALL_COLOR = 0xcccccc
  private readonly FLOOR_COLOR = 0x996633
  private readonly CEILING_COLOR = 0x6666ff

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.map = new DungeonMap()
    this.player = new Player(this.map.playerStart)

    this.mesh = scene.add.mesh(0, 0, '__DEFAULT')
    this.mesh.setPerspective(scene.scale.width, scene.scale.height, 60, 0.1, 1000)
    this.buildWorld()

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
    this.updateView()
  }

  private addFace(verts: number[], uvs: number[], p1: number[], p2: number[], p3: number[], p4: number[]) {
    verts.push(
      ...p1, ...p2, ...p3,
      ...p1, ...p3, ...p4
    )
    uvs.push(
      0, 1,
      1, 1,
      1, 0,
      0, 1,
      1, 0,
      0, 0
    )
  }

  private addCube(x: number, y: number, z: number, size: number, color: number) {
    const s = size / 2
    const p0 = [x - s, y - s, z - s]
    const p1 = [x + s, y - s, z - s]
    const p2 = [x + s, y + s, z - s]
    const p3 = [x - s, y + s, z - s]
    const p4 = [x - s, y - s, z + s]
    const p5 = [x + s, y - s, z + s]
    const p6 = [x + s, y + s, z + s]
    const p7 = [x - s, y + s, z + s]

    const verts: number[] = []
    const uvs: number[] = []

    this.addFace(verts, uvs, p4, p5, p6, p7) // front
    this.addFace(verts, uvs, p1, p0, p3, p2) // back
    this.addFace(verts, uvs, p0, p4, p7, p3) // left
    this.addFace(verts, uvs, p5, p1, p2, p6) // right
    this.addFace(verts, uvs, p3, p7, p6, p2) // top
    this.addFace(verts, uvs, p0, p1, p5, p4) // bottom

    this.mesh.addVertices(verts, uvs, undefined, true, undefined, color)
  }

  private addPlane(z: number, color: number) {
    const verts: number[] = []
    const uvs: number[] = []
    const w = this.map.width
    const h = this.map.height
    const p0 = [0, 0, z]
    const p1 = [w, 0, z]
    const p2 = [w, h, z]
    const p3 = [0, h, z]
    this.addFace(verts, uvs, p0, p1, p2, p3)
    this.mesh.addVertices(verts, uvs, undefined, true, undefined, color)
  }

  private addFloor() {
    this.addPlane(0, this.FLOOR_COLOR)
  }

  private addCeiling() {
    this.addPlane(1, this.CEILING_COLOR)
  }

  private buildWorld() {
    this.addFloor()
    this.addCeiling()
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.tileAt(x, y) === '#') {
          this.addCube(x + 0.5, y + 0.5, 0.5, 1, this.WALL_COLOR)
        }
      }
    }
  }

  private updateView() {
    const angle = this.angleForDir(this.player.dir)
    const px = this.player.x + 0.5
    const py = this.player.y + 0.5
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    this.mesh.modelRotation.set(0, 0, -angle)
    this.mesh.viewPosition.set(
      -(px * cos + py * sin),
      px * sin - py * cos,
      1.5
    )
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
    this.scene.tweens.add({
      targets: this.player,
      x: nx,
      y: ny,
      duration: this.moveDuration,
      onUpdate: () => {
        this.updateView()
        this.updateDebugText()
      },
      onComplete: () => {
        this.isMoving = false
        this.player.x = nx
        this.player.y = ny
        this.updateView()
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
    const endAngle = this.angleForDir(endDir)
    const startAngle = this.angleForDir(this.player.dir)
    this.scene.tweens.add({
      targets: { t: startAngle },
      t: endAngle,
      duration: this.rotateDuration,
      onUpdate: (tween) => {
        const val = tween.getValue() as number
        this.player.dir = this.angleToDir(val)
        this.updateView()
        this.updateDebugText()
      },
      onComplete: () => {
        this.isRotating = false
        this.player.dir = endDir
        this.updateView()
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
    const px = x + (this.player.x + 0.5) * cellW
    const py = y + (this.player.y + 0.5) * cellH
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

  private angleToDir(angle: number): Direction {
    const a = Phaser.Math.Angle.Wrap(angle)
    if (a > -Math.PI / 4 && a <= Math.PI / 4) return 'east'
    if (a > Math.PI / 4 && a <= (3 * Math.PI) / 4) return 'south'
    if (a <= -Math.PI / 4 && a > -(3 * Math.PI) / 4) return 'north'
    return 'west'
  }

  draw() {
    this.drawMiniMap()
  }

  update() {
    if (this.isMoving || this.isRotating) {
      this.draw()
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
    this.updateView()
    this.updateDebugText()
  }
}
