export default class MasterChannel {
  public context: AudioContext
  private gain: GainNode
  private compressor: DynamicsCompressorNode

  constructor(context?: AudioContext, volume = 1) {
    this.context = context ?? new AudioContext()
    this.gain = this.context.createGain()
    this.gain.gain.value = volume
    this.compressor = this.context.createDynamicsCompressor()
    this.gain.connect(this.compressor)
    this.compressor.connect(this.context.destination)
  }

  get input(): AudioNode {
    return this.gain
  }

  setVolume(v: number) {
    this.gain.gain.value = v
  }
}

let shared: MasterChannel | null = null
export function getMaster(): MasterChannel {
  if (!shared) {
    shared = new MasterChannel()
  }
  return shared
}
