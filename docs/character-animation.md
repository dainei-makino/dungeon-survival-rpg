# Character Animation Design

This project stores character meshes as vertex JSON generated from SVG data. To apply animations consistently, a common set of joints and body parts is defined for every character. Animations reference these joint names so they can be reused across models.

## Skeleton and Joint Names

Each character contains a hierarchy of joints. The following names are reserved:

- `root`
- `torso`
- `head`
- `leftShoulder`
- `leftElbow`
- `leftHand`
- `rightShoulder`
- `rightElbow`
- `rightHand`
- `leftHip`
- `leftKnee`
- `leftFoot`
- `rightHip`
- `rightKnee`
- `rightFoot`

A model may omit joints it does not use, but when present the joint should keep the same name. Every joint stores its pivot position relative to its parent.

## Animation Clips

Animations are described as JSON files containing keyframes. Each keyframe records the time (in seconds) and a partial pose for one or more joints.

Example:

```json
{
  "loop": true,
  "keyframes": [
    { "time": 0, "pose": { "leftShoulder": { "rotation": [0, 0, 0] } } },
    { "time": 0.5, "pose": { "leftShoulder": { "rotation": [0, 0.2, 0] } } },
    { "time": 1, "pose": { "leftShoulder": { "rotation": [0, 0, 0] } } }
  ]
}
```

By sharing the same joint names, animations such as shoulder sway or a jump can be applied to any character that implements this skeleton.

## Animator Class

The `Animator` class under `src/games/dungeon-rpg-three/components` manages playback of these animation clips. Pass it a map of joint objects when constructing. Call `play` with a clip and `update` each frame to interpolate joint transforms.

## Asset Workflow

1. Create body-part SVGs under `src/assets/.../svg`.
2. Run `npm run convert-svgs` to generate vertex JSON files.
3. Build a character by attaching the parts to joints defined above.
4. Create animation JSON referencing the joint names.

This approach keeps animations portable across characters and allows simple definitions for motions like jumping or idling.
