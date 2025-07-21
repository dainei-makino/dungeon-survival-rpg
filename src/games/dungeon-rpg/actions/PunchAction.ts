import Hero from '../Hero'
import Action, { Damageable } from './Action'

export default class PunchAction implements Action {
  execute(source: Hero, target: Damageable) {
    const dmg = source.strength
    target.hp = Math.max(0, target.hp - dmg)
  }
}
