import { GfxTools } from '../O876/GfxTools.js';
import { GXEffect } from './GXEffect.js';

export class GXFade extends GXEffect {
    constructor(oRaycaster) {
        super(oRaycaster);
        this.sClass = 'FadeOut';
        this.nTime = 0;
        this.fAlpha = 0;
        this.fAlphaFade = 0;
        this.oColor = null;
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d')
    }

    isOver() {
        return this.fAlphaFade > 0 ? this.fAlpha >= 1 : this.fAlpha <= 0
    }

    process() {
        this.oColor.a = this.fAlpha;
        if (this.oColor.a < 0) {
            this.oColor.a = 0
        }
        if (this.oColor.a > 1) {
            this.oColor.a = 1
        }
        this.fAlpha += this.fAlphaFade
    }

    render() {
        this.oContext.fillStyle = GfxTools.buildRGBA(this.oColor);
        this.oContext.fillRect(0, 0, this.oCanvas.width, this.oCanvas.height)
    }

    terminate() {
        this.fAlpha = this.fAlphaFade > 0 ? 1 : 0
    }
}
