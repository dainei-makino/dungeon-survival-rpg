export default class PerlinNoise {
  private perm: number[]

  constructor(seed = 0) {
    const p = new Array(256).fill(0).map((_, i) => i)
    let n = seed
    const random = () => {
      n = (n * 9301 + 49297) % 233280
      return n / 233280
    }
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    this.perm = new Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255]
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)

    const u = this.fade(x)
    const v = this.fade(y)

    const A = this.perm[X] + Y
    const B = this.perm[X + 1] + Y

    return this.lerp(
      v,
      this.lerp(
        u,
        this.grad(this.perm[A], x, y),
        this.grad(this.perm[B], x - 1, y)
      ),
      this.lerp(
        u,
        this.grad(this.perm[A + 1], x, y - 1),
        this.grad(this.perm[B + 1], x - 1, y - 1)
      )
    )
  }
}
