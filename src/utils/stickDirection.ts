import { StickDirection } from '../hooks/useGamepadMapping'

/**
 * Calculate stick direction from X and Y axes values
 * @param x - X axis value (-1 to 1)
 * @param y - Y axis value (-1 to 1)
 * @param threshold - Threshold value for detecting direction (0 to 1)
 * @returns StickDirection or null if below threshold
 */
export function getStickDirection(
  x: number,
  y: number,
  threshold: number
): StickDirection | null {
  const absX = Math.abs(x)
  const absY = Math.abs(y)

  if (absX < threshold && absY < threshold) {
    return null // No direction
  }

  const isUp = y < -threshold
  const isDown = y > threshold
  const isLeft = x < -threshold
  const isRight = x > threshold

  if (isUp && isLeft) return 'up-left'
  if (isUp && isRight) return 'up-right'
  if (isDown && isLeft) return 'down-left'
  if (isDown && isRight) return 'down-right'
  if (isUp) return 'up'
  if (isDown) return 'down'
  if (isLeft) return 'left'
  if (isRight) return 'right'

  return null
}

/**
 * Get D-Pad direction from button states
 * @param buttons - Array of button states
 * @returns StickDirection or null if no direction pressed
 */
export function getDpadDirection(buttons: Array<{ pressed?: boolean }>): StickDirection | null {
  const up = buttons[12]?.pressed || false
  const down = buttons[13]?.pressed || false
  const left = buttons[14]?.pressed || false
  const right = buttons[15]?.pressed || false

  if (up && left) return 'up-left'
  if (up && right) return 'up-right'
  if (down && left) return 'down-left'
  if (down && right) return 'down-right'
  if (up) return 'up'
  if (down) return 'down'
  if (left) return 'left'
  if (right) return 'right'

  return null
}

/**
 * Get stick axes indices for a given stick index
 * @param stickIndex - Stick index (0 for left, 1 for right)
 * @returns Object with axisXIndex and axisYIndex
 */
export function getStickAxes(stickIndex: number): { axisXIndex: number; axisYIndex: number } {
  if (stickIndex === 0) {
    return { axisXIndex: 0, axisYIndex: 1 }
  } else {
    return { axisXIndex: 2, axisYIndex: 3 }
  }
}

