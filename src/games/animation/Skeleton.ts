import * as THREE from 'three'

export class Bone {
  name: string
  object: THREE.Object3D
  children: Bone[] = []
  constructor(name: string, object?: THREE.Object3D) {
    this.name = name
    this.object = object || new THREE.Object3D()
  }
  addChild(b: Bone) {
    this.children.push(b)
    this.object.add(b.object)
  }
}

export default class Skeleton {
  root: Bone
  private bones: Record<string, Bone> = {}

  constructor(rootName = 'root') {
    this.root = new Bone(rootName, new THREE.Group())
    this.bones[rootName] = this.root
  }

  addBone(name: string, parentName = 'root'): Bone {
    const parent = this.bones[parentName]
    if (!parent) throw new Error(`parent bone ${parentName} not found`)
    const bone = new Bone(name)
    parent.addChild(bone)
    this.bones[name] = bone
    return bone
  }

  getBone(name: string): THREE.Object3D {
    const b = this.bones[name]
    if (!b) throw new Error(`bone ${name} not found`)
    return b.object
  }

  getJoints(): Record<string, THREE.Object3D> {
    const joints: Record<string, THREE.Object3D> = {}
    for (const [name, bone] of Object.entries(this.bones)) {
      joints[name] = bone.object
    }
    return joints
  }
}
