import * as THREE from 'three'
import { Keyframe, JointTransform } from './Animator'

export interface KeyframeJSON {
  time: number
  joints: Record<string, {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
  }>
}

export async function loadKeyframes(url: string): Promise<Keyframe[]> {
  const resp = await fetch(url)
  const data: KeyframeJSON[] = await resp.json()
  return data.map((kf) => {
    const joints: Record<string, JointTransform> = {}
    for (const [name, t] of Object.entries(kf.joints)) {
      const jt: JointTransform = {}
      if (t.position) jt.position = new THREE.Vector3(...t.position)
      if (t.rotation) jt.rotation = new THREE.Euler(...t.rotation)
      if (t.scale) jt.scale = new THREE.Vector3(...t.scale)
      joints[name] = jt
    }
    return { time: kf.time, joints }
  })
}
