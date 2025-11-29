import { useState, useCallback, useEffect, useRef } from "react";
import { GamepadState } from "./useGamepad";
import {
  getStickDirection,
  getDpadDirection,
  getStickAxes,
} from "../utils/stickDirection";
import {
  DEFAULT_STICK_THRESHOLD,
  DEFAULT_MOUSE_SENSITIVITY,
  DEFAULT_MOUSE_ACCELERATION,
  DEFAULT_MOUSE_INVERT_X,
  DEFAULT_MOUSE_INVERT_Y,
  DEFAULT_STICK_MAPPING_TYPE,
} from "../constants/defaults";

export interface ButtonMapping {
  buttonIndex: number;
  key: string;
  label: string;
}

export type StickDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

export type StickMappingType = "hotkey" | "mouse";

export interface AxisMapping {
  stickIndex: number; // 0 for left stick, 1 for right stick
  direction: StickDirection; // Only used for hotkey mode
  key: string;
  label: string;
  threshold: number;
  type: StickMappingType; // 'hotkey' for 8 directions, 'mouse' for mouse control
  sensitivity?: number; // For mouse control (0.1 - 10.0)
  acceleration?: number; // For mouse control (0.0 - 2.0)
  invertX?: boolean; // For mouse control
  invertY?: boolean; // For mouse control
}

export interface DpadMapping {
  direction: StickDirection;
  key: string;
  label: string;
}

export interface GamepadMapping {
  gamepadIndex: number;
  buttonMappings: ButtonMapping[];
  axisMappings: AxisMapping[];
  dpadMappings?: DpadMapping[];
}

const STORAGE_KEY = "gamepad-mappings";

