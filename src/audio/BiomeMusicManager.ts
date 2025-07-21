import MasterOutput from './MasterOutput'
import BasicSynth from './BasicSynth'
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
    const padSynth = new BasicSynth({
      context: this.master.context,
      destination: this.master.input,
      eqFilters: [
        { type: 'highpass', frequency: 80 },
        { type: 'lowpass', frequency: 12000 },
      ],
      reverbDuration: music?.reverb ? 2 : undefined,
    })
    const pianoSynth = new BasicSynth({
      context: this.master.context,
      destination: this.master.input,
      eqFilters: [
        { type: 'highpass', frequency: 120 },
        { type: 'lowpass', frequency: 8000 },
      ],
      reverbDuration: music?.reverb ? 2 : undefined,
    })
    this.pad = new Pad(padSynth)
    this.piano = new Piano(pianoSynth)
    this.generator = new MusicGenerator(this.pad)
  }

  start() {
    if (!this.current || !this.generator || !this.pad || !this.piano) return
    const tracks = MusicGenerator.generateFixedTracks([this.pad, this.piano])
    this.master.master.gain.cancelScheduledValues(this.master.context.currentTime)
    const g = this.master.master.gain
    g.setValueAtTime(0, this.master.context.currentTime)
    g.linearRampToValueAtTime(0.05, this.master.context.currentTime + 15)
    MusicGenerator.playTracks(tracks)
  }
}
