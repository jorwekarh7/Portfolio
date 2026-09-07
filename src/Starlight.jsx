import { useContext, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseGLSL } from "./GalacticSky";
import { SceneSettings } from "./sceneSettings";

const vertex = `
attribute float aSize;
attribute float aPhase;
attribute float aKind;
attribute vec3 aColor;
uniform float uTime;
uniform float uRatio;
varying vec3 vColor;
varying float vPhase;
varying float vKind;
void main(){
  vec3 p=position;
  p.y+=sin(uTime*.06+aPhase)*aKind*.7;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=aSize*uRatio*clamp(950./max(1.,-mv.z),.45,1.7);
  vColor=aColor;vPhase=aPhase;vKind=aKind;
}`;
const fragment = `
uniform float uTime;
uniform float uReading;
varying vec3 vColor;
varying float vPhase;
varying float vKind;
void main(){
  vec2 p=gl_PointCoord-.5;
  float r=length(p)*2.;
  if(r>1.)discard;
  float core=exp(-r*r*28.);
  float glow=exp(-r*r*5.)*.22;
  float crossGlow=(exp(-abs(p.x)*90.)*exp(-abs(p.y)*12.)+exp(-abs(p.y)*90.)*exp(-abs(p.x)*12.))*.16;
  float shimmer=.85+.15*sin(uTime*.42+vPhase);
  float alpha=(core+glow+crossGlow)*shimmer;
  if(vKind>1.5)alpha=exp(-r*r*4.)*.035;
  alpha*=mix(1.,.56,uReading);
  gl_FragColor=vec4(vColor*1.35,alpha);
}`;

export default function Starlight({ compact, reading }) {
  const { time } = useContext(SceneSettings);
  const material = useRef();
  const group = useRef();
  const data = useMemo(() => {
    let seed = 91207;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const distant = compact ? 2100 : 5400;
    const band = compact ? 850 : 2400;
    const haze = 0;
    const near = compact ? 22 : 65;
    const count = distant + band + haze + near;
    const position = new Float32Array(count * 3),
      color = new Float32Array(count * 3),
      size = new Float32Array(count),
      phase = new Float32Array(count),
      kind = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const isBand = i >= distant && i < distant + band + haze;
      const isHaze = i >= distant + band && i < distant + band + haze;
      const isNear = i >= distant + band + haze;
      if (isBand) {
        const t = random();
        const spread = isHaze ? 190 : 45 + 230 * Math.pow(random(), 2);
        const scatter = (random() + random() + random() - 1.5) * spread;
        position.set(
          [
            (t - 0.35) * 1800,
            -230 - (t - 0.35) * 600 + scatter,
            -850 + random() * 170,
          ],
          i * 3,
        );
      } else {
        const theta = random() * Math.PI * 2,
          y = random() * 2 - 1,
          radius = isNear ? 470 + random() * 230 : 1300 + random() * 350;
        position.set(
          [
            Math.sqrt(1 - y * y) * Math.cos(theta) * radius,
            y * radius,
            Math.sqrt(1 - y * y) * Math.sin(theta) * radius,
          ],
          i * 3,
        );
      }
      const warm = random() > 0.87;
      const strength = 0.55 + random() * 0.45;
      color.set(
        warm
          ? [strength, strength * 0.82, strength * 0.61]
          : [strength * 0.62, strength * 0.81, strength],
        i * 3,
      );
      size[i] = isHaze
        ? 100 + random() * 140
        : isNear
          ? 5 + random() * 8
          : random() > 0.975
            ? 8 + random() * 6
            : 2.4 + Math.pow(random(), 3) * 4.2;
      kind[i] = isHaze ? 2 : isBand ? 1 : 0;
      phase[i] = random() * Math.PI * 2;
    }
    return { position, color, size, kind, phase };
  }, [compact]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRatio: { value: 1 },
      uReading: { value: 0 },
    }),
    [],
  );
  useFrame(({ gl }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = time.current;
    material.current.uniforms.uRatio.value = gl.getPixelRatio();
    material.current.uniforms.uReading.value = reading ? 1 : 0;
    group.current.rotation.y = Math.sin(time.current * 0.009) * 0.018;
  });
  return (
    <points ref={group} frustumCulled={false} name="layered-starlight">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.position, 3]}
        />
        <bufferAttribute attach="attributes-aColor" args={[data.color, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.size, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[data.phase, 1]} />
        <bufferAttribute attach="attributes-aKind" args={[data.kind, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

export function SunHalo() {
  const plane = useRef();
  const material = useRef();
  const { time } = useContext(SceneSettings);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uVisibility: { value: 1 } }),
    [],
  );
  useFrame(({ camera }) => {
    plane.current.quaternion.copy(camera.quaternion);
    material.current.uniforms.uTime.value = time.current;
    material.current.uniforms.uVisibility.value = THREE.MathUtils.smoothstep(
      camera.position.length(),
      50,
      100,
    );
  });
  return (
    <mesh ref={plane} name="sun-halo" renderOrder={1}>
      <planeGeometry args={[145, 145]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`${noiseGLSL}
          uniform float uTime;uniform float uVisibility;varying vec2 vUv;
          void main(){vec2 p=vUv-.5;float r=length(p)*2.;float a=atan(p.y,p.x);
          float turbulence=fbm(vec3(p*18.,uTime*.11));
          float rays=pow(.5+.5*sin(a*43.+turbulence*12.-uTime*.15),3.);
          float edge=.415+.045*turbulence;
          float flame=exp(-max(0.,r-edge)*(32.-rays*13.))*(.3+rays*.5);
          float arc=0.;
          for(int i=0;i<3;i++){float start=-2.3+float(i)*1.95;float w=(a-start)/.55;if(w>0.&&w<1.){float ridge=.42+.13*sin(w*3.14159);arc+=exp(-abs(r-ridge)*170.)*pow(sin(w*3.14159),.5)*.65;}}
          float alpha=(flame+arc)*smoothstep(.408,.424,r)*(1.-smoothstep(.75,.95,r))*uVisibility;
          gl_FragColor=vec4(1.,.28+flame*.27,.055,alpha);
          }`}
      />
    </mesh>
  );
}
