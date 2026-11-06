// Adapted from beUI motion primitives.
// Source: https://github.com/starc007/ui-components
// License: MIT

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.7,
} as const;
