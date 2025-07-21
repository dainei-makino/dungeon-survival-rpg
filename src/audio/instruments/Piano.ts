import BasicSynth from '../BasicSynth'
import Instrument, { InstrumentPreset } from './Instrument'
import { pianoPreset } from './presets'

export default class Piano extends Instrument {
  constructor(synth?: BasicSynth, preset: InstrumentPreset = pianoPreset) {
    super(synth ?? new BasicSynth(), preset)
  }
}
