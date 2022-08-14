"use strict";

const config = {
    width: 240,
    height: 320,
    fps: 2,
    saturation: 0.5,
    lightness: 0.5,
    isEffect: false,
}
const saturationRange = document.getElementById("saturationRange");
saturationRange.addEventListener("change", e => config.saturation = +e.target.value / 100);
const lightnessRange = document.getElementById("lightnessRange");
lightnessRange.addEventListener("change", e => config.lightness = +e.target.value / 100);

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

const effectChangeButton = document.getElementById("effectChangeButton");
effectChangeButton.addEventListener("click", () => config.isEffect = !config.isEffect);

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
    if(!config.isEffect) return;

    const imageData = context.getImageData(0, 0, config.width, config.height);
    const newImageData = context.createImageData(config.width, config.height);
    const len = imageData.width * imageData.height * 4;
    for(let i=0; i<len; i+=4){
        let r, g, b, h, l, s, max, min, diff, t;
        [r, g, b] = imageData.data.slice(i, i+3);
        r /= 255;
        g /= 255;
        b /= 255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        diff = max - min;
        h = 0;
        l = (max + min) / 2;
        s = diff / (1 -Math.abs(max + min - 1));
        switch(min){
            case max: h = 0; break;
            case r: h = (60 * ((b - g) / diff)) + 180; break;
            case g: h = (60 * ((r - b) / diff)) + 300; break;
            case b: h = (60 * ((g - r) / diff)) + 60; break;
        }

        if(config.saturation > 0.5){
            s = s + (1-s)*(config.saturation-0.5)*2;
        }else{
            s = s * (config.saturation) * 2;
        }
        if(config.lightness > 0.5){
            l = l + (1-l)*(config.lightness-0.5)*2;
        }else{
            l = l * (config.lightness) * 2;
        }

        max = l + (s * (1 - Math.abs((2 * l) - 1)) / 2);
        min = l - (s * (1 - Math.abs((2 * l) - 1)) / 2);
        t = parseInt(h/60);
        switch(t){
            case 0:
            case 6:
                r = max;
                g = min + (max - min) * h / 60;
                b = min;
                break;
            case 1:
                r = min + (max - min) * (120 - h) / 60;
                g = max;
                b = min;
                break;
            case 2:
                r = min;
                g = max;
                b = min + (max - min) * (h - 120) / 60;
                break;
            case 3:
                r = min;
                g = min + (max - min) * (240 - h) / 60;
                b = max;
                break;
            case 4:
                r = min + (max - min) * (h - 240) / 60;
                g = min;
                b = max;
                break;
            case 5:
                r = max;
                g = min;
                b = min + (max - min) * (360 - h) / 60;
                break;
        }
        r *= 255;
        g *= 255;
        b *= 255;

        newImageData.data[i] = r;
        newImageData.data[i+1] = g;
        newImageData.data[i+2] = b;
        newImageData.data[i+3] = 255;
    }
    context.putImageData(newImageData, 0, 0);
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