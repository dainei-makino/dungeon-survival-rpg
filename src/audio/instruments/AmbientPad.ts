import BasicSynth from '../BasicSynth'
import Instrument, { InstrumentPreset } from './Instrument'
import { ambientPadPreset } from './presets'

export default class AmbientPad extends Instrument {
  constructor(synth?: BasicSynth, preset: InstrumentPreset = ambientPadPreset) {
    const s =
      synth ??
      new BasicSynth({
        filterFrequency: 700,
        delayTime: 0.4,
      })
    super(s, preset)
  }
}
