import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

// GLSL noise function (you can paste a full simplex or Perlin noise function here)
const snoise3 = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise3(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0.0 + 0.0 * C
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;      // -1.0 + 3.0 * C

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  // mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.y;
  vec4 y = y_ *ns.x + ns.y;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const SunMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("orange"),
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec2 vUv;

    ${snoise3}

    void main() {
      // Keep the original simplex surface, adding finer turbulent granulation.
      vec3 surface = normalize(vNormal);
      float noise = snoise3(surface * 2.0 + uTime * 0.08);
      noise += .35 * snoise3(surface * 15.0 + uTime * 0.12);
      noise += .18 * snoise3(surface * 48.0 - uTime * 0.10);
      float intensity = 0.68 + 0.3 * noise;

      vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
      float light = dot(normalize(vNormal), lightDir);
      light = clamp(light * 0.15 + 0.85, 0.85, 1.0);  // Bias shadows to be lighter

      // Mix with ambient fallback
      float ambient = 0.5; // controls how visible the shadow side is
      float totalLight = mix(ambient, 1.0, light);


      float cells = snoise3(surface * 85.0 + noise * 2.0 + uTime * .14);
      float filaments = pow(1.0-abs(cells), 7.0);
      vec3 color = mix(vec3(.25,.018,.001), uColor * vec3(1.5,1.5,1.) + vec3(0.,.14,.035), smoothstep(-.6,.75,noise));
      color += vec3(.36,.18,.015) * filaments;
      color *= totalLight * (.8 + intensity*.35);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ SunShaderMaterial: SunMaterial });

export default SunMaterial;
