import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sun, Earth } from "./CelestialBodies";
import Mercury from "./components/planets/Mercury";
import Venus from "./components/planets/Venus";
import Mars from "./components/planets/Mars";
import Jupiter from "./components/planets/Jupiter";
import Saturn from "./components/planets/Saturn";
import Uranus from "./components/planets/Uranus";
import Neptune from "./components/planets/Neptune";
import { SceneSettings, motionRates, initialSimulationTime } from "./sceneSettings";
import { planetConfig, stops } from "./journey";
import Starlight, { SunHalo } from "./Starlight";
import Debris from "./Debris";
import GalacticSky from "./GalacticSky";

const bodies = {
  mercury: Mercury,
  venus: Venus,
  earth: Earth,
  mars: Mars,
  jupiter: Jupiter,
  saturn: Saturn,
  uranus: Uranus,
  neptune: Neptune,
};
function TrackedBody({ name, component, positions, onSelect }) {
  const Body = component;
  const root = useRef();
  const mesh = useRef();
  useFrame(() => {
    mesh.current = null;
    root.current?.traverse((obj) => {
      if (!mesh.current && obj.isMesh) mesh.current = obj;
    });
    if (mesh.current) {
      if (!positions.current[name])
        positions.current[name] = new THREE.Vector3();
      mesh.current.updateWorldMatrix(true, false);
      mesh.current.getWorldPosition(positions.current[name]);
    }
  }, -1);
  return (
    <group
      ref={root}
      name={name}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(name);
      }}
    >
      <Body />
    </group>
  );
}

function SimulationClock({ time, animate, reading }) {
  const wasAnimating = useRef(false);
  useFrame((_, delta) => {
    // Never charge asset loading or a hidden-tab interval to the simulation.
    if (animate && wasAnimating.current)
      time.current +=
        Math.min(delta, 0.1) * (reading ? motionRates.reading : 1);
    wasAnimating.current = animate;
  }, -3);
  useEffect(() => {
    if (!animate) wasAnimating.current = false;
  }, [animate]);
  return null;
}

