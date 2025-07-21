export default class AmbientPadSynth {
  private filter: BiquadFilterNode
  private output: GainNode

  constructor(private ctx: AudioContext) {
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 800
    this.output = ctx.createGain()
    this.output.gain.value = 0.5
    this.filter.connect(this.output)
    this.output.connect(ctx.destination)
  }

  playNote(freq: number, duration = 8) {
    const now = this.ctx.currentTime
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.4, now + 2)
    gain.gain.linearRampToValueAtTime(0, now + duration)
    gain.connect(this.filter)

    const detunes = [-10, 0, 10]
    for (const d of detunes) {
      const osc = this.ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = freq
      osc.detune.value = d
      osc.connect(gain)
      osc.start(now)
      osc.stop(now + duration)
    }
  }
}
