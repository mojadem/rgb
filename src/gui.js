import * as THREE from "three";
import { updateTint } from "./planes";
import { getImage } from "./image";

/** @type {Element} */
let redSlider;
/** @type {Element} */
let greenSlider;
/** @type {Element} */
let blueSlider;
/** @type {Element} */
let button;
/** @type {THREE.Color} */
const tint = new THREE.Color(0.0, 0.0, 0.0);

function initGui() {
  redSlider = document.getElementById("red-slider");
  redSlider.value = tint.r;
  redSlider.oninput = () => {
    tint.r = parseFloat(redSlider.value);
    updateTint(tint);
  };

  greenSlider = document.getElementById("green-slider");
  greenSlider.value = tint.g;
  greenSlider.oninput = () => {
    tint.g = parseFloat(greenSlider.value);
    updateTint(tint);
  };

  blueSlider = document.getElementById("blue-slider");
  blueSlider.value = tint.b;
  blueSlider.oninput = () => {
    tint.b = parseFloat(blueSlider.value);
    updateTint(tint);
  };

  button = document.getElementById("button");
  button.onclick = () => {
    getImage();
    tint.copy(new THREE.Color(0.0, 0.0, 0.0));
    redSlider.value = tint.r;
    greenSlider.value = tint.g;
    blueSlider.value = tint.b;
    updateTint(tint);
  };
}

export { initGui };
