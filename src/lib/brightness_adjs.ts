import {getRandomNumber} from "./helpers"
let i, addition1, addition2, addition;

const darkify_imgdata = (imgData: any, dec_amt: any) => {
    let BRIGHTNESS_ADJ = dec_amt;
    for (i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i] - BRIGHTNESS_ADJ >= 0) {
            imgData.data[i] -= BRIGHTNESS_ADJ;
        }
        if (imgData.data[i + 1] - BRIGHTNESS_ADJ >= 0) {
            imgData.data[i + 1] -= BRIGHTNESS_ADJ;
        }

        if (imgData.data[i + 2] - BRIGHTNESS_ADJ >= 0) {
            imgData.data[i + 2] -= BRIGHTNESS_ADJ;
        }

    }
    return imgData;
}

const incbrightness_imgdata = (imgData: any, inc_amt: any) => {
    let BRIGHTNESS_ADJ = 20;
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] += BRIGHTNESS_ADJ
        imgData.data[i + 1] += BRIGHTNESS_ADJ
        imgData.data[i + 2] += BRIGHTNESS_ADJ
    }
    return imgData;
}

const incbrightness_two_imgdata = (imgData: any) => {
    let BRIGHTNESS_ADJ = 80;
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] += BRIGHTNESS_ADJ
        imgData.data[i + 1] += BRIGHTNESS_ADJ
        imgData.data[i + 2] += BRIGHTNESS_ADJ
    }
    return imgData;
}

const invert_imgdata = (imgData: any) => {
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i + 1] = 255 - imgData.data[i + 1];
        imgData.data[i + 2] = 255 - imgData.data[i + 2];
    }
    return imgData;
}

const sat_adj_imgdata = (imgData: any) => {
    let SAT_ADJ = 150;
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] -= SAT_ADJ
        imgData.data[i + 1] -= SAT_ADJ
        imgData.data[i + 2] -= SAT_ADJ
    }
    return imgData;
}

const pixel_blue_imgdata = (imgData: any) => {
    let randomNumber = 0;

    for (i = 0; i < imgData.data.length; i += 4) {
        randomNumber = getRandomNumber(0, 200);
        let addition = 0;
        if (randomNumber > 0 && randomNumber < 50) {
            addition1 = 0;
            addition2 = 30;
        }
        else if (randomNumber > 49 && randomNumber < 100) {
            addition1 = 100;
            addition2 = 90;
        }

        else {
            addition1 = 70;
            addition2 = 10;
        }

        if (imgData.data[i] - addition > 255) {
            imgData.data[i] -= addition
        }
        else {
            imgData.data[i] += addition
        }

        if (imgData.data[i + 1] + addition > 255) {
            imgData.data[i + 1] -= addition2;
        } else {
            imgData.data[i + 2] += addition2;
        }
    }
    return imgData;
}

export {sat_adj_imgdata, incbrightness_imgdata, incbrightness_two_imgdata, darkify_imgdata, invert_imgdata, pixel_blue_imgdata}

