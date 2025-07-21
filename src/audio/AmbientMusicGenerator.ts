import AmbientPadSynth from './AmbientPadSynth'

export default class AmbientMusicGenerator {
  private timer: number | null = null
  private longTermScales = [
    [0, 3, 5, 7, 10],
    [0, 2, 5, 7, 9],
    [0, 3, 6, 8, 10]
  ]
  private midTermProgression = [0, 5, -3, 7]
  private chordIntervalMs = 4000
  private noteDuration = 8
  private intensity = 0

  private chordCount = 0
  private chordsPerMidTerm = 8
  private midTermIndex = 0
  private midTermsPerLongTerm = 4
  private longTermIndex = 0

  private readonly defaultGain = 0.03

  constructor(
    private ctx: AudioContext,
    private synth: AmbientPadSynth,
    private root = 220
  ) {}

  setRoot(root: number) {
    this.root = root
  }

  setScale(scale: number[]) {
    this.longTermScales = [scale]
    this.longTermIndex = 0
  }

  setIntensity(level: number) {
    this.intensity = Math.max(0, Math.min(1, level))
    this.chordIntervalMs = Math.max(800, 4000 - 3200 * this.intensity)
    this.noteDuration = Math.max(4, 8 - 4 * this.intensity)
  }

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

  async playIntro(fadeSec = 15) {
    this.stop()
    this.synth.setMasterGain(0, 0)
    const steps = [0, 2, 4, 2]
    for (const s of steps) {
      const freq = this.root * Math.pow(2, s / 12)
      this.synth.playNote(freq, this.noteDuration)
      await this.wait(this.chordIntervalMs)
    }
    this.synth.setMasterGain(this.defaultGain, fadeSec)
    this.start()
  }

  async playBridge(fadeSec = 15) {
    this.stop()
    this.synth.setMasterGain(0, fadeSec)
    await this.wait(fadeSec * 1000)
  }

  private wait(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
  }

  private schedule() {
    const scale = this.longTermScales[this.longTermIndex]
    const rootShift = this.midTermProgression[this.midTermIndex]

    const rootIndex = Math.floor(Math.random() * scale.length)
    const degrees = [0, 2, 4]
    const base = this.root * Math.pow(2, rootShift / 12)
    for (const d of degrees) {
      const semitone = scale[(rootIndex + d) % scale.length]
      const freq = base * Math.pow(2, semitone / 12)
      this.synth.playNote(freq, this.noteDuration)
    }

    this.chordCount++
    if (this.chordCount >= this.chordsPerMidTerm) {
      this.chordCount = 0
      this.midTermIndex = (this.midTermIndex + 1) % this.midTermProgression.length
      if (this.midTermIndex === 0) {
        this.longTermIndex = (this.longTermIndex + 1) % this.longTermScales.length
      }
    }

    this.timer = window.setTimeout(() => this.schedule(), this.chordIntervalMs)
  }
}
