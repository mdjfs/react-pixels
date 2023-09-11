import React, { createRef, useEffect, useState } from 'react';
import { FILTERS, PixelsImageData, PixelsImageSource } from "node-pixels";
import { adjustColors,drawImageSource, getExportObject, getImageSource, loadFilter, setHorizontalFlip, setVerticalFlip, applyChanges } from 'node-pixels';
import { EDIT_OBJECT, PixelsImageProps } from './types';

const PixelsImage: React.FC<PixelsImageProps> = ({ 
  onFilter, 
  type, 
  filter, 
  brightness, 
  saturation, 
  contrast, 
  verticalFlip, 
  horizontalFlip, 
  src, 
  ...props }) => {
  const ref = createRef<HTMLCanvasElement>();
  const [editObject, setEditObject] = useState<EDIT_OBJECT>({})
  const [isVisible, setIsVisible] = useState(false);
  const [source, setSource] = useState<PixelsImageSource>();
  const [data, setData] = useState<PixelsImageData>();
  const [isFiltered, setIsFiltered] = useState(false);

  const load = async () => {
    if(data && ref.current) {
      const canvas = ref.current;
      let changed = false;
      let { context, imageData } = data;
      setIsFiltered(true);
      if(editObject.filter) {
        await loadFilter(imageData, editObject.filter as FILTERS);
        changed = true;
      }
      const { brightness, saturation, contrast } = editObject;
      if(brightness || saturation || contrast) {
        await adjustColors(imageData, { brightness, saturation, contrast });
        changed = true;
      }
      if(changed) applyChanges(imageData, context);
      if(editObject.verticalFlip) {
        setVerticalFlip(canvas, context);
        changed = true;
      }
      if(editObject.horizontalFlip) {
        setHorizontalFlip(canvas, context);
        changed = true;
      }
      if(onFilter && source && changed) onFilter(getExportObject(canvas, source.type))
    }
  }

  useEffect(() => {
    setEditObject({
      filter,
      brightness,
      contrast,
      saturation,
      lastChange: Date.now(),
      verticalFlip,
      horizontalFlip
    })
  }, [filter, brightness, contrast, saturation, verticalFlip, horizontalFlip])

  useEffect(() => {
    if(ref && ref.current) {
      const observer = new IntersectionObserver((ent) => {
        const v = !!ent.find(e => e.isIntersecting);
        if(v != isVisible) setIsVisible(v);
      })
      observer.observe(ref.current);
    }
  }, [ref.current])

  useEffect(() => {
    if(ref.current && data && isVisible && !isFiltered) load();
  }, [data, isVisible, isFiltered, ref.current])

  useEffect(() => {
    if(ref && ref.current && source) {
      setIsFiltered(false);
      setData(drawImageSource(ref.current, source));
    }
  }, [source, ref.current, editObject.lastChange])

  useEffect(() => {
    if(src) {
      if(src instanceof HTMLImageElement || src instanceof HTMLCanvasElement || typeof src === "string") {
        (async () => {
          const source = await getImageSource(src, type);
          setSource(source);
        })();
      }
      else setSource(src);
    }
  }, [src])

  if(src) return  <canvas {...props} ref={ref} />;
};

export default PixelsImage;
