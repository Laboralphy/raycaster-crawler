import { CanvasFactory } from '../../libraries/O876/CanvasFactory.js';
import { GXEffect } from '../../libraries/Raycaster/GXEffect.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

export class GXBlind extends GXEffect {
    constructor(oRaycaster) {
        super(oRaycaster);
        this.sClass = 'Blind';
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d');
        this.oFlashCanvas = CanvasFactory.getCanvas();
        this.oFlashCanvas.width = this.oCanvas.width;
        this.oFlashCanvas.height = this.oCanvas.height;
        this.oFlashContext = this.oFlashCanvas.getContext('2d');
        this.oFlashContext.fillStyle = 'rgb(0, 0, 0)';
        this.oFlashContext.fillRect(0, 0, this.oFlashCanvas.width, this.oFlashCanvas.height);
        this.nTime = 0;
        this.bOver = false
    }

    isOver() {
        return this.bOver
    }

    process() {
        this.nTime++
    }

    render() {
        this.buildBlindness();
        this.oContext.drawImage(this.oFlashCanvas, 0, 0)
    }

    done() {
        this.oFlashCanvas = null
    }

    terminate() {
        this.bOver = true
    }

    buildBlindness() {
        let xGA = this.oFlashContext.globalAlpha;
        const f = Math.sin(MathTools.toRad(this.nTime << 3));
        if (f < 0) {
            this.oFlashContext.globalAlpha = 0
        } else {
            this.oFlashContext.globalAlpha = f
        }
        this.oFlashContext.fillRect(0, 0, this.oFlashCanvas.width, this.oFlashCanvas.height);
        this.oFlashContext.globalAlpha = xGA;
        xGA = this.oFlashContext.globalCompositeOperation;
        this.oFlashContext.globalCompositeOperation = 'lighter';
        this.oFlashContext.drawImage(this.oCanvas, 0, 0);
        this.oFlashContext.globalCompositeOperation = xGA
    }
}
