import { useRef, useContext } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import "./SunShaderMaterial";
import "./EarthShaderMaterial";
import "./AuroraShaderMaterial";
import SocialCube from "./SocialCube";
import { SceneSettings, textureUrl, motionRates } from "./sceneSettings";

export function Sun() {
  const { compact, time } = useContext(SceneSettings);
  const sunRef = useRef();

  useFrame(() => {
    if (sunRef.current?.material?.uniforms) {
      sunRef.current.material.uniforms.uTime.value = time.current;
    }
  });

  return (
    <mesh ref={sunRef}>
      <sphereGeometry args={[30, compact ? 32 : 64, compact ? 32 : 64]} />
      <sunShaderMaterial attach="material" />
    </mesh>
  );
}

export function Earth({ radius = 120 }) {
  const { compact, details, time, opening } = useContext(SceneSettings);
  const planetGroup = useRef();
  const planetRef = useRef();
  const cloudRef = useRef();
  const northAurora = useRef();
  const southAurora = useRef();
  const initialized = useRef(false);

  const dayTexture = useLoader(
    TextureLoader,
    textureUrl("/textures/earth_diffuse.jpg", compact),
  );
  const nightTexture = useLoader(
    TextureLoader,
    textureUrl("/textures/8k_earth_nightmap.jpg", compact),
  );
  const cloudTexture = useLoader(
    TextureLoader,
    textureUrl("/textures/8k_earth_clouds.jpg", compact),
  );

  useFrame((_, delta) => {
    const t = time.current;
    const scale = opening ? 4.6 : 1;
    if (!initialized.current) planetGroup.current.scale.setScalar(scale);
    else planetGroup.current.scale.lerp(
      { x: scale, y: scale, z: scale },
      1 - Math.exp(-delta * 4),
    );
    const x = Math.cos(t * motionRates.earthOrbit + 1.72) * radius;
    const z = Math.sin(t * motionRates.earthOrbit + 1.72) * radius;
    planetGroup.current.position.set(x, 0, z);
    planetRef.current.rotation.y = t * motionRates.earthAxial + 3.42;
    if (cloudRef.current)
      cloudRef.current.rotation.y = t * motionRates.earthAxial * 1.08 + 1.2;
    if (northAurora.current) northAurora.current.uTime = t;
    if (southAurora.current) southAurora.current.uTime = t;

    if (planetRef.current.material?.uniforms) {
      const sunDirection = new THREE.Vector3()
        .subVectors(new THREE.Vector3(0, 0, 0), planetGroup.current.position)
        .normalize();
      planetRef.current.material.uniforms.uLightDirection.value.copy(
        sunDirection,
      );
      planetRef.current.material.uniforms.uTime.value = t;
    }
    initialized.current = true;
  }, -2);

  return (
    <group ref={planetGroup}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[4, compact ? 32 : 64, compact ? 32 : 64]} />
        <earthShaderMaterial
          uDayTexture={dayTexture}
          uNightTexture={nightTexture}
          uLightDirection={new THREE.Vector3(1, 0, 0)}
          uTime={0}
          uBlendFactor={0.0}
        />
      </mesh>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[4.02, compact ? 32 : 64, compact ? 32 : 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[3, 5, 64, 1, true]} />
        <auroraShaderMaterial
          ref={northAurora}
          transparent
          depthWrite={false}
          uTime={0}
        />
      </mesh>
      <mesh position={[0, -3.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[3, 5, 64, 1, true]} />
        <auroraShaderMaterial
          ref={southAurora}
          transparent
          depthWrite={false}
          uTime={0}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.08, compact ? 32 : 64, compact ? 32 : 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          vertexShader={`varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`}
          fragmentShader={`varying vec3 n;varying vec3 v;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.5);gl_FragColor=vec4(.10,.48,1.,rim*.28);}`}
        />
      </mesh>
      {details && (
        <group>
          <SocialCube
            texturePath="/textures/linkedin.jpg"
            orbitRadius={8}
            speed={0.2}
            size={2}
            orbitTilt={[THREE.MathUtils.degToRad(30), 0, 0]}
            link="https://www.linkedin.com/in/harshal-jorwekar.com"
          />
          <SocialCube
            texturePath="/textures/Resume.jpg"
            orbitRadius={10}
            speed={0.12}
            size={2}
            orbitTilt={[THREE.MathUtils.degToRad(-100), 0, 0]}
            link="https://in.docworkspace.com/d/sIATGloGMAcKP_MQG?sa=601.1037"
          />
        </group>
      )}
    </group>
  );
}
