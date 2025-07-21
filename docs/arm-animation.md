# Player Arm Animation Guide

This project includes a `PlayerArms` component that renders the hero's arms in
first‑person view. To create reusable animations for the arms, keyframes can be
stored in JSON files and loaded at runtime.

## Joints

`PlayerArms` exposes its internal meshes with the following joint names:

- `leftUpperArm`
- `leftLowerArm`
- `leftHand`
- `rightUpperArm`
- `rightLowerArm`
- `rightHand`

These identifiers are used in animation keyframes.

## Keyframe Format

Arm animations are described by an array of keyframes. Each keyframe includes a
`time` in milliseconds and optional transforms for any joints.

```json
[
  {
    "time": 0,
    "joints": {
      "leftUpperArm": { "rotation": [2.5, 0, 0] }
    }
  }
]
```

Transforms can specify `position`, `rotation`, and `scale` as three element
arrays. Rotations are expressed in radians.

Keyframes are loaded with `loadKeyframes()` and played using the generic
`Animator` class.

## Example

1. Place JSON files under `src/assets/arms/animations/`.
2. Load the keyframes:

```ts
import Animator from '../animation/Animator'
import { loadKeyframes } from '../animation/loadKeyframes'
import PlayerArms from './PlayerArms'

const arms = new PlayerArms(camera)
const keyframes = await loadKeyframes('assets/arms/animations/raise_hands.json')
const animator = new Animator(arms.getJoints(), keyframes)
animator.play()
```

This design allows new motions—such as waving, raising both hands or grabbing
objects—to be authored in JSON without changing code.
