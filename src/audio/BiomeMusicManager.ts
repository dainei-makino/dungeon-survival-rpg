import MasterOutput from './MasterOutput'
import BasicSynth, { BasicSynthOptions } from './BasicSynth'
import MusicGenerator from './MusicGenerator'
import Piano from './instruments/Piano'
import Pad from './instruments/Pad'
import { Biome } from '../games/world/biomes'

export default class BiomeMusicManager {
  private master: MasterOutput
  private pad?: Pad
  private piano?: Piano
  private generator?: MusicGenerator
  private current?: Biome

  constructor(master?: MasterOutput) {
    this.master = master ?? new MasterOutput()
  }

  setBiome(biome: Biome) {
    this.current = biome
    const music = biome.music
    const common: Partial<BasicSynthOptions> = {
      context: this.master.context,
      destination: this.master.input,
      reverbDuration: music?.reverb ? 2 : undefined,
    }
    const padSynth = new BasicSynth({
      ...common,
      eqFilters: [
        { type: 'highpass', frequency: 80 },
        { type: 'lowpass', frequency: 12000 },
      ],
      attack: biome.name === 'forest' ? 1 : 0.05,
      release: biome.name === 'forest' ? 3 : 0.5,
    })
    const pianoSynth = new BasicSynth({
      ...common,
      eqFilters: [
        { type: 'highpass', frequency: 120 },
        { type: 'lowpass', frequency: 8000 },
      ],
      attack: biome.name === 'forest' ? 0.3 : 0.01,
      release: biome.name === 'forest' ? 2 : 0.3,
    })
    this.pad = new Pad(padSynth)
    this.piano = new Piano(pianoSynth)
    this.generator = new MusicGenerator(this.pad, { tempo: music?.tempo })
  }

  async start() {
    if (!this.current || !this.generator || !this.pad || !this.piano) return
    if (this.master.context.state === 'suspended') {
      await this.master.context.resume()
    }
    const tracks = MusicGenerator.generateFixedTracks(
      [this.pad, this.piano],
      this.current.music?.tempo
    )
    this.master.master.gain.cancelScheduledValues(this.master.context.currentTime)
    const g = this.master.master.gain
    g.setValueAtTime(0, this.master.context.currentTime)
    g.linearRampToValueAtTime(0.05, this.master.context.currentTime + 15)
    MusicGenerator.playTracks(tracks)
  }
}
