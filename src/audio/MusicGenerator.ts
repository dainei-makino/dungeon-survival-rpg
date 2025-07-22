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

  playSequence(sequence: NoteEvent[], fadeIn = false) {
    const base = this.instrument.getCurrentTime()
    let t = base
    if (fadeIn) {
      this.instrument.fadeIn(2)
    }
    for (const note of sequence) {
      this.instrument.play(note.frequency, note.duration, t)
      t += note.duration
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

  static generateRandomTracks(
    instruments: Instrument[],
    bars = 4,
    scale: number[] = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88]
  ): Track[] {
    const tracks: Track[] = []
    const steps = bars * 4
    for (const instrument of instruments) {
      const seq: NoteEvent[] = []
      for (let i = 0; i < steps; i++) {
        const freq = scale[Math.floor(Math.random() * scale.length)]
        seq.push({ frequency: freq, duration: 0.25 })
      }
      tracks.push({ instrument, sequence: seq })
    }
    return tracks
  }

  static generateAmbientTracks(
    instruments: Instrument[],
    bars = 4,
    scale: number[] = [261.63, 293.66, 329.63, 392.0]
  ): Track[] {
    const tracks: Track[] = []
    const steps = bars
    for (const instrument of instruments) {
      const seq: NoteEvent[] = []
      for (let i = 0; i < steps; i++) {
        const freq = scale[Math.floor(Math.random() * scale.length)]
        seq.push({ frequency: freq, duration: 2 })
      }
      tracks.push({ instrument, sequence: seq })
    }
    return tracks
  }

  static playTracks(tracks: Track[], fadeIn = false) {
    const base = tracks[0]?.instrument.getCurrentTime() ?? 0
    for (const track of tracks) {
      let t = base
      if (fadeIn) {
        track.instrument.fadeIn(2)
      }
      for (const note of track.sequence) {
        track.instrument.play(note.frequency, note.duration, t)
        t += note.duration
      }
    }
  }
}
