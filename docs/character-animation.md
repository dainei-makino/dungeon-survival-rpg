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

## Skeleton Class

Version 2 introduces a small `Skeleton` helper (see `src/games/animation/Skeleton.ts`).
It manages a collection of named bones implemented as `THREE.Object3D` nodes.
Bones can be added dynamically and queried through `getJoints()` which returns
a record of bone objects keyed by name. `BlockyCharacterLoader` now builds
characters using this skeleton so that animations can operate on the bones
directly.

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

## JSON Character Format

Characters made from cubes can be described in external JSON files. Each file includes
a `voxelHeight` property indicating how many vertical map cells the character occupies
and an array of parts with a body part name, box size and offset.  Parts may also
specify a display color or textures for individual faces:

```json
{
  "voxelHeight": 3,
  "parts": [
    {
      "name": "head",
      "size": [0.3, 0.3, 0.3],
      "position": [0, 0.9, 0],
      "color": "#ffd4aa",
      "textures": { "front": "./face.png" }
    }
  ]
}
```

`BlockyCharacterLoader` reads this JSON at runtime and creates a group of meshes.
The `name` attribute must match one of the body part identifiers above so that
animations can be applied generically.

If a `color` is provided, that color will be used for all faces of the box. When
`textures` are specified, each face can have a different texture using the keys
`front`, `back`, `left`, `right`, `top` and `bottom`. Missing entries fall back
to the part's color or a default gray.
