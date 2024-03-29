"use strict";

const config = {
    width: 240,
    height: 320,
    fps: 2,
    mag: 1.0,
}

const video = document.createElement("video");
video.autoplay = true;
const constraints = {
    video: {
        aspectRatio: { ideal: config.width / config.height },
        facingMode: {
            ideal: "environment"
        },
    },
    audio: false,
}
const media = navigator.mediaDevices.getUserMedia(constraints);
media.then((stream) => video.srcObject = stream);

const canvas = document.getElementById("previewScreen");
canvas.width = config.width;
canvas.height = config.height;
const context = canvas.getContext("2d");

const fullscreenButton = document.getElementById("fullscreenButton");
fullscreenButton.addEventListener("click", () => canvas.requestFullscreen());

const zoomRange = document.getElementById("zoomRange");
const zoomDisplay = document.getElementById("zoomDisplay");
zoomRange.addEventListener("input", (e) => {
    const val = +e.target.value;
    config.mag = val;
    zoomDisplay.textContent = `x${Number.isInteger(val) ? val+".0": val}`;
})

const previewScreenUpdate = () => {
    if(video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    let sx, sy, sw, sh;
    if(w/h > config.width/config.height){
        sh = h / config.mag;
        sy = (h - sh) / 2;
        sw = sh * config.width / config.height;
        sx = (w - sw) / 2;
    }else{
        sw = w / config.mag;
        sx = (w - sw) / 2;
        sh = sw * config.height / config.width;
        sy = (h - sh) / 2;
    }
    context.drawImage(video, sx, sy, sw, sh, 0, 0, config.width, config.height);
}
setInterval(previewScreenUpdate, 1000/config.fps);

const takePhoto = () => {
    const dataURI = canvas.toDataURL("image/jpeg", 0.5);
    const img = document.createElement("a");
    img.href = `data:img/jpeg;${dataURI}`;
    img.download = `tinyIMG${Date.now()}.jpg`;
    img.click();
    context.clearRect(0, 0, config.width, config.height);
};
canvas.addEventListener("click", () => takePhoto());