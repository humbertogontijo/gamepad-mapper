import { useState, useCallback } from 'react'
import { GamepadState } from '../hooks/useGamepad'
import { GamepadMapping, StickDirection } from '../hooks/useGamepadMapping'
import { MappingActions } from './MappingPanel'
import { KeyMappingSelector } from './KeyMappingSelector'
import './MappingPanel.css'

const DIRECTION_LABELS: Record<StickDirection, string> = {
  'up': '↑ Up',
  'down': '↓ Down',
  'left': '← Left',
  'right': '→ Right',
  'up-left': '↖ Up-Left',
  'up-right': '↗ Up-Right',
  'down-left': '↙ Down-Left',
  'down-right': '↘ Down-Right',
}

interface DpadMappingPanelProps {
  gamepad: GamepadState
  mapping?: GamepadMapping
  editingDpad: { gamepadIndex: number; direction: StickDirection } | null
  onSetDpadMapping: (direction: StickDirection, key: string, label: string) => void
  onRemoveDpadMapping: (direction: StickDirection) => void
  onSetEditingDpad: (value: { gamepadIndex: number; direction: StickDirection } | null) => void
}

export function DpadMappingPanel({
  gamepad,
  mapping,
  editingDpad,
  onSetDpadMapping,
  onRemoveDpadMapping,
  onSetEditingDpad,
}: DpadMappingPanelProps) {
  const [pendingKeys, setPendingKeys] = useState<Map<StickDirection, { key: string; label: string }>>(new Map())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Get current dpad state
  const getDpadDirection = (): StickDirection | null => {
    const up = gamepad.buttons[12]?.pressed || false
    const down = gamepad.buttons[13]?.pressed || false
    const left = gamepad.buttons[14]?.pressed || false
    const right = gamepad.buttons[15]?.pressed || false

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

  const currentDpadDirection = getDpadDirection()

  const handleKeyPress = useCallback((direction: StickDirection, key: string, label: string) => {
    setPendingKeys(prev => {
      const newMap = new Map(prev)
      newMap.set(direction, { key, label })
      return newMap
    })
    setHasUnsavedChanges(true)
  }, [])

  const revertChanges = useCallback(() => {
    setPendingKeys(new Map())
    setHasUnsavedChanges(false)
    onSetEditingDpad(null)
  }, [onSetEditingDpad])

  const directions: StickDirection[] = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right']

  return (
    <div className="mapping-panel-content">
      <div className="mapping-header">
        <h3>D-Pad</h3>
        <p className="panel-subtitle">Configure D-Pad mapping with combined keys</p>
        {currentDpadDirection && (
          <span className="pressed-indicator">● {DIRECTION_LABELS[currentDpadDirection]} Active</span>
        )}
      </div>
      
      <div className="stick-directions-list">
        {directions.map(direction => {
          const dpadMapping = mapping?.dpadMappings?.find(m => m.direction === direction)
          const isEditing = editingDpad?.direction === direction
          const pendingKey = pendingKeys.get(direction)
          const isActive = currentDpadDirection === direction

          return (
            <div
              key={direction}
              className={`button-mapping-item ${dpadMapping ? 'has-mapping' : ''} ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''}`}
              onClick={() => {
                onSetEditingDpad({ gamepadIndex: gamepad.index, direction })
              }}
            >
              <div className="direction-label">{DIRECTION_LABELS[direction]}</div>
              <KeyMappingSelector
                currentMapping={dpadMapping ? { key: dpadMapping.key, label: dpadMapping.label } : null}
                isEditing={isEditing}
                pendingKey={pendingKey || null}
                onKeyPress={(key, label) => handleKeyPress(direction, key, label)}
                onRemove={() => {
                  onRemoveDpadMapping(direction)
                  setPendingKeys(prev => {
                    const newMap = new Map(prev)
                    newMap.delete(direction)
                    return newMap
                  })
                  setHasUnsavedChanges(false)
                }}
                showRemove={!!dpadMapping || !!pendingKey}
              />
              {isActive && <span className="active-indicator">●</span>}
            </div>
          )
        })}
      </div>

      {editingDpad && (
        <div className="editing-hint">
          {pendingKeys.get(editingDpad.direction) ? (
            <div>New key: <strong>{pendingKeys.get(editingDpad.direction)?.label}</strong> (press Apply Changes to save)</div>
          ) : (
            <div>Press a key to map...</div>
          )}
        </div>
      )}
      
      <MappingActions
        hasUnsavedChanges={hasUnsavedChanges && pendingKeys.size > 0}
        onApplyChanges={() => {
          // Apply all pending keys, not just the currently editing one
          pendingKeys.forEach((pendingKey, direction) => {
            onSetDpadMapping(direction, pendingKey.key, pendingKey.label)
          })
          setPendingKeys(new Map())
          setHasUnsavedChanges(false)
          onSetEditingDpad(null)
        }}
        onRevertChanges={revertChanges}
        onRemoveMapping={() => {
          if (editingDpad) {
            onRemoveDpadMapping(editingDpad.direction)
            setPendingKeys(prev => {
              const newMap = new Map(prev)
              newMap.delete(editingDpad.direction)
              return newMap
            })
            setHasUnsavedChanges(false)
          }
        }}
        showRemove={editingDpad !== null && (!!mapping?.dpadMappings?.find(m => m.direction === editingDpad.direction) || !!pendingKeys.get(editingDpad.direction))}
      />
    </div>
  )
}

