import * as THREE from "three";

/**
 * @param {THREE.Mesh[]} planes
 */
async function loadTexture(planes) {
  fetch("http://localhost:3000/api/get-image", {
    headers: { Accept: "image/jpg" },
  })
    .then((response) => response.blob())
    .then((textureBlob) => {
      const objectURL = URL.createObjectURL(textureBlob);
      const texture = new THREE.TextureLoader().load(objectURL);

      for (const plane of planes) {
        plane.material.uniforms.u_texture.value = texture;
        plane.material.needsUpdate = true;
      }
    });
}

export { loadTexture };
