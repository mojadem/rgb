import * as THREE from "three";

/**
 * @param {string} url
 */
async function apiCall(url) {
  try {
    const response = await fetch(url);
    return response;
  } catch (error) {
    console.error(error);
  }
}

/**
 * @param {THREE.Group} planes
 */
async function loadTexture(planes) {
  const response = await apiCall("https://random.imagecdn.app/500/500");

  document.getElementById("thumbnail").src = response.url;

  const texture = new THREE.TextureLoader().load(response.url);

  for (let plane of planes.children) {
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
