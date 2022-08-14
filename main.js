"use strict";

const config = {
    width: 240,
    height: 320,
    fps: 2,
    effect: "none",
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

const effectButton = document.getElementById("effectButton");
effectButton.addEventListener("change", e => config.effect = e.target.value);

const previewScreenUpdate = () => {
    if(video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    let sx, sy, sw, sh;
    if(w/h > config.width/config.height){
        sy = 0;
        sh = h;
        sw = sh * 3 / 4;
        sx = (w - sw) / 2;
    }else{
        sx = 0;
        sw = w;
        sh = sw * 4 / 3;
        sy = (h - sh) / 2;
    }
    context.drawImage(video, sx, sy, sw, sh, 0, 0, config.width, config.height);

    if(config.effect === "monochrome"){
        const imageData = context.getImageData(0, 0, config.width, config.height);
        const newImageData = context.createImageData(config.width, config.height);
        const len = imageData.width * imageData.height * 4;
        for(let i=0; i<len; i+=4){
            const [r, g, b] = imageData.data.slice(i, i+3);
            const gr = Math.round((r+g+b)/3);
            newImageData.data[i] = newImageData.data[i+1] = newImageData.data[i+2] = gr;
            newImageData.data[i+3] = 255;
        }
        context.putImageData(newImageData, 0, 0);
    }
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