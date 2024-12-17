const ROTATE_SPEED = -6;
const ROTATE_AFTER_INACTIVITY = 2 * 1000;
const SUPPORTED_IMAGE_TYPES = ["jpg", "png", "gif"];
const SUPPORTED_PANORAMA_TYPES = ["jpg", "png"];

let imagesCache = null;
let panoramasCache = null;
let currentPanoIndex = 0;

function mapFiles(files, supportedTypes) {
  return files
    .filter((file) => supportedTypes.some((type) => file.name.endsWith(type)))
    .sort((a, b) => {
      const aIndex = parseInt(a.name.split(".")[0]);
      const bIndex = parseInt(b.name.split(".")[0]);
      return aIndex - bIndex;
    })
    .map((file) => ({
      download_url: file.download_url,
      displayName: file.name.split(".")[1],
    }));
}

async function fetchImages() {
  if (imagesCache) {
    displayImages(imagesCache, "gallery");
    return;
  }

  const response = await fetch(
    "https://api.github.com/repos/dimitarbishev/collection/contents/images"
  );
  const data = await response.json();
  imagesCache = mapFiles(data, SUPPORTED_IMAGE_TYPES);
  displayImages(imagesCache, "gallery");
}

function displayImages(data, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  for (const image of data) {
    const row = document.createElement("div");
    row.classList.add("row");
    const img = document.createElement("img");
    img.src = image.download_url;
    img.classList.add("img-fluid", "h-100");
    row.appendChild(img);
    container.appendChild(row);
  }
}

async function fetchPanoramas() {
  if (!panoramasCache) {
    const response = await fetch(
      "https://api.github.com/repos/dimitarbishev/collection/contents/panorama"
    );
    const data = await response.json();
    panoramasCache = mapFiles(data, SUPPORTED_PANORAMA_TYPES);
  }
  displayCurrentPanorama();
}

function displayCurrentPanorama() {
  if (!panoramasCache || panoramasCache.length === 0) return;

  const currentPano = panoramasCache[currentPanoIndex];
  const viewer = document.getElementById("pano-viewer");

  pannellum.viewer("pano-viewer", {
    type: "equirectangular",
    panorama: currentPano.download_url,
    autoLoad: true,
    showControls: true,
    autoRotateInactivityDelay: ROTATE_AFTER_INACTIVITY,
    autoRotate: ROTATE_SPEED,
  });

  document.getElementById("pano-name").innerText = currentPano.displayName;

  // Enable/disable navigation buttons
  document.getElementById("prev-pano").disabled = currentPanoIndex === 0;
  document.getElementById("next-pano").disabled =
    currentPanoIndex === panoramasCache.length - 1;
}

function showNextPanorama() {
  if (currentPanoIndex < panoramasCache.length - 1) {
    currentPanoIndex++;
    displayCurrentPanorama();
  }
}

function showPreviousPanorama() {
  if (currentPanoIndex > 0) {
    currentPanoIndex--;
    displayCurrentPanorama();
  }
}

function showGallery(sectionId) {
  document.getElementById("gallery").style.display =
    sectionId === "gallery" ? "block" : "none";
  document.getElementById("panorama").style.display =
    sectionId === "panorama" ? "block" : "none";
  if (sectionId === "panorama") {
    fetchPanoramas();
  }
}

function toggleMenu() {
  const navGrid = document.querySelector(".nav-grid");
  navGrid.classList.toggle("active"); // Toggles visibility of the menu
}
