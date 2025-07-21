import assert from 'assert'
import MusicGenerator from '../src/audio/MusicGenerator'
import Piano from '../src/audio/instruments/Piano'
import Pad from '../src/audio/instruments/Pad'

class MockSynth {
  public type: OscillatorType = 'sine'
  public gain = 0.2
  public played: {frequency: number; duration: number}[] = []
  setType(type: OscillatorType) { this.type = type }
  setGain(gain: number) { this.gain = gain }
  play(frequency: number, duration: number) {
    this.played.push({ frequency, duration })
  }
}

async function run() {
  const synth = new MockSynth()
  const piano = new Piano(synth as any)
  const generator = new MusicGenerator(piano)
  generator.playSequence([
    { frequency: 440, duration: 1 },
    { frequency: 660, duration: 0.5 },
  ])
  assert.strictEqual(synth.played.length, 2, 'should play two notes')
  assert.strictEqual(synth.type, 'triangle')
  const padSynth = new MockSynth()
  const pad = new Pad(padSynth as any)
  const generator2 = new MusicGenerator(pad)
  generator2.playSequence([{ frequency: 330, duration: 1 }])
  assert.strictEqual(padSynth.type, 'sine')
  assert.strictEqual(padSynth.played[0].frequency, 330)
  console.log('MusicGenerator test passed')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
