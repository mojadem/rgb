import * as THREE from "three";
import { loadTexture } from "./planes";

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
  const response = await apiCall("https://picsum.photos/500");

  setImage(response.url);
  const blob = await response.blob();
  setImageText(blob);
}

/**
 * @param {File} image
 */
function uploadImage(image) {
  const url = URL.createObjectURL(image);
  setImage(url);
  setImageText(image);
}

/**
 * @param {string|Blob} imageSrc
 */
function setImage(imageSrc) {
  document.getElementById("thumbnail").src = imageSrc;
  const texture = new THREE.TextureLoader().load(imageSrc);
  loadTexture(texture);
}

/**
 * @param {Blob} imageData
 */
function setImageText(imageData) {
  const reader = new FileReader();
  reader.readAsDataURL(imageData);
  reader.onloadend = () => {
    const imageDataText = reader.result;
    document.getElementById("img-data").innerHTML = imageDataText;
  };
}

export { getImage, uploadImage };
