// SocialCube.jsx
import React, { useRef, useState, useContext } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { SceneSettings } from "./sceneSettings";

export default function SocialCube({
  texturePath,
  orbitRadius,
  speed,
  size = 1,
  orbitTilt = [0, 0, 0],
  link,
}) {
  const { time } = useContext(SceneSettings);
  const cubeRef = useRef();
  const pivotRef = useRef();
  const texture = useLoader(TextureLoader, texturePath);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const angle = time.current * speed;
    cubeRef.current.position.set(
      Math.cos(angle) * orbitRadius,
      0,
      Math.sin(angle) * orbitRadius,
    );
    cubeRef.current.rotation.y = angle;

    const targetScale = hovered ? 1.3 : 1.0;
    cubeRef.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale },
      0.1,
    );
  });

  const handleClick = () => {
    window.open(link, "_blank");
  };

  return (
    <group ref={pivotRef} rotation={orbitTilt}>
      <mesh
        ref={cubeRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[size, size, size]} />
        {[...Array(6)].map((_, i) => (
          <meshBasicMaterial key={i} attach={`material-${i}`} map={texture} />
        ))}
      </mesh>
    </group>
  );
}