function CameraRig({
  fitAll,
  mode,
  focus,
  active,
  layout,
  positions,
  controls,
  compact,
  resetKey,
  animate,
}) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const destination = useMemo(() => new THREE.Vector3(), []);
  const radial = useMemo(() => new THREE.Vector3(), []);
  const lastReset = useRef(-1);
  const lastSize = useRef("");
  useFrame(({ camera, size }, delta) => {
    const orbit = controls.current;
    if (!orbit) return;
    const sizeKey = `${size.width}:${size.height}`;
    if (
      mode === "free" && !focus &&
      lastReset.current === resetKey && lastSize.current === sizeKey
    ) return;
    lastSize.current = sizeKey;
    const stop = stops[active];
    const name = focus || (mode === "guided" ? stop.planet : null);
    const planet = positions.current[name];
    const bound = layout.current.bounds[active]?.scene;
    let centerX = compact ? size.width * 0.5 : size.width * 0.73;
    let centerY = size.height * 0.49;
    if (mode === "guided" && compact && bound) {
      centerX = bound.x + bound.width / 2;
      centerY = bound.y + bound.height / 2;
    }
    if (mode === "free") {
      centerX = focus && !compact ? size.width * 0.68 : size.width * 0.5;
      centerY = compact && focus ? size.height * 0.72 : size.height * 0.5;
    }
    camera.setViewOffset(
      size.width,
      size.height,
      size.width / 2 - centerX,
      size.height / 2 - centerY,
      size.width,
      size.height,
    );
    if (planet) {
      const config = planetConfig[name];
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const regionHeight = compact ? bound?.height || 230 : size.height * 0.78;
      const regionWidth = compact ? size.width * 0.86 : size.width * 0.51;
      let distance =
        name === "saturn"
          ? (config.radius * size.height) / (regionWidth * 0.8 * tan)
          : (config.radius * size.height) /
            (regionHeight * (compact ? 0.7 : 0.53) * tan);
      distance = Math.max(
        distance,
        config.radius * 2.5,
        (config.radius * size.height) / (regionWidth * 0.82 * tan),
      );
      if (mode === "free")
        distance = Math.max(config.distance * 1.35, distance);
      if (mode === "guided")
        distance *=
          1 + Math.max(0, stop.reading[0] - layout.current.progress) * 0.18;
      radial.copy(planet).normalize();
      const tangent = new THREE.Vector3(-radial.z, 0, radial.x);
      const direction = radial
        .multiplyScalar(name === "mercury" ? -0.4 : -0.78)
        .addScaledVector(tangent, name === "mercury" ? 0.88 : 0.54)
        .add(new THREE.Vector3(0, name === "saturn" ? 0.64 : 0.24, 0))
        .normalize();
      destination.copy(planet).addScaledVector(direction, distance);
      target.copy(planet);
    } else if (mode === "free" && fitAll) {
      const box = new THREE.Box3(
        new THREE.Vector3(-30, -30, -30),
        new THREE.Vector3(30, 30, 30),
      );
      for (const [key, p] of Object.entries(positions.current)) {
        const r = planetConfig[key].radius * planetConfig[key].openingScale;
        box.expandByPoint(p.clone().addScalar(r));
        box.expandByPoint(p.clone().addScalar(-r));
      }
      box.getCenter(target);
      const direction = new THREE.Vector3(0, 0.85, 1).normalize();
      const up = new THREE.Vector3(0, direction.z, -direction.y);
      const baseTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      // Fit the live bodies inside the region clear of the Explore selector.
      const tanY = baseTan * (compact ? 0.54 : 0.85);
      const tanX = baseTan * size.width / size.height * (compact ? 0.9 : 0.68);
      let distance = 0;
      for (const [key, position] of Object.entries({ sun: new THREE.Vector3(), ...positions.current })) {
        const radius = key === "sun" ? 30 : planetConfig[key].radius * planetConfig[key].openingScale;
        const relative = position.clone().sub(target);
        distance = Math.max(distance, relative.dot(direction) + radius + Math.max(
          (Math.abs(relative.x) + radius) / tanX,
          (Math.abs(relative.dot(up)) + radius) / tanY,
        ));
      }
      distance *= 1.08;
      orbit.maxDistance = distance * 1.2;
      destination.copy(target).addScaledVector(direction, distance);
      camera.setViewOffset(size.width, size.height,
        compact ? 0 : -size.width * 0.14,
        compact ? -size.height * 0.2 : 0,
        size.width, size.height);
    } else {
      orbit.maxDistance = 900;
      destination.set(0, 45, 300);
      target.set(0, 0, 0);
      if (compact) {
        const distance =
          (30 * size.height) /
          ((mode === "free" ? Math.min(size.height * 0.42, size.width * 0.7) : bound?.height || 230) *
            0.6 *
            Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
        destination.normalize().multiplyScalar(distance);
      }
      centerX = compact
        ? size.width * 0.5
        : mode === "free"
          ? size.width * 0.56
          : size.width * 0.72;
      centerY = compact
        ? mode === "free"
          ? size.height * 0.54
          : centerY
        : size.height * 0.3;
      camera.setViewOffset(
        size.width,
        size.height,
        size.width / 2 - centerX,
        size.height / 2 - centerY,
        size.width,
        size.height,
      );
    }
    const alpha =
      !animate || (mode === "free" && !focus)
        ? 1
        : 1 - Math.exp(-Math.min(delta, 0.08) * 4.2);
    camera.position.lerp(destination, alpha);
    // Lift the path over the Sun instead of allowing a lerp through its centre.
    const horizontalSq = camera.position.x ** 2 + camera.position.z ** 2;
    if (horizontalSq < 39 ** 2)
      camera.position.y = Math.max(
        camera.position.y,
        Math.sqrt(39 ** 2 - horizontalSq),
      );
    for (const [key, position] of Object.entries(positions.current)) {
      const clearance =
        planetConfig[key].radius * (key === "saturn" ? 0.5 : 1) + 2;
      const away = camera.position.clone().sub(position);
      if (away.length() < clearance)
        camera.position
          .copy(position)
          .add(away.normalize().multiplyScalar(clearance));
    }
    orbit.target.lerp(target, alpha);
    orbit.update();
    lastReset.current = resetKey;
  }, -0.5);
  return null;
}

function OrbitPaths({ mode, focus, positions }) {
  // Leave a small gap at each live body as well as using normal depth testing.
  // This avoids near-side orbit segments visually cutting through a silhouette.
  const uniforms = useMemo(() => ({
    centers: { value: Object.keys(bodies).map(() => new THREE.Vector3(10000, 0, 0)) },
    radii: { value: Object.keys(bodies).map(name => planetConfig[name].radius * planetConfig[name].openingScale * 1.15) },
  }), []);
  useFrame(() => {
    Object.keys(bodies).forEach((name, i) => {
      if (positions.current[name]) uniforms.centers.value[i].copy(positions.current[name]);
    });
  });
  const paths = useMemo(
    () =>
      [50, 80, 120, 150, 200, 250, 300, 350].map((radius) => {
        const points = Array.from(
          { length: 129 },
          (_, i) =>
            new THREE.Vector3(
              Math.cos((i / 128) * Math.PI * 2) * radius,
              0,
              Math.sin((i / 128) * Math.PI * 2) * radius,
            ),
        );
        return new THREE.BufferGeometry().setFromPoints(points);
      }),
    [],
  );
  useEffect(() => () => paths.forEach((path) => path.dispose()), [paths]);
  return paths.map((geometry, i) => (
    <line key={i} geometry={geometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{ ...uniforms, opacity: { value: mode === "free" && focus === Object.keys(bodies)[i] ? 0.2 : 0.025 } }}
        vertexShader={`varying vec3 world; void main(){ world=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(world,1.); }`}
        fragmentShader={`uniform vec3 centers[8]; uniform float radii[8]; uniform float opacity; varying vec3 world; void main(){ for(int i=0;i<8;i++){ if(distance(world,centers[i])<radii[i]) discard; } gl_FragColor=vec4(.64,.72,.81,opacity); }`}
      />
    </line>
  ));
}

