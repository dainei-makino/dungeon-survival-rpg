import * as THREE from 'three'
import armBox from '../../../assets/arms/arm-box.json'

export default class PlayerArms {
  private group: THREE.Group
  private leftUpper: THREE.Mesh
  private leftLower: THREE.Mesh
  private leftFist: THREE.Mesh
  private rightUpper: THREE.Mesh
  private rightLower: THREE.Mesh
  private rightFist: THREE.Mesh
  private spacing = 0.4
  private lowerDist = -0.06
  private fistDist = 0
  private baseLeftY = 0
  private baseRightY = 0

  constructor(camera: THREE.Camera) {
    this.group = new THREE.Group()

    const vertsPer = 24
    const idxPer = 36

    const partGeo = (i: number) => {
      const verts = armBox.vertices.slice(i * vertsPer * 3, (i + 1) * vertsPer * 3)
      const idx = armBox.indices
        .slice(i * idxPer, (i + 1) * idxPer)
        .map((v: number) => v - i * vertsPer)
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      g.setIndex(idx)
      g.computeVertexNormals()
      return g
    }

    const upperGeo = partGeo(2)
    const lowerGeo = partGeo(0)
    const fistGeo = partGeo(1)

    const armMat = new THREE.MeshBasicMaterial({ color: 0xdfcbbd })

    const makeArm = () => {
      const upper = new THREE.Mesh(upperGeo, armMat)
      const lower = new THREE.Mesh(lowerGeo, armMat)
      lower.position.y = this.lowerDist
      const fist = new THREE.Mesh(fistGeo, armMat)
      fist.position.y = this.fistDist
      lower.add(fist)
      upper.add(lower)
      return { upper, lower, fist }
    }

    const left = makeArm()
    const right = makeArm()

    this.leftUpper = left.upper
    this.leftLower = left.lower
    this.leftFist = left.fist
    this.rightUpper = right.upper
    this.rightLower = right.lower
    this.rightFist = right.fist

    this.leftUpper.rotation.x = 2.5
    this.leftUpper.rotation.z = 0.15
    this.rightUpper.rotation.x = 2.5
    this.rightUpper.rotation.z = -0.15
    const scale = 1.1

    this.leftUpper.scale.setScalar(scale)
    this.leftLower.scale.setScalar(scale)
    this.rightUpper.scale.setScalar(scale)
    this.rightLower.scale.setScalar(scale)

    this.leftUpper.position.set(-this.spacing, 0, -0.6)
    this.rightUpper.position.set(this.spacing, 0, -0.6)

    this.group.add(this.leftUpper)
    this.group.add(this.rightUpper)
    this.group.position.y = -0.6
    camera.add(this.group)
  }

  startSway() {
    this.baseLeftY = this.leftUpper.position.y
    this.baseRightY = this.rightUpper.position.y
  }

  sway(t: number) {
    const swing = Math.sin(t * Math.PI)
    const ampY = 0.03
    this.leftUpper.position.y = this.baseLeftY + swing * ampY
    this.rightUpper.position.y = this.baseRightY - swing * ampY
  }

  getSettings() {
    return {
      posY: this.group.position.y,
      upperRotX: this.leftUpper.rotation.x,
      lowerRotX: this.leftLower.rotation.x,
      rotZ: this.leftUpper.rotation.z,
      scale: this.leftUpper.scale.x,
      spacing: Math.abs(this.leftUpper.position.x),
      lowerDist: this.leftLower.position.y,
      fistDist: this.leftFist.position.y,
    }
  }

  update(settings: {
    posY?: number
    upperRotX?: number
    lowerRotX?: number
    rotZ?: number
    scale?: number
    spacing?: number
    lowerDist?: number
    fistDist?: number
  }) {

    if (settings.posY !== undefined) this.group.position.y = settings.posY
    if (settings.upperRotX !== undefined) {
      this.leftUpper.rotation.x = settings.upperRotX
      this.rightUpper.rotation.x = settings.upperRotX
    }
    if (settings.lowerRotX !== undefined) {
      this.leftLower.rotation.x = settings.lowerRotX
      this.rightLower.rotation.x = settings.lowerRotX
    }
    if (settings.rotZ !== undefined) {
      this.leftUpper.rotation.z = settings.rotZ
      this.rightUpper.rotation.z = -settings.rotZ
    }
    if (settings.scale !== undefined) {
      this.leftUpper.scale.setScalar(settings.scale)
      this.leftLower.scale.setScalar(settings.scale)
      this.rightUpper.scale.setScalar(settings.scale)
      this.rightLower.scale.setScalar(settings.scale)
    }

    if (settings.spacing !== undefined) {
      this.spacing = settings.spacing
      this.leftUpper.position.x = -this.spacing
      this.rightUpper.position.x = this.spacing
    }
    if (settings.lowerDist !== undefined) {
      this.lowerDist = settings.lowerDist
      this.leftLower.position.y = this.lowerDist
      this.rightLower.position.y = this.lowerDist
    }
    if (settings.fistDist !== undefined) {
      this.fistDist = settings.fistDist
      this.leftFist.position.y = this.fistDist
      this.rightFist.position.y = this.fistDist
    }
  }
}
