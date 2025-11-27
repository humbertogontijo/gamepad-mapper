import React from "react";
import { GamepadState } from "../hooks/useGamepad";
import { GamepadMapping } from "../hooks/useGamepadMapping";
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

const driftThreshold = 0.1;

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

  const isSelected = (
    type: "button" | "stick" | "dpad",
    index?: number,
    direction?: string
  ) => {
    if (!selectedControl) return false;
    if (selectedControl.type === type && selectedControl.type === "button") {
      return selectedControl.buttonIndex === index;
    }
    if (selectedControl.type === type && selectedControl.type === "stick") {
      return selectedControl.stickIndex === index;
    }
    if (selectedControl.type === type && selectedControl.type === "dpad") {
      return true;
    }
    return false;
  };

  const handleButtonClick = (buttonIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // If clicking LS (10) or RS (11), select the stick instead of the button
    if (buttonIndex === 10 || buttonIndex === 11) {
      const stickIndex = buttonIndex === 10 ? 0 : 1;
      onControlSelect?.({ type: "stick", stickIndex });
    } else if (buttonIndex >= 12 && buttonIndex <= 15) {
      // D-Pad buttons (12-15) select the dpad control
      onControlSelect?.({ type: "dpad" });
    } else {
      onControlSelect?.({ type: "button", buttonIndex });
    }
  };

  // Auto-select button when pressed on physical controller
  React.useEffect(() => {
    // Check for dpad buttons first (12-15)
    const dpadPressed =
      gamepad.buttons[12]?.pressed ||
      gamepad.buttons[13]?.pressed ||
      gamepad.buttons[14]?.pressed ||
      gamepad.buttons[15]?.pressed;
    if (dpadPressed && selectedControl?.type !== "dpad") {
      onControlSelect?.({ type: "dpad" });
      return;
    }

    // Check other buttons
    gamepad.buttons.forEach((button, index) => {
      // Skip dpad buttons (12-15) and stick buttons (10-11)
      if (index >= 12 && index <= 15) return;
      if (index === 10 || index === 11) return;

      if (button.pressed && button.value > driftThreshold) {
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

  return (
    <div className="controller-wrapper">
      <div className="controller" onClick={handleControllerClick}>
        {/* SVG Background */}
        <img src={controllerSvg} alt="Controller" className="controller-svg" />

        {/* Visual elements (non-interactive) */}
        <div className="stick-visual stick-visual-left">
          <div
            className="stick-indicator"
            style={{
              transform: `translate(${gamepad.axes[0] * 35}px, ${
                gamepad.axes[1] * 35
              }px)`,
            }}
          />
        </div>

        <div className="stick-visual stick-visual-right">
          <div
            className="stick-indicator"
            style={{
              transform: `translate(${gamepad.axes[2] * 35}px, ${
                gamepad.axes[3] * 35
              }px)`,
            }}
          />
        </div>

        {/* All buttons at the same level */}
        {/* Triggers */}
        <div
          className={`trigger trigger-left ${
            isSelected("button", 6) ? "selected" : ""
          }`}
          onClick={(e) => handleButtonClick(6, e)}
        >
          <div
            className={`trigger-visual ${
              getButton(6).value > driftThreshold ? "pressed" : ""
            }`}
            style={{ height: `${getButton(6).value * 100}%` }}
          />
          <div className="trigger-label">LT</div>
          {getButtonMapping(6) && (
            <div className="mapping-badge">{getButtonMapping(6)?.label}</div>
          )}
        </div>

        <div
          className={`trigger trigger-right ${
            isSelected("button", 7) ? "selected" : ""
          }`}
          onClick={(e) => handleButtonClick(7, e)}
        >
          <div
            className={`trigger-visual ${
              getButton(7).value > driftThreshold ? "pressed" : ""
            }`}
            style={{ height: `${getButton(7).value * 100}%` }}
          />
          <div className="trigger-label">RT</div>
          {getButtonMapping(7) && (
            <div className="mapping-badge">{getButtonMapping(7)?.label}</div>
          )}
        </div>

        {/* Bumpers */}
        <div
          className={`bumper bumper-left ${
            getButton(4).pressed ? "pressed" : ""
          } ${isSelected("button", 4) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(4, e)}
        >
          LB
          {getButtonMapping(4) && (
            <div className="mapping-badge">{getButtonMapping(4)?.label}</div>
          )}
        </div>

        <div
          className={`bumper bumper-right ${
            getButton(5).pressed ? "pressed" : ""
          } ${isSelected("button", 5) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(5, e)}
        >
          RB
          {getButtonMapping(5) && (
            <div className="mapping-badge">{getButtonMapping(5)?.label}</div>
          )}
        </div>

        {/* Sticks */}
        <div
          className={`stick-button stick-button-left ${
            getButton(10).pressed ? "pressed" : ""
          } ${
            selectedControl?.type === "stick" &&
            selectedControl.stickIndex === 0
              ? "selected"
              : ""
          }`}
          onClick={(e) => handleButtonClick(10, e)}
        >
          LS
          {getButtonMapping(10) && (
            <div className="mapping-badge">{getButtonMapping(10)?.label}</div>
          )}
        </div>

        <div
          className={`stick-button stick-button-right ${
            getButton(11).pressed ? "pressed" : ""
          } ${
            selectedControl?.type === "stick" &&
            selectedControl.stickIndex === 1
              ? "selected"
              : ""
          }`}
          onClick={(e) => handleButtonClick(11, e)}
        >
          RS
          {getButtonMapping(11) && (
            <div className="mapping-badge">{getButtonMapping(11)?.label}</div>
          )}
        </div>

        {/* D-Pad Buttons */}
        <div
          className={`dpad-button dpad-up ${
            getButton(12).pressed ? "pressed" : ""
          } ${isSelected("dpad") ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(12, e)}
        >
          ↑
          {mapping?.dpadMappings && mapping.dpadMappings.length > 0 && (
            <div className="mapping-badge">
              {mapping.dpadMappings.length} mapped
            </div>
          )}
        </div>

        <div
          className={`dpad-button dpad-down ${
            getButton(13).pressed ? "pressed" : ""
          } ${isSelected("dpad") ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(13, e)}
        >
          ↓
        </div>

        <div
          className={`dpad-button dpad-left ${
            getButton(14).pressed ? "pressed" : ""
          } ${isSelected("dpad") ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(14, e)}
        >
          ←
        </div>

        <div
          className={`dpad-button dpad-right ${
            getButton(15).pressed ? "pressed" : ""
          } ${isSelected("dpad") ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(15, e)}
        >
          →
        </div>

        {/* Center Buttons */}
        <div
          className={`center-button center-button-back ${
            getButton(8).pressed ? "pressed" : ""
          } ${isSelected("button", 8) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(8, e)}
        >
          <div className="button-icon">☰</div>
          {getButtonMapping(8) && (
            <div className="mapping-badge">{getButtonMapping(8)?.label}</div>
          )}
        </div>

        <div
          className={`center-button center-button-start ${
            getButton(9).pressed ? "pressed" : ""
          } ${isSelected("button", 9) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(9, e)}
        >
          <div className="button-icon">☰</div>
          {getButtonMapping(9) && (
            <div className="mapping-badge">{getButtonMapping(9)?.label}</div>
          )}
        </div>

        <div
          className={`center-button center-button-16 ${
            getButton(16).pressed ? "pressed" : ""
          } ${isSelected("button", 16) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(16, e)}
        >
          <div className="button-label">16</div>
          {getButtonMapping(16) && (
            <div className="mapping-badge">{getButtonMapping(16)?.label}</div>
          )}
        </div>

        <div
          className={`center-button center-button-17 ${
            getButton(17).pressed ? "pressed" : ""
          } ${isSelected("button", 17) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(17, e)}
        >
          <div className="button-label">17</div>
          {getButtonMapping(17) && (
            <div className="mapping-badge">{getButtonMapping(17)?.label}</div>
          )}
        </div>

        {/* Face Buttons */}
        <div
          className={`face-button face-a ${
            getButton(0).pressed ? "pressed" : ""
          } ${isSelected("button", 0) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(0, e)}
        >
          A
          {getButtonMapping(0) && (
            <div className="mapping-badge">{getButtonMapping(0)?.label}</div>
          )}
        </div>

        <div
          className={`face-button face-b ${
            getButton(1).pressed ? "pressed" : ""
          } ${isSelected("button", 1) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(1, e)}
        >
          B
          {getButtonMapping(1) && (
            <div className="mapping-badge">{getButtonMapping(1)?.label}</div>
          )}
        </div>

        <div
          className={`face-button face-x ${
            getButton(2).pressed ? "pressed" : ""
          } ${isSelected("button", 2) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(2, e)}
        >
          X
          {getButtonMapping(2) && (
            <div className="mapping-badge">{getButtonMapping(2)?.label}</div>
          )}
        </div>

        <div
          className={`face-button face-y ${
            getButton(3).pressed ? "pressed" : ""
          } ${isSelected("button", 3) ? "selected" : ""}`}
          onClick={(e) => handleButtonClick(3, e)}
        >
          Y
          {getButtonMapping(3) && (
            <div className="mapping-badge">{getButtonMapping(3)?.label}</div>
          )}
        </div>

        {/* Mapping badges for sticks */}
        {getStickMappings(0).length > 0 && (
          <div className="mapping-badge stick-mapping-left">
            {getStickMappings(0).length} mapped
          </div>
        )}

        {getStickMappings(1).length > 0 && (
          <div className="mapping-badge stick-mapping-right">
            {getStickMappings(1).length} mapped
          </div>
        )}
      </div>
    </div>
  );
}
