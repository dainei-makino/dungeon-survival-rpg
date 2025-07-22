export interface BasicSynthOptions {
  type?: OscillatorType
  gain?: number
  context?: any
  filterFrequency?: number
  delayTime?: number
}

export default class BasicSynth {
  private context: any
  private master: GainNode
  private oscillator: OscillatorNode | null = null
  private type: OscillatorType
  private gain: number
  private filter?: BiquadFilterNode
  private delay?: DelayNode

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

    if (options.filterFrequency !== undefined) {
      const filter = this.context.createBiquadFilter()
      filter.frequency.value = options.filterFrequency
      this.filter = filter
    }

    if (options.delayTime !== undefined) {
      const delay = this.context.createDelay()
      delay.delayTime.value = options.delayTime
      this.delay = delay
    }
    this.type = options.type ?? 'sine'
    this.gain = options.gain ?? 0.2
  }

  setType(type: OscillatorType) {
    this.type = type
  }

  setGain(gain: number) {
    this.gain = gain
  }

  setFilterFrequency(freq: number) {
    if (!this.filter) {
      this.filter = this.context.createBiquadFilter()
    }
    this.filter!.frequency.value = freq
  }

  setDelayTime(time: number) {
    if (!this.delay) {
      this.delay = this.context.createDelay()
    }
    this.delay!.delayTime.value = time
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
    let node: AudioNode = gain
    if (this.filter) {
      node.connect(this.filter)
      node = this.filter
    }
    if (this.delay) {
      node.connect(this.delay)
      node = this.delay
    }
    node.connect(this.master)
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
