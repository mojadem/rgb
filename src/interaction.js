import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { alignPlanes, viewPlane } from "./animation";
import { planes } from "./planes";

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
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableRotate = false;

  CURRENT = planes[0];
}

/**
 * @param {THREE.PerspectiveCamera} camera
 */
function updateInteraction(camera) {
  controls.update();
  updateIntersected(camera);
  updateCursor();
}

/**
 * @param {THREE.PerspectiveCamera} camera
 */
function updateIntersected(camera) {
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
 */
function onClick(camera) {
  if (INTERSECTED === null) {
    return;
  }

  if (INTERSECTED === CURRENT) {
    alignPlanes(CURRENT);
  } else {
    viewPlane(camera, INTERSECTED);
    CURRENT = INTERSECTED;
  }
}

export { initInteraction, updateInteraction, onResize, onPointermove, onClick };
