import React from 'react'
import { ButtonConfig, getButtonClassName } from '../constants/controllerMappings'

interface ButtonElementProps {
  config: ButtonConfig
  pressed: boolean
  value?: number // For triggers (0-1)
  selected: boolean
  mappingLabel?: string
  onClick: (e: React.MouseEvent) => void
  className?: string
}

export function ButtonElement({
  config,
  pressed,
  value = 0,
  selected,
  mappingLabel,
  onClick,
  className = '',
}: ButtonElementProps) {
  const baseClassName = getButtonClassName(config)
  const pressedClass = pressed ? 'pressed' : ''
  const selectedClass = selected ? 'selected' : ''
  const combinedClassName = `${baseClassName} ${pressedClass} ${selectedClass} ${className}`.trim()

  // Handle trigger-specific rendering
  if (config.type === 'trigger') {
    return (
      <div className={combinedClassName} onClick={onClick}>
        <div
          className={`trigger-visual ${pressed ? 'pressed' : ''}`}
          style={{ height: `${value * 100}%` }}
        />
        <div className="trigger-label">{config.label}</div>
        {mappingLabel && (
          <div className="mapping-badge">{mappingLabel}</div>
        )}
      </div>
    )
  }

  // Handle center buttons with icons
  if (config.type === 'center' && config.icon) {
    return (
      <div className={combinedClassName} onClick={onClick}>
        <div className="button-icon">{config.icon}</div>
        {mappingLabel && (
          <div className="mapping-badge">{mappingLabel}</div>
        )}
      </div>
    )
  }

  // Handle center buttons with labels
  if (config.type === 'center' && !config.icon) {
    return (
      <div className={combinedClassName} onClick={onClick}>
        <div className="button-label">{config.label}</div>
        {mappingLabel && (
          <div className="mapping-badge">{mappingLabel}</div>
        )}
      </div>
    )
  }

  // Default rendering for face dpads, buttons, bumpers, stick buttons, etc.
    return (
      <div className={combinedClassName} onClick={onClick}>
        {config.label}
        {mappingLabel && (
          <div className="mapping-badge">{mappingLabel}</div>
        )}
      </div>
    )
}

