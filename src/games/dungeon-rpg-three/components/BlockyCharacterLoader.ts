import * as THREE from 'three'

export interface BoxPartSpec {
  name: string
  size: [number, number, number]
  position: [number, number, number]
}

export interface CharacterSpec {
  voxelHeight?: number
  parts: BoxPartSpec[]
}

export default class BlockyCharacterLoader {
  private url: string
  private material?: THREE.Material

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
    const mat = this.material || new THREE.MeshLambertMaterial({ color: 0xcccccc })
    ;(group.userData.parts ||= {})
    if (typeof spec.voxelHeight === 'number') {
      group.userData.voxelHeight = spec.voxelHeight
    }
    spec.parts.forEach((p) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...p.size), mat)
      mesh.position.set(...p.position)
      group.add(mesh)
      group.userData.parts[p.name] = mesh
    })
    return group
  }
}
