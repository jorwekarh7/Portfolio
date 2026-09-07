import * as THREE from "three";

// Original deterministic equirectangular scenery, baked once on the CPU.
// The defining Sun, planets, rocks, stars and camera remain live geometry.
export function createSkyTexture(compact) {
  const width = compact ? 512 : 1024,
    height = width / 2;
  const pixels = new Uint8Array(width * height * 4);
  const hash = (x, y, z) => {
    let n =
      Math.imul(x, 374761393) +
      Math.imul(y, 668265263) +
      Math.imul(z, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const mix = (a, b, t) => a + (b - a) * t;
  const noise = (x, y, z) => {
    const i = Math.floor(x),
      j = Math.floor(y),
      k = Math.floor(z);
    let a = x - i,
      b = y - j,
      c = z - k;
    a = a * a * (3 - 2 * a);
    b = b * b * (3 - 2 * b);
    c = c * c * (3 - 2 * c);
    return mix(
      mix(
        mix(hash(i, j, k), hash(i + 1, j, k), a),
        mix(hash(i, j + 1, k), hash(i + 1, j + 1, k), a),
        b,
      ),
      mix(
        mix(hash(i, j, k + 1), hash(i + 1, j, k + 1), a),
        mix(hash(i, j + 1, k + 1), hash(i + 1, j + 1, k + 1), a),
        b,
      ),
      c,
    );
  };
  const fbm = (x, y, z) => {
    let v = 0,
      a = 0.5;
    for (let i = 0; i < 4; i++) {
      v += a * noise(x, y, z);
      x = x * 2.03 + 5.1;
      y = y * 2.03 + 1.7;
      z = z * 2.03 + 3.2;
      a *= 0.5;
    }
    return v;
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const theta = (1 - y / (height - 1)) * Math.PI,
        phi = (x / width) * Math.PI * 2;
      const dx = -Math.cos(phi) * Math.sin(theta),
        dy = Math.cos(theta),
        dz = Math.sin(phi) * Math.sin(theta);
      const px = dx * 5.5,
        py = dy * 5.5,
        pz = dz * 5.5;
      const broad = fbm(px * 1.3, py * 1.3, pz * 1.3);
      const band = dy + 0.27 + dx * 0.36 + (broad - 0.5) * 0.22;
      const spread = 0.07 + 0.09 * broad;
      const mask = Math.exp((-band * band) / (spread * spread));
      const cloud = fbm(
        px * 7 + broad * 3,
        py * 7 + broad * 3,
        pz * 7 + broad * 3,
      );
      const wisps = fbm(px * 19, py * 19, pz * 19);
      const lane = Math.max(
        0,
        Math.min(
          1,
          (fbm(px * 11 + 19, py * 11 + 19, pz * 11 + 19) - 0.4) / 0.24,
        ),
      );
      const strength = mask * cloud * wisps * (1 - lane * 0.85) * 1.8;
      const warm = Math.max(0, Math.min(1, (broad - 0.4) / 0.3));
      const i = (y * width + x) * 4;
      pixels[i] = Math.min(
        255,
        (0.007 + mix(0.16, 0.31, warm) * strength) * 255,
      );
      pixels[i + 1] = Math.min(
        255,
        (0.012 + mix(0.24, 0.22, warm) * strength) * 255,
      );
      pixels[i + 2] = Math.min(
        255,
        (0.023 + mix(0.35, 0.15, warm) * strength) * 255,
      );
      pixels[i + 3] = 255;
    }
  const texture = new THREE.DataTexture(pixels, width, height);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
