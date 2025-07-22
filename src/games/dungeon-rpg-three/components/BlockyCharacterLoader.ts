import * as THREE from 'three'
import Skeleton from '../../animation/Skeleton'

export type FaceDirection =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'

export interface PartSpec {
  name: string
  position: [number, number, number]
  parent?: string
  size?: [number, number, number]
  mesh?: string
  scale?: [number, number, number]
  color?: string
  textures?: Partial<Record<FaceDirection, string>>
}

export interface CharacterSpec {
  voxelHeight?: number
  parts: PartSpec[]
}

export default class BlockyCharacterLoader {
  private url: string
  private material?: THREE.Material
  private textureLoader = new THREE.TextureLoader()

  constructor(url = '', material?: THREE.Material) {
    this.url = url
    this.material = material
  }

  async load(): Promise<THREE.Group> {
    const res = await fetch(this.url)
    const spec: CharacterSpec = await res.json()
    return this.fromSpec(spec)
  }

  async fromSpec(spec: CharacterSpec, baseUrl?: string): Promise<THREE.Group> {
    const skeleton = new Skeleton()
    const group = skeleton.root.object as THREE.Group
    ;(group.userData.parts ||= {})
    group.userData.skeleton = skeleton
    let urlBase = baseUrl || this.url.substring(0, this.url.lastIndexOf('/') + 1)
    if (!urlBase && typeof window !== 'undefined') {
      urlBase = window.location.origin + '/'
    }
    if (typeof spec.voxelHeight === 'number') {
      group.userData.voxelHeight = spec.voxelHeight
    }
    if (!Array.isArray(spec.parts)) {
      return group
    }
    for (const p of spec.parts) {
      let geom: THREE.BufferGeometry | THREE.BoxGeometry
      if (p.mesh) {
        try {
          const url = new URL(p.mesh, urlBase).href
          const resp = await fetch(url)
          const data: { vertices: number[]; indices: number[] } = await resp.json()
          geom = new THREE.BufferGeometry()
          geom.setAttribute('position', new THREE.Float32BufferAttribute(data.vertices, 3))
          geom.setIndex(data.indices)
          geom.computeVertexNormals()
        } catch {
          continue
        }
      } else if (p.size) {
        geom = new THREE.BoxGeometry(...p.size)
      } else {
        continue
      }
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
            try {
              const url = new URL(texPath, urlBase).href
              const tex = this.textureLoader.load(url)
              materials[dirIndex[dir]] = new THREE.MeshLambertMaterial({ map: tex })
            } catch {
              materials[dirIndex[dir]] = defaultMat
            }
          } else {
            materials[dirIndex[dir]] = defaultMat
          }
        })
        mesh = new THREE.Mesh(geom, materials)
      } else {
        const mat = this.material || new THREE.MeshLambertMaterial({ color })
        mesh = new THREE.Mesh(geom, mat)
      }
      const bone = skeleton.addBone(p.name, p.parent)
      bone.object.position.set(...p.position)
      if (p.scale) {
        bone.object.scale.set(...p.scale)
      }
      bone.object.add(mesh)
      group.userData.parts[p.name] = bone.object
    }
    return group
  }
}
