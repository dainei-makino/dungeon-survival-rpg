import AmbientPadSynth from './AmbientPadSynth'

export default class AmbientMusicGenerator {
  private timer: number | null = null
  private scale = [0, 3, 5, 7, 10]
  private chordIntervalMs = 4000
  private noteDuration = 8

  constructor(private ctx: AudioContext, private synth: AmbientPadSynth, private root = 220) {}

  start() {
    if (this.timer !== null) return
    this.schedule()
  }

  stop() {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private schedule() {
    const rootIndex = Math.floor(Math.random() * this.scale.length)
    const degrees = [0, 2, 4]
    for (const d of degrees) {
      const semitone = this.scale[(rootIndex + d) % this.scale.length]
      const freq = this.root * Math.pow(2, semitone / 12)
      this.synth.playNote(freq, this.noteDuration)
    }
    this.timer = window.setTimeout(() => this.schedule(), this.chordIntervalMs)
  }
}
