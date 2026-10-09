import { GfxTools } from '../O876/GfxTools.js';
import { GXEffect } from './GXEffect.js';

export class GXFlash extends GXEffect {
    __construct(oRaycaster) {
        super.__construct(oRaycaster);
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d')
    }

    isOver() {
        return this.fAlpha <= 0
    }

    process() {
        this.oColor.a = this.fAlpha;
        if (this.oColor.a < 0) {
            this.oColor.a = 0
        }
        if (this.oColor.a > 1) {
            this.oColor.a = 1
        }
        this.fAlpha -= this.fAlphaFade
    }

    render() {
        this.oContext.fillStyle = GfxTools.buildRGBA(this.oColor);
        this.oContext.fillRect(0, 0, this.oCanvas.width, this.oCanvas.height)
    }

    terminate() {
        this.fAlpha = 0
    }
}
Object.assign(GXFlash.prototype, {
    sClass: 'Flash',
    oCanvas: null,
    oContext: null,
    nTime: 0,
    fAlpha: 0,
    fAlphaFade: 0,
    oColor: null
});
