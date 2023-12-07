import * as THREE from "three";
import { updateTint } from "./planes";

/** @type {Element} */
let redSlider;
/** @type {Element} */
let greenSlider;
/** @type {Element} */
let blueSlider;
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
}

export { initGui };
