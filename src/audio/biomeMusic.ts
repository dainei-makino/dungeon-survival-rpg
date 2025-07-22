export interface MusicSettings {
  instruments: (() => import('./instruments/Instrument').default)[]
}

import Piano from './instruments/Piano'
import AmbientPad from './instruments/AmbientPad'

export const forestMusic: MusicSettings = {
  instruments: [() => new AmbientPad(), () => new Piano()],
}

export const caveMusic: MusicSettings = {
  instruments: [() => new AmbientPad()],
}

export const plainMusic: MusicSettings = {
  instruments: [() => new AmbientPad()],
}

export const desertMusic: MusicSettings = {
  instruments: [() => new AmbientPad(), () => new Piano()],
}
