import React from "react";
import { GamepadState } from "../hooks/useGamepad";
import { GamepadMapping } from "../hooks/useGamepadMapping";
import { ButtonElement } from "./ButtonElement";
import { getButtonConfig, getStickConfig, getExtraButtons, isStickButton, getStickIndexForButton, isDpadButton, getSticks, getDpad, getButtons } from "../constants/controllerMappings";
import { getDpadDirection } from "../utils/stickDirection";
import { DEFAULT_DRIFT_THRESHOLD } from "../constants/defaults";
import "./ControllerVisualization.css";
import controllerSvg from "/controller.svg?url";

export type SelectedControl =
  | { type: "button"; buttonIndex: number }
  | { type: "stick"; stickIndex: number }
  | { type: "dpad" }
  | null;

interface ControllerVisualizationProps {
  gamepad: GamepadState;
  mapping?: GamepadMapping;
  selectedControl?: SelectedControl;
  onControlSelect?: (control: SelectedControl) => void;
}

export function ControllerVisualization({
  gamepad,
  mapping,
  selectedControl,
  onControlSelect,
}: ControllerVisualizationProps) {
  const getButton = (index: number) => {
    return gamepad.buttons[index] || { pressed: false, value: 0 };
  };

  const getButtonMapping = (buttonIndex: number) => {
    return mapping?.buttonMappings.find((m) => m.buttonIndex === buttonIndex);
  };

  const getStickMappings = (stickIndex: number) => {
    return (
      mapping?.axisMappings.filter((m) => m.stickIndex === stickIndex) || []
    );
  };

  const isButtonSelected = (buttonIndex: number) => {
    return selectedControl?.type === "button" && selectedControl.buttonIndex === buttonIndex;
  };

  const isStickSelected = (stickIndex: number) => {
    return selectedControl?.type === "stick" && selectedControl.stickIndex === stickIndex;
  };

  const isDpadSelected = () => {
    return selectedControl?.type === "dpad";
  };

  const handleButtonClick = (buttonIndex: number, config: ReturnType<typeof getButtonConfig>, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Handle special button behaviors - check stick and dpad configs
    const mapping = gamepad.mapping;
    if (isStickButton(buttonIndex, mapping)) {
      const stickIndex = getStickIndexForButton(buttonIndex, mapping);
      if (stickIndex !== undefined) {
        onControlSelect?.({ type: "stick", stickIndex });
        return;
      }
    }
    
    if (isDpadButton(buttonIndex, mapping)) {
      onControlSelect?.({ type: "dpad" });
      return;
    }
    
    onControlSelect?.({ type: "button", buttonIndex });
  };

  // Auto-select button when pressed on physical controller
  React.useEffect(() => {
    // Check for dpad buttons first
    const dpadDirection = getDpadDirection(gamepad.buttons);
    if (dpadDirection && selectedControl?.type !== "dpad") {
      onControlSelect?.({ type: "dpad" });
      return;
    }

    // Check other buttons
    gamepad.buttons.forEach((button, index) => {
      // Skip dpad buttons and stick buttons (they select stick/dpad instead)
      if (isDpadButton(index, gamepad.mapping) || isStickButton(index, gamepad.mapping)) return;

      if (button.pressed && button.value > DEFAULT_DRIFT_THRESHOLD) {
        const currentlySelected =
          selectedControl?.type === "button" &&
          selectedControl.buttonIndex === index;
        if (!currentlySelected) {
          onControlSelect?.({ type: "button", buttonIndex: index });
        }
      }
    });
  }, [gamepad.buttons, selectedControl, onControlSelect]);

  const handleControllerClick = (e: React.MouseEvent) => {
    // If clicking directly on controller (not on a button), deselect
    const target = e.target as HTMLElement;
    if (
      target.classList.contains("controller") ||
      target.classList.contains("controller-svg")
    ) {
      onControlSelect?.(null);
    }
  };

  // Get all buttons up to index 16 (standard buttons, 0-16)
  const standardButtons = getButtons(gamepad.mapping).filter(b => b.index <= 16);
  
  // Get extra buttons (index >= 17) for horizontal display at bottom
  const extraButtons = gamepad.buttons
    .map((_, index) => index)
    .filter(index => index >= 17 && getButton(index))
    .map(index => ({
      index,
      config: getButtonConfig(index, gamepad.mapping) || {
        index,
        label: `Btn ${index}`,
        type: 'extra' as const,
      },
    }));

  return (
    <div className="controller-wrapper">
      <div className="controller" onClick={handleControllerClick}>
        {/* SVG Background */}
        <img src={controllerSvg} alt="Controller" className="controller-svg" />

        {/* Visual elements (non-interactive) */}
        {getSticks(gamepad.mapping).map((stickConfig) => {
          const axes = stickConfig.axes;
          return (
            <div
              key={stickConfig.index}
              className={`stick-visual stick-visual-${stickConfig.index === 0 ? 'left' : 'right'}`}
            >
              <div
                className="stick-indicator"
                style={{
                  transform: `translate(${gamepad.axes[axes.x] * 35}px, ${
                    gamepad.axes[axes.y] * 35
                  }px)`,
                }}
              />
            </div>
          );
        })}

        {/* Render all standard buttons using ButtonElement */}
        {standardButtons.map((buttonConfig) => {
          const button = getButton(buttonConfig.index);
          const buttonMapping = getButtonMapping(buttonConfig.index);
          
          // Determine if button is selected
          let isSelected = false;
          if (isStickButton(buttonConfig.index, gamepad.mapping)) {
            const stickIndex = getStickIndexForButton(buttonConfig.index, gamepad.mapping);
            isSelected = stickIndex !== undefined ? isStickSelected(stickIndex) : false;
          } else if (isDpadButton(buttonConfig.index, gamepad.mapping)) {
            isSelected = isDpadSelected();
          } else {
            isSelected = isButtonSelected(buttonConfig.index);
          }

          // Special handling for D-Pad buttons - show mapping badge only on up button
          const dpad = getDpad(gamepad.mapping)
          const showDpadBadge = isDpadButton(buttonConfig.index, gamepad.mapping) && 
            dpad &&
            buttonConfig.index === dpad.buttons.up &&
            mapping?.dpadMappings && 
            mapping.dpadMappings.length > 0;

          // Special handling for stick buttons - merge button mapping and stick mappings
          let mergedStickBadge: string | undefined = undefined;
          if (isStickButton(buttonConfig.index, gamepad.mapping)) {
            const stickIndex = getStickIndexForButton(buttonConfig.index, gamepad.mapping);
            if (stickIndex !== undefined) {
              const stickMappings = getStickMappings(stickIndex);
              const parts: string[] = [];
              
              if (buttonMapping?.label) {
                parts.push(buttonMapping.label);
              }
              
              if (stickMappings.length > 0) {
                parts.push(`${stickMappings.length} dir${stickMappings.length > 1 ? 's' : ''}`);
              }
              
              if (parts.length > 0) {
                mergedStickBadge = parts.join(' + ');
              }
            }
          }

          return (
            <ButtonElement
              key={buttonConfig.index}
              config={buttonConfig}
              pressed={button.pressed}
              value={button.value}
              selected={isSelected}
              mappingLabel={
                mergedStickBadge
                  ? mergedStickBadge
                  : showDpadBadge && mapping?.dpadMappings
                  ? `${mapping.dpadMappings.length} mapped`
                  : buttonMapping?.label
              }
              onClick={(e) => handleButtonClick(buttonConfig.index, buttonConfig, e)}
            />
          );
        })}

      </div>

      {/* Extra buttons displayed horizontally at bottom */}
      {extraButtons.length > 0 && (
        <div className="extra-buttons-container">
          {extraButtons.map(({ index, config }) => {
            const button = getButton(index);
            const buttonMapping = getButtonMapping(index);
            
            return (
              <ButtonElement
                key={index}
                config={config}
                pressed={button.pressed}
                value={button.value}
                selected={isButtonSelected(index)}
                mappingLabel={buttonMapping?.label}
                onClick={(e) => handleButtonClick(index, config, e)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
