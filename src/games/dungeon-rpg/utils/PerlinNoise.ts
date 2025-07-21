export default class PerlinNoise {
  private perm: number[]
  constructor(seed = Math.random()) {
    this.perm = new Array(512)
    const p = new Array(256).fill(0).map((_, i) => i)
    const rnd = this.mulberry32(Math.floor(seed * 0xffffffff))
    for (let i = 255; i >= 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255]
    }
  }

  private mulberry32(a: number) {
    return function () {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number) {
    switch (hash & 3) {
      case 0:
        return x + y
      case 1:
        return -x + y
      case 2:
        return x - y
      default:
        return -x - y
    }
  }

  noise2D(x: number, y: number) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    const topRight = this.perm[this.perm[X + 1] + Y + 1]
    const topLeft = this.perm[this.perm[X] + Y + 1]
    const bottomRight = this.perm[this.perm[X + 1] + Y]
    const bottomLeft = this.perm[this.perm[X] + Y]

    const u = this.fade(xf)
    const v = this.fade(yf)

    const x1 = this.lerp(u, this.grad(bottomLeft, xf, yf), this.grad(bottomRight, xf - 1, yf))
    const x2 = this.lerp(u, this.grad(topLeft, xf, yf - 1), this.grad(topRight, xf - 1, yf - 1))

    return (this.lerp(v, x1, x2) + 1) / 2
  }
}
