import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { cameraDistance } from "./constants";

let planesAligned = false;

function updateAnimation() {
  TWEEN.update();
}

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Mesh} plane
 */
function viewPlane(camera, plane) {
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
      const origin = new THREE.Vector3();
      camera.lookAt(origin);
    })
    .easing(TWEEN.Easing.Exponential.Out)
    .start();
}

/**
 * @param {THREE.Mesh} currentPlane
 * @param {THREE.Group} planes
 */
function alignPlanes(currentPlane, planes) {
  let offset = 0.1;

  for (let plane of planes.children) {
    if (plane === currentPlane) {
      continue;
    }

    let targetPosition;

    if (!planesAligned) {
      targetPosition = currentPlane.position.clone().multiplyScalar(1 - offset);
      offset *= 2;
    } else {
      targetPosition = plane.userData.position;
    }

    new TWEEN.Tween(plane.position)
      .to({
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
      })
      .onUpdate(() => {
        // const extended = position.normalize().multiplyScalar();
        // plane.position.copy(extended);
        plane.lookAt(planes.position);
      })
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
  }

  planesAligned = !planesAligned;
}

export { updateAnimation, viewPlane, alignPlanes };
