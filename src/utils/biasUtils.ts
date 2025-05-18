/**
 * Utility functions for language bias handling
 */

/**
 * Converts a numerical bias value to a descriptive text representation
 * Uses unidirectional terminology (degree of bias rather than bidirectional scale)
 * @param biasValue The numerical bias value (range: -1 to 1)
 * @returns A descriptive string representing the bias level
 */
export const getBiasDescription = (biasValue: number): string => {
  if (biasValue <= -0.7) {
    return "Without Bias";
  } else if (biasValue <= -0.3) {
    return "Low Bias";
  } else if (biasValue < 0.3) {
    return "Moderate Bias";
  } else if (biasValue < 0.7) {
    return "High Bias";
  } else {
    return "Extreme Bias";
  }
};

/**
 * Gets the appropriate color variable for a bias value
 * @param biasValue The numerical bias value (range: -1 to 1)
 * @returns The Ionic color variable name for the bias level
 */
export const getBiasColorClass = (biasValue: number): string => {
  if (biasValue <= -0.3) {
    return "var(--ion-color-success)";
  } else if (biasValue < 0.3) {
    return "var(--ion-color-warning-shade)";
  } else {
    return "var(--ion-color-danger)";
  }
};

/**
 * Gets the appropriate background color variable for a bias value (lighter version)
 * @param biasValue The numerical bias value (range: -1 to 1)
 * @returns The Ionic background color for the bias level
 */
export const getBiasBgColor = (biasValue: number): string => {
  if (biasValue <= -0.3) {
    return "rgba(var(--ion-color-success-rgb), 0.12)";
  } else if (biasValue < 0.3) {
    return "rgba(var(--ion-color-warning-rgb), 0.12)";
  } else {
    return "rgba(var(--ion-color-danger-rgb), 0.12)";
  }
};
