import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneSettings } from "./sceneSettings";

// One instanced draw call: a broken belt between the original Mars/Jupiter orbits.
export default function Debris({ compact }) {
  const mesh = useRef();
  const group = useRef();
  const { time } = useContext(SceneSettings);
  const count = compact ? 140 : 450;
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const variation =
        0.8 + 0.25 * Math.sin(p.getX(i) * 12 + p.getY(i) * 4 + p.getZ(i) * 7);
      p.setXYZ(
        i,
        p.getX(i) * variation,
        p.getY(i) * variation,
        p.getZ(i) * variation,
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  useLayoutEffect(() => {
    let seed = 603;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 166 + rand() * 22;
      dummy.position.set(Math.cos(a) * r, (rand() - 0.5) * 9, Math.sin(a) * r);
      dummy.rotation.set(rand() * 6, rand() * 6, rand() * 6);
      const size = 0.12 + Math.pow(rand(), 4) * 1.35;
      dummy.scale.set(size * (0.8 + rand()), size * 0.7, size * (0.8 + rand()));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.setHSL(
        0.075 + rand() * 0.035,
        0.12 + rand() * 0.15,
        0.09 + rand() * 0.12,
      );
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor.needsUpdate = true;
  }, [count]);
  useFrame(() => {
    group.current.rotation.y = -time.current * 0.0015;
  });
  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh}
        args={[geometry, null, count]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
    </group>
  );
}
