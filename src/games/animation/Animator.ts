import * as THREE from 'three'

export interface JointTransform {
  position?: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
}

export interface Keyframe {
  // time in milliseconds
  time: number
  joints: Record<string, JointTransform>
}

export default class Animator {
  private joints: Record<string, THREE.Object3D>
  private keyframes: Keyframe[]
  private startTime: number | null = null
  private duration = 0

  constructor(joints: Record<string, THREE.Object3D>, keyframes: Keyframe[]) {
    this.joints = joints
    this.keyframes = keyframes.sort((a, b) => a.time - b.time)
    if (this.keyframes.length > 0) {
      this.duration = this.keyframes[this.keyframes.length - 1].time
    }
  }

  play() {
    this.startTime = performance.now()
  }

  update() {
    if (this.startTime === null || this.keyframes.length === 0) return
    const elapsed = (performance.now() - this.startTime) % this.duration

    let i = 0
    while (i < this.keyframes.length - 1 && elapsed >= this.keyframes[i + 1].time) {
      i++
    }
    const kf1 = this.keyframes[i]
    const kf2 = this.keyframes[(i + 1) % this.keyframes.length]
    const blend = (elapsed - kf1.time) / (kf2.time - kf1.time)

    Object.keys(this.joints).forEach((name) => {
      const obj = this.joints[name]
      const t1 = kf1.joints[name]
      const t2 = kf2.joints[name]
      if (!t1 || !t2) return
      if (t1.position && t2.position) {
        obj.position.lerpVectors(t1.position, t2.position, blend)
      }
      if (t1.rotation && t2.rotation) {
        obj.rotation.set(
          THREE.MathUtils.lerp(t1.rotation.x, t2.rotation.x, blend),
          THREE.MathUtils.lerp(t1.rotation.y, t2.rotation.y, blend),
          THREE.MathUtils.lerp(t1.rotation.z, t2.rotation.z, blend)
        )
      }
      if (t1.scale && t2.scale) {
        obj.scale.copy(t1.scale.clone().lerp(t2.scale, blend))
      }
    })
  }
}
