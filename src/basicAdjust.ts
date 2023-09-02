import { EDIT_COLORS } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    if(h) h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export const adjustColors = (imgData: ImageData, colors: EDIT_COLORS) => {
  let factor: number;
  for(let i = 0; i < imgData.data.length; i+= 4) {
    if(colors.brightness !== undefined) {
        factor = colors.brightness + 1;
        imgData.data[i] *= factor;
        imgData.data[i + 1] *= factor;
        imgData.data[i + 2] *= factor;
    }
    if(colors.contrast !== undefined) {
      factor = colors.contrast + 1;
      imgData.data[i] = clamp(factor * (imgData.data[i] - 128) + 128, 0, 255);
      imgData.data[i + 1] = clamp(factor * (imgData.data[i + 1] - 128) + 128, 0, 255);
      imgData.data[i + 2] = clamp(factor * (imgData.data[i + 2] - 128) + 128, 0, 255);
    }
    if(colors.hue !== undefined || colors.saturation !== undefined) {
      let r = imgData.data[i];
      let g = imgData.data[i + 1];
      let b = imgData.data[i + 2];
      let hsl = rgbToHsl(r, g, b) as number[];
      if(colors.saturation !== undefined) {
        factor = colors.saturation + 1;
        hsl[1] *= factor;
      }
      if(colors.hue !== undefined) {
        factor = Number((colors.hue).toFixed(2)) * 100
        hsl[0] = (hsl[0] + factor / 360) % 1;
      }
      [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);
      imgData.data[i] = r;
      imgData.data[i + 1] = g;
      imgData.data[i + 2] = b;
    }
  }
}

export const setVerticalFlip = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempContext = tempCanvas.getContext("2d");
  tempContext?.scale(1, -1);
  tempContext?.drawImage(canvas, 0, -canvas.height);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(tempCanvas, 0, 0);
}

export const setHorizontalFlip = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempContext = tempCanvas.getContext("2d");
  tempContext?.scale(-1, 1);
  tempContext?.drawImage(canvas, -canvas.width, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(tempCanvas, 0, 0);
}