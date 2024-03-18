import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createPlanes, planes } from "./planes";
import {
  updateCameraDistance,
  updateAnimation,
  alignPlanes,
  viewPlane,
} from "./animation";
import { getImage } from "./image";
import { initGui } from "./gui";

/** @type {THREE.PerspectiveCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;

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

/** @type {boolean} */
let pointerDown = false;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5; // initial camera distance

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  initPlanes();
  initInteraction();
  initEventListeners();
  initGui();
  getImage();
}

function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  updateOutlines();
  updateCursor();
  updateAnimation();
  renderer.render(scene, camera);
}

function initPlanes() {
  const planes = createPlanes();
  planes.map((plane) => scene.add(plane));
}

function initInteraction() {
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableRotate = false;

  CURRENT = planes[0];
}

function initEventListeners() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    updateIntersected(event);
  });

  window.addEventListener("pointermove", (event) => {
    if (!pointerDown) {
      updateIntersected(event);
    }
  });

  window.addEventListener("pointerup", (event) => {
    pointerDown = false;
    selectIntersected();

    if (event.pointerType === "touch") {
      INTERSECTED = null;
    }
  });

  controls.addEventListener("change", () => updateCameraDistance(camera));
}

function updateIntersected(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planes, false);

  if (intersects.length > 0) {
    INTERSECTED = intersects[0].object;
  } else {
    INTERSECTED = null;
  }
}

function selectIntersected() {
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

function updateOutlines() {
  for (let plane of planes) {
    const outline = plane.children[0];

    outline.material.color =
      plane === INTERSECTED
        ? new THREE.Color(0xffffff)
        : outline.userData.color;
  }
}

function updateCursor() {
  if (INTERSECTED) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }
}
