import { work } from "./portfolioContent";

export const planetConfig = {
  mercury: { radius: 2, distance: 10, phase: 2.55, openingScale: 1.6 },
  venus: { radius: 3.5, distance: 16, phase: 0.62, openingScale: 1.7 },
  earth: { radius: 4.1, distance: 19, phase: 1.72, openingScale: 4.6 },
  mars: { radius: 3, distance: 14, phase: 2.9, openingScale: 1.5 },
  jupiter: { radius: 9, distance: 41, phase: 1.46, openingScale: 1.8 },
  saturn: { radius: 20, distance: 78, phase: 5.0, openingScale: 2.2 },
  uranus: { radius: 6, distance: 28, phase: 3.8, openingScale: 1.3 },
  neptune: { radius: 6, distance: 28, phase: 5.2, openingScale: 1.3 },
};

export const stops = [
  {
    anchor: "overview",
    planet: null,
    label: "The solar system",
    kind: "opening",
    reading: [0.15, 0.75],
  },
  {
    anchor: "work",
    planet: "mercury",
    label: "SANSKRITA",
    kind: "project",
    reading: [0.12, 0.8],
  },
  {
    anchor: "venus",
    planet: "venus",
    label: "Gesture recognition",
    kind: "project",
    reading: [0.12, 0.8],
  },
  {
    anchor: "about",
    planet: "earth",
    label: "A little closer to home",
    kind: "personal",
    reading: [0.1, 0.85],
  },
  {
    anchor: "mars",
    planet: "mars",
    label: "Medical records",
    kind: "project",
    reading: [0.12, 0.8],
  },
  {
    anchor: "jupiter",
    planet: "jupiter",
    label: "Space portfolio",
    kind: "project",
    reading: [0.12, 0.8],
  },
  {
    anchor: "saturn",
    planet: "saturn",
    label: "SpotRec",
    kind: "project",
    reading: [0.12, 0.8],
  },
  {
    anchor: "uranus",
    planet: "uranus",
    label: "GuildDB",
    kind: "project",
    reading: [0.12, 0.8],
  },
  {
    anchor: "contact",
    planet: "neptune",
    label: "Beyond the last orbit",
    kind: "closing",
    reading: [0.1, 0.85],
  },
].map((stop, index) => ({
  ...stop,
  index,
  project: work.find((project) => project.id === stop.planet),
  camera: planetConfig[stop.planet],
}));

export function stopForHash(hash) {
  const key = hash.replace(/^#/, "");
  return (
    stops.find((stop) => stop.anchor === key || stop.planet === key) || stops[0]
  );
}
