export type AmbientPatch = 'saw' | 'triangle' | 'square' | 'noise'

export interface ADSR {
  attack: number
  decay: number
  sustain: number
  release: number
}

export default class AmbientPadSynth {
  private filter: BiquadFilterNode
  private output: GainNode
  private noiseBuffer: AudioBuffer
  private noiseLevel = 0.4
  private envelope: ADSR = {
    attack: 2,
    decay: 0.3,
    sustain: 0.8,
    release: 8
  }
  private patches: AmbientPatch[]

  constructor(private ctx: AudioContext, patch: AmbientPatch | AmbientPatch[] = 'saw') {
    this.patches = Array.isArray(patch) ? patch : [patch]
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
  setMasterGain(value: number, time = 15) {
    const now = this.ctx.currentTime
    this.output.gain.linearRampToValueAtTime(value, now + time)
  }

  /**
   * Change the current timbre patch.
   */
  setPatch(patch: AmbientPatch | AmbientPatch[]) {
    this.patches = Array.isArray(patch) ? patch : [patch]
  }

  /**
   * Adjust noise amplitude when using the "noise" patch.
   */
  setNoiseLevel(level: number) {
    this.noiseLevel = level
  }

  /**
   * Set release time for notes.
   */
  setDecay(time: number) {
    this.envelope.release = time
  }

  /**
   * Adjust ADSR envelope parameters.
   */
  setEnvelope(env: Partial<ADSR>) {
    this.envelope = { ...this.envelope, ...env }
  }

  playNote(freq: number, sustainTime = 0) {
    const now = this.ctx.currentTime
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)

    const { attack, decay, sustain, release } = this.envelope
    const peak = 0.4

    const decayEnd = now + attack + decay
    const releaseStart = decayEnd + sustainTime
    gain.gain.linearRampToValueAtTime(peak, now + attack)
    gain.gain.linearRampToValueAtTime(peak * sustain, decayEnd)
    gain.gain.setValueAtTime(peak * sustain, releaseStart)
    gain.gain.linearRampToValueAtTime(0, releaseStart + release)
    gain.connect(this.filter)

    for (const patch of this.patches) {
      if (patch === 'noise') {
        const src = this.ctx.createBufferSource()
        src.buffer = this.noiseBuffer
        src.loop = true
        src.connect(gain)
        src.start(now)
        src.stop(releaseStart + release)
        continue
      }

      const detunes = [-10, 0, 10]
      for (const d of detunes) {
        const osc = this.ctx.createOscillator()
        osc.type = patch
        osc.frequency.value = freq
        osc.detune.value = d
        osc.connect(gain)
        osc.start(now)
        osc.stop(releaseStart + release)
      }
    }
  }
}
