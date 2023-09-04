import { EDIT_COLORS } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const rgbToHsl = (r: number, g: number, b: number) => {
  var min = Math.min(r, g, b),
    max = Math.max(r, g, b),
    delta = max - min,
    h: any, s, l

  if (max === min) {
    h = 0
  } else if (r === max) {
    h = (g - b) / delta
  } else if (g === max) {
    h = 2 + (b - r) / delta
  } else if (b === max) {
    h = 4 + (r - g) / delta
  }

  h = Math.min(h * 60, 360)

  if (h < 0) {
    h += 360
  }

  l = (min + max) / 2

  if (max === min) {
    s = 0
  } else if (l <= 0.5) {
    s = delta / (max + min)
  } else {
    s = delta / (2 - max - min)
  }

  return [h / 360, s, l]
}

const hslToRgb = (hue: number, saturation: number, lightness: number) => {
  if( hue == undefined ){
    return [0, 0, 0];
  }

  var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
  var huePrime = hue / 60;
  var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

  huePrime = Math.floor(huePrime);
  var red: any;
  var green: any;
  var blue: any;

  if( huePrime === 0 ){
    red = chroma;
    green = secondComponent;
    blue = 0;
  }else if( huePrime === 1 ){
    red = secondComponent;
    green = chroma;
    blue = 0;
  }else if( huePrime === 2 ){
    red = 0;
    green = chroma;
    blue = secondComponent;
  }else if( huePrime === 3 ){
    red = 0;
    green = secondComponent;
    blue = chroma;
  }else if( huePrime === 4 ){
    red = secondComponent;
    green = 0;
    blue = chroma;
  }else if( huePrime === 5 ){
    red = chroma;
    green = 0;
    blue = secondComponent;
  }

  var lightnessAdjustment = lightness - (chroma / 2);
  red += lightnessAdjustment;
  green += lightnessAdjustment;
  blue += lightnessAdjustment;

  return [
      Math.abs(Math.round(red * 255)),
      Math.abs(Math.round(green * 255)),
      Math.abs(Math.round(blue * 255))
  ];

};

export const adjustColors = (imgData: ImageData, colors: EDIT_COLORS) => {
  let factor: number;
  for(let i = 0; i < imgData.data.length; i+= 4) {
    if(colors.brightness) {
        factor = colors.brightness + 1;
        imgData.data[i] *= factor;
        imgData.data[i + 1] *= factor;
        imgData.data[i + 2] *= factor;
    }
    if(colors.contrast) {
      factor = colors.contrast + 1;
      imgData.data[i] = clamp(factor * (imgData.data[i] - 128) + 128, 0, 255);
      imgData.data[i + 1] = clamp(factor * (imgData.data[i + 1] - 128) + 128, 0, 255);
      imgData.data[i + 2] = clamp(factor * (imgData.data[i + 2] - 128) + 128, 0, 255);
    }
    if(colors.hue || colors.saturation) {
      let r = imgData.data[i];
      let g = imgData.data[i + 1];
      let b = imgData.data[i + 2];
      let hsl = rgbToHsl(r, g, b) as number[];
      if(colors.saturation) {
        factor = colors.saturation + 1;
        hsl[1] *= factor;
      }
      if(colors.hue) {
        factor = Math.round((colors.hue) * 100) / 100;
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