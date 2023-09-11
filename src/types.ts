
import { FILTERS, EXPORT_OBJECT, PixelsImageSource, VALID_MIMETYPE } from "node-pixels";
import { CanvasHTMLAttributes } from "react";

export type EDIT_OBJECT = {
  brightness?: number;
  saturation?: number;
  contrast?: number;
  filter?: FILTERS | FILTERS[] | string | string[];
  lastChange?: number;
  verticalFlip?: boolean;
  horizontalFlip?: boolean;
}

export interface PixelsImageProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
    filter?: FILTERS | FILTERS[] | string | string[],
    onFilter?: (exportObject: EXPORT_OBJECT) => void,
    src?: string | HTMLImageElement | HTMLCanvasElement | PixelsImageSource;
    saturation?: number;
    brightness?: number;
    contrast?: number;
    verticalFlip?: boolean;
    horizontalFlip?: boolean;
    type?: VALID_MIMETYPE;
}
