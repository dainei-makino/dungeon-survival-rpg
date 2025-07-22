export interface InstrumentPreset {
  type: OscillatorType
  gain: number
}

export default class Instrument {
  protected synth: any
  protected preset: InstrumentPreset

  constructor(synth: any, preset: InstrumentPreset) {
    this.synth = synth
    this.preset = preset
  }

  play(frequency: number, duration = 1, startTime?: number) {
    if (typeof this.synth.setType === 'function') {
      this.synth.setType(this.preset.type)
    } else {
      ;(this.synth as any).type = this.preset.type
    }
    if (typeof this.synth.setGain === 'function') {
      this.synth.setGain(this.preset.gain)
    } else {
      ;(this.synth as any).gain = this.preset.gain
    }
    this.synth.play(frequency, duration, startTime)
  }

  getCurrentTime(): number {
    if (typeof this.synth.getCurrentTime === 'function') {
      return this.synth.getCurrentTime()
    }
    return 0
  }

  fadeIn(duration = 2) {
    if (typeof this.synth.fadeIn === 'function') {
      this.synth.fadeIn(duration)
    }
  }
}
