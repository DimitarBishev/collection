const ROTATE_SPEED = -6;
const ROTATE_AFTER_INACTIVITY = 2 * 1000;
const SUPPORTED_IMAGE_TYPES = ["jpg", "png", "gif"];
const SUPPORTED_PANORAMA_TYPES = ["jpg", "png"];

let foldersCache = {}; // { folderName: [images] }
let panoramasCache = null;
let currentPanoIndex = 0;
let activeTab = null;

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
  try {
    // Fetch the top-level images directory to get subfolders
    const response = await fetch(
      "https://api.github.com/repos/dimitarbishev/collection/contents/images"
    );
    const data = await response.json();

    // Separate folders from files
    const folders = data.filter((item) => item.type === "dir");
    const rootFiles = data.filter((item) => item.type === "file");

    const navGrid = document.querySelector(".nav-grid");

    // Clear existing gallery nav links (keep panorama)
    const existingGalleryLinks = navGrid.querySelectorAll(".gallery-nav-link");
    existingGalleryLinks.forEach((el) => el.remove());

    // If there are subfolders, create a tab for each
    if (folders.length > 0) {
      for (const folder of folders) {
        const link = document.createElement("a");
        link.href = "#";
        link.classList.add("nav-link", "gallery-nav-link");
        link.dataset.folder = folder.name;
        link.textContent = capitalize(folder.name);
        link.onclick = (e) => {
          e.preventDefault();
          showFolderGallery(folder.name, folder.url);
        };
        // Insert before panorama link
        const panoramaLink = navGrid.querySelector("[data-section='panorama']");
        navGrid.insertBefore(link, panoramaLink);
      }

      // Load the first folder by default
      await showFolderGallery(folders[0].name, folders[0].url);
    } else {
      // Fallback: no subfolders, load root images directly
      const link = document.createElement("a");
      link.href = "#";
      link.classList.add("nav-link", "gallery-nav-link");
      link.dataset.folder = "gallery";
      link.textContent = "Gallery";
      link.onclick = (e) => {
        e.preventDefault();
        showGallery("gallery");
      };
      const panoramaLink = navGrid.querySelector("[data-section='panorama']");
      navGrid.insertBefore(link, panoramaLink);

      const images = mapFiles(rootFiles, SUPPORTED_IMAGE_TYPES);
      foldersCache["gallery"] = images;
      displayImages(images, "gallery");
      setActiveTab("gallery");
      document.getElementById("gallery").style.display = "block";
      document.getElementById("panorama").style.display = "none";
    }
  } catch (err) {
    console.error("Failed to fetch images:", err);
  }
}

async function showFolderGallery(folderName, folderUrl) {
  // Hide panorama, show gallery container
  document.getElementById("gallery").style.display = "block";
  document.getElementById("panorama").style.display = "none";

  setActiveTab(folderName);

  if (foldersCache[folderName]) {
    displayImages(foldersCache[folderName], "gallery");
    return;
  }

  // Show loading state
  const container = document.getElementById("gallery");
  container.innerHTML = '<p style="color:white;text-align:center;padding-top:150px;">Loading...</p>';

  try {
    const response = await fetch(folderUrl);
    const data = await response.json();
    const images = mapFiles(data, SUPPORTED_IMAGE_TYPES);
    foldersCache[folderName] = images;
    displayImages(images, "gallery");
  } catch (err) {
    console.error("Failed to fetch folder images:", err);
    container.innerHTML = '<p style="color:white;text-align:center;padding-top:150px;">Failed to load images.</p>';
  }
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

  pannellum.viewer("pano-viewer", {
    type: "equirectangular",
    panorama: currentPano.download_url,
    autoLoad: true,
    showControls: true,
    autoRotateInactivityDelay: ROTATE_AFTER_INACTIVITY,
    autoRotate: ROTATE_SPEED,
  });

  document.getElementById("pano-name").innerText = currentPano.displayName;

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
    setActiveTab("panorama");
    fetchPanoramas();
  }
}

function setActiveTab(name) {
  activeTab = name;
  document.querySelectorAll(".nav-link").forEach((link) => {
    const isActive =
      link.dataset.folder === name || link.dataset.section === name;
    link.classList.toggle("nav-link-active", isActive);
  });
}

function toggleMenu() {
  const navGrid = document.querySelector(".nav-grid");
  navGrid.classList.toggle("active");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
