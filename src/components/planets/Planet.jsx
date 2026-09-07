import React, { useRef, useContext } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, SRGBColorSpace } from "three";
import { planetConfig } from "../../journey";
import { SceneSettings, textureUrl, motionRates } from "../../sceneSettings";

/**
 * Generic Planet component.
 * Props:
 * - texturePath: String URL of planet texture
 * - radius: Orbit radius around origin
 * - size: Planet radius size
 * - speed: Orbit angular speed
 * - rotationSpeed: Self-rotation speed
 * - orbitTilt: [x, y, z] radians tilt of orbital plane
 * - ring: { texturePath, innerRadius, outerRadius } optional for rings
 * - children: anything you want to orbit with the planet (moons, cubes, etc.)
 */
export default function Planet({
  texturePath,
  radius,
  size,
  speed,
  rotationSpeed,
  orbitTilt = [0, 0, 0],
  ring = null,
  children, // ← NEW: allow moons/cubes/etc.
  ...groupProps // ← optional: forward extra props (onClick, etc.)
}) {
  const { compact, details, time, opening } = useContext(SceneSettings);
  const pivot = useRef();
  const planetGroup = useRef();
  const mesh = useRef();
  const ringMaterial = useRef();
  const initialized = useRef(false);

  const paths = ring ? [texturePath, ring.texturePath] : [texturePath];
  const [texture, ringTexture] = useLoader(
    TextureLoader,
    paths.map((path) => textureUrl(path, compact)),
  );

  const name = texturePath.split("/").pop().split(".")[0];
  const config = planetConfig[name];
  texture.colorSpace = SRGBColorSpace;
  if (ringTexture) ringTexture.colorSpace = SRGBColorSpace;
  useFrame((_, delta) => {
    const t = time.current;
    const angle =
      t * speed * motionRates.orbit + (config?.phase || 0) + orbitTilt[1];
    const scale = opening ? config?.openingScale || 1 : 1;
    if (!initialized.current) planetGroup.current.scale.setScalar(scale);
    else planetGroup.current.scale.lerp(
      { x: scale, y: scale, z: scale },
      1 - Math.exp(-delta * 4),
    );

    // move the entire planet+ring
    planetGroup.current.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    );
    // spin the planet+ring around its own Y
    planetGroup.current.rotation.y = ring ? 0 : t * rotationSpeed * motionRates.axial;
    if (ring) mesh.current.rotation.y = t * rotationSpeed * motionRates.axial;
    planetGroup.current.rotation.z = ring ? 0.28 : 0;

    // tilt the orbit
    pivot.current.rotation.set(...orbitTilt);
    const shader = ringMaterial.current?.userData.shader;
    if (shader) {
      planetGroup.current.updateWorldMatrix(true, false);
      planetGroup.current.getWorldPosition(shader.uniforms.uBodyCenter.value);
      shader.uniforms.uBodyRadius.value = size * planetGroup.current.scale.x;
    }
    initialized.current = true;
  }, -2);

  return (
    <group ref={pivot} {...groupProps}>
      <group ref={planetGroup}>
        {/* the sphere itself */}
        <mesh ref={mesh}>
          <sphereGeometry args={[size, compact ? 32 : 64, compact ? 32 : 64]} />
          <meshStandardMaterial map={texture} roughness={0.96} />
        </mesh>

        {/* optional ring */}
        {ring && ringTexture && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[ring.innerRadius, ring.outerRadius, compact ? 64 : 128]}
              onUpdate={(geometry) => {
                // The original texture is a radial strip, not a disc image.
                const vertices = geometry.attributes.position;
                const uv = geometry.attributes.uv;
                for (let i = 0; i < vertices.count; i += 1) {
                  const radiusAtVertex = Math.hypot(
                    vertices.getX(i),
                    vertices.getY(i),
                  );
                  uv.setXY(
                    i,
                    (radiusAtVertex - ring.innerRadius) /
                      (ring.outerRadius - ring.innerRadius),
                    0.5,
                  );
                }
                uv.needsUpdate = true;
              }}
            />
            <meshStandardMaterial
              ref={ringMaterial}
              onBeforeCompile={(shader) => {
                shader.uniforms.uBodyCenter = {
                  value: planetGroup.current.position.clone(),
                };
                shader.uniforms.uBodyRadius = { value: size };
                shader.vertexShader =
                  "varying vec3 vRingWorld;\n" + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <worldpos_vertex>",
                  "#include <worldpos_vertex>\nvRingWorld=(modelMatrix*vec4(transformed,1.)).xyz;",
                );
                shader.fragmentShader =
                  "varying vec3 vRingWorld;uniform vec3 uBodyCenter;uniform float uBodyRadius;\n" +
                  shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <opaque_fragment>",
                  `vec3 rayToSun=normalize(-vRingWorld);vec3 toBody=uBodyCenter-vRingWorld;float along=dot(toBody,rayToSun);float distanceToRay=length(toBody-rayToSun*along);float shade=along>0.?mix(.22,1.,smoothstep(uBodyRadius*.92,uBodyRadius*1.08,distanceToRay)):1.;outgoingLight*=shade;\n#include <opaque_fragment>`,
                );
                ringMaterial.current.userData.shader = shader;
              }}
              map={ringTexture}
              transparent
              opacity={0.82}
              roughness={1}
              depthWrite={false}
              side={2} /* THREE.DoubleSide */
            />
          </mesh>
        )}

        {/* NEW: anything passed in (moon, SocialCube, etc.) orbits with the planet */}
        {details && children}
      </group>
    </group>
  );
}
