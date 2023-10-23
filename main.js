import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer;
let raycaster, pointer;
let controls;

let particles;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);

  createPlanes();
  createParticles();

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onClick);
}

function createPlanes() {
  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const placement = new THREE.Vector3(0, 0, 1);
  const up = new THREE.Vector3(0, 1, 0);
  const colors = [0xff0000, 0x00ff00, 0x0000ff];

  for (let i = 0; i < 3; i++) {
    const plane = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide })
    );
    plane.position.set(placement.x, placement.y, placement.z);
    plane.rotateY((-Math.PI / 3) * i);
    scene.add(plane);

    placement.applyAxisAngle(up, (2 * Math.PI) / 3);
  }
}

function createParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    const z = Math.random() * 200 - 100;

    vertices.push(x, y, z);
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  const particleMaterial = new THREE.PointsMaterial();
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    const cameraPosition = new THREE.Vector3(
      object.position.x,
      object.position.y,
      object.position.z
    ).multiplyScalar(5);

    new TWEEN.Tween(camera.position)
      .to({ x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z })
      .easing(TWEEN.Easing.Exponential.Out)
      .start();

    new TWEEN.Tween(particles.material.color)
      .to(object.material.color)
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  TWEEN.update();
  renderer.render(scene, camera);
}
