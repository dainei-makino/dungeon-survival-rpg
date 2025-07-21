import Instrument from './instruments/Instrument'

export interface NoteEvent {
  frequency: number
  duration: number
}

export default class MusicGenerator {
  private instrument: Instrument

  constructor(instrument: Instrument) {
    this.instrument = instrument
  }

  playSequence(sequence: NoteEvent[]) {
    for (const note of sequence) {
      this.instrument.play(note.frequency, note.duration)
    }
  }
}
