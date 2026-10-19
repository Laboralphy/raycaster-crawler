import { Animation } from './Animation.js';

export class Tile {
    constructor(oData) {
        this.oImage = null;
        this.nWidth = 0;
        this.nHeight = 0;
        this.sSource = null;
        this.nFrames = 0;
        this.aAnimations = null;
        this.bShading = true;
        this.nScale = 1;
        if (oData !== undefined) {
            this.sSource = oData.src;
            this.nFrames = oData.frames;
            this.nWidth = oData.width;
            this.nHeight = oData.height;
            this.bShading = true;
            this.nScale = oData.scale || 1;
            if ('noshading' in oData && oData.noshading) {
                this.bShading = false
            }
            if (oData.animations) {
                let oAnimation, iFrame;
                this.aAnimations = [];
                for (let iAnim = 0; iAnim < oData.animations.length; iAnim++) {
                    if (oData.animations[iAnim] === null) {
                        for (iFrame = 0; iFrame < 8; iFrame++) {
                            this.aAnimations.push(null)
                        }
                    } else {
                        for (iFrame = 0; iFrame < 8; iFrame++) {
                            oAnimation = new Animation();
                            oAnimation.nStart = oData.animations[iAnim][0][iFrame];
                            oAnimation.nCount = oData.animations[iAnim][1];
                            oAnimation.nDuration = oData.animations[iAnim][2];
                            oAnimation.nLoop = oData.animations[iAnim][3];
                            this.aAnimations.push(oAnimation)
                        }
                    }
                }
            }
        }
    }
}
