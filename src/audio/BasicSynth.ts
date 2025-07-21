export interface BasicSynthOptions {
  type?: OscillatorType
  gain?: number
  context?: any
  /** Overall output volume. 1.0 is 100% */
  masterGain?: number
  attack?: number
  release?: number
  reverb?: number
  /** Simple three band EQ in dB */
  eq?: {
    low?: number
    mid?: number
    high?: number
  }
  /** Destination node for output */
  output?: AudioNode
}

import { getMaster } from './MasterChannel'

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
  private eqNodes?: {
    low: BiquadFilterNode
    mid: BiquadFilterNode
    high: BiquadFilterNode
  }

  constructor(options: BasicSynthOptions = {}) {
    if (options.context) {
      this.context = options.context
    } else if (typeof AudioContext !== 'undefined') {
      this.context = getMaster().context
    } else {
      throw new Error('No AudioContext available')
    }
    this.master = this.context.createGain()
    this.master.gain.value = options.masterGain ?? 0.003
    if (options.output) {
      this.master.connect(options.output)
    } else if (options.context) {
      this.master.connect(this.context.destination)
    } else {
      this.master.connect(getMaster().input)
    }
    this.type = options.type ?? 'sine'
    this.gain = options.gain ?? 0.2
    this.attack = options.attack ?? 0.02
    this.release = options.release ?? 0.1
    this.reverb = options.reverb ?? 0

    if (options.eq) {
      const low = this.context.createBiquadFilter()
      low.type = 'lowshelf'
      low.frequency.value = 200
      low.gain.value = options.eq.low ?? 0
      const mid = this.context.createBiquadFilter()
      mid.type = 'peaking'
      mid.frequency.value = 1000
      mid.Q.value = 1
      mid.gain.value = options.eq.mid ?? 0
      const high = this.context.createBiquadFilter()
      high.type = 'highshelf'
      high.frequency.value = 4000
      high.gain.value = options.eq.high ?? 0
      low.connect(mid)
      mid.connect(high)
      high.connect(this.master)
      this.eqNodes = { low, mid, high }
    }
    if (this.reverb > 0) {
      const delay = this.context.createDelay()
      delay.delayTime.value = 0.3
      const feedback = this.context.createGain()
      feedback.gain.value = this.reverb
      delay.connect(feedback)
      feedback.connect(delay)
      if (this.eqNodes) {
        delay.connect(this.eqNodes.low)
      } else {
        delay.connect(this.master)
      }
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

  setOutput(node: AudioNode) {
    this.master.disconnect()
    this.master.connect(node)
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
    const dest = this.eqNodes ? this.eqNodes.low : this.master
    gain.connect(dest)
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
