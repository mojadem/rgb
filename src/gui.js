import * as THREE from "three";
import { updateTint } from "./planes";
import { getImage, uploadImage } from "./image";

/** @type {HTMLInputElement} */
let redSlider;
/** @type {HTMLInputElement} */
let greenSlider;
/** @type {HTMLInputElement} */
let blueSlider;

/** @type {THREE.Color} */
const tint = new THREE.Color(0.0, 0.0, 0.0);

function initGui() {
  const refreshButton = document.getElementById("refresh");
  refreshButton.onclick = () => {
    getImage();
    tint.copy(new THREE.Color(0.0, 0.0, 0.0));
    redSlider.value = tint.r;
    greenSlider.value = tint.g;
    blueSlider.value = tint.b;
    updateTint(tint);
  };

  const imageUpload = document.getElementById("upload");
  imageUpload.onchange = (event) => {
    const [file] = event.target.files;
    uploadImage(file);
  };

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
