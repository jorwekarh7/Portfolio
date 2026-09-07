// src/SkillsCube.jsx
import React, { useRef, useContext } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { SceneSettings } from "./sceneSettings";

export default function SkillsCube({
  texturePath,
  orbitRadius = 10,
  speed = 0.18,
  size = 2.0,
  orbitTilt = [0, 0, 0], // tilt of orbit plane
  phase = 0, // starting angle (radians)
  elevation = 0, // lift out of plane (units)
}) {
  const { time } = useContext(SceneSettings);
  const pivotRef = useRef(); // defines plane
  const orbiterRef = useRef(); // moves around circle
  const meshRef = useRef();
  const tex = useLoader(TextureLoader, texturePath);

  useFrame(() => {
    const angle = time.current * speed + phase;
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    if (orbiterRef.current) orbiterRef.current.position.set(x, elevation, z);
    if (meshRef.current) meshRef.current.rotation.y = time.current * 0.6;
  });

  // block bubbling so planets don't get clicks
  const stop = (e) => e.stopPropagation();

  return (
    <group ref={pivotRef} rotation={orbitTilt}>
      <group ref={orbiterRef} position={[orbitRadius, elevation, 0]}>
        <mesh
          ref={meshRef}
          onClick={stop}
          onPointerDown={stop}
          onPointerUp={stop}
          onPointerOver={stop}
          onPointerOut={stop}
        >
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial map={tex} />
        </mesh>
      </group>
    </group>
  );
}
