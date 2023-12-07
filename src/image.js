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
  document.getElementById("thumbnail").src =
    "https://64.media.tumblr.com/a94744a6a469f521d735fbe2631acb7f/tumblr_n2raoheCRZ1s33p20o1_500.gif";
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
    document.getElementById("img-data").innerHTML = imgData;
  };
}

export { getImage };
