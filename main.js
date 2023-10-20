import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
  console.log(plane);
  scene.add(plane);

  placement.applyAxisAngle(up, (2 * Math.PI) / 3);
}

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
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

camera.position.z = 5;
const controls = new OrbitControls(camera, renderer.domElement);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener("click", () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    console.log(intersects[0]);
    console.log(scene);
    particles.material.color = intersects[0].object.material.color;
  }
  console.log("click");
});

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("pointermove", onPointerMove);

function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
