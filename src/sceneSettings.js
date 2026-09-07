import { createContext } from "react";

export const SceneSettings = createContext({
  compact: false,
  details: false,
  time: { current: 0 },
  opening: false,
});

export function textureUrl(original, compact) {
  return `/textures/optimized/${compact ? "mobile" : "desktop"}/${original.split("/").pop()}.webp`;
}

// Independent, frame-rate-independent channels; camera easing is separate.
export const motionRates = {
  orbit: 0.04375,
  axial: 36,
  earthOrbit: 0.0021875,
  earthAxial: 0.045,
  reading: 0.65,
};

// The requested opening occurs naturally about 90 seconds into the existing
// animation. Seed once per scene mount; navigation must never reset this clock.
export const initialSimulationTime = 90;
