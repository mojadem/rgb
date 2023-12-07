import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { cameraDistance } from "./constants";
import { planes } from "./planes";

/** @type {boolean} */
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
    plane.userData.initalPosition.x,
    plane.userData.initalPosition.y,
    plane.userData.initalPosition.z
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
 */
function alignPlanes(currentPlane) {
  let offset = 0.1;
  const isCurrent = (plane) => plane === currentPlane;
  const startIndex = 1 + planes.findIndex(isCurrent);
  const numPlanes = planes.length;

  for (let i = startIndex; i < startIndex + numPlanes; i++) {
    const plane = planes[i % numPlanes];
    if (plane === currentPlane) {
      continue;
    }

    alignPlaneDirect(plane, currentPlane, offset);
    // alignPlaneRotate(plane, currentPlane, offset);
    offset *= 2;
  }

  planesAligned = !planesAligned;
}

/**
 * @param {THREE.Mesh} plane
 * @param {THREE.Mesh} currentPlane
 * @param {number} offset
 */
function alignPlaneDirect(plane, currentPlane, offset) {
  const targetPosition = planesAligned
    ? plane.userData.initalPosition
    : currentPlane.position.clone().multiplyScalar(1 - offset);
  console.log(targetPosition);

  new TWEEN.Tween(plane.position)
    .to({
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
    })
    .onUpdate((position) => {
      plane.lookAt(position.clone().multiplyScalar(2));
    })
    .easing(TWEEN.Easing.Exponential.Out)
    .start();
}

/**
 * @param {THREE.Mesh} plane
 * @param {THREE.Mesh} currentPlane
 * @param {number} offset
 */
function alignPlaneRotate(plane, currentPlane, offset) {
  let target = planesAligned
    ? {
        position: {
          x: plane.userData.initalPosition.x,
          y: plane.userData.initalPosition.y,
          z: plane.userData.initalPosition.z,
        },
        distance: 1,
      }
    : {
        position: {
          x: currentPlane.position.x,
          y: currentPlane.position.y,
          z: currentPlane.position.z,
        },
        distance: 1 - offset,
      };

  offset *= 2;

  const initial = {
    position: {
      x: plane.position.x,
      y: plane.position.y,
      z: plane.position.z,
    },
    distance: plane.position.length(),
  };

  new TWEEN.Tween(initial)
    .to(target)
    .onUpdate((step) => {
      const extended = new THREE.Vector3(
        step.position.x,
        step.position.y,
        step.position.z
      )
        .normalize()
        .multiplyScalar(step.distance);

      plane.position.copy(extended);
      plane.lookAt(plane.position.clone().multiplyScalar(2));
    })
    .easing(TWEEN.Easing.Exponential.Out)
    .start();
}

export { updateAnimation, viewPlane, alignPlanes };
