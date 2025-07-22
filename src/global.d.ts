declare module '*.json' {
  const value: any
  export default value
}

declare module 'three' {
  interface Object3D {
    parts?: Record<string, THREE.Object3D>
    skeleton?: any
  }
}

