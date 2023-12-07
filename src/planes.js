import * as THREE from "three";

import imageFilterVert from "./glsl/imageFilter.vert";
import imageFilterFrag from "./glsl/imageFilter.frag";

/** @type {THREE.Mesh[]} */
let planes = [];

function createPlanes() {
  const normal = new THREE.Vector3(0, 0, 1);
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < 3; i++) {
    const plane = createPlane(i, normal);
    planes.push(plane);
    normal.applyAxisAngle(up, (2 * Math.PI) / 3);
  }

  return planes;
}

/**
 *
 * @param {int} color 0: red, 1: green, 2: blue
 * @param {THREE.Vector3} position
 */
function createPlane(color, position) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader: imageFilterVert,
    fragmentShader: imageFilterFrag,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      u_texture: {
        /** to be updated in loadTexture() */
      },
      u_color: { value: color },
      u_tint: {
        /** to be updated by GUI */
        value: new THREE.Color(0.5, 0.5, 0.5),
      },
    },
  });

  const plane = new THREE.Mesh(geometry, material);

  const outline = createOutline(plane, color);
  plane.add(outline);

  plane.lookAt(position);
  plane.position.copy(position);

  plane.userData.position = position.clone();

  return plane;
}

/**
 * @param {THREE.Mesh} plane
 * @param {int} color
 */
function createOutline(plane, color) {
  const points = [];
  points.push(new THREE.Vector3(-0.5, 0.5, 0));
  points.push(new THREE.Vector3(0.5, 0.5, 0));
  points.push(new THREE.Vector3(0.5, -0.5, 0));
  points.push(new THREE.Vector3(-0.5, -0.5, 0));
  points.push(new THREE.Vector3(-0.5, 0.5, 0));

  const colors = [0xff0000, 0x00ff00, 0x0000ff];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: colors[color] });

  const outline = new THREE.Line(geometry, material);
  outline.userData.color = new THREE.Color(colors[color]);
  outline.position.copy(plane.position);
  outline.rotation.copy(plane.rotation);

  return outline;
}

/**
 * @param {THREE.Texture} texture
 */
function loadTexture(texture) {
  planes.map((plane) => {
    plane.material.uniforms.u_texture.value = texture;
    plane.material.needsUpdate = true;
  });
}

/**
 * @param {THREE.Vector3} tint
 */
function updateTint(tint) {
  planes.map((plane) => {
    plane.material.uniforms["u_tint"].value.copy(tint);
    plane.material.needsUpdate = true;
  });
}

export { planes, createPlanes, loadTexture, updateTint };
