import * as THREE from "three";

// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer;
// let controls;

const flowField = [];

let sphere;

init();
animate();

function init() {
  scene = new THREE.Scene();

  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 100;
  camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    100
  );
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);

  const geometry = new THREE.SphereGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  for (let i = 0; i < 100; i++) {
    let fieldRow = [];

    for (let j = 0; j < 100; j++) {
      const v = new THREE.Vector3(1, 1, 0).normalize();
      v.z = 0;
      // const arrowHelper = new THREE.ArrowHelper(
      //   v,
      //   new THREE.Vector3(i - 50, j - 50, 0),
      //   0.5
      // );
      // scene.add(arrowHelper);
      fieldRow.push(v);
    }

    flowField.push(fieldRow);
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  flow();
  renderer.render(scene, camera);
}

function flow() {
  const flowPos = new THREE.Vector3()
    .copy(sphere.position)
    .round()
    .clampScalar(-50, 49);
  flowPos.x += 50;
  flowPos.y += 50;

  const flowForce = flowField[flowPos.x][flowPos.y];
  sphere.position.addScaledVector(flowForce, 0.1);
}
