import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'

function tileablePerlin(noise: ImprovedNoise, x: number, y: number, size: number, scale: number, z: number): number {
  const u = x / size
  const v = y / size
  const w = size / scale
  const nx = x / scale
  const ny = y / scale
  const n00 = noise.noise(nx, ny, z)
  const n10 = noise.noise(nx - w, ny, z)
  const n01 = noise.noise(nx, ny - w, z)
  const n11 = noise.noise(nx - w, ny - w, z)
  return n00 * (1 - u) * (1 - v) + n10 * u * (1 - v) + n01 * (1 - u) * v + n11 * u * v
}

export function perlinTexture(size = 256, base = 30, range = 50, scale = 50) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const imgData = ctx.createImageData(size, size)
  const noise = new ImprovedNoise()
  const z = Math.random() * 100
  let i = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = tileablePerlin(noise, x, y, size, scale, z)
      const c = Math.floor(base + (v + 1) * range)
      imgData.data[i++] = c
      imgData.data[i++] = c
      imgData.data[i++] = c
      imgData.data[i++] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function perlinTextureColor(
  size = 256,
  base: { r: number; g: number; b: number },
  range: { r: number; g: number; b: number },
  scale = 50
) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const imgData = ctx.createImageData(size, size)
  const noise = new ImprovedNoise()
  const z = Math.random() * 100
  let i = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = tileablePerlin(noise, x, y, size, scale, z)
      imgData.data[i++] = Math.floor(base.r + (v + 1) * range.r)
      imgData.data[i++] = Math.floor(base.g + (v + 1) * range.g)
      imgData.data[i++] = Math.floor(base.b + (v + 1) * range.b)
      imgData.data[i++] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function floorTexture() {
  return perlinTextureColor(256, { r: 80, g: 60, b: 40 }, { r: 30, g: 20, b: 15 }, 40)
}

export function swampTexture() {
  return perlinTextureColor(256, { r: 40, g: 50, b: 40 }, { r: 20, g: 20, b: 20 }, 40)
}

export function treeTexture(scale: number) {
  return perlinTextureColor(256, { r: 70, g: 40, b: 20 }, { r: 40, g: 30, b: 20 }, scale)
}

export function wallTexture(scale: number) {
  return perlinTextureColor(256, { r: 70, g: 70, b: 70 }, { r: 50, g: 50, b: 50 }, scale)
}

export function checkerTexture(color1: string, color2: string, squares = 8) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const s = size / squares
  for (let y = 0; y < squares; y++) {
    for (let x = 0; x < squares; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? color1 : color2
      ctx.fillRect(x * s, y * s, s, s)
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function darkSkyTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    10,
    size / 2,
    size / 2,
    size / 2
  )
  grad.addColorStop(0, '#222')
  grad.addColorStop(1, '#000')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = '#fff'
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 1.5
    ctx.fillRect(x, y, r, r)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