function ContextGuard({ onFailure }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  return null;
}

function Ready({ onReady, positions, active, mode, time }) {
  const announced = useRef(false);
  const prepared = useRef(false);
  const sample = useRef({ seconds: 0, frames: 0 });
  useFrame(({ gl, camera }, delta) => {
    if (!announced.current && Object.keys(positions.current).length === 8) {
      // Allow one complete render with all textures, transforms and camera
      // prepared before revealing the canvas. Time remains at the seed.
      if (prepared.current) {
        announced.current = true;
        if (import.meta.env.DEV) gl.domElement.dataset.initialScene = JSON.stringify({
          time: time.current,
          camera: camera.position.toArray(),
          planets: Object.fromEntries(Object.entries(positions.current).map(([name, p]) => [name, p.toArray()])),
        });
        onReady();
      }
      prepared.current = true;
    }
    // Local QA observations, omitted from production. No scene internals need
    // to be reached through React or Three's private state during browser tests.
    if (!import.meta.env.DEV) return;
    sample.current.seconds += delta;
    sample.current.frames += 1;
    if (sample.current.seconds >= 2) {
      gl.domElement.dataset.scene = JSON.stringify({
        bodies: Object.keys(positions.current),
        stop: stops[active].anchor,
        mode,
        time: +time.current.toFixed(3),
        view: camera.view,
        camera: camera.position.toArray().map((value) => +value.toFixed(2)),
        planets: Object.fromEntries(
          Object.entries(positions.current).map(([key, value]) => [
            key,
            value.toArray().map((number) => +number.toFixed(2)),
          ]),
        ),
        framesPerSecond: +(
          sample.current.frames / sample.current.seconds
        ).toFixed(1),
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        textures: gl.info.memory.textures,
        pixelRatio: gl.getPixelRatio(),
      });
      sample.current = { seconds: 0, frames: 0 };
    }
  });
  return null;
}

export default function SolarScene({
  mode,
  fitAll,
  visible,
  focus,
  active,
  layout,
  animate,
  compact,
  details,
  resetKey,
  onSelect,
  onInteract,
  onReady,
  onFailure,
}) {
  const positions = useRef({});
  const time = useRef(initialSimulationTime);
  const controls = useRef();
  const [supported] = useState(() => {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      if (!context) return false;
      context.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!supported) onFailure();
    // Fiber initializes the renderer asynchronously, beyond React boundaries.
    const rejected = (event) => {
      if (/creating WebGL context/i.test(event.reason?.message || "")) {
        event.preventDefault();
        onFailure();
      }
    };
    window.addEventListener("unhandledrejection", rejected);
    return () => window.removeEventListener("unhandledrejection", rejected);
  }, [supported, onFailure]);
  if (!supported) return null;
  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={compact ? 1 : [1, 1.5]}
      camera={{ position: [0, 45, 300], fov: 35, near: 0.1, far: 3500 }}
      gl={{ antialias: !compact, powerPreference: "high-performance" }}
    >
      <SceneSettings.Provider
        value={{
          compact,
          details,
          time,
          opening:
            (active === 0 && mode === "guided") || (mode === "free" && !focus),
        }}
      >
        <SimulationClock
          time={time}
          animate={animate}
          reading={active > 0 && mode === "guided"}
        />
        <ContextGuard onFailure={onFailure} />
        <GalacticSky
          compact={compact}
          reading={active > 0 && mode === "guided"}
        />
        <Starlight
          compact={compact}
          reading={active > 0 && mode === "guided"}
        />
        <ambientLight intensity={0.16} />
        <hemisphereLight args={["#a0caff", "#1a151b", 0.24]} />
        <pointLight
          position={[0, 0, 0]}
          intensity={2.5}
          decay={0}
          color="#fff0d7"
        />
        <directionalLight
          position={[100, 80, 300]}
          intensity={0.6}
          color="#a9cfff"
        />

        <Sun />
        {(active === 0 || mode === "free") && <SunHalo />}
        <OrbitPaths mode={mode} focus={focus} positions={positions} />
        <Debris compact={compact} />
        <Suspense fallback={null}>
        {Object.entries(bodies).map(([name, component]) => (
            <TrackedBody
              key={name}
              name={name}
              component={component}
              positions={positions}
              onSelect={onSelect}
            />
        ))}
        </Suspense>
        <Ready
          onReady={onReady}
          positions={positions}
          active={active}
          mode={mode}
          time={time}
        />
        <OrbitControls
          ref={controls}
          makeDefault
          enabled={mode === "free"}
          enableDamping
          minDistance={8}
          maxDistance={900}
          onStart={onInteract}
        />
        <CameraRig
          fitAll={fitAll}
          mode={mode}
          focus={focus}
          active={active}
          layout={layout}
          animate={animate}
          positions={positions}
          controls={controls}
          compact={compact}
          resetKey={resetKey}
        />
      </SceneSettings.Provider>
    </Canvas>
  );
}
