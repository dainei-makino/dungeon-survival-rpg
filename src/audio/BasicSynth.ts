export interface BasicSynthOptions {
  type?: OscillatorType
  gain?: number
  context?: any
  /** Overall output volume. 1.0 is 100% */
  masterGain?: number
  attack?: number
  release?: number
  reverb?: number
}

export default class BasicSynth {
  private context: any
  private master: GainNode
  private oscillator: OscillatorNode | null = null
  private type: OscillatorType
  private gain: number
  private attack: number
  private release: number
  private reverb: number
  private delay: DelayNode | null = null
  private feedback: GainNode | null = null

  constructor(options: BasicSynthOptions = {}) {
    if (options.context) {
      this.context = options.context
    } else if (typeof AudioContext !== 'undefined') {
      this.context = new AudioContext()
    } else {
      throw new Error('No AudioContext available')
    }
    this.master = this.context.createGain()
    this.master.gain.value = options.masterGain ?? 0.003
    this.master.connect(this.context.destination)
    this.type = options.type ?? 'sine'
    this.gain = options.gain ?? 0.2
    this.attack = options.attack ?? 0.02
    this.release = options.release ?? 0.1
    this.reverb = options.reverb ?? 0
    if (this.reverb > 0) {
      const delay = this.context.createDelay()
      delay.delayTime.value = 0.3
      const feedback = this.context.createGain()
      feedback.gain.value = this.reverb
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(this.master)
      this.delay = delay
      this.feedback = feedback
    }
  }

  setType(type: OscillatorType) {
    this.type = type
  }

  setGain(gain: number) {
    this.gain = gain
  }

  fadeIn(duration: number) {
    this.master.gain.setValueAtTime(0, this.context.currentTime)
    this.master.gain.linearRampToValueAtTime(1, this.context.currentTime + duration)
  }

  fadeOut(duration: number) {
    this.master.gain.setValueAtTime(this.master.gain.value, this.context.currentTime)
    this.master.gain.linearRampToValueAtTime(0, this.context.currentTime + duration)
  }

  play(frequency: number, duration = 1) {
    if (this.oscillator) {
      this.stop()
    }
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()
    osc.type = this.type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0, this.context.currentTime)
    if (this.attack > 0) {
      gain.gain.linearRampToValueAtTime(
        this.gain,
        this.context.currentTime + this.attack,
      )
    } else {
      gain.gain.setValueAtTime(this.gain, this.context.currentTime)
    }
    const stopTime = this.context.currentTime + duration
    gain.gain.setValueAtTime(this.gain, stopTime)
    if (this.release > 0) {
      gain.gain.linearRampToValueAtTime(
        0,
        stopTime + this.release,
      )
    } else {
      gain.gain.setValueAtTime(0, stopTime)
    }
    osc.connect(gain)
    gain.connect(this.master)
    if (this.delay) {
      gain.connect(this.delay)
    }
    osc.start()
    osc.stop(stopTime + this.release)
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
