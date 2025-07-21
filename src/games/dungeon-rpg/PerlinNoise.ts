export function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function lerp(a: number, b: number, t: number) {
  return a + t * (b - a)
}

function gradient(ix: number, iy: number) {
  const r = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453
  const angle = (r - Math.floor(r)) * Math.PI * 2
  return { x: Math.cos(angle), y: Math.sin(angle) }
}

function dotGridGradient(ix: number, iy: number, x: number, y: number) {
  const g = gradient(ix, iy)
  return x * g.x + y * g.y
}

function perlinBase(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const n00 = dotGridGradient(ix, iy, fx, fy)
  const n10 = dotGridGradient(ix + 1, iy, fx - 1, fy)
  const n01 = dotGridGradient(ix, iy + 1, fx, fy - 1)
  const n11 = dotGridGradient(ix + 1, iy + 1, fx - 1, fy - 1)

  const u = fade(fx)
  const v = fade(fy)

  const nx0 = lerp(n00, n10, u)
  const nx1 = lerp(n01, n11, u)
  const nxy = lerp(nx0, nx1, v)

  return nxy * 0.5 + 0.5
}

export default function perlin(x: number, y: number, octaves = 4, persistence = 0.5) {
  let total = 0
  let frequency = 1
  let amplitude = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    total += perlinBase(x * frequency, y * frequency) * amplitude
    max += amplitude
    amplitude *= persistence
    frequency *= 2
  }
  return total / max
}
