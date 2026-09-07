> Phase 3 is complete in this same draft. See ../phase-3-review/REVIEW.md and ../phase-3-review/gallery.html for the current review and before/after screenshots. The phase-one notes below and phase-two review are historical.

# Solar System — Reimagined: first milestone

Local preview: http://127.0.0.1:5173/

This is an isolated clone of `E:\Portfolio\space-portfolio`, on branch
`draft/solar-system-reimagined`. The original checkout, including its existing
uncommitted CSS edit and handoff folder, is unchanged. Nothing was pushed,
merged, or deployed.

## Reopen the preview

Open `Start-Preview.cmd` in this folder, or run these commands here:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Then visit the local URL above. If the port is already occupied by this preview,
use the running preview. Stop its terminal with Ctrl+C when finished.
Dependencies were installed with the existing `package-lock.json` using `npm ci`.
Node v22.17.0 and npm 10.9.2 were used. No dependency versions were changed.

## Implemented

- HTML identity, Work/About/Contact navigation, résumé action, and native scrolling.
- One lazily loaded shared canvas with the original custom Sun and eight planets.
- A guided camera transition to Mercury/SANSKRITA, an accessible native dialog,
  and a directly selectable project list.
- Free orbit rotation, pan and zoom, planet focus shortcuts, optional original
  skill/social satellites, and an explicit overview reset.
- Responsive desktop/mobile layouts, lower mobile geometry and rendering
  resolution, and delivery-sized texture copies.
- Loading, reduced-motion, WebGL initialization failure, and context-loss handling;
  the HTML portfolio remains usable independently of the canvas.

## Preservation and deliberate changes

`SunShaderMaterial.js`, `EarthShaderMaterial.js`, `AuroraShaderMaterial.js`, the
seven separate planet components, and all original texture files remain
unchanged. Sun and Earth were extracted from the original App into
`CelestialBodies.jsx`. Earth retains its day/night shader, clouds, and both aurora
meshes. The aurora time uniform now updates so its original animation can run.

The generic planet component still uses the original orbital equations, radii,
sizes, tilts, and planet-specific relative speeds. A common time scale slows the
orbits and initial phase offsets spread the planets around the opening view.
Rotation now depends on time instead of frame count. Camera framing and lighting
were redesigned. Mobile spheres use 32 rather than 64 segments per axis.

Saturn retains its original ring geometry and source texture. Its UV mapping now
uses the radial strip correctly, producing concentric bands; desktop ring
segments increased from 64 to 128. Original skill cubes remain opt-in on desktop.
The generic Twitter homepage cube is omitted because it was not a personal link.
The astronaut asset and original implementation in Git history are retained,
but the astronaut is not mounted in this first guided milestone.

The original project descriptions remain in `projects.js`; the new presentation
uses `portfolioContent.js` to avoid illustrative metrics and placeholder claims.
Neptune remains in the scene, without a featured placeholder project. Mercury
maps to SANSKRITA and Earth maps to personal links.

## Verification

- `npm run lint`: passed. The baseline had four errors; the refactor removed the
  unused App callbacks, fixed the conditional texture-loading hook, and removed
  an unused legacy panel argument.
- `npm run build`: passed. Vite retains a size warning for the lazy 3D bundle
  (about 243 kB gzipped); the HTML application bundle is about 70 kB gzipped.
- Local HTTP request: 200.
- Visually inspected in the WebGL-capable Codex browser at 1440×900 and 390×844;
  also checked horizontal overflow at 360×740. These are browser viewport tests,
  not measurements on physical phones.
- Observed the rendered Sun, all eight live planet positions, Mercury camera
  tracking, Earth/cloud rendering, and Saturn's corrected rings. Optional
  satellites load and can be toggled.
- Tested project opening, Tab navigation, Escape dismissal, restored focus,
  returning to exploration from a dialog, and overview navigation.
- Observed useful identity and actions while the scene reported loading.
- Exercised WebGL-unavailable behavior by making context creation return null;
  verified no canvas remained, exploration was disabled, and SANSKRITA details
  remained accessible. Exercised reduced motion through the same `matchMedia`
  path used by the OS preference; the test simulates that preference rather than
  changing the computer's accessibility settings.
- Quiet-view / Enable-3D switching was tested. Context listeners are cleaned up
  during unmount so deliberate renderer disposal is not reported as failure.

Local development scenarios are available at `/?qa=no-webgl` and
`/?qa=reduced-motion`. They are removed from production builds. `/?no-webgl`
opens the ordinary quiet view. Development-only `canvas.dataset.scene` records
live body positions, camera coordinates, draw calls, and short frame samples for
inspection without accessing private renderer state.

## Performance and remaining review items

Two-second samples in the local desktop browser were approximately 60 fps,
including a mobile-sized viewport. This is a short local observation, not a
physical-mobile benchmark or a guarantee across GPUs and networks.

The eleven delivery textures total approximately 0.46 MiB for mobile and
2.63 MiB for desktop. The original high-resolution files remain available.
`scripts/prepare_textures.py` reproduces the copies with Pillow; Python is not
needed to run or build the site because the generated copies are included.

The existing GitHub profile was reachable. LinkedIn returned a provider fetch
restriction and the résumé provider could not be independently verified. Their
existing destinations are retained and marked as provider-dependent in Contact.
No email address or replacement destination was invented. A general GitHub
profile is explicitly labelled as a profile, not as project source code.

SANSKRITA is the complete first case study. Other project entries preserve concise
source-backed summaries and technology lists, pending fuller case-study review.
Benchmark scores, project-specific repository links, and external résumé/social
destinations still need content verification before a production release.

