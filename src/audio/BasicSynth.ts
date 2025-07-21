export interface BasicSynthOptions {
  type?: OscillatorType
  gain?: number
  context?: any
}

export default class BasicSynth {
  private context: any
  private master: GainNode
  private oscillator: OscillatorNode | null = null
  private type: OscillatorType
  private gain: number

  constructor(options: BasicSynthOptions = {}) {
    if (options.context) {
      this.context = options.context
    } else if (typeof AudioContext !== 'undefined') {
      this.context = new AudioContext()
    } else {
      throw new Error('No AudioContext available')
    }
    this.master = this.context.createGain()
    this.master.connect(this.context.destination)
    this.type = options.type ?? 'sine'
    this.gain = options.gain ?? 0.2
  }

  play(frequency: number, duration = 1) {
    if (this.oscillator) {
      this.stop()
    }
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()
    osc.type = this.type
    osc.frequency.value = frequency
    gain.gain.value = this.gain
    osc.connect(gain)
    gain.connect(this.master)
    osc.start()
    osc.stop(this.context.currentTime + duration)
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
      if (this.oscillator === osc) {
        this.oscillator = null
      }
    }
    this.oscillator = osc
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop()
    }
  }
}
