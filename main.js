"use strict";

const config = {
    width: 240,
    height: 320,
    fps: 2,
}

const video = document.createElement("video");
video.autoplay = true;
const constraints = {
    video: {
        width: config.width,
        height: config.height,
        aspectRatio: config.width / config.height,
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

const previewScreenUpdate = () => {
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
}
setInterval(previewScreenUpdate, 1000 / config.fps);

const takePhoto = () => {
    const dataURI = canvas.toDataURL("image/jpeg", 0.5);
    const img = document.createElement("a");
    img.href = `data:img/jpeg;${dataURI}`;
    img.download = `tinyIMG${Date.now()}.jpg`;
    img.click();
    context.clearRect(0, 0, config.width, config.height);
};
canvas.addEventListener("click", () => takePhoto());