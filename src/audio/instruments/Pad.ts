import BasicSynth from '../BasicSynth'
import Instrument, { InstrumentPreset } from './Instrument'
import { padPreset } from './presets'

export default class Pad extends Instrument {
  constructor(synth?: BasicSynth, preset: InstrumentPreset = padPreset) {
    super(synth ?? new BasicSynth(), preset)
  }
}
