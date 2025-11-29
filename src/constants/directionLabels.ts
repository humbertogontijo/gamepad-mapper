import { StickDirection } from '../hooks/useGamepadMapping'

export const DIRECTION_LABELS: Record<StickDirection, string> = {
  'up': '↑ Up',
  'down': '↓ Down',
  'left': '← Left',
  'right': '→ Right',
  'up-left': '↖ Up-Left',
  'up-right': '↗ Up-Right',
  'down-left': '↙ Down-Left',
  'down-right': '↘ Down-Right',
}

export const STICK_DIRECTIONS: StickDirection[] = [
  'up',
  'down',
  'left',
  'right',
  'up-left',
  'up-right',
  'down-left',
  'down-right',
]

