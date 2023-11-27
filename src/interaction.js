import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { alignPlanes, viewPlane } from "./animation";

/** @type {THREE.Raycaster} */
let raycaster;
/** @type {THREE.Vector2} */
let pointer;
/** @type {OrbitControls} */
let controls;
/** @type {THREE.Mesh} */
let INTERSECTED = null;
/** @type {THREE.Mesh} */
let CURRENT = null;

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.WebGLRenderer} renderer
 */
function initInteraction(camera, renderer) {
  console.log("hello");
  raycaster = new THREE.Raycaster();
  console.log(raycaster);
  pointer = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false; // TODO: remove controls?
}

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
    /** @type {THREE.Line} */
    const outline = INTERSECTED.children[0];

    outline.material.color = value
      ? new THREE.Color(0xffffff)
      : outline.userData.color;
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
 * @param {THREE.Mesh[]} planes
 * @returns
 */
function onClick(camera, scene, planes) {
  if (INTERSECTED === null) {
    return;
  }

  if (INTERSECTED === CURRENT) {
    // alignPlanes(scene, CURRENT, planes);
  } else {
    viewPlane(camera, scene, INTERSECTED);
    CURRENT = INTERSECTED;
  }
}

export { initInteraction, updateInteraction, onResize, onPointermove, onClick };