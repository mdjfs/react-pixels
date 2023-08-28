import React, { createRef, useEffect, useState } from 'react';
import {  EXPORT_OBJECT, FILTERS, PixelsImageProps, VALID_MIMETYPE } from './types';
import Pixels from "./lib"

const PixelsImage: React.FC<PixelsImageProps> = ({ onFilter, filter, src, ...props }) => {
  const ref = createRef<HTMLCanvasElement>();
  const [img, setImg] = useState<HTMLImageElement>();
  const [inferedMimetype, setInferedMimetype] = useState<VALID_MIMETYPE>('image/png')

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

  const loadImage = (img: HTMLImageElement) => {
    const { width, height } = img;
    if(ref && ref.current) {
      const canvas = ref.current;
      canvas.height = height;
      canvas.width = width;
      const context = canvas.getContext('2d');
      if(context) {
        const pattern = context.createPattern(img, 'no-repeat');
        context.fillStyle = pattern as CanvasPattern;
        context.fillRect(0, 0, canvas.width, canvas.height);
        let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        for(const flt of Array.isArray(filter) ? filter : [filter]) {
          if(Pixels.filter_dict[flt as FILTERS]){
            imgData = Pixels.filter_dict[flt as FILTERS](imgData)
          } else throw new Error(`${flt} is not a valid filter!`)
        }
        context.putImageData(imgData, 0, 0);
        if(onFilter) onFilter(getExportObject())
      } else console.error("PixelsImage: Error obtaining the canvas context")
    }
  }

  useEffect(() => { 
    if(ref && ref.current && img && filter) {
      loadImage(img)
    }
  }, [ref.current, img, src, filter])

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
          const isArray = Array.isArray(filter);
          console.error("PixelsImage: There was a CORS error while loading the image. Please consider saving it on your local server or configuring the CORS rules of the remote server.")
          console.warn(`PixelsImage: Loading the image without the '${isArray ? filter.join(',') : filter}' ${isArray ? 'filters': 'filter'} as it violates the CORS policies of the remote server.`)
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
