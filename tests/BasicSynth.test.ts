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
  gain = {
    value: 1,
    setValueAtTime(value: number, _time: number) {
      this.value = value
    },
    linearRampToValueAtTime(value: number, _time: number) {
      this.value = value
    },
  }
  connect() {}
  disconnect() {}
}

class MockContext {
  currentTime = 0
  destination = {}
  createOscillator() { return new MockOscillator() }
  createGain() { return new MockGain() }
  createBiquadFilter() {
    return {
      type: 'lowshelf',
      frequency: { value: 0 },
      Q: { value: 1 },
      gain: { value: 0 },
      connect() {},
    } as any
  }
}

async function run() {
  const context = new MockContext()
  const synth = new BasicSynth({
    context: context as any,
    eq: { low: -3, high: -3 },
  })
  assert.strictEqual((synth as any).master.gain.value, 0.003)
  assert.strictEqual((synth as any).attack, 0.02)
  assert.strictEqual((synth as any).release, 0.1)
  assert.ok((synth as any).eqNodes, 'eq nodes should be created')
  synth.fadeIn(0.5)
  synth.play(440, 0.01)
  assert.ok((synth as any).oscillator, 'oscillator should be created')
  ;(synth as any).oscillator!.stop()
  synth.fadeOut(0.5)
  assert.strictEqual((synth as any).oscillator, null, 'oscillator should stop')
  console.log('BasicSynth test passed')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
