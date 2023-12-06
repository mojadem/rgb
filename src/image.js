import * as THREE from "three";

/**
 * @param {THREE.Mesh[]} planes
 */
async function loadTexture(planes) {
  const response = await fetch("https://picsum.photos/500/500");
  const texture = new THREE.TextureLoader().load(response.url);

  for (let plane of planes) {
    plane.material.transparent = true;
    plane.material.uniforms.u_texture.value = texture;
    plane.material.needsUpdate = true;
  }

  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
    const rawData = reader.result;
    console.log(rawData);
  };
}

export { loadTexture };
