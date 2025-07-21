export interface MusicSettings {
  instruments: (() => import('./instruments/Instrument').default)[]
}

import Piano from './instruments/Piano'
import Pad from './instruments/Pad'

export const forestMusic: MusicSettings = {
  instruments: [() => new Pad(), () => new Piano()],
}

export const caveMusic: MusicSettings = {
  instruments: [() => new Pad()],
}

export const plainMusic: MusicSettings = {
  instruments: [() => new Piano()],
}
