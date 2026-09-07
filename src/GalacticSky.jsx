import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSkyTexture } from "./skyTexture";

export const noiseGLSL = `
float hash(vec3 p){p=fract(p*.3183099+vec3(.11,.17,.13));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec3(5.1,1.7,3.2);a*=.5;}return v;}
`;
const cache = new Map();
export default function GalacticSky({ reading, compact }) {
  const uniforms = useMemo(() => {
    if (!cache.has(compact)) cache.set(compact, createSkyTexture(compact));
    return { uSky: { value: cache.get(compact) }, uReading: { value: 0 } };
  }, [compact]);
  useFrame(() => {
    uniforms.uReading.value = reading ? 1 : 0;
  });
  return (
    <mesh renderOrder={-2}>
      <sphereGeometry args={[1900, 32, 20]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`uniform sampler2D uSky;uniform float uReading;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(uSky,vUv).rgb*mix(1.,.6,uReading),1.);}`}
      />
    </mesh>
  );
}
