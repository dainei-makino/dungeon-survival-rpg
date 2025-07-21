export default class SoundSystem {
  private ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  private bgmFreq: Record<string, number>
  private seFreq: Record<string, number>
  private bgmNodes: Record<string, OscillatorNode> = {}

  constructor(bgmFreq: Record<string, number>, seFreq: Record<string, number>) {
    this.bgmFreq = bgmFreq
    this.seFreq = seFreq
  }

  playBgm(name: string) {
    const freq = this.bgmFreq[name]
    if (freq === undefined) return
    this.stopBgm(name)
    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.connect(this.ctx.destination)
    osc.start()
    this.bgmNodes[name] = osc
  }

  stopBgm(name: string) {
    const osc = this.bgmNodes[name]
    if (osc) {
      osc.stop()
      osc.disconnect()
      delete this.bgmNodes[name]
    }
  }

  playSe(name: string) {
    const freq = this.seFreq[name]
    if (freq === undefined) return
    const osc = this.ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq
    osc.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.2)
  }
}
