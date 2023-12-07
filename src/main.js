import * as THREE from "three";

import { cameraDistance } from "./constants";
import {
  initInteraction,
  onResize,
  onPointermove,
  onClick,
  updateInteraction,
} from "./interaction";
import { createPlanes } from "./planes";
import { updateAnimation } from "./animation";
import { createParticles } from "./particles";
import { getImage } from "./image";
import { initGui } from "./gui";

/** @type {THREE.PerspectiveCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;

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
  getImage();
  // initParticles();
  initGui();
  initInteraction(camera, renderer);
  initEventListeners();
}

function animate() {
  window.requestAnimationFrame(animate);
  updateInteraction(camera);
  updateAnimation();
  renderer.render(scene, camera);
}

function initPlanes() {
  const planes = createPlanes();
  planes.map((plane) => scene.add(plane));
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
    onClick(camera);
  });
}
