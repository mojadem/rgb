import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer;
let raycaster, pointer;
let controls;

const planes = [];
const outlines = [];
let particles;

let CURRENT_INDEX = 0;
let INTERSECTED = null;
let pageActive = false;

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

  createLights();
  createPlanes();
  createParticles();

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onClick);
}

function createLights() {
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);
}

function createPlanes() {
  const planeGeometry = new THREE.PlaneGeometry(1, 1);

  const outlinePoints = [];
  outlinePoints.push(new THREE.Vector3(-0.5, 0.5, 0));
  outlinePoints.push(new THREE.Vector3(0.5, 0.5, 0));
  outlinePoints.push(new THREE.Vector3(0.5, -0.5, 0));
  outlinePoints.push(new THREE.Vector3(-0.5, -0.5, 0));
  outlinePoints.push(new THREE.Vector3(-0.5, 0.5, 0));

  const outlineGeometry = new THREE.BufferGeometry().setFromPoints(
    outlinePoints
  );
  const outlineMaterial = new THREE.LineBasicMaterial();

  const placement = new THREE.Vector3(0, 0, 1);
  const up = new THREE.Vector3(0, 1, 0);
  const colors = [0xff0000, 0x00ff00, 0x0000ff];

  for (let i = 0; i < 3; i++) {
    const plane = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshLambertMaterial({
        color: colors[i],
        side: THREE.DoubleSide,
      })
    );
    plane.position.set(placement.x, placement.y, placement.z);
    plane.rotateY((-Math.PI / 3) * i);
    plane.userData.index = i;
    scene.add(plane);
    planes.push(plane);

    const outline = new THREE.Line(outlineGeometry, outlineMaterial);
    outline.position.set(placement.x, placement.y, placement.z);
    outline.rotateY((-Math.PI / 3) * i);
    outline.visible = false;
    scene.add(outline);
    outlines.push(outline);

    placement.applyAxisAngle(up, (2 * Math.PI) / 3);
  }
}

function createParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    const z = Math.random() * 200 - 100;

    positions.push(x, y, z);
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
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

  pageActive = true;
}

function onClick() {
  if (INTERSECTED) {
    CURRENT_INDEX = INTERSECTED.userData.index;

    const newCameraPosition = new THREE.Vector3(
      INTERSECTED.position.x,
      INTERSECTED.position.y,
      INTERSECTED.position.z
    ).multiplyScalar(5);

    new TWEEN.Tween(camera.position)
      .to({
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
      })
      .onUpdate((object) => {
        const extendedPosition = object.normalize().multiplyScalar(5);
        camera.position.copy(extendedPosition);
      })
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  TWEEN.update();
  updateIntersected();
  updateCursor();
  renderer.render(scene, camera);
}

function updateIntersected() {
  if (!pageActive) {
    return;
  }

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planes);

  const update = (value) => {
    outlines[INTERSECTED.userData.index].visible = value;
    INTERSECTED.material.emissive.setHex(value ? 0x222222 : 0x000000);

    new TWEEN.Tween(particles.material.color)
      .to(value ? INTERSECTED.material.color : new THREE.Color(0xffffff))
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
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
