import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer;
let raycaster, pointer;
let controls;

const planes = [];
const outlines = [];
let particles;

const numParticles = 100000;
const particleRadius = 1000;
const cameraDistance = 5;

const fov = 45;
const near = 0.1;
const far = particleRadius * 2;

let CURRENT = null;
let INTERSECTED = null;
let pageActive = false;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near,
    far
  );
  camera.position.z = particleRadius;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableRotate = false;

  initLights();
  initPlanes();
  initParticles();
  initEventListeners();
}

function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  TWEEN.update();
  updateIntersected();
  updateCursor();
  renderer.render(scene, camera);
}

function initLights() {
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);
}

function initPlanes() {
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

  CURRENT = planes[0];
}

function initParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const positions = [];

  const normalSample = () => {
    // normal distribution; see https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return normalSample(); // resample between 0 and 1
    return num;
  };

  for (let i = 0; i < numParticles; i++) {
    const pos = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(normalSample() * particleRadius)
      .clampLength(cameraDistance, particleRadius);
    positions.push(pos.x, pos.y, pos.z);
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  const particleMaterial = new THREE.PointsMaterial();
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}

function initEventListeners() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("pointermove", () => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("click", () => {
    if (!pageActive) {
      pageActive = true;
      zoomInCamera();
    } else {
      selectPlane();
    }
  });

  controls.addEventListener("change", () => {
    if (camera.position.length() < 1 + near) {
      console.log("change");
    }
  });
}

function zoomInCamera() {
  new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 0, z: cameraDistance }, 3000)
    .easing(TWEEN.Easing.Quartic.Out)
    .start();
}

function selectPlane() {
  if (INTERSECTED) {
    CURRENT = INTERSECTED;
    viewPlane();
  }
}

function viewPlane() {
  const extendPosition = camera.position.clone().normalize().multiplyScalar(5);

  const extend = new TWEEN.Tween(camera.position).to(
    {
      x: extendPosition.x,
      y: extendPosition.y,
      z: extendPosition.z,
    },
    100
  );

  const rotatePosition = new THREE.Vector3(
    INTERSECTED.position.x,
    INTERSECTED.position.y,
    INTERSECTED.position.z
  ).multiplyScalar(cameraDistance);

  const rotate = new TWEEN.Tween(camera.position)
    .to({
      x: rotatePosition.x,
      y: rotatePosition.y,
      z: rotatePosition.z,
    })
    .onUpdate((object) => {
      const extended = object.normalize().multiplyScalar(cameraDistance);
      camera.position.copy(extended);
      camera.lookAt(scene.position);
    })
    .easing(TWEEN.Easing.Exponential.Out);

  extend.chain(rotate);
  extend.start();
}

function updateIntersected() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planes);

  const update = (value) => {
    outlines[INTERSECTED.userData.index].visible = value;
    INTERSECTED.material.emissive.setHex(value ? 0x222222 : 0x000000);
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
  if (!pageActive) {
    document.body.style.cursor = "pointer";
  } else if (INTERSECTED) {
    document.body.style.cursor =
      CURRENT === INTERSECTED ? "zoom-in" : "pointer";
  } else {
    document.body.style.cursor = "default";
  }
}
