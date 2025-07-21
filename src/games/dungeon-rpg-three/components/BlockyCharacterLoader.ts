import * as THREE from 'three'

export type FaceDirection =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'

export interface BoxPartSpec {
  name: string
  size: [number, number, number]
  position: [number, number, number]
  color?: string
  textures?: Partial<Record<FaceDirection, string>>
}

export interface CharacterSpec {
  voxelHeight?: number
  parts: BoxPartSpec[]
}

export default class BlockyCharacterLoader {
  private url: string
  private material?: THREE.Material
  private textureLoader = new THREE.TextureLoader()

  constructor(url: string, material?: THREE.Material) {
    this.url = url
    this.material = material
  }

  async load(): Promise<THREE.Group> {
    const res = await fetch(this.url)
    const spec: CharacterSpec = await res.json()
    return this.fromSpec(spec)
  }

  fromSpec(spec: CharacterSpec): THREE.Group {
    const group = new THREE.Group()
    ;(group.userData.parts ||= {})
    const baseUrl = this.url.substring(0, this.url.lastIndexOf('/') + 1)
    if (typeof spec.voxelHeight === 'number') {
      group.userData.voxelHeight = spec.voxelHeight
    }
    spec.parts.forEach((p) => {
      const geom = new THREE.BoxGeometry(...p.size)
      const color = p.color ? new THREE.Color(p.color) : new THREE.Color(0xcccccc)
      let mesh: THREE.Mesh
      if (p.textures) {
        const dirIndex: Record<FaceDirection, number> = {
          right: 0,
          left: 1,
          top: 2,
          bottom: 3,
          front: 4,
          back: 5,
        }
        const materials: THREE.Material[] = []
        const defaultMat = new THREE.MeshLambertMaterial({ color })
        ;(['right', 'left', 'top', 'bottom', 'front', 'back'] as FaceDirection[]).forEach((dir) => {
          const texPath = p.textures![dir]
          if (texPath) {
            const url = new URL(texPath, baseUrl).href
            const tex = this.textureLoader.load(url)
            materials[dirIndex[dir]] = new THREE.MeshLambertMaterial({ map: tex })
          } else {
            materials[dirIndex[dir]] = defaultMat
          }
        })
        mesh = new THREE.Mesh(geom, materials)
      } else {
        const mat = this.material || new THREE.MeshLambertMaterial({ color })
        mesh = new THREE.Mesh(geom, mat)
      }
      mesh.position.set(...p.position)
      group.add(mesh)
      group.userData.parts[p.name] = mesh
    })
    return group
  }
}
