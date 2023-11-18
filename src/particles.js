import * as THREE from "three";

/**
 * @param {int} amount
 * @param {int} minDistance
 * @param {int} maxDistance
 */
function createParticles(amount, minDistance, maxDistance) {
  const positions = [];

  for (let i = 0; i < amount; i++) {
    const pos = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(normalSample() * maxDistance)
      .clampLength(minDistance, maxDistance);
    positions.push(pos.x, pos.y, pos.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial();
  return new THREE.Points(geometry, material);
}

function normalSample() {
  // normal distribution; see https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return normalSample(); // resample between 0 and 1
  return num;
}

export { createParticles };
