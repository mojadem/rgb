import * as THREE from "three";
import { loadTexture, createShader } from "./image";

/**
 *
 * @param {int} color
 * @param {THREE.Vector3} position
 */
function createPlane(color, position) {
  const texture = loadTexture();

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = createShader(color, texture);

  const plane = new THREE.Mesh(geometry, material);

  const outline = createOutline(plane);
  outline.visible = false;
  plane.add(outline);

  plane.lookAt(position);
  plane.position.copy(position);

  return plane;
}

/**
 * @param {THREE.Mesh} plane
 */
function createOutline(plane) {
  const points = [];
  points.push(new THREE.Vector3(-0.5, 0.5, 0));
  points.push(new THREE.Vector3(0.5, 0.5, 0));
  points.push(new THREE.Vector3(0.5, -0.5, 0));
  points.push(new THREE.Vector3(-0.5, -0.5, 0));
  points.push(new THREE.Vector3(-0.5, 0.5, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial();

  const outline = new THREE.Line(geometry, material);
  outline.position.copy(plane.position);
  outline.rotation.copy(plane.rotation);

  return outline;
}

export { createPlane };
