export default class MasterOutput {
  public context: AudioContext
  public master: GainNode
  public compressor: DynamicsCompressorNode

  constructor(context?: AudioContext) {
    if (context) {
      this.context = context
    } else if (typeof AudioContext !== 'undefined') {
      this.context = new AudioContext()
    } else {
      throw new Error('No AudioContext available')
    }
    this.compressor = this.context.createDynamicsCompressor()
    this.master = this.context.createGain()
    this.master.gain.value = 0.05
    this.master.connect(this.compressor)
    this.compressor.connect(this.context.destination)
  }

  get input(): AudioNode {
    return this.master
  }
}
