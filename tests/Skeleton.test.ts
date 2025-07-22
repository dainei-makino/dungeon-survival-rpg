import assert from 'assert'
import Skeleton from '../src/games/animation/Skeleton'

async function run() {
  const skel = new Skeleton()
  const spine = skel.addBone('spine')
  const head = skel.addBone('head', 'spine')
  assert.ok(skel.getBone('head').parent === spine.object)
  const joints = skel.getJoints()
  assert.ok(joints.head === head.object)
  console.log('Skeleton test passed')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
