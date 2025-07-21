import AmbientPadSynth, { AmbientPatch } from './AmbientPadSynth'
import AmbientMusicGenerator from './AmbientMusicGenerator'

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
const synth = new AmbientPadSynth(ctx, 'triangle')
const generator = new AmbientMusicGenerator(ctx, synth)

const biomeConfigs: Record<string, { patch: AmbientPatch; scale: number[]; root: number; noise: number }> = {
  forest: { patch: 'triangle', scale: [0, 2, 5, 7, 9], root: 220, noise: 0.1 },
  cave: { patch: 'noise', scale: [0, 3, 5, 7, 10], root: 110, noise: 0.4 },
  plain: { patch: 'saw', scale: [0, 2, 4, 7, 9], root: 220, noise: 0.4 }
}

export async function setAmbientBiome(name: string, bridge = true) {
  const cfg = biomeConfigs[name]
  if (!cfg) return
  if (bridge) {
    await generator.playBridge()
  }
  synth.setPatch(cfg.patch)
  generator.setScale(cfg.scale)
  generator.setRoot(cfg.root)
  synth.setNoiseLevel(cfg.noise)
  synth.setMasterGain(0.03, 1)
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