export function useGamepadMapping(gamepads: GamepadState[]) {
  const [mappings, setMappings] = useState<GamepadMapping[]>([]);
  const [editingButton, setEditingButton] = useState<{
    gamepadIndex: number;
    buttonIndex: number;
  } | null>(null);
  const [editingAxis, setEditingAxis] = useState<{
    gamepadIndex: number;
    stickIndex: number;
    direction: StickDirection;
  } | null>(null);
  const [editingDpad, setEditingDpad] = useState<{
    gamepadIndex: number;
    direction: StickDirection;
  } | null>(null);

  // Load mappings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMappings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load mappings:", e);
      }
    }
  }, []);

  // Initialize mappings for new gamepads
  useEffect(() => {
    setMappings((prev) => {
      const updated = [...prev];
      gamepads.forEach((gamepad) => {
        const existing = updated.find((m) => m.gamepadIndex === gamepad.index);
        if (!existing) {
          updated.push({
            gamepadIndex: gamepad.index,
            buttonMappings: [],
            axisMappings: [],
            dpadMappings: [],
          });
        }
      });
      return updated;
    });
  }, [gamepads]);

  // Save mappings to localStorage
  useEffect(() => {
    if (mappings.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    }
  }, [mappings]);

  const getMapping = useCallback(
    (gamepadIndex: number): GamepadMapping | undefined => {
      return mappings.find((m) => m.gamepadIndex === gamepadIndex);
    },
    [mappings]
  );

  // Memoize mouse mappings lookup to avoid filtering every frame
  const getMouseMappings = useCallback((mapping: GamepadMapping) => {
    return mapping.axisMappings.filter((m) => m.type === "mouse");
  }, []);

  const setButtonMapping = useCallback(
    (gamepadIndex: number, buttonIndex: number, key: string, label: string) => {
      setMappings((prev) => {
        const updated = [...prev];
        let mapping = updated.find((m) => m.gamepadIndex === gamepadIndex);

        if (!mapping) {
          mapping = {
            gamepadIndex,
            buttonMappings: [],
            axisMappings: [],
            dpadMappings: [],
          };
          updated.push(mapping);
        }

        const existingButtonMapping = mapping.buttonMappings.find(
          (m) => m.buttonIndex === buttonIndex
        );
        if (existingButtonMapping) {
          existingButtonMapping.key = key;
          existingButtonMapping.label = label;
        } else {
          mapping.buttonMappings.push({ buttonIndex, key, label });
        }

        return updated;
      });
      setEditingButton(null);
    },
    []
  );

  const setAxisMapping = useCallback(
    (
      gamepadIndex: number,
      stickIndex: number,
      direction: StickDirection,
      key: string,
      label: string,
      threshold: number = DEFAULT_STICK_THRESHOLD,
      type: StickMappingType = DEFAULT_STICK_MAPPING_TYPE,
      sensitivity: number = DEFAULT_MOUSE_SENSITIVITY,
      acceleration: number = DEFAULT_MOUSE_ACCELERATION,
      invertX: boolean = DEFAULT_MOUSE_INVERT_X,
      invertY: boolean = DEFAULT_MOUSE_INVERT_Y
    ) => {
      setMappings((prev) => {
        const updated = [...prev];
        let mapping = updated.find((m) => m.gamepadIndex === gamepadIndex);

        if (!mapping) {
          mapping = {
            gamepadIndex,
            buttonMappings: [],
            axisMappings: [],
            dpadMappings: [],
          };
          updated.push(mapping);
        }

        if (type === "mouse") {
          // For mouse mode, there's only one mapping per stick (direction doesn't matter)
          const existingMouseMapping = mapping.axisMappings.find(
            (m) => m.stickIndex === stickIndex && m.type === "mouse"
          );
          if (existingMouseMapping) {
            existingMouseMapping.threshold = threshold;
            existingMouseMapping.sensitivity = sensitivity;
            existingMouseMapping.acceleration = acceleration;
            existingMouseMapping.invertX = invertX;
            existingMouseMapping.invertY = invertY;
          } else {
            // Remove all hotkey mappings for this stick when adding mouse mapping
            mapping.axisMappings = mapping.axisMappings.filter(
              (m) => !(m.stickIndex === stickIndex && m.type === "hotkey")
            );
            mapping.axisMappings.push({
              stickIndex,
              direction: "up",
              key: "Mouse",
              label: "Mouse",
              threshold,
              type: "mouse",
              sensitivity,
              acceleration,
              invertX,
              invertY,
            });
          }
        } else {
          // Hotkey mode - individual direction mappings
          const existingAxisMapping = mapping.axisMappings.find(
            (m) =>
              m.stickIndex === stickIndex &&
              m.direction === direction &&
              m.type === "hotkey"
          );
          if (existingAxisMapping) {
            existingAxisMapping.key = key;
            existingAxisMapping.label = label;
            existingAxisMapping.threshold = threshold;
          } else {
            // Remove mouse mapping if exists when adding hotkey mapping
            mapping.axisMappings = mapping.axisMappings.filter(
              (m) => !(m.stickIndex === stickIndex && m.type === "mouse")
            );
            mapping.axisMappings.push({
              stickIndex,
              direction,
              key,
              label,
              threshold,
              type: "hotkey",
            });
          }
        }

        return updated;
      });
      setEditingAxis(null);
    },
    []
  );

  const removeButtonMapping = useCallback(
    (gamepadIndex: number, buttonIndex: number) => {
      setMappings((prev) => {
        const updated = [...prev];
        const mapping = updated.find((m) => m.gamepadIndex === gamepadIndex);
        if (mapping) {
          mapping.buttonMappings = mapping.buttonMappings.filter(
            (m) => m.buttonIndex !== buttonIndex
          );
        }
        return updated;
      });
    },
    []
  );

  const removeAxisMapping = useCallback(
    (gamepadIndex: number, stickIndex: number, direction: StickDirection) => {
      setMappings((prev) => {
        const updated = [...prev];
        const mapping = updated.find((m) => m.gamepadIndex === gamepadIndex);
        if (mapping) {
          mapping.axisMappings = mapping.axisMappings.filter(
            (m) => !(m.stickIndex === stickIndex && m.direction === direction)
          );
        }
        return updated;
      });
    },
    []
  );

  const setDpadMapping = useCallback(
    (
      gamepadIndex: number,
      direction: StickDirection,
      key: string,
      label: string
    ) => {
      setMappings((prev) => {
        const updated = [...prev];
        let mapping = updated.find((m) => m.gamepadIndex === gamepadIndex);

        if (!mapping) {
          mapping = {
            gamepadIndex,
            buttonMappings: [],
            axisMappings: [],
            dpadMappings: [],
          };
          updated.push(mapping);
        }

        if (!mapping.dpadMappings) {
          mapping.dpadMappings = [];
        }

        const existingDpadMapping = mapping.dpadMappings.find(
          (m) => m.direction === direction
        );
        if (existingDpadMapping) {
          existingDpadMapping.key = key;
          existingDpadMapping.label = label;
        } else {
          mapping.dpadMappings.push({ direction, key, label });
        }

        return updated;
      });
      setEditingDpad(null);
    },
    []
  );

  const removeDpadMapping = useCallback(
    (gamepadIndex: number, direction: StickDirection) => {
      setMappings((prev) => {
        const updated = [...prev];
        const mapping = updated.find((m) => m.gamepadIndex === gamepadIndex);
        if (mapping && mapping.dpadMappings) {
          mapping.dpadMappings = mapping.dpadMappings.filter(
            (m) => m.direction !== direction
          );
        }
        return updated;
      });
    },
    []
  );

  // Helper function to get fallback cardinal directions for diagonal directions
  const getFallbackDirections = useCallback(
    (direction: StickDirection): StickDirection[] => {
      switch (direction) {
        case "up-left":
          return ["up", "left"];
        case "up-right":
          return ["up", "right"];
        case "down-left":
          return ["down", "left"];
        case "down-right":
          return ["down", "right"];
        default:
          return [];
      }
    },
    []
  );

  // Track which stateKeys are holding each key (allows multiple buttons to hold same key)
  const keyHoldersRef = useRef<Map<string, Set<string>>>(new Map());
  // Track previous button states to only trigger on state changes
  const previousButtonStatesRef = useRef<Map<string, boolean>>(new Map());
  // Track previous axis states to only trigger on state changes
  const previousAxisStatesRef = useRef<Map<string, boolean>>(new Map());
  // Track pending mouse movements to prevent queuing (which causes drift)
  const pendingMouseMovementsRef = useRef<Set<string>>(new Set());
  // Track when each stick started moving for time-based acceleration
  const stickMovementStartTimeRef = useRef<Map<string, number>>(new Map());

  // Simulate keyboard key press or mouse button via Electron IPC
  const simulateKeyPress = useCallback(
    async (key: string, pressed: boolean, stateKey: string) => {
      // Check if state actually changed
      const previousState =
        previousButtonStatesRef.current.get(stateKey) ??
        previousAxisStatesRef.current.get(stateKey);
      if (previousState === pressed) {
        // State hasn't changed, don't do anything
        return;
      }

      // Update previous state
      if (stateKey.startsWith("button-")) {
        previousButtonStatesRef.current.set(stateKey, pressed);
      } else {
        previousAxisStatesRef.current.set(stateKey, pressed);
      }

      // Get or create the set of stateKeys holding this key/button
      if (!keyHoldersRef.current.has(key)) {
        keyHoldersRef.current.set(key, new Set());
      }
      const holders = keyHoldersRef.current.get(key)!;

      const wasPressed = holders.size > 0;

      if (pressed) {
        // Add this stateKey to the holders set
        holders.add(stateKey);

        // Only press the key/button if it wasn't already pressed by another button
        if (!wasPressed) {
          try {
            let result;
            // Check if it's a mouse button
            if (key.startsWith("Mouse")) {
              if (!window.mouseSimulator) {
                console.warn("Mouse simulator not available");
                return;
              }
              result = await window.mouseSimulator.buttonToggle(key, true);
            } else {
              if (!window.keySimulator) {
                console.warn("Key simulator not available");
                return;
              }
              result = await window.keySimulator.keyToggle(key, true);
            }

            if (result && !result.success && result.error) {
              console.error("Input simulation error:", result.error);
              // If it's a permissions error, log it prominently
              if (result.error.includes("Accessibility permissions")) {
                console.error(
                  "⚠️ Accessibility permissions required! Please grant permissions in System Preferences > Security & Privacy > Privacy > Accessibility"
                );
              }
            }
          } catch (error) {
            console.error("Error pressing key/button:", error);
          }
        }
      } else {
        // Remove this stateKey from the holders set
        holders.delete(stateKey);

        // Only release the key/button if no other buttons are holding it
        if (wasPressed && holders.size === 0) {
          try {
            let result;
            // Check if it's a mouse button
            if (key.startsWith("Mouse")) {
              if (!window.mouseSimulator) {
                console.warn("Mouse simulator not available");
                return;
              }
              result = await window.mouseSimulator.buttonToggle(key, false);
            } else {
              if (!window.keySimulator) {
                console.warn("Key simulator not available");
                return;
              }
              result = await window.keySimulator.keyToggle(key, false);
            }

            if (result && !result.success && result.error) {
              console.error("Input simulation error:", result.error);
              if (result.error.includes("Accessibility permissions")) {
                console.error(
                  "⚠️ Accessibility permissions required! Please grant permissions in System Preferences > Security & Privacy > Privacy > Accessibility"
                );
              }
            }
          } catch (error) {
            console.error("Error releasing key/button:", error);
          }
        }
      }
    },
    []
  );

  // Check and trigger mappings based on gamepad state
  useEffect(() => {
    gamepads.forEach((gamepad) => {
      const mapping = getMapping(gamepad.index);
      if (!mapping) return;

      // Check button mappings
      mapping.buttonMappings.forEach((btnMapping) => {
        const button = gamepad.buttons[btnMapping.buttonIndex];
        if (button) {
          const stateKey = `gamepad-${gamepad.index}-button-${btnMapping.buttonIndex}`;
          simulateKeyPress(btnMapping.key, button.pressed, stateKey);
        }
      });

      // Check dpad mappings with combined keys
      if (mapping.dpadMappings && mapping.dpadMappings.length > 0) {
        const currentDirection = getDpadDirection(gamepad.buttons);

        // Check if there's a direct mapping for the current direction
        const hasDirectMapping =
          currentDirection &&
          mapping.dpadMappings.some((m) => m.direction === currentDirection);

        // Process each dpad mapping
        mapping.dpadMappings.forEach((dpadMapping) => {
          const stateKey = `gamepad-${gamepad.index}-dpad-${dpadMapping.direction}`;
          let isActive = false;

          if (currentDirection === dpadMapping.direction) {
            // Direct match
            isActive = true;
          } else if (currentDirection && !hasDirectMapping) {
            // No direct mapping - check if this is a fallback cardinal direction for a diagonal
            const fallbackDirections = getFallbackDirections(currentDirection);
            isActive = fallbackDirections.includes(dpadMapping.direction);
          }

          simulateKeyPress(dpadMapping.key, isActive, stateKey);
        });
      }

      // Process axis mappings - handle both hotkey and mouse control modes
      // Check if mouse mode is enabled for each stick
      const mouseMappings = getMouseMappings(mapping);
      const sticksWithMouse = new Set(mouseMappings.map((m) => m.stickIndex));
      const processedMouseSticks = new Set<number>();

      // Process mouse mappings first (one per stick)
      mouseMappings.forEach((mouseMapping) => {
        const stickIndex = mouseMapping.stickIndex;
        if (processedMouseSticks.has(stickIndex)) {
          return; // Already processed this stick
        }
        processedMouseSticks.add(stickIndex);

        // Get stick axes based on stick index
        const { axisXIndex, axisYIndex } = getStickAxes(stickIndex);
        let stickX = gamepad.axes[axisXIndex] || 0;
        let stickY = gamepad.axes[axisYIndex] || 0;

        // Apply user invert settings
        if (mouseMapping.invertX) stickX = -stickX;
        if (mouseMapping.invertY) stickY = -stickY;

        // Use flat deadzone threshold for X and Y independently (not relative to magnitude)
        const absX = Math.abs(stickX);
        const absY = Math.abs(stickY);
        const threshold = mouseMapping.threshold;
        const inDeadzone = absX < threshold && absY < threshold;

        const mouseStateKey = `gamepad-${gamepad.index}-mouse-${stickIndex}`;

        if (inDeadzone) {
          // Reset movement start time when stick returns to deadzone
          stickMovementStartTimeRef.current.delete(mouseStateKey);
          return; // In deadzone - don't move mouse
        }

        // Calculate movement with sensitivity and acceleration
        const sensitivity =
          mouseMapping.sensitivity ?? DEFAULT_MOUSE_SENSITIVITY;
        const acceleration =
          mouseMapping.acceleration ?? DEFAULT_MOUSE_ACCELERATION;

        // Track movement start time for time-based acceleration
        const now = Date.now();
        if (!stickMovementStartTimeRef.current.has(mouseStateKey)) {
          stickMovementStartTimeRef.current.set(mouseStateKey, now);
        }
        const movementStartTime =
          stickMovementStartTimeRef.current.get(mouseStateKey)!;
        const movementDurationSeconds = (now - movementStartTime) / 1000;

        // Remove deadzone: subtract threshold from X and Y independently (flat deadzone)
        let normalizedX = 0;
        let normalizedY = 0;

        if (absX >= threshold) {
          const signX = stickX >= 0 ? 1 : -1;
          normalizedX = (signX * (absX - threshold)) / (1 - threshold);
        }

        if (absY >= threshold) {
          const signY = stickY >= 0 ? 1 : -1;
          normalizedY = (signY * (absY - threshold)) / (1 - threshold);
        }

        // Apply time-based acceleration: acceleration = 1 means no acceleration,
        // acceleration = 1.2 means 1.2x speed every second
        let accelerationMultiplier = 1.0;
        if (acceleration !== 1.0 && movementDurationSeconds > 0) {
          // acceleration^time gives us the multiplier
          // e.g., acceleration=1.2, time=1s -> 1.2^1 = 1.2x
          // e.g., acceleration=1.2, time=2s -> 1.2^2 = 1.44x
          accelerationMultiplier = Math.pow(
            acceleration,
            movementDurationSeconds
          );
        }

        // Calculate movement delta
        const deltaX = normalizedX * sensitivity * accelerationMultiplier * 10;
        const deltaY = normalizedY * sensitivity * accelerationMultiplier * 10;

        // Final check: re-read stick state RIGHT BEFORE sending to prevent drift
        // This ensures we never send a movement if stick is already released
        let finalStickX = gamepad.axes[axisXIndex] || 0;
        let finalStickY = gamepad.axes[axisYIndex] || 0;
        if (mouseMapping.invertX) finalStickX = -finalStickX;
        if (mouseMapping.invertY) finalStickY = -finalStickY;

        if (
          Math.abs(finalStickX) < threshold &&
          Math.abs(finalStickY) < threshold
        ) {
          // Reset movement start time when stick returns to deadzone
          stickMovementStartTimeRef.current.delete(mouseStateKey);
          return; // In deadzone now - don't send movement
        }

        // Prevent queuing: only send if no pending movement for this stick
        // Queued IPC calls cause drift because each reads mouse position after previous move
        if (pendingMouseMovementsRef.current.has(mouseStateKey)) {
          return; // Skip this frame - previous movement still pending
        }

        // Send movement - mark as pending to prevent queuing
        if (window.mouseSimulator) {
          pendingMouseMovementsRef.current.add(mouseStateKey);
          window.mouseSimulator
            .moveMouse(deltaX, deltaY)
            .then(() => {
              pendingMouseMovementsRef.current.delete(mouseStateKey);
            })
            .catch((err) => {
              console.error("Error moving mouse:", err);
              pendingMouseMovementsRef.current.delete(mouseStateKey);
            });
        }
      });

      // Process hotkey mappings (skip if mouse mode is enabled for that stick)
      // Group by stick index to check for direct mappings efficiently
      const stickMappingsByStick = mapping.axisMappings.reduce(
        (acc, axisMapping) => {
          if (
            axisMapping.type === "hotkey" &&
            !sticksWithMouse.has(axisMapping.stickIndex)
          ) {
            acc.set(
              axisMapping.stickIndex,
              (acc.get(axisMapping.stickIndex) || []).concat(axisMapping)
            );
          }
          return acc;
        },
        new Map<number, AxisMapping[]>()
      );

      // Process each stick's mappings
      stickMappingsByStick.entries().forEach(([stickIndex, axisMappings]) => {
        const { axisXIndex, axisYIndex } = getStickAxes(stickIndex);
        const stickX = gamepad.axes[axisXIndex] || 0;
        const stickY = gamepad.axes[axisYIndex] || 0;

        // Get all configured directions for this stick (to check if diagonal has direct mapping)
        const configuredDirections = new Set(
          axisMappings.map((m) => m.direction)
        );

        // Process each mapping for this stick
        Promise.all(
          axisMappings.map((axisMapping) => {
            const stateKey = `gamepad-${gamepad.index}-axis-${axisMapping.stickIndex}-${axisMapping.direction}`;
            const detectedDirection = getStickDirection(
              stickX,
              stickY,
              axisMapping.threshold
            );
            let isActive = false;

            if (detectedDirection === axisMapping.direction) {
              // Direct match
              isActive = true;
            } else if (
              detectedDirection &&
              !configuredDirections.has(detectedDirection)
              
            ) {
              // No direct mapping configured for detected direction - check if this is a fallback cardinal direction for a diagonal
              const fallbackDirections =
                getFallbackDirections(detectedDirection);
              isActive = fallbackDirections.includes(axisMapping.direction);
            }

            return simulateKeyPress(axisMapping.key, isActive, stateKey);
          })
        );
      });
    });
  }, [gamepads, getMapping, getMouseMappings, simulateKeyPress]);

  return {
    mappings,
    getMapping,
    setButtonMapping,
    setAxisMapping,
    setDpadMapping,
    removeButtonMapping,
    removeAxisMapping,
    removeDpadMapping,
    editingButton,
    setEditingButton,
    editingAxis,
    setEditingAxis,
    editingDpad,
    setEditingDpad,
  };
}
