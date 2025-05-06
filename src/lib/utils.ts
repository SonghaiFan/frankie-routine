import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a CSS filter string to colorize black PNG icons based on category color
 * @param colorName The name of the color (red, green, blue, gray)
 * @returns CSS filter string
 */
export function getIconFilter(colorName: string): string {
  switch (colorName) {
    case "red":
      return "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(90%) contrast(97%)";
    case "green":
      return "invert(48%) sepia(79%) saturate(200%) hue-rotate(100deg) brightness(90%) contrast(119%)";
    case "blue":
      return "invert(40%) sepia(80%) saturate(1000%) hue-rotate(200deg) brightness(80%) contrast(120%)";
    case "gray":
      return "invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)";
    default:
      return "none";
  }
}
