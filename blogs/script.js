document.querySelectorAll('time').forEach($e => {
  const date = new Date($e.dateTime);
  // output the localized date and time
  $e.innerHTML = date.toLocaleDateString();
});

const imageViewer = document.getElementById("image-viewer");
const viewerImage = imageViewer.querySelector("#full-image");
const viewerClose = imageViewer.querySelector(".close");
const viewerPrev = imageViewer.querySelector("#prev-button");
const viewerNext = imageViewer.querySelector("#next-button");
const viewerCaption = imageViewer.querySelector("#image-caption");
const viewerProgress = imageViewer.querySelector("#image-progress");
// store all images for scrolling
const blog_imgs = []
let currentViewingId = -1;

const refreshImageContent = () => {

    viewerImage.style.transition = "";

    viewerPrev.disabled = currentViewingId === 0;
    viewerNext.disabled = currentViewingId === blog_imgs.length - 1;

    viewerImage.src = blog_imgs[currentViewingId].src;
    viewerImage.style.transform = "";

    setTimeout(() => {
        viewerImage.style.transition = "transform 200ms ease-out";
    })
    viewerCaption.innerText = blog_imgs[currentViewingId].alt;
    viewerProgress.innerText = `${currentViewingId + 1}/${blog_imgs.length}`
}

const closeViewerShortcut = (e) => {
    if (e.key === "Escape")
        closeImageViewer(e)
}

const closeImageViewer = (e) => {
    e.preventDefault();
    const img = blog_imgs[currentViewingId];
    currentViewingId = -1;

    const {top, bottom, left, width, height} = img.getBoundingClientRect();

    const vpWidth = window.visualViewport.width
    const vpHeight = window.visualViewport.height;
    const finalRect = viewerImage.getBoundingClientRect();
    const finalWidth = finalRect.width;
    const scale = width / finalWidth;
    if (bottom > 0 && top < vpHeight) {
        viewerImage.style.transform = `translate(${left - vpWidth / 2 + width / 2}px, ${top - vpHeight / 2 + height / 2}px) scale(${scale})`;
    }
    imageViewer.style.opacity = "0";
    window.removeEventListener("keydown", closeViewerShortcut);
    
    setTimeout(() => {
        viewerImage.style.transform = "";
        imageViewer.style.display = "none";
    }, 200)
};
// image viewer
document.querySelectorAll("img:not(.modal-content)").forEach((img, id) => {
    blog_imgs.push(img)
    img.addEventListener("click", (e) => {
        currentViewingId = id;
        imageViewer.style.display = "flex";
        refreshImageContent();

        const {top, left, width, height} = img.getBoundingClientRect();

        const vpWidth = window.visualViewport.width;
        const vpHeight = window.visualViewport.height;

        const finalRect = viewerImage.getBoundingClientRect();
        const finalWidth = finalRect.width;
        const scale = width / finalWidth;
        viewerImage.style.transform = `translate(${left - vpWidth / 2 + width / 2}px, ${top - vpHeight / 2 + height / 2}px) scale(${scale})`
        imageViewer.style.opacity = "1";
        setTimeout(() => {
            viewerImage.style.transform = "";
        })
        window.addEventListener("keydown", closeViewerShortcut);
    })
})

imageViewer.addEventListener("click", closeImageViewer)
viewerClose.addEventListener("click", closeImageViewer)
viewerImage.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
})

viewerPrev.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    currentViewingId -= 1;
    refreshImageContent();

})

viewerNext.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    currentViewingId += 1;
    refreshImageContent();

})