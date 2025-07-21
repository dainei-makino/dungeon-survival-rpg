export interface MusicSettings {
  tempo: number
  reverb: boolean
}

export const forestMusic: MusicSettings = {
  tempo: 60,
  reverb: true,
}

export const caveMusic: MusicSettings = {
  tempo: 90,
  reverb: false,
}

export const plainMusic: MusicSettings = {
  tempo: 100,
  reverb: false,
}
