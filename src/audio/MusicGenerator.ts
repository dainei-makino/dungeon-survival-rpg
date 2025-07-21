import Instrument from './instruments/Instrument'

export interface NoteEvent {
  frequency: number
  duration: number
}

export interface Track {
  instrument: Instrument
  sequence: NoteEvent[]
}

export interface MusicLoop {
  stop(): void
}

export interface AmbientMusicConfig {
  instruments: Instrument[]
  root: number
  scale: number[]
  length?: number
  tempo?: number
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

  static generateAmbientTracks(config: AmbientMusicConfig): Track[] {
    const length = config.length ?? 8
    const tracks: Track[] = []
    const toFreq = (step: number) => config.root * Math.pow(2, step / 12)

    for (const inst of config.instruments) {
      const sequence: NoteEvent[] = []
      for (let i = 0; i < length; i++) {
        const step = config.scale[Math.floor(Math.random() * config.scale.length)]
        const freq = toFreq(step)
        const durationChoices = [0.5, 1, 2]
        const duration = durationChoices[Math.floor(Math.random() * durationChoices.length)]
        sequence.push({ frequency: freq, duration })
      }
      tracks.push({ instrument: inst, sequence })
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

  static startLoop(tracks: Track[], bpm = 120, intro = 0): MusicLoop {
    const timers: NodeJS.Timeout[] = []
    let stopped = false
    const beat = 60 / bpm

    if (intro > 0) {
      for (const track of tracks) {
        if (typeof (track.instrument as any).fadeIn === 'function') {
          ;(track.instrument as any).fadeIn(intro)
        }
      }
    }

    const scheduleTrack = (track: Track) => {
      let index = 0
      const playNext = () => {
        if (stopped) return
        const note = track.sequence[index]
        track.instrument.play(note.frequency, note.duration * beat)
        index = (index + 1) % track.sequence.length
        timers.push(
          setTimeout(() => {
            playNext()
          }, note.duration * beat * 1000),
        )
      }
      playNext()
    }

    tracks.forEach(scheduleTrack)
    return {
      stop() {
        stopped = true
        for (const t of timers) clearTimeout(t)
      },
    }
  }
}
