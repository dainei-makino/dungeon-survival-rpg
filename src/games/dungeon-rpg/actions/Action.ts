export interface Damageable {
  name: string
  hp: number
}

export default interface Action {
  execute(source: { strength: number }, target: Damageable): void
}
