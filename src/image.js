import * as THREE from "three";
import { loadTexture } from "./planes";

/** @type {string} */
let imgUrl;
/** @type {string} */
let imgData;

/**
 * @param {string} url
 */
async function apiCall(url) {
  try {
    const response = await fetch(url);
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function getImage() {
  const response = await apiCall("https://random.imagecdn.app/500/500");

  imgUrl = response.url;
  document.getElementById("thumbnail").src = imgUrl;
  const texture = new THREE.TextureLoader().load(imgUrl);

  loadTexture(texture);

  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
    imgData = reader.result;
  };
}

export { getImage };
