import Instrument from './instruments/Instrument'

export interface NoteEvent {
  frequency: number
  duration: number
}

export interface Track {
  instrument: Instrument
  sequence: NoteEvent[]
}

export interface GeneratorOptions {
  tempo?: number
}

export default class MusicGenerator {
  private instrument: Instrument
  private tempo: number

  constructor(instrument: Instrument, options: GeneratorOptions = {}) {
    this.instrument = instrument
    this.tempo = options.tempo ?? 120
  }

  playSequence(sequence: NoteEvent[]) {
    const beat = 60 / this.tempo
    for (const note of sequence) {
      this.instrument.play(note.frequency, note.duration * beat)
    }
  }

  static generateFixedTracks(instruments: Instrument[], tempo = 120): Track[] {
    const progression = [
      [261.63, 329.63, 392.0],
      [349.23, 440.0, 523.25],
      [392.0, 493.88, 587.33],
      [261.63, 329.63, 392.0],
    ]
    const rhythm = [1, 1, 1, 1]
    const beat = 60 / tempo
    const tracks: Track[] = []

    if (instruments[0]) {
      const seq: NoteEvent[] = progression.map((chord, i) => ({
        frequency: chord[0],
        duration: rhythm[i] * beat,
      }))
      tracks.push({ instrument: instruments[0], sequence: seq })
    }

    if (instruments[1]) {
      const seq: NoteEvent[] = []
      for (const chord of progression) {
        for (const note of chord) {
          seq.push({ frequency: note, duration: 0.25 * beat })
        }
      }
      tracks.push({ instrument: instruments[1], sequence: seq })
    }

    return tracks
  }

  static playTracks(tracks: Track[]) {
    for (const track of tracks) {
      for (const note of track.sequence) {
        track.instrument.play(note.frequency, note.duration)
      }
    }
  }
}
