import Instrument from './instruments/Instrument'

export interface NoteEvent {
  frequency: number
  duration: number
}

export interface Track {
  instrument: Instrument
  sequence: NoteEvent[]
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

  static generateFixedTracks(instruments: Instrument[]): Track[] {
    const progression = [
      [261.63, 329.63, 392.0],
      [349.23, 440.0, 523.25],
      [392.0, 493.88, 587.33],
      [261.63, 329.63, 392.0],
    ]
    const rhythm = [1, 1, 1, 1]
    const tracks: Track[] = []

    if (instruments[0]) {
      const seq: NoteEvent[] = progression.map((chord, i) => ({
        frequency: chord[0],
        duration: rhythm[i],
      }))
      tracks.push({ instrument: instruments[0], sequence: seq })
    }

    if (instruments[1]) {
      const seq: NoteEvent[] = []
      for (const chord of progression) {
        for (const note of chord) {
          seq.push({ frequency: note, duration: 0.25 })
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
