/**
 * Utility functions for political bias handling
 */

/**
 * Converts a string orientation and confidence value to a numerical score
 * for consistent display scaling
 * @param orientation The orientation as 'left', 'right', or 'center'
 * @param confidence The confidence value (0-1)
 * @returns A numerical bias value between -1 and 1
 */
export const getPoliticalBiasScore = (
  orientation: "left" | "right" | "center" | undefined,
  confidence: number | undefined
): number => {
  if (!orientation || confidence === undefined) return 0;

  switch (orientation) {
    case "left":
      return -confidence; // Left is negative
    case "right":
      return confidence; // Right is positive
    case "center":
    default:
      return 0; // Center is zero
  }
};

/**
 * Converts a numerical political bias score to a descriptive text representation
 * @param biasScore The numerical bias score (range: -1 to 1, negative = left, positive = right)
 * @returns A descriptive string representing the political orientation
 */
export const getPoliticalBiasDescription = (biasScore: number): string => {
  if (biasScore <= -0.8) {
    return "Far Left";
  } else if (biasScore <= -0.5) {
    return "Left";
  } else if (biasScore <= -0.3) {
    return "Left Leaning";
  } else if (biasScore < 0.3 && biasScore > -0.3) {
    return "Center";
  } else if (biasScore < 0.5) {
    return "Right Leaning";
  } else if (biasScore < 0.8) {
    return "Right";
  } else {
    return "Far Right";
  }
};

/**
 * Gets the appropriate color for a political bias value
 * @param biasScore The numerical bias score (range: -1 to 1)
 * @returns The CSS color value for the bias level
 */
export const getPoliticalBiasColor = (biasScore: number): string => {
  // Blue for left, red for right, gray for center
  if (biasScore <= -0.7) {
    return "var(--ion-color-primary-shade)"; // Darker blue for far left
  } else if (biasScore <= -0.3) {
    return "var(--ion-color-primary)"; // Blue for left
  } else if (biasScore < 0.3 && biasScore > -0.3) {
    return "var(--ion-color-medium)"; // Gray for center
  } else if (biasScore < 0.7) {
    return "var(--ion-color-danger)"; // Red for right
  } else {
    return "var(--ion-color-danger-shade)"; // Darker red for far right
  }
};

/**
 * Gets the appropriate background color for a political bias value (lighter version)
 * @param biasScore The numerical bias score (range: -1 to 1)
 * @returns The CSS background color value for the bias level
 */
export const getPoliticalBiasBgColor = (biasScore: number): string => {
  if (biasScore <= -0.7) {
    return "rgba(var(--ion-color-primary-rgb), 0.15)"; // Light blue for far left
  } else if (biasScore <= -0.3) {
    return "rgba(var(--ion-color-primary-rgb), 0.1)"; // Light blue for left
  } else if (biasScore < 0.3 && biasScore > -0.3) {
    return "rgba(var(--ion-color-medium-rgb), 0.1)"; // Light gray for center
  } else if (biasScore < 0.7) {
    return "rgba(var(--ion-color-danger-rgb), 0.1)"; // Light red for right
  } else {
    return "rgba(var(--ion-color-danger-rgb), 0.15)"; // Light red for far right
  }
};
