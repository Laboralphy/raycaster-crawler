import { CanvasFactory } from '../../libraries/O876/CanvasFactory.js';
import { GXEffect } from '../../libraries/Raycaster/GXEffect.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

export class GXConfused extends GXEffect {
    __construct(oRaycaster) {
        super.__construct(oRaycaster);
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d');
        this.oConfCanvas = CanvasFactory.getCanvas();
        this.oConfCanvas.width = this.oCanvas.width;
        this.oConfCanvas.height = this.oCanvas.height;
        this.oConfContext = this.oConfCanvas.getContext('2d');
        this.oConfContext.fillStyle = 'rgb(0, 0, 0)';
        this.oConfContext.fillRect(0, 0, this.oConfCanvas.width, this.oConfCanvas.height);
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
        this.buildConfusion();
        this.oContext.drawImage(this.oConfCanvas, 0, 0)
    }

    done() {
        this.oConfCanvas = null
    }

    terminate() {
        this.bOver = true
    }

    buildConfusion() {
        const fx = Math.sin(MathTools.toRad(this.nTime << 3)) + 1;
        const fy = 2 - fx;
        const nx = fx * 32 | 0;
        const ny = fy * 32 | 0;
        this.oConfContext.drawImage(this.oCanvas, nx, ny, this.oCanvas.width - nx - nx, this.oCanvas.height - ny - ny, 0, 0, this.oConfCanvas.width, this.oConfCanvas.height)
    }
}
Object.assign(GXConfused.prototype, {
    sClass: 'Confused',
    oCanvas: null,
    oContext: null,
    nTime: 0,
    bOver: false,
    oConfCanvas: null,
    oConfContext: null
});
