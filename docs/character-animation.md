# Character Animation Design

This project represents characters using simple 3D primitives such as cubes and rectangular boxes. 2D billboards are no longer used. Models are assembled from independent body parts so that animations can be reused across different characters.

## Body Part Definitions

Characters are built from the following joints and parts. Each part is represented by a `THREE.Object3D` instance so that transformations can be applied independently:

- `body`: main torso
- `head`
- `leftUpperArm`, `leftLowerArm`, `leftHand`
- `rightUpperArm`, `rightLowerArm`, `rightHand`
- `leftUpperLeg`, `leftLowerLeg`, `leftFoot`
- `rightUpperLeg`, `rightLowerLeg`, `rightFoot`

Additional joints can be defined as needed. Parts are connected in a hierarchy to mimic a simple skeleton.

## Vertex JSON / SVG Animation

Shapes for each part can be designed in SVG and converted to vertex JSON using the existing conversion script (`npm run convert-svgs`). The resulting JSON files contain vertex arrays that can be loaded into `THREE.BufferGeometry` objects. By keeping geometry for each part separate, the same animation data can be reused with different meshes.

Animations are expressed as keyframes that specify position, rotation and scale for each joint. Because joints are predetermined, an animation such as _shake shoulders_ or _jump_ can be authored once and applied to any character model that implements the same joint names.

A simple runtime `Animator` class is provided (see `src/games/animation/Animator.ts`). It takes a set of joints and a list of keyframes and interpolates transformations over time.

```ts
interface Keyframe {
  time: number;                       // milliseconds
  joints: Record<string, JointTransform>;
}
```

Keyframes are stored in JSON so that they can be shared or edited outside of the codebase.

## Usage Example

1. Load geometry for each body part from an SVG/JSON file.
2. Create an object hierarchy using the part names above.
3. Instantiate `Animator` with the joints and animation keyframes.
4. Call `animator.play()` to start and `animator.update()` each frame.

This design makes it possible to create common animations (walking, attacking, jumping) that work across multiple characters built from simple geometric parts.
