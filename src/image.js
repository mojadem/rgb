import * as THREE from "three";

import imageFilterVert from "./glsl/imageFilter.vert";
import imageFilterFrag from "./glsl/imageFilter.frag";

function loadTexture() {
  return new THREE.TextureLoader().load("../textures/example.jpg");
}

/**
 * @param {int} color
 * @param {THREE.Texture} texture
 */
function createShader(color, texture) {
  return new THREE.ShaderMaterial({
    vertexShader: imageFilterVert,
    fragmentShader: imageFilterFrag,
    side: THREE.DoubleSide,
    uniforms: {
      u_texture: { value: texture },
      u_color: { value: color },
    },
  });
}

export { loadTexture, createShader };
