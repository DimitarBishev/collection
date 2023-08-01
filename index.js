async function fetchImages() {
  const response = await fetch("https://api.github.com/repos/dimitarbishev/collection/contents/images");
  const data = await response.json();
  const images = data.filter(file => file.name.endsWith(".jpg") || file.name.endsWith(".png") || file.name.endsWith(".gif"));
  images.sort((a, b) => {
    const aIndex = parseInt(a.name.split(".")[0]);
    const bIndex = parseInt(b.name.split(".")[0]);
    return aIndex - bIndex;
  });
  const imageContainer = document.getElementById("gallery");
  for (const image of images) {
    const row = document.createElement("div");
    row.classList.add("row");
    const img = document.createElement("img");
    img.src = image.download_url;
    img.classList.add("img-fluid", "h-100");
    row.appendChild(img);
    imageContainer.appendChild(row);
  }
}
