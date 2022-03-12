import Jimp from "jimp/browser/lib/jimp";
import { buffer } from "stream/consumers";
import Minifier from "./minifier";

var worker:Minifier;

export function initWorker(){
  worker = new Minifier();
  return worker
}

function scaleImage(buffer: Buffer, options: { scale?: number }) {
  const scale = options.scale || 1;

  
  const promise = Jimp.read(buffer)
    .then((image) => image.scale(scale))
    // eslint-disable-next-line no-underscore-dangle
    .then((image) => {
      return image.getBufferAsync(image._originalMime)
    })
    .then(async (buffer) => {
      try {
        return await worker.minify(buffer)
      }catch(e){
        console.error("failed to run pngquant")
        return buffer;
      }
    })
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.error(err);
    });

  return promise;
}

function dataURLtoBlob(dataurl: string) {
  let arr = dataurl.split(",");
  const m = arr[0].match(/:(.*?);/);
  if (!m || m.length < 2) throw new Error("failed to convert to blob");

  const mime = m[1];
  let bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function scaleLottie(data: any, scale: number) {
  const imagesToScale: Promise<Buffer | void>[] = [];
  data.assets.forEach((asset: { p: string }, idx: number) => {
    if (!asset.p) {
      imagesToScale.push();
      return;
    }
    const data = asset.p.split(",")[1];
    imagesToScale.push(scaleImage(Buffer.from(data, "base64"), { scale }));
  });

  return Promise.all(imagesToScale).then((assets) => {
    var mime = "image/png";
    var encoding = "base64";

    assets.forEach((asset, idx) => {
      if (!asset) return;
      const scaledData = asset.toString('base64')
      data.assets[idx].p = "data:" + mime + ";" + encoding + "," + scaledData;
    });
    return data
  })
}
