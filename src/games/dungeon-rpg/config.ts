// Average adult walking cadence is roughly two steps per second
// with a stride around 0.75m. We use these values to derive
// animation durations for moving one tile.
export const STEP_FREQUENCY = 2 // steps per second
export const BASE_STEP_TIME_MS = 1000 / STEP_FREQUENCY

export let animationSpeed = 3

export function setAnimationSpeed(speed: number) {
  animationSpeed = speed
}
