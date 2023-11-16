import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { viewPlane } from "./animation";

/** @type {THREE.Raycaster} */
let raycaster;
/** @type {THREE.Vector2} */
let pointer;
/** @type {THREE.OrbitControls} */
let controls;
/** @type {THREE.Mesh} */
let INTERSECTED = null;

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.WebGLRenderer} renderer
 */
function initInteraction(camera, renderer) {
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
}

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Mesh[]} planes
 */
function updateInteraction(camera, planes) {
  controls.update();
  updateIntersected(camera, planes);
  updateCursor();
}

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Mesh[]} planes
 */
function updateIntersected(camera, planes) {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planes, false);

  const update = (value) => {
    INTERSECTED.children[0].visible = value;
  };

  if (intersects.length > 0) {
    if (INTERSECTED && INTERSECTED !== intersects[0].object) {
      update(false);
    }

    INTERSECTED = intersects[0].object;
    update(true);
  } else {
    if (INTERSECTED) {
      update(false);
    }
    INTERSECTED = null;
  }
}

function updateCursor() {
  if (INTERSECTED) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }
}

/**
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.WebGLRenderer} renderer
 */
function onResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * @param {PointerEvent} event
 */
function onPointermove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Scene} scene
 * @returns
 */
function onClick(scene, camera) {
  if (INTERSECTED === null) {
    return;
  }

  viewPlane(INTERSECTED, scene, camera);
}

export { initInteraction, updateInteraction, onResize, onPointermove, onClick };
