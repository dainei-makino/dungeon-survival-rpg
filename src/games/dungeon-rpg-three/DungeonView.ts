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

  constructor(container: HTMLElement) {
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

    this.buildScene()
    this.updateCamera()
  }

  private buildScene() {
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 })
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.map.width, this.map.height),
      floorMaterial
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(this.map.width / 2, 0, this.map.height / 2)
    this.scene.add(floor)

    const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 })
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(this.map.width, this.map.height),
      ceilingMaterial
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(this.map.width / 2, 2, this.map.height / 2)
    this.scene.add(ceiling)

    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
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
  }

  private angleForDir(dir: Direction): number {
    switch (dir) {
      case 'north':
        return Math.PI
      case 'east':
        return -Math.PI / 2
      case 'south':
        return 0
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
