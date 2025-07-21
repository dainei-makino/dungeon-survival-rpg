import * as THREE from 'three'

export interface JointMap {
  [name: string]: THREE.Object3D
}

export interface JointPose {
  position?: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
}

export interface AnimationKeyframe {
  time: number
  pose: { [joint: string]: JointPose }
}

export interface AnimationClip {
  loop: boolean
  keyframes: AnimationKeyframe[]
}

export default class Animator {
  private current?: AnimationClip
  private startTime = 0

  constructor(private joints: JointMap) {}

  play(clip: AnimationClip) {
    this.current = clip
    this.startTime = performance.now()
  }

  update() {
    if (!this.current) return
    const { keyframes, loop } = this.current
    if (keyframes.length === 0) return
    const elapsed = (performance.now() - this.startTime) / 1000
    const duration = keyframes[keyframes.length - 1].time
    let t = elapsed
    if (loop) {
      t %= duration
    } else {
      t = Math.min(elapsed, duration)
    }
    let idx = 1
    while (idx < keyframes.length && keyframes[idx].time < t) idx++
    const prev = keyframes[idx - 1]
    const next = keyframes[idx] || prev
    const span = next.time - prev.time || 1
    const f = (t - prev.time) / span

    const apply = (obj: THREE.Object3D, a?: JointPose, b?: JointPose) => {
      if (a?.rotation || b?.rotation) {
        const q1 = a?.rotation
          ? new THREE.Quaternion().setFromEuler(a.rotation)
          : obj.quaternion
        const q2 = b?.rotation
          ? new THREE.Quaternion().setFromEuler(b.rotation)
          : obj.quaternion
        obj.quaternion.copy(q1).slerp(q2, f)
      }
      if (a?.position || b?.position) {
        const v1 = a?.position || obj.position
        const v2 = b?.position || obj.position
        obj.position.set(
          v1.x + (v2.x - v1.x) * f,
          v1.y + (v2.y - v1.y) * f,
          v1.z + (v2.z - v1.z) * f,
        )
      }
      if (a?.scale || b?.scale) {
        const s1 = a?.scale || obj.scale
        const s2 = b?.scale || obj.scale
        obj.scale.set(
          s1.x + (s2.x - s1.x) * f,
          s1.y + (s2.y - s1.y) * f,
          s1.z + (s2.z - s1.z) * f,
        )
      }
    }

    Object.keys(this.joints).forEach((name) => {
      const obj = this.joints[name]
      const poseA = prev.pose[name]
      const poseB = next.pose[name]
      if (poseA || poseB) apply(obj, poseA, poseB)
    })
  }
}
