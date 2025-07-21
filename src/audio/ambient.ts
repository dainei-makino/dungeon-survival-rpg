import AmbientPadSynth, { AmbientPatch } from './AmbientPadSynth'
import AmbientMusicGenerator from './AmbientMusicGenerator'

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
const patches: AmbientPatch[] = ['saw', 'triangle', 'square', 'noise']
const patch = patches[Math.floor(Math.random() * patches.length)]
const synth = new AmbientPadSynth(ctx, patch)
const generator = new AmbientMusicGenerator(ctx, synth)

export function startAmbientBgm() {
  generator.start()
}

export function stopAmbientBgm() {
  generator.stop()
}
