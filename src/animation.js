import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";

import { cameraDistance } from "./constants";

function updateAnimation() {
  TWEEN.update();
}
/**
 *
 * @param {THREE.Mesh} plane
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Scene} scene
 */
function viewPlane(plane, scene, camera) {
  const extendPosition = new THREE.Vector3()
    .copy(camera.position)
    .normalize()
    .multiplyScalar(5);

  const extend = new TWEEN.Tween(camera.position).to(
    {
      x: extendPosition.x,
      y: extendPosition.y,
      z: extendPosition.z,
    },
    100
  );

  const rotatePosition = new THREE.Vector3(
    plane.position.x,
    plane.position.y,
    plane.position.z
  ).multiplyScalar(cameraDistance);

  const rotate = new TWEEN.Tween(camera.position)
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
    .easing(TWEEN.Easing.Exponential.Out);
  // .onComplete(() => {
  //   CURRENT = selectedPlane;
  // });

  let startingTween;

  if (extendPosition.equals(camera.position)) {
    startingTween = rotate;
  } else {
    startingTween = extend;

    // if (CURRENT !== selectedPlane) {
    //   startingTween.chain(rotate);
    // }
  }

  startingTween.start();
}

export { updateAnimation, viewPlane };
