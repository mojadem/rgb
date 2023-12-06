import * as THREE from "three";

import { cameraDistance } from "./constants";
import {
  initInteraction,
  onResize,
  onPointermove,
  onClick,
  updateInteraction,
} from "./interaction";
import { createPlane } from "./plane";
import { updateAnimation } from "./animation";
import { createParticles } from "./particles";
import { loadTexture } from "./image";

/** @type {THREE.PerspectiveCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;

/** @type {THREE.Mesh[]} */
const planes = [];

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = cameraDistance;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  initPlanes();
  initParticles();
  initInteraction(camera, renderer, planes[0]);
  initEventListeners();
}

function animate() {
  window.requestAnimationFrame(animate);
  updateInteraction(camera, planes);
  updateAnimation();
  renderer.render(scene, camera);
}

function initPlanes() {
  const normal = new THREE.Vector3(0, 0, 1);
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < 3; i++) {
    const plane = createPlane(i, normal);
    scene.add(plane);
    planes.push(plane);
    normal.applyAxisAngle(up, (2 * Math.PI) / 3);
  }

  loadTexture(planes);
}

function initParticles() {
  const amount = 1000;
  const radius = 100;
  const particles = createParticles(amount, cameraDistance, radius);
  scene.add(particles);
}

function initEventListeners() {
  window.addEventListener("resize", () => {
    onResize(camera, renderer);
  });

  window.addEventListener("pointermove", (event) => {
    onPointermove(event);
  });

  window.addEventListener("click", () => {
    onClick(camera, scene, planes);
  });
}
