import React, { createRef, useEffect, useState } from 'react';
import {  EDIT_OBJECT, EXPORT_OBJECT, FILTERS, PixelsImageProps, VALID_MIMETYPE } from './types';
import Pixels from "./lib"
import { adjustBrightness, adjustContrast, adjustHue, adjustSaturation, setHorizontalFlip, setVerticalFlip } from './basicAdjust';

const PixelsImage: React.FC<PixelsImageProps> = ({ onFilter, filter, brightness, saturation, hue, contrast, verticalFlip, horizontalFlip, src, ...props }) => {
  const ref = createRef<HTMLCanvasElement>();
  const [img, setImg] = useState<HTMLImageElement>();
  const [inferedMimetype, setInferedMimetype] = useState<VALID_MIMETYPE>('image/png')
  const [editObject, setEditObject] = useState<EDIT_OBJECT>({})

  const getExportObject: () => EXPORT_OBJECT = () => {
    const toBlob = () => new Promise((r) => {
      if(ref && ref.current) {
        ref.current.toBlob(b => r(b as Blob), inferedMimetype)
      } else r(null)
    }) as Promise<Blob|null>
    return {
       /**
       * Gets a Blob of the canvas content.
       * Ideal method for large images, optimizes the image size
       * It's advisable to handle dataURLs for small images, as converting to blobs, even for small images, might introduce unnecessary delays
       * @returns {Promise<Blob|null>} Promise that resolves with the Blob or null if the canvas is not available.
       */
      getBlob: async (): Promise<Blob | null> => await toBlob(),
      /**
       * Gets a data URL of the canvas content.
       * Faster method for <1MB images (3-35ms). Slowly for large images
       * Caution: Avoid using this method for very large images, as they may significantly increase the image size
       * @returns {string|undefined} Data URL or null if the canvas is not available.
       */
      getDataURL: (): string | undefined => {
        if(ref && ref.current) return ref.current.toDataURL(inferedMimetype)
      },
      /**
       * Gets the canvas itself.
       * Faster method. Takes ~0.01ms to get the canvas element
       * @returns {HTMLCanvasElement|null} Canvas element or null if the canvas is not available.
       */
      getCanvas: (): HTMLCanvasElement | null => ref.current,
      /**
       * Gets an Image object from the canvas content using DataURL (small images)
       * @returns {Promise<HTMLImageElement | undefined>} Promise that resolves with the Image object or null if the canvas is not available.
       */
      getImageFromDataURL: async (): Promise<HTMLImageElement | undefined> => {
        if(ref && ref.current) {
          const img = new Image();
          img.src = ref.current.toDataURL(inferedMimetype);
          return img;
        }
      },
      /**
       * Gets an Image object from the canvas content using Blob (large images)
       * @returns {Promise<HTMLImageElement | undefined>} Promise that resolves with the Image object or null if the canvas is not available.
       */
      getImageFromBlob: async (): Promise<HTMLImageElement | undefined> => {
        if(ref && ref.current) {
          const img = new Image();
          const blob = await toBlob();
          if(!blob) return;
          img.src = URL.createObjectURL(blob)
          return img;
        }
      }
    }
  }

  const getImageData: (img: HTMLImageElement) => [] | [CanvasRenderingContext2D, ImageData] = (img: HTMLImageElement) => {
    const { width, height } = img;
    if(ref && ref.current) {
      const canvas = ref.current;
      canvas.height = height;
      canvas.width = width;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if(context) {
        const pattern = context.createPattern(img, 'no-repeat');
        context.fillStyle = pattern as CanvasPattern;
        context.fillRect(0, 0, canvas.width, canvas.height);
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        return [context, imgData];
      } else console.error("PixelsImage: Error obtaining the canvas context")
    }
    return [];
  }

  const loadFilter = (imgData: ImageData) => {
    for(const flt of Array.isArray(editObject.filter) ? editObject.filter : [editObject.filter]) {
      if(Pixels.filter_dict[flt as FILTERS]){
        imgData = Pixels.filter_dict[flt as FILTERS](imgData)
      } else throw new Error(`${flt} is not a valid filter!`)
    }
  }

  const loadBrightness = (imgData: ImageData) => {
    imgData = adjustBrightness(imgData, editObject.brightness)
  }

  const loadHue = (imgData: ImageData) => {
    imgData = adjustHue(imgData, editObject.hue)
  }

  const loadSaturation = (imgData: ImageData) => {
    imgData = adjustSaturation(imgData, editObject.saturation)
  }

  const loadContrast = (imgData: ImageData) => {
    imgData = adjustContrast(imgData, editObject.contrast)
  }

  const haveChanges = () => (editObject.verticalFlip || editObject.horizontalFlip || editObject.filter || editObject.brightness || editObject.contrast || editObject.hue || editObject.saturation)

  const load = () => {
    if(img) {
      const changed = haveChanges();
      let [context, imageData] = getImageData(img);
      if(changed && imageData) {
        if(editObject.filter) loadFilter(imageData);
        if(editObject.brightness) loadBrightness(imageData);
        if(editObject.saturation) loadSaturation(imageData);
        if(editObject.hue) loadHue(imageData);
        if(editObject.contrast) loadContrast(imageData);
        if(onFilter) onFilter(getExportObject()) 
      } 
      if(context && imageData) context.putImageData(imageData, 0, 0);
      if(changed && context) {
        if(editObject.verticalFlip && ref.current) setVerticalFlip(ref.current, context)
        if(editObject.horizontalFlip && ref.current) setHorizontalFlip(ref.current, context)
      }
      if(changed && onFilter) {
        onFilter(getExportObject()) 
      }
    }
  }

  useEffect(() => {
    setEditObject({
      filter,
      brightness,
      contrast,
      hue,
      saturation,
      lastChange: Date.now(),
      verticalFlip,
      horizontalFlip
    })
  }, [filter, brightness, contrast, hue, saturation, verticalFlip, horizontalFlip])

  useEffect(() => {
    if(img) load();
  }, [img, editObject.lastChange])

  useEffect(() => {
    if(ref && ref.current && src) {
      const canvas = ref.current;
      const type = src.includes(".jpg") || src.includes(".jpeg") ? 'image/jpeg' : 'image/png';
      setInferedMimetype(type);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => setImg(img);
      img.onerror = () => {
        if(src.startsWith("http")) {
          const isArray = Array.isArray(editObject.filter);
          console.error("PixelsImage: There was a CORS error while loading the image. Please consider saving it on your local server or configuring the CORS rules of the remote server.")
          console.warn(`PixelsImage: Loading the image without the '${isArray ? (editObject.filter as string[]).join(',') : editObject.filter}' ${isArray ? 'filters': 'filter'} as it violates the CORS policies of the remote server.`)
          const tryImg = new Image();
          tryImg.src = src;
          tryImg.onload = () => {
            canvas.width = tryImg.width;
            canvas.height = tryImg.height;
            const ctx = canvas.getContext("2d");
            if(ctx) {
              ctx.drawImage(tryImg, 0, 0);
            } else console.error("PixelsImage: Error obtaining the canvas context")
            tryImg.onerror = () => console.error("PixelsImage: Unknown error while loading the image.")
          }
        } else {
          console.error("PixelsImage: Unknown error while loading the image.")
        }
      }
    }
  }, [ref.current, src])

  return  <canvas {...props} ref={ref} />;
};

export default PixelsImage;
