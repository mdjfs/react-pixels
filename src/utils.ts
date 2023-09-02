export const isImageLoaded = (img: HTMLImageElement) => {
    if(!img.complete) {
        return false;
    }

    if(img.naturalWidth === 0) {
        return false;
    }

    return true;
}

export const getInferedType = (src: string) => src.includes('png') ? 'image/png' : 'image/jpeg'