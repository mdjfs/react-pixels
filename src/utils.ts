export const isImageLoaded = (img: HTMLImageElement) => {
    if(!img.complete) {
        return false;
    }

    if(img.naturalWidth === 0) {
        return false;
    }

    return true;
}