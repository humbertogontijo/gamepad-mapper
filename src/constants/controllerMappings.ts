/**
 * Controller button and axis mappings
 */

export interface ButtonConfig {
  index: number;
  label: string;
  type: "face" | "bumper" | "trigger" | "center" | "stick" | "dpad" | "extra";
  icon?: string;
  side?: "left" | "right"; // For buttons that have left/right variants
  dpadDirection?: "up" | "down" | "left" | "right"; // For D-Pad buttons
}

export interface StickConfig {
  index: number;
  label: string;
  buttonIndex: number; // Button index for stick press
  axes: {
    x: number;
    y: number;
  };
}

export interface DpadConfig {
  buttons: {
    up: number;
    down: number;
    left: number;
    right: number;
  };
}

export interface ControllerMapping {
  buttons: ButtonConfig[];
  sticks: StickConfig[];
  dpad: DpadConfig;
}

/**
 * Generate className for a button based on its type and index
 */
export function getButtonClassName(config: ButtonConfig): string {
  const baseClass = `${config.type}-button`;

  if (config.type === "face") {
    // Face buttons: face-button face-a, face-button face-b, etc.
    const faceLabels = ["a", "b", "x", "y"];
    return `${baseClass} face-${faceLabels[config.index] || config.index}`;
  }

  if (
    config.type === "bumper" ||
    config.type === "trigger" ||
    config.type === "stick"
  ) {
    // Use side if available, otherwise infer from index
    const side = config.side || (config.index % 2 === 0 ? "left" : "right");
    return `${baseClass} ${config.type}-${side}`;
  }

  if (config.type === "dpad") {
    // D-Pad buttons: dpad-button dpad-up, etc.
    return `${baseClass} dpad-${config.dpadDirection || "up"}`;
  }

  if (config.type === "center") {
    // Center buttons: center-button center-button-{index}
    return `${baseClass} center-button-${config.index}`;
  }

  if (config.type === "extra") {
    return "extra-button";
  }

  return baseClass;
}

/**
 * Standard gamepad mapping (for gamepads with mapping === "standard")
 * Based on the standard gamepad layout specification
 */
const STANDARD_MAPPING: ControllerMapping = {
  buttons: [
    // Button 0: Bottom button in right cluster (A)
    { index: 0, label: "A", type: "face" as const },
    // Button 1: Right button in right cluster (B)
    { index: 1, label: "B", type: "face" as const },
    // Button 2: Left button in right cluster (X)
    { index: 2, label: "X", type: "face" as const },
    // Button 3: Top button in right cluster (Y)
    { index: 3, label: "Y", type: "face" as const },
    // Button 4: Top left front button (LB)
    { index: 4, label: "LB", type: "bumper" as const, side: "left" as const },
    // Button 5: Top right front button (RB)
    { index: 5, label: "RB", type: "bumper" as const, side: "right" as const },
    // Button 6: Bottom left front button (LT)
    { index: 6, label: "LT", type: "trigger" as const, side: "left" as const },
    // Button 7: Bottom right front button (RT)
    { index: 7, label: "RT", type: "trigger" as const, side: "right" as const },
    // Button 8: Left button in center cluster (Back)
    { index: 8, label: "Back", type: "center" as const, icon: "☰" },
    // Button 9: Right button in center cluster (Start)
    { index: 9, label: "Start", type: "center" as const, icon: "☰" },
    // Button 10: Left stick pressed button (LS)
    { index: 10, label: "LS", type: "stick" as const, side: "left" as const },
    // Button 11: Right stick pressed button (RS)
    { index: 11, label: "RS", type: "stick" as const, side: "right" as const },
    // Button 12: Top button in left cluster (D-Pad Up)
    {
      index: 12,
      label: "↑",
      type: "dpad" as const,
      dpadDirection: "up" as const,
    },
    // Button 13: Bottom button in left cluster (D-Pad Down)
    {
      index: 13,
      label: "↓",
      type: "dpad" as const,
      dpadDirection: "down" as const,
    },
    // Button 14: Left button in left cluster (D-Pad Left)
    {
      index: 14,
      label: "←",
      type: "dpad" as const,
      dpadDirection: "left" as const,
    },
    // Button 15: Right button in left cluster (D-Pad Right)
    {
      index: 15,
      label: "→",
      type: "dpad" as const,
      dpadDirection: "right" as const,
    },
    // Button 16: Center button in center cluster
    { index: 16, label: "16", type: "center" as const },
    // Buttons 17+ are extra buttons and will be generated dynamically
  ],

  sticks: [
    {
      index: 0,
      label: "LS",
      buttonIndex: 10,
      // Axes 0: Horizontal axis for left stick (negative left/positive right)
      // Axes 1: Vertical axis for left stick (negative up/positive down)
      axes: { x: 0, y: 1 },
    },
    {
      index: 1,
      label: "RS",
      buttonIndex: 11,
      // Axes 2: Horizontal axis for right stick (negative left/positive right)
      // Axes 3: Vertical axis for right stick (negative up/positive down)
      axes: { x: 2, y: 3 },
    },
  ],

  dpad: {
    buttons: {
      up: 12,
      down: 13,
      left: 14,
      right: 15,
    },
  },
};

