import * as THREE from "three";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import imageFilterVert from "./glsl/imageFilter.vert";
import imageFilterFrag from "./glsl/imageFilter.frag";

let camera, scene, renderer;
let raycaster, pointer;
let controls;

const colors = [0xff0000, 0x00ff00, 0x0000ff];
let colorSelections = [0, 0, 0]; // r, g, b

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
let clickDisabled = false;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near,
    far
  );
  camera.position.z = cameraDistance;

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
  initStars();
  initEventListeners();
}

function animate() {
  window.requestAnimationFrame(animate);
  controls.update();

  TWEEN.update();
  if (TWEEN.getAll().length > 0) {
    clickDisabled = true;
  } else {
    clickDisabled = false;
  }

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
  const texture = new THREE.TextureLoader().load("../textures/example.jpg");

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

  for (let i = 0; i < 3; i++) {
    const plane = new THREE.Mesh(
      planeGeometry,
      new THREE.ShaderMaterial({
        vertexShader: imageFilterVert,
        fragmentShader: imageFilterFrag,
        side: THREE.DoubleSide,
        uniforms: {
          u_texture: { value: texture },
          u_color: { value: i },
        },
      })
    );
    plane.position.copy(placement);
    plane.rotateY((-Math.PI / 3) * i);
    plane.userData.index = i;
    scene.add(plane);
    planes.push(plane);

    const outline = new THREE.Line(outlineGeometry, outlineMaterial);
    outline.position.copy(placement);
    outline.rotateY((-Math.PI / 3) * i);
    outline.visible = false;
    scene.add(outline);
    outlines.push(outline);

    placement.applyAxisAngle(up, (2 * Math.PI) / 3);
  }

  CURRENT = planes[0];
}

function initStars() {
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

  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("click", () => {
    if (clickDisabled) {
      return;
    }

    if (!pageActive) {
      pageActive = true;
      // zoomInCamera();
    } else {
      selectPlane();
    }
  });

  controls.addEventListener("change", () => {
    if (camera.position.length() < 1 + near) {
      resetScene();
    } else if (camera.position.length() > cameraDistance) {
      const clamped = new THREE.Vector3()
        .copy(camera.position)
        .normalize()
        .multiplyScalar(cameraDistance);

      camera.position.copy(clamped);
    }
  });
}

function zoomInCamera() {
  const targetPosition = new THREE.Vector3()
    .copy(camera.position)
    .normalize()
    .multiplyScalar(cameraDistance);
  new TWEEN.Tween(camera.position)
    .to(targetPosition, 3000)
    .easing(TWEEN.Easing.Quartic.Out)
    .start();
}

function selectPlane() {
  if (INTERSECTED === null) {
    return;
  }

  const selectedPlane = INTERSECTED;

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
    selectedPlane.position.x,
    selectedPlane.position.y,
    selectedPlane.position.z
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
    .easing(TWEEN.Easing.Exponential.Out)
    .onComplete(() => {
      CURRENT = selectedPlane;
    });

  let startingTween;

  if (extendPosition.equals(camera.position)) {
    startingTween = rotate;
  } else {
    startingTween = extend;

    if (CURRENT !== selectedPlane) {
      startingTween.chain(rotate);
    }
  }

  startingTween.start();
}

function updateIntersected() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planes);

  const update = (value) => {
    outlines[INTERSECTED.userData.index].visible = value;
    // INTERSECTED.material.emissive.setHex(value ? 0x222222 : 0x000000);
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
  if (clickDisabled) {
    document.body.style.cursor = "not-allowed";
  } else if (!pageActive) {
    document.body.style.cursor = "pointer";
  } else if (INTERSECTED) {
    document.body.style.cursor =
      CURRENT === INTERSECTED ? "zoom-in" : "pointer";
  } else {
    document.body.style.cursor = "default";
  }
}

function resetScene() {
  const selectedPlane = CURRENT.userData.index;

  colorSelections[selectedPlane] += 1;

  const max = Math.max(...colorSelections);

  const newColor = new THREE.Color(
    ...colorSelections.map((c) => {
      return c / max;
    })
  );
  console.log(newColor);

  particles.material.setValues({ color: newColor });

  camera.position.copy(
    new THREE.Vector3()
      .copy(camera.position)
      .normalize()
      .multiplyScalar(particleRadius)
  );

  zoomInCamera();
}
