import AmbientPadSynth, { AmbientPatch, ADSR } from './AmbientPadSynth'
import AmbientMusicGenerator from './AmbientMusicGenerator'

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
const synth = new AmbientPadSynth(ctx, 'triangle')
const generator = new AmbientMusicGenerator(ctx, synth)

const biomeConfigs: Record<string, {
  patch: AmbientPatch | AmbientPatch[]
  scales: number[][]
  root: number
  noise: number
  decay: number
  intensity: number
  envelope?: Partial<ADSR>
  noteLength?: number
}> = {
  forest: {
    patch: ['triangle', 'saw', 'woodbass'],
    scales: [[0, 2, 5, 7, 9], [0, 4, 5, 7, 11]],
    root: 220,
    noise: 0.05,
    decay: 12,
    intensity: 0.3,
    envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 12 },
    noteLength: 0.2
  },
  cave: {
    patch: 'noise',
    scales: [[0, 3, 5, 7, 10], [0, 2, 5, 7, 9]],
    root: 110,
    noise: 0.4,
    decay: 6,
    intensity: 0.4
  },
  plain: {
    patch: 'saw',
    scales: [[0, 2, 4, 7, 9], [0, 2, 5, 7, 9]],
    root: 220,
    noise: 0.2,
    decay: 8,
    intensity: 0.6
  }
}

export async function setAmbientBiome(name: string, bridge = true) {
  const cfg = biomeConfigs[name]
  if (!cfg) return
  if (bridge) {
    await generator.playBridge()
  }
  synth.setPatch(cfg.patch)
  if (cfg.envelope) synth.setEnvelope(cfg.envelope)
  generator.setScales(cfg.scales)
  generator.setRoot(cfg.root)
  synth.setNoiseLevel(cfg.noise)
  synth.setDecay(cfg.decay)
  generator.setIntensity(cfg.intensity)
  if (cfg.noteLength !== undefined) generator.setNoteValue(cfg.noteLength)
  synth.setMasterGain(0.03, 15)
  generator.start()
}

export function setAmbientIntensity(level: number) {
  generator.setIntensity(level)
}

export async function startAmbientBgm() {
  await setAmbientBiome('forest', false)
  await generator.playIntro()
}

export function stopAmbientBgm() {
  generator.stop()
}
