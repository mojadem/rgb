import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { cameraDistance } from "./constants";

function updateAnimation() {
  TWEEN.update();
}

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Scene} scene
 * @param {THREE.Mesh} plane
 */
function viewPlane(camera, scene, plane) {
  const rotatePosition = new THREE.Vector3(
    plane.position.x,
    plane.position.y,
    plane.position.z
  ).multiplyScalar(cameraDistance);

  new TWEEN.Tween(camera.position)
    .to({
      x: rotatePosition.x,
      y: rotatePosition.y,
      z: rotatePosition.z,
    })
    .onUpdate((position) => {
      const extended = position.normalize().multiplyScalar(cameraDistance);
      camera.position.copy(extended);
      camera.lookAt(scene.position);
    })
    .easing(TWEEN.Easing.Exponential.Out)
    .start();
}

/**
 * @param {THREE.Scene} scene
 * @param {THREE.Mesh} currentPlane
 * @param {THREE.Mesh[]} planes
 */
function alignPlanes(scene, currentPlane, planes) {
  for (let plane of planes) {
    if (plane === currentPlane) {
      continue;
    }

    new TWEEN.Tween(plane.position)
      .to({
        x: currentPlane.position.x,
        y: currentPlane.position.y,
        z: currentPlane.position.z,
      })
      .onUpdate((position) => {
        const extended = position.normalize();
        plane.position.copy(extended);
        plane.lookAt(scene.position);
      })
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
  }
}

export { updateAnimation, viewPlane, alignPlanes };
