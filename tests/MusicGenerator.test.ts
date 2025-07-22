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

  const padSynth2 = new MockSynth()
  const pianoSynth2 = new MockSynth()
  const pad2 = new Pad(padSynth2 as any)
  const piano2 = new Piano(pianoSynth2 as any)
  const tracks = MusicGenerator.generateFixedTracks([pad2, piano2])
  assert.strictEqual(tracks.length, 2)
  MusicGenerator.playTracks(tracks)
  assert.ok(padSynth2.played.length > 0, 'pad track should play notes')
  assert.ok(pianoSynth2.played.length > 0, 'piano track should play notes')

  const tracksRandom = MusicGenerator.generateRandomTracks([piano2, pad2], 1, [440, 660])
  assert.strictEqual(tracksRandom.length, 2)
  assert.strictEqual(tracksRandom[0].sequence.length, 4)

  console.log('MusicGenerator test passed')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
