export interface BasicSynthOptions {
  type?: OscillatorType
  gain?: number
  context?: any
  destination?: AudioNode
  eqFilters?: { type?: BiquadFilterType; frequency: number; q?: number; gain?: number }[]
  reverbDuration?: number
}

export default class BasicSynth {
  private context: any
  private master: GainNode
  private destination: AudioNode
  private oscillator: OscillatorNode | null = null
  private type: OscillatorType
  private gain: number
  private filters: BiquadFilterNode[] = []
  private convolver?: ConvolverNode

  constructor(options: BasicSynthOptions = {}) {
    if (options.context) {
      this.context = options.context
    } else if (typeof AudioContext !== 'undefined') {
      this.context = new AudioContext()
    } else {
      throw new Error('No AudioContext available')
    }
    this.master = this.context.createGain()
    this.destination = options.destination ?? this.context.destination
    let last: AudioNode = this.master
    if (options.eqFilters) {
      this.filters = options.eqFilters.map((f) => {
        const node = this.context.createBiquadFilter()
        if (f.type) node.type = f.type
        node.frequency.value = f.frequency
        if (f.q) node.Q.value = f.q
        if (typeof f.gain === 'number') node.gain.value = f.gain
        last.connect(node)
        last = node
        return node
      })
    }

    if (options.reverbDuration) {
      const len = this.context.sampleRate * options.reverbDuration
      const impulse = this.context.createBuffer(2, len, this.context.sampleRate)
      for (let c = 0; c < 2; c++) {
        const ch = impulse.getChannelData(c)
        for (let i = 0; i < len; i++) {
          ch[i] = (Math.random() * 2 - 1) * (1 - i / len)
        }
      }
      const conv = this.context.createConvolver()
      conv.buffer = impulse
      last.connect(conv)
      last = conv
      this.convolver = conv
    }

    last.connect(this.destination)
    this.type = options.type ?? 'sine'
    this.gain = options.gain ?? 0.2
  }

  setType(type: OscillatorType) {
    this.type = type
  }

  setGain(gain: number) {
    this.gain = gain
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

  connect(node: AudioNode) {
    this.master.disconnect()
    this.destination = node
    let last: AudioNode = this.master
    if (this.filters.length) {
      for (const f of this.filters) {
        last.connect(f)
        last = f
      }
    }
    if (this.convolver) {
      last.connect(this.convolver)
      last = this.convolver
    }
    last.connect(node)
  }
}
