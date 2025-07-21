import Phaser from 'phaser'
import DungeonMap from './DungeonMap'
import Player, { Direction } from './Player'
import { animationSpeed, BASE_STEP_TIME_MS } from './config'
import Hero from './Hero'

export default class DungeonView {
  private scene: Phaser.Scene
  private map: DungeonMap
  private player: Player
  private hero: Hero
  private keys: Record<string, Phaser.Input.Keyboard.Key>
  private dirVectors: Record<Direction, { dx: number; dy: number; left: { dx: number; dy: number }; right: { dx: number; dy: number } }>
  private debugText: Phaser.GameObjects.Text
  private tiles: Phaser.GameObjects.Rectangle[][] = []
  private playerMarker: Phaser.GameObjects.Triangle
  private readonly tileSize = 32
  private readonly moveDuration = (BASE_STEP_TIME_MS * animationSpeed) / 3
  private isMoving = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.map = new DungeonMap()
    this.player = new Player(this.map.playerStart)
    this.hero = new Hero()
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

    this.createTiles()
    this.createPlayerMarker()
    this.updateDebugText()
  }

  private createTiles() {
    for (let r = 0; r < this.map.height; r++) {
      this.tiles[r] = []
      for (let c = 0; c < this.map.width; c++) {
        const cell = this.tileAt(c, r)
        const color = cell === '#' ? 0x666666 : 0x333333
        const rect = this.scene.add.rectangle(
          c * this.tileSize + this.tileSize / 2,
          r * this.tileSize + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          color
        )
        rect.setStrokeStyle(1, 0x000000, 0.1)
        rect.setOrigin(0.5, 0.5)
        this.tiles[r][c] = rect
      }
    }
  }

  private createPlayerMarker() {
    const s = this.tileSize
    this.playerMarker = this.scene.add.triangle(0, 0, 0, s, s / 2, 0, s, s, 0xff0000)
    this.playerMarker.setOrigin(0.5, 0.5)
    this.updatePlayerMarker()
  }

  private updatePlayerMarker() {
    const dirAngles: Record<Direction, number> = {
      north: -90,
      east: 0,
      south: 90,
      west: 180,
    }
    this.playerMarker.x = this.player.x * this.tileSize + this.tileSize / 2
    this.playerMarker.y = this.player.y * this.tileSize + this.tileSize / 2
    this.playerMarker.setRotation(Phaser.Math.DegToRad(dirAngles[this.player.dir]))
  }

  private updateDebugText() {
    const pressed = Object.entries(this.keys)
      .filter(([, key]) => key.isDown)
      .map(([name]) => name)
      .join(' ')
    this.debugText.setText(
      `Keys: ${pressed}\n` +
        `Pos: ${this.player.x},${this.player.y}\n` +
        `Dir: ${this.player.dir}\n` +
        `HP: ${this.hero.hp}\n` +
        `STR: ${this.hero.strength}`
    )
    this.debugText.setPosition(this.scene.scale.width - 10, 10)
  }

  private tileAt(x: number, y: number): string {
    return this.map.tileAt(x, y)
  }

  private startMove(nx: number, ny: number) {
    this.isMoving = true
    const startX = this.playerMarker.x
    const startY = this.playerMarker.y
    const endX = nx * this.tileSize + this.tileSize / 2
    const endY = ny * this.tileSize + this.tileSize / 2
    this.player.x = nx
    this.player.y = ny
    this.scene.tweens.add({
      targets: this.playerMarker,
      x: endX,
      y: endY,
      duration: this.moveDuration,
      onUpdate: () => {
        this.updateDebugText()
      },
      onComplete: () => {
        this.isMoving = false
        this.updatePlayerMarker()
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
    this.player.dir = this.rotateDir(this.player.dir, delta)
    this.updatePlayerMarker()
    this.updateDebugText()
  }

  draw() {
    this.updatePlayerMarker()
  }

  update() {
    if (this.isMoving) {
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

    this.updateDebugText()
  }
}
