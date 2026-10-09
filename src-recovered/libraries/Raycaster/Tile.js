import { Animation } from './Animation.js';

export class Tile {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(oData) {
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
Object.assign(Tile.prototype, {
    oImage: null,
    nWidth: 0,
    nHeight: 0,
    sSource: null,
    nFrames: 0,
    aAnimations: null,
    bShading: true,
    nScale: 1
});
