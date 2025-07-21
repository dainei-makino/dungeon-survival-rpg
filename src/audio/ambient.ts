import AmbientPadSynth from './AmbientPadSynth'
import AmbientMusicGenerator from './AmbientMusicGenerator'

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
const synth = new AmbientPadSynth(ctx)
const generator = new AmbientMusicGenerator(ctx, synth)

export function startAmbientBgm() {
  generator.start()
}

export function stopAmbientBgm() {
  generator.stop()
}
