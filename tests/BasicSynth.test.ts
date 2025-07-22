import assert from 'assert'
import BasicSynth from '../src/audio/BasicSynth'

class MockOscillator {
  type: OscillatorType = 'sine'
  frequency = { value: 440 }
  onended?: () => void
  connect() {}
  start() { /* start */ }
  stop() { if (this.onended) this.onended() }
  disconnect() {}
}

class MockGain {
  gain = { value: 1 }
  connect() {}
  disconnect() {}
}

class MockFilter {
  frequency = { value: 0 }
  connect() {}
  disconnect() {}
}

class MockDelay {
  delayTime = { value: 0 }
  connect() {}
  disconnect() {}
}

class MockContext {
  currentTime = 0
  destination = {}
  createOscillator() { return new MockOscillator() }
  createGain() { return new MockGain() }
  createBiquadFilter() { return new MockFilter() }
  createDelay() { return new MockDelay() }
}

async function run() {
  const context = new MockContext()
  const synth = new BasicSynth({
    context: context as any,
    filterFrequency: 800,
    delayTime: 0.1,
  })
  synth.play(440, 0.01)
  assert.ok((synth as any).oscillator, 'oscillator should be created')
  assert.ok((synth as any).filter, 'filter node should be created')
  assert.ok((synth as any).delay, 'delay node should be created')
  ;(synth as any).oscillator!.stop()
  assert.strictEqual((synth as any).oscillator, null, 'oscillator should stop')
  console.log('BasicSynth test passed')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
