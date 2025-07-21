export type AmbientPatch = 'saw' | 'triangle' | 'square' | 'noise'

export default class AmbientPadSynth {
  private filter: BiquadFilterNode
  private output: GainNode
  private noiseBuffer: AudioBuffer
  private noiseLevel = 0.4

  constructor(private ctx: AudioContext, private patch: AmbientPatch = 'saw') {
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 800
    this.output = ctx.createGain()
    // master gain lowered further
    this.output.gain.value = 0.03
    this.filter.connect(this.output)
    this.output.connect(ctx.destination)

    // create a short noise buffer used by the "noise" patch
    this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }

  /**
   * Smoothly adjust the master gain.
   */
  setMasterGain(value: number, time = 0.5) {
    const now = this.ctx.currentTime
    this.output.gain.linearRampToValueAtTime(value, now + time)
  }

  /**
   * Change the current timbre patch.
   */
  setPatch(patch: AmbientPatch) {
    this.patch = patch
  }

  /**
   * Adjust noise amplitude when using the "noise" patch.
   */
  setNoiseLevel(level: number) {
    this.noiseLevel = level
  }

  playNote(freq: number, duration = 8) {
    const now = this.ctx.currentTime
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    const peak = this.patch === 'noise' ? this.noiseLevel : 0.4
    gain.gain.linearRampToValueAtTime(peak, now + 2)
    gain.gain.linearRampToValueAtTime(0, now + duration)
    gain.connect(this.filter)

    if (this.patch === 'noise') {
      const src = this.ctx.createBufferSource()
      src.buffer = this.noiseBuffer
      src.loop = true
      src.connect(gain)
      src.start(now)
      src.stop(now + duration)
      return
    }

    const detunes = [-10, 0, 10]
    for (const d of detunes) {
      const osc = this.ctx.createOscillator()
      osc.type = this.patch
      osc.frequency.value = freq
      osc.detune.value = d
      osc.connect(gain)
      osc.start(now)
      osc.stop(now + duration)
    }
  }
}