/**
 * Get controller mapping for a gamepad
 * Uses STANDARD_MAPPING if gamepad.mapping === "standard", otherwise returns STANDARD_MAPPING as fallback
 */
export function getControllerMapping(mapping?: string): ControllerMapping {
  if (mapping === "standard") {
    return STANDARD_MAPPING;
  }
  // Fallback to standard mapping for non-standard gamepads
  return STANDARD_MAPPING;
}

/**
 * Get button configuration for a given index and gamepad mapping
 */
export function getButtonConfig(
  index: number,
  mapping?: string
): ButtonConfig | undefined {
  const controllerMapping = getControllerMapping(mapping);
  const buttons = controllerMapping.buttons;

  const config = buttons.find((b) => b.index === index);
  if (!config && index >= 17) {
    // Generate config for extra buttons (index >= 17)
    return {
      index,
      label: `Btn ${index}`,
      type: "extra",
    };
  }
  return config;
}

/**
 * Get all extra buttons (index >= 17) for a given gamepad mapping
 */
export function getExtraButtons(mapping?: string): ButtonConfig[] {
  const controllerMapping = getControllerMapping(mapping);
  return controllerMapping.buttons.filter((b) => b.index >= 17);
}

/**
 * Get stick configuration for a given index and gamepad mapping
 */
export function getStickConfig(
  stickIndex: number,
  mapping?: string
): StickConfig | undefined {
  const controllerMapping = getControllerMapping(mapping);
  return controllerMapping.sticks.find((s) => s.index === stickIndex);
}

/**
 * Check if a button index corresponds to a stick button
 */
export function isStickButton(
  buttonIndex: number,
  mapping?: string
): boolean {
  const controllerMapping = getControllerMapping(mapping);
  return controllerMapping.sticks.some((s) => s.buttonIndex === buttonIndex);
}

/**
 * Get stick index for a given button index (if it's a stick button)
 */
export function getStickIndexForButton(
  buttonIndex: number,
  mapping?: string
): number | undefined {
  const controllerMapping = getControllerMapping(mapping);
  const stickConfig = controllerMapping.sticks.find((s) => s.buttonIndex === buttonIndex);
  return stickConfig?.index;
}

/**
 * Check if a button index corresponds to a dpad button
 */
export function isDpadButton(buttonIndex: number, mapping?: string): boolean {
  const controllerMapping = getControllerMapping(mapping);
  const dpad = controllerMapping.dpad;
  if (!dpad) return false;

  return (
    buttonIndex === dpad.buttons.up ||
    buttonIndex === dpad.buttons.down ||
    buttonIndex === dpad.buttons.left ||
    buttonIndex === dpad.buttons.right
  );
}

/**
 * Get all buttons for a given gamepad mapping
 */
export function getButtons(mapping?: string): ButtonConfig[] {
  const controllerMapping = getControllerMapping(mapping);
  return controllerMapping.buttons;
}

/**
 * Get all sticks for a given gamepad mapping
 */
export function getSticks(mapping?: string): StickConfig[] {
  const controllerMapping = getControllerMapping(mapping);
  return controllerMapping.sticks;
}

/**
 * Get dpad config for a given gamepad mapping
 */
export function getDpad(mapping?: string): DpadConfig | undefined {
  const controllerMapping = getControllerMapping(mapping);
  return controllerMapping.dpad;
}
