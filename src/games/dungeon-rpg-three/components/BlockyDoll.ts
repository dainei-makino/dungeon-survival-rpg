import * as THREE from 'three'

export default function createBlockyDoll(): THREE.Group {
  const group = new THREE.Group()
  const material = new THREE.MeshLambertMaterial({ color: 0xcccccc })

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), material)
  head.position.y = 0.9
  group.add(head)

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.2), material)
  body.position.y = 0.45
  group.add(body)

  const armGeo = new THREE.BoxGeometry(0.15, 0.5, 0.15)
  const leftArm = new THREE.Mesh(armGeo, material)
  leftArm.position.set(-0.275, 0.45, 0)
  group.add(leftArm)

  const rightArm = new THREE.Mesh(armGeo, material)
  rightArm.position.set(0.275, 0.45, 0)
  group.add(rightArm)

  const legGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15)
  const leftLeg = new THREE.Mesh(legGeo, material)
  leftLeg.position.set(-0.1, -0.05, 0)
  group.add(leftLeg)

  const rightLeg = new THREE.Mesh(legGeo, material)
  rightLeg.position.set(0.1, -0.05, 0)
  group.add(rightLeg)

  return group
}
