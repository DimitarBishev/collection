async function fetchImages() {
  const response = await fetch("https://api.github.com/repos/dimitarbishev/collection/contents/images");
  const data = await response.json();
  displayImages(data, "gallery");
}

async function fetchPanoramas() {
  const response = await fetch("https://api.github.com/repos/dimitarbishev/collection/contents/panorama");
  const data = await response.json();
  displayPanoramas(data);
}

function displayImages(data, containerId) {
  const images = data.filter(file => file.name.endsWith(".jpg") || file.name.endsWith(".png") || file.name.endsWith(".gif"));
  images.sort((a, b) => {
      const aIndex = parseInt(a.name.split(".")[0]);
      const bIndex = parseInt(b.name.split(".")[0]);
      return aIndex - bIndex;
  });
  const container = document.getElementById(containerId);
  for (const image of images) {
      const row = document.createElement("div");
      row.classList.add("row");
      const img = document.createElement("img");
      img.src = image.download_url;
      img.classList.add("img-fluid", "h-100");
      row.appendChild(img);
      container.appendChild(row);
  }
}

function displayPanoramas(data) {
  const panoramas = data.filter(file => file.name.endsWith(".jpg") || file.name.endsWith(".png"));
  panoramas.sort((a, b) => {
      const aIndex = parseInt(a.name.split(".")[0]);
      const bIndex = parseInt(b.name.split(".")[0]);
      return aIndex - bIndex;
  });

  const panoList = document.getElementById("pano-list");
  const viewer = document.getElementById("pano-viewer");

  panoramas.forEach((pano, index) => {
      const panoThumbnail = document.createElement("div");
      panoThumbnail.classList.add("col-12", "col-md-4", "p-2");

      const panoButton = document.createElement("button");
      panoButton.classList.add("btn", "btn-primary", "w-100");
      panoButton.innerText = `View Panorama ${index + 1}`;
      panoButton.onclick = () => {
          pannellum.viewer('pano-viewer', {
              type: "equirectangular",
              panorama: pano.download_url,
              autoLoad: true,
              showControls: true
          });
      };

      panoThumbnail.appendChild(panoButton);
      panoList.appendChild(panoThumbnail);
  });

  // Load the first panorama by default
  if (panoramas.length > 0) {
      pannellum.viewer('pano-viewer', {
          type: "equirectangular",
          panorama: panoramas[0].download_url,
          autoLoad: true,
          showControls: true
      });
  }
}

function showGallery(sectionId) {
  document.getElementById("gallery").style.display = sectionId === "gallery" ? "block" : "none";
  document.getElementById("panorama").style.display = sectionId === "panorama" ? "block" : "none";
  if (sectionId === "panorama") {
      if (!document.getElementById("panorama").hasChildNodes()) {
          fetchPanoramas();
      }
  }
}

function toggleMenu() {
  const navGrid = document.querySelector('.nav-grid');
  navGrid.classList.toggle('active'); // Toggles visibility of the menu
}